import { lookup, Resolver } from "node:dns/promises";
import { isIP } from "node:net";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import type { Sql } from "@/lib/db";
import { advisorNoteLetter, applyEmailStyle } from "@/lib/email-templates";
import { emailLogoFile, sendFromMailbox, type MailFile, readEmailStyles } from "@/lib/mail.server";

const DAY = 24 * 60 * 60 * 1000;

export function latestMessageText(value: string) {
  const text = value.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").trim();
  if (!text) return "";
  const lines = text.split("\n");
  let cut = lines.length;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const window = lines.slice(index, index + 4).join(" ").replace(/\s+/g, " ").trim();
    const wrote = /^on\b[\s\S]{0,280}\bwrote:\s*$/i.test(window);
    const marker = /^-{2,}\s*original message\s*-{2,}$/i.test(line)
      || /^-{5,}\s*forwarded message\s*-{5,}$/i.test(line)
      || /^_{8,}$/.test(line)
      || /^begin forwarded message:?$/i.test(line)
      || line.startsWith(">");
    const outlook = /^from:\s+\S/i.test(line) && lines.slice(index + 1, index + 6).some((item) => /^(sent|date|to|cc|subject):\s/i.test(item.trim()));
    if (wrote || marker || outlook) {
      cut = index;
      break;
    }
  }
  const fresh = lines.slice(0, cut).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (fresh) return fresh;
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length > 0 && compact.length <= 1200) return compact;
  return "No new text. The rest repeats an earlier message.";
}

export async function ensureInbox(sql: Sql) {
  await sql`alter table advisors add column if not exists imap_host text not null default ''`;
  await sql`alter table advisors add column if not exists imap_port integer not null default 993`;
  await sql`alter table advisors add column if not exists imap_user text not null default ''`;
  await sql`alter table advisors add column if not exists imap_password text not null default ''`;
  await sql`alter table advisors add column if not exists imap_secure boolean not null default true`;
  await sql`alter table advisors add column if not exists imap_last_uid integer not null default 0`;
  await sql`
    create table if not exists inbox_messages (
      id text primary key,
      advisor_id text not null,
      direction text not null default 'in',
      uid integer not null default 0,
      message_id text not null default '',
      from_name text not null default '',
      from_email text not null default '',
      to_name text not null default '',
      to_email text not null default '',
      subject text not null default '',
      body_text text not null default '',
      lead_id text not null default '',
      received_at timestamptz not null default now(),
      seen boolean not null default false
    )
  `;
  await sql`alter table inbox_messages add column if not exists telegram_notified boolean not null default false`;
  await sql`alter table inbox_messages add column if not exists telegram_attempts integer not null default 0`;
  await sql`alter table inbox_messages add column if not exists telegram_body boolean not null default false`;
  await sql`alter table inbox_messages add column if not exists folder text not null default 'INBOX'`;
  await sql`alter table inbox_messages add column if not exists body_raw text not null default ''`;
  await sql`alter table inbox_messages add column if not exists attachments jsonb not null default '[]'::jsonb`;
}

type MailboxRow = {
  id: string;
  name: string;
  imap_host: string;
  imap_port: number;
  imap_user: string;
  imap_password: string;
  imap_secure: boolean;
  imap_last_uid: number;
};

export async function syncInboxes(sql: Sql) {
  const run = inboxQueue.then(() => syncInboxesNow(sql));
  inboxQueue = run.then(() => undefined, () => undefined);
  return run;
}

async function syncInboxesNow(sql: Sql) {
  await ensureInbox(sql);
  const advisors = await sql<MailboxRow>`
    select id, name, imap_host, imap_port, imap_user, imap_password, imap_secure, coalesce(imap_last_uid, 0) as imap_last_uid
    from advisors
    where imap_host <> '' and imap_user <> '' and imap_password <> ''
  `;
  let added = 0;
  let notified = 0;
  let telegram = "";
  let detail = "";
  const errors: string[] = [];
  for (const advisor of advisors) {
    try {
      const result = await syncAdvisor(sql, advisor);
      added += result.added;
      notified += result.notified;
      if (result.telegram) telegram = result.telegram;
      if (result.detail) detail = [detail, result.detail].filter(Boolean).join(" · ");
    } catch (caught) {
      const detailText = caught instanceof Error && caught.message ? caught.message : "could not connect";
      errors.push(`${advisor.name || advisor.imap_user}: ${detailText}`);
    }
  }
  if (errors.length) await reportInboxFailure(sql, errors.join("\n"));
  else await sql`delete from site_settings where key = 'inbox_sync_error'`;
  return { added, checked: advisors.length, errors, notified, telegram, detail };
}

function failureKey(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 500);
}

async function reportInboxFailure(sql: Sql, text: string) {
  const key = failureKey(text);
  const rows = await sql<{ key: string; value: string }>`
    select key, value from site_settings where key in ('inbox_sync_error', 'inbox_sync_notice_at')
  `;
  const previous = rows.find((row) => row.key === "inbox_sync_error")?.value ?? "";
  const noticed = Date.parse(rows.find((row) => row.key === "inbox_sync_notice_at")?.value ?? "");
  const same = previous === key;
  const recent = Number.isFinite(noticed) && Date.now() - noticed < 6 * 60 * 60 * 1000;
  await sql`
    insert into site_settings (key, value) values ('inbox_sync_error', ${key})
    on conflict (key) do update set value = excluded.value
  `;
  if (same || recent) return;
  await sql`
    insert into site_settings (key, value) values ('inbox_sync_notice_at', ${new Date().toISOString()})
    on conflict (key) do update set value = excluded.value
  `;
  const { sendTelegramNotice } = await import("@/lib/mail.server");
  await sendTelegramNotice(sql, "Inbox sync failed", key).catch(() => undefined);
}

async function resolve4(host: string, servers?: string[]) {
  const resolver = new Resolver();
  if (servers) resolver.setServers(servers);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      resolver.resolve4(host),
      new Promise<string[]>((_, reject) => {
        timer = setTimeout(() => {
          resolver.cancel();
          reject(new Error("timeout"));
        }, 4000);
      }),
    ]);
  } catch {
    return [];
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function mailboxAddresses(host: string) {
  if (isIP(host)) return [host];
  const found: string[] = [];
  const add = (list: string[]) => {
    for (const ip of list) if (ip && !found.includes(ip)) found.push(ip);
  };
  add(await resolve4(host));
  add(await resolve4(host, ["1.1.1.1", "8.8.8.8"]));
  if (found.length) return found.slice(0, 3);
  try {
    const looked = await lookup(host, { family: 4, all: true });
    add(looked.map((item) => item.address));
  } catch {
    /* connect with the hostname itself */
  }
  return found.length ? found.slice(0, 3) : [host];
}

async function connectMailbox(name: string, address: string, port: number, secure: boolean, advisor: MailboxRow) {
  const client = new ImapFlow({
    host: address,
    port,
    secure,
    auth: { user: advisor.imap_user, pass: advisor.imap_password },
    tls: { rejectUnauthorized: false, ...(isIP(name) ? {} : { servername: name }) },
    logger: false,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 45000,
    disableAutoIdle: true,
  });
  client.on("error", () => undefined);
  try {
    await client.connect();
    return client;
  } catch (caught) {
    try {
      client.close();
    } catch {
      /* the failed socket is already closed */
    }
    const message = caught instanceof Error && caught.message ? caught.message : "could not connect";
    throw new Error(`${address}: ${message}`);
  }
}

async function openMailbox(advisor: MailboxRow) {
  const name = advisor.imap_host.trim().replace(/^[a-z]+:\/\//i, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
  const port = Number(advisor.imap_port) || 993;
  const secure = port === 143 ? false : port === 993 ? true : advisor.imap_secure !== false;
  const addresses = await mailboxAddresses(name);
  let last = "";
  for (const address of addresses) {
    try {
      return await connectMailbox(name, address, port, secure, advisor);
    } catch (caught) {
      last = caught instanceof Error ? caught.message : "could not connect";
    }
  }
  if (/required time|timed out|timeout/i.test(last)) {
    throw new Error(`Could not reach ${name} (${addresses.join(", ")}) on port ${port}. Nothing answered. In Advisors, set the IMAP host to the new mail server address, port 993, with SSL checked.`);
  }
  throw new Error(`${name} (${addresses.join(", ")}) on port ${port}: ${last || "could not connect"}`);
}

async function syncAdvisor(sql: Sql, advisor: MailboxRow) {
  try {
    return await readAdvisor(sql, advisor);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/timed out|timeout|required time|Nothing answered|ECONNRESET|socket|closed/i.test(message)) throw error;
    return readAdvisor(sql, advisor);
  }
}

async function readAdvisor(sql: Sql, advisor: MailboxRow) {
  const client = await openMailbox(advisor);
  let added = 0;
  const fresh: string[] = [];
  const pictures = new Map<string, MailFile[]>();
  const notes: string[] = [];
  try {
    for (const folder of ["INBOX", "INBOX.Junk", "INBOX.spam", "Junk", "Spam"]) {
      try {
        const result = await readFolder(sql, client, advisor, folder, fresh, pictures);
        added += result.added;
        if (result.detail) notes.push(result.detail);
      } catch (error) {
        if (folder === "INBOX") throw error;
      }
    }
  } finally {
    await client.logout().catch(() => undefined);
  }
  const notice = await notifyInbox(sql, advisor, fresh, pictures);
  return { added, notified: notice.sent, telegram: notice.note, detail: notes.join(" · ") };
}

async function readFolder(sql: Sql, client: ImapFlow, advisor: MailboxRow, folder: string, fresh: string[], pictures: Map<string, MailFile[]>) {
  let lock: { release: () => void };
  try {
    lock = await client.getMailboxLock(folder);
  } catch {
    return { added: 0, detail: "" };
  }
  let added = 0;
  let latest = "";
  try {
    const box = client.mailbox;
    const exists = box && typeof box === "object" ? Number(box.exists || 0) : 0;
    if (!exists) return { added: 0, detail: folder === "INBOX" ? "INBOX is empty" : "" };
    const start = Math.max(1, exists - 29);
    for await (const message of client.fetch(`${start}:${exists}`, { uid: true, source: true, internalDate: true })) {
      const uid = Number(message.uid || 0);
      if (!uid || !message.source) continue;
      const parsed = await simpleParser(message.source);
      const from = parsed.from?.value?.[0];
      const to = parsed.to && !Array.isArray(parsed.to) ? parsed.to.value?.[0] : Array.isArray(parsed.to) ? parsed.to[0]?.value?.[0] : undefined;
      const fromEmail = (from?.address || "").trim().toLowerCase();
      const lead = fromEmail
        ? await sql<{ id: string }>`select id from crm_leads where lower(email) = ${fromEmail} order by received_at desc limit 1`
        : [];
      const rawHtml = typeof parsed.html === "string" ? parsed.html : "";
      const rawSource = (parsed.text || rawHtml.replace(/<[^>]+>/g, " ") || "").replace(/\s+\n/g, "\n").trim().slice(0, 12000);
      const body = latestMessageText(rawSource).slice(0, 20000);
      const receivedAt = message.internalDate instanceof Date ? message.internalDate : parsed.date instanceof Date && !Number.isNaN(parsed.date.getTime()) ? parsed.date : new Date();
      const messageId = (parsed.messageId || "").slice(0, 300);
      const subject = (parsed.subject || "(no subject)").slice(0, 300);
      latest = `${subject} from ${fromEmail || "unknown"}`;
      if (folder !== "INBOX" && Date.now() - receivedAt.getTime() > 2 * DAY) continue;
      const images = emailFiles(parsed.attachments);
      const known = messageId
        ? await sql<{ id: string; attachments: unknown }>`
            select id, attachments from inbox_messages
            where direction = 'in' and message_id = ${messageId}
            limit 1
          `
        : await sql<{ id: string; attachments: unknown }>`
            select id, attachments from inbox_messages
            where advisor_id = ${advisor.id} and direction = 'in' and uid = ${uid} and coalesce(folder, 'INBOX') = ${folder}
              and from_email = ${fromEmail.slice(0, 160)} and subject = ${subject}
            limit 1
          `;
      if (known[0]) {
        const storedCount = storedInboxFiles(known[0].attachments).length;
        if (images.length > storedCount) {
          const stored = JSON.stringify(images.map((file) => ({ filename: file.filename, contentType: file.contentType, content: file.content })));
          await sql`update inbox_messages set attachments = ${stored}::jsonb, telegram_notified = false, telegram_attempts = 0 where id = ${known[0].id}`;
          fresh.push(known[0].id);
          pictures.set(known[0].id, images);
        }
        continue;
      }
      const id = crypto.randomUUID();
      const stored = JSON.stringify(images.map((file) => ({ filename: file.filename, contentType: file.contentType, content: file.content })));
      await sql`
        insert into inbox_messages (
          id, advisor_id, direction, uid, message_id, from_name, from_email, to_name, to_email, subject, body_text, body_raw, lead_id, received_at, seen, folder, attachments
        ) values (
          ${id},
          ${advisor.id},
          'in',
          ${uid},
          ${messageId},
          ${(from?.name || "").slice(0, 160)},
          ${fromEmail.slice(0, 160)},
          ${(to?.name || "").slice(0, 160)},
          ${(to?.address || advisor.imap_user).slice(0, 160)},
          ${subject},
          ${body},
          ${rawSource},
          ${lead[0]?.id || ""},
          ${receivedAt.toISOString()},
          false,
          ${folder},
          ${stored}::jsonb
        )
      `;
      fresh.push(id);
      if (images.length) pictures.set(id, images);
      added += 1;
    }
  } finally {
    lock.release();
  }
  return { added, detail: latest ? `${folder}: latest “${latest}”` : "" };
}

function emailFiles(attachments: Array<{ filename?: string; contentType?: string; content?: Buffer; size?: number }> | undefined): Array<MailFile & { contentType: string }> {
  const files: Array<MailFile & { contentType: string }> = [];
  for (const attachment of attachments || []) {
    const type = (attachment.contentType || "application/octet-stream").split(";")[0].trim().toLowerCase();
    if (type.startsWith("multipart/") || type === "text/html" || type === "text/plain" || /pkcs7|pgp-signature|ms-tnef/.test(type)) continue;
    const bytes = attachment.content ? Buffer.from(attachment.content) : null;
    const size = bytes?.length || attachment.size || 0;
    if (!bytes || size < 1 || size > 20_000_000) continue;
    const name = (attachment.filename || "").trim();
    const image = isImageFile(type, name, bytes);
    if (image) {
      if (size < 1024) continue;
      if (size < 8192 && (!name || /pixel|spacer|logo|icon|signature|blank|track/i.test(name))) continue;
    } else if (!name || size < 32) {
      continue;
    }
    const filename = image ? imageFilename(name, type, bytes, files.length + 1) : (name || `file-${files.length + 1}`).replace(/[^\w.\-]+/g, "-").slice(0, 80);
    const contentType = image ? imageType(type, filename, bytes) : type || "application/octet-stream";
    files.push({ filename, contentType, content: bytes.toString("base64") });
    if (files.length >= 8) break;
  }
  return files;
}

function isImageFile(type: string, name: string, bytes: Buffer) {
  if (type.startsWith("image/") && !type.includes("svg")) return true;
  if (/\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?)$/i.test(name)) return true;
  return imageKind(bytes) !== "";
}

function imageKind(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes.toString("ascii", 1, 4) === "PNG") return "png";
  const head = bytes.toString("ascii", 0, 6);
  if (head === "GIF87a" || head === "GIF89a") return "gif";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  return "";
}

function imageType(type: string, filename: string, bytes: Buffer) {
  const kind = imageKind(bytes);
  if (kind === "jpg") return "image/jpeg";
  if (kind === "png") return "image/png";
  if (kind === "gif") return "image/gif";
  if (kind === "webp") return "image/webp";
  if (type.startsWith("image/") && !type.includes("svg")) return type;
  if (/\.png$/i.test(filename)) return "image/png";
  if (/\.gif$/i.test(filename)) return "image/gif";
  if (/\.webp$/i.test(filename)) return "image/webp";
  return "image/jpeg";
}

function imageFilename(name: string, type: string, bytes: Buffer, index: number) {
  const kind = imageKind(bytes);
  const fromName = /\.(jpe?g|png|gif|webp|heic|heif)$/i.exec(name)?.[1]?.toLowerCase().replace("jpeg", "jpg") || "";
  const extension = kind || fromName || (type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("gif") ? "gif" : type.includes("heic") ? "heic" : type.includes("heif") ? "heif" : "jpg");
  const base = (name || `photo-${index}.${extension}`).replace(/[^\w.\-]+/g, "-").slice(0, 70);
  if (/\.(jpe?g|png|gif|webp|heic|heif)$/i.test(base)) return base;
  return `${base.replace(/\.+$/, "") || `photo-${index}`}.${extension}`;
}

let inboxQueue: Promise<void> = Promise.resolve();

async function notifyInbox(sql: Sql, advisor: MailboxRow, fresh: string[], pictures: Map<string, MailFile[]>) {
  await sql`
    update inbox_messages set telegram_notified = false, telegram_attempts = 0
    where id in (
      select id from inbox_messages
      where advisor_id = ${advisor.id} and direction = 'in' and telegram_body = false and telegram_notified = true
        and received_at > now() - interval '24 hours'
      order by received_at desc
      limit 1
    )
  `;
  const pending = await sql<{ id: string }>`
    select id from inbox_messages
    where advisor_id = ${advisor.id} and direction = 'in' and telegram_notified = false and coalesce(telegram_attempts, 0) < 3
      and received_at > now() - interval '3 days'
    order by received_at asc
    limit 5
  `;
  const ids = [...new Set([...fresh, ...pending.map((item) => item.id)].filter(Boolean))];
  let sent = 0;
  let note = "";
  for (const id of ids) {
    const result = await notifyInboxMessage(sql, advisor, id, pictures.get(id) || []);
    sent += result.sent;
    if (result.note) note = result.note;
  }
  return { sent, note };
}

async function notifyInboxMessage(sql: Sql, advisor: MailboxRow, id: string, memoryFiles: MailFile[]) {
  const rows = await sql<{ id: string; from_name: string; from_email: string; subject: string; message_id: string; body_text: string; body_raw: string; attachments: unknown; telegram_attempts: number }>`
    select id, from_name, from_email, subject, coalesce(message_id, '') as message_id, coalesce(body_text, '') as body_text, coalesce(body_raw, '') as body_raw, attachments, coalesce(telegram_attempts, 0) as telegram_attempts
    from inbox_messages
    where id = ${id} and telegram_notified = false
    limit 1
  `;
  const row = rows[0];
  if (!row) return { sent: 0, note: "" };
  const claimed = await sql<{ id: string }>`
    update inbox_messages set telegram_notified = true, telegram_attempts = coalesce(telegram_attempts, 0) + 1
    where id = ${row.id} and telegram_notified = false
    returning id
  `;
  if (!claimed[0]) return { sent: 0, note: "" };
  if (row.message_id) {
    const prior = await sql<{ id: string }>`
      select id from inbox_messages
      where direction = 'in' and telegram_body = true and message_id = ${row.message_id} and id <> ${row.id}
      limit 1
    `;
    if (prior[0]) return { sent: 0, note: "" };
  }
  const who = row.from_name?.trim() ? `${row.from_name.trim()} <${row.from_email}>` : row.from_email || "Unknown sender";
  const body = inboxNoticeBody(row.body_text, row.body_raw);
  const short = body.length > 0 && body.length <= 700;
  const visible = [`From: ${who}`, `Subject: ${row.subject || "(no subject)"}`, short ? body : ""].filter(Boolean).join("\n");
  const files = memoryFiles.length ? memoryFiles : storedInboxFiles(row.attachments);
  const { sendTelegramNotice } = await import("@/lib/mail.server");
  try {
    const result = await sendTelegramNotice(sql, `New email for ${advisor.name || advisor.imap_user}`, visible, short ? "" : body, files);
    if (result.delivery !== "sent") {
      const attempts = Number(row.telegram_attempts) + 1;
      if (attempts < 3) await sql`update inbox_messages set telegram_notified = false where id = ${row.id}`;
      return { sent: 0, note: result.error || "Telegram did not accept the notice." };
    }
    await sql`update inbox_messages set telegram_body = true where id = ${row.id}`;
    if (row.message_id) {
      await sql`update inbox_messages set telegram_notified = true, telegram_body = true where direction = 'in' and message_id = ${row.message_id}`;
    }
    return { sent: 1, note: "" };
  } catch (error) {
    const attempts = Number(row.telegram_attempts) + 1;
    if (attempts < 3) await sql`update inbox_messages set telegram_notified = false where id = ${row.id}`;
    return { sent: 0, note: error instanceof Error ? error.message : "Telegram did not accept the notice." };
  }
}

function inboxNoticeBody(body: string, raw: string) {
  const text = (body || "").trim();
  const source = (raw || "").trim();
  if (text && text !== "No new text. The rest repeats an earlier message.") return text.slice(0, 3500);
  if (source.length > 0 && source.length <= 1200) return source;
  return text.slice(0, 3500);
}

function storedInboxFiles(value: unknown): MailFile[] {
  const stored = Array.isArray(value) ? value : typeof value === "string" ? (JSON.parse(value) as unknown[]) : [];
  return stored.flatMap((item) => {
    const file = item as { filename?: string; contentType?: string; content?: string };
    if (!file?.content) return [];
    return [{ filename: file.filename || "photo.jpg", contentType: file.contentType || "application/octet-stream", content: file.content }];
  });
}
export async function listInbox(sql: Sql, advisorId: string) {
  await ensureInbox(sql);
  const rows = advisorId
    ? await sql<{
        id: string;
        advisor_id: string;
        advisor_name: string;
        direction: string;
        from_name: string;
        from_email: string;
        to_name: string;
        to_email: string;
        subject: string;
        body_text: string;
        lead_id: string;
        lead_name: string;
        received_at: string;
        seen: boolean;
        files: unknown;
      }>`
        select m.id, m.advisor_id, coalesce(a.name, '') as advisor_name, m.direction,
          m.from_name, m.from_email, m.to_name, m.to_email, m.subject, m.body_text, m.lead_id,
          coalesce(l.name, '') as lead_name,
          to_char(m.received_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as received_at,
          m.seen,
          (
            select coalesce(jsonb_agg(jsonb_build_object('filename', item->>'filename', 'contentType', item->>'contentType')), '[]'::jsonb)
            from jsonb_array_elements(coalesce(m.attachments, '[]'::jsonb)) item
          ) as files
        from inbox_messages m
        left join advisors a on a.id = m.advisor_id
        left join crm_leads l on l.id = m.lead_id
        where m.advisor_id = ${advisorId}
        order by m.received_at desc
        limit 200
      `
    : await sql<{
        id: string;
        advisor_id: string;
        advisor_name: string;
        direction: string;
        from_name: string;
        from_email: string;
        to_name: string;
        to_email: string;
        subject: string;
        body_text: string;
        lead_id: string;
        lead_name: string;
        received_at: string;
        seen: boolean;
        files: unknown;
      }>`
        select m.id, m.advisor_id, coalesce(a.name, '') as advisor_name, m.direction,
          m.from_name, m.from_email, m.to_name, m.to_email, m.subject, m.body_text, m.lead_id,
          coalesce(l.name, '') as lead_name,
          to_char(m.received_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as received_at,
          m.seen,
          (
            select coalesce(jsonb_agg(jsonb_build_object('filename', item->>'filename', 'contentType', item->>'contentType')), '[]'::jsonb)
            from jsonb_array_elements(coalesce(m.attachments, '[]'::jsonb)) item
          ) as files
        from inbox_messages m
        left join advisors a on a.id = m.advisor_id
        left join crm_leads l on l.id = m.lead_id
        order by m.received_at desc
        limit 200
      `;
  return rows.map((row) => ({
    id: row.id,
    advisorId: row.advisor_id,
    advisorName: row.advisor_name,
    direction: row.direction,
    fromName: row.from_name,
    fromEmail: row.from_email,
    toName: row.to_name,
    toEmail: row.to_email,
    subject: row.subject,
    body: latestMessageText(row.body_text),
    leadId: row.lead_id,
    leadName: row.lead_name,
    receivedAt: row.received_at,
    seen: row.seen,
    files: fileMeta(row.files),
  }));
}

function fileMeta(value: unknown) {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      parsed = [];
    }
  }
  const rows = Array.isArray(parsed) ? parsed : [];
  return rows.flatMap((item) => {
    const file = item as { filename?: string; contentType?: string };
    const filename = (file.filename || "").trim();
    if (!filename) return [];
    return [{ filename, contentType: file.contentType || "application/octet-stream" }];
  });
}

export async function readInboxFiles(sql: Sql, id: string) {
  await ensureInbox(sql);
  const rows = await sql<{ attachments: unknown }>`select attachments from inbox_messages where id = ${id} limit 1`;
  const value = rows[0]?.attachments;
  const stored = Array.isArray(value) ? value : typeof value === "string" ? (JSON.parse(value) as unknown[]) : [];
  return stored.flatMap((item) => {
    const file = item as { filename?: string; contentType?: string; content?: string };
    if (!file.content) return [];
    return [{ filename: file.filename || "file", contentType: file.contentType || "application/octet-stream", content: file.content }];
  });
}

export async function markInboxRead(sql: Sql, id: string) {
  await sql`update inbox_messages set seen = true where id = ${id}`;
}

export async function previewInboxLetter(
  sql: Sql,
  input: { advisorId: string; toEmail?: string; toName?: string; subject?: string; message?: string; quote?: string },
) {
  const advisors = await sql<{ id: string; name: string; phone: string; email: string; mailbox: string; role: string; personal_phone: string }>`
    select id, name, phone, email, coalesce(mailbox, '') as mailbox, coalesce(role, '') as role, coalesce(personal_phone, '') as personal_phone
    from advisors where id = ${input.advisorId}
  `;
  const advisor = advisors[0];
  if (!advisor) throw new Error("Select an advisor.");
  const companyRows = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('company_name', 'company_phone', 'email_logo', 'public_domain')`;
  const company = companyRows.find((row) => row.key === "company_name")?.value?.trim() || "Account Holding";
  const companyPhone = companyRows.find((row) => row.key === "company_phone")?.value?.trim() || "";
  const logo = companyRows.find((row) => row.key === "email_logo")?.value || null;
  const pageUrl = companyRows.find((row) => row.key === "public_domain")?.value || "";
  const toName = (input.toName || "").trim();
  const toEmail = (input.toEmail || "").trim();
  const letter = advisorNoteLetter({
    company,
    companyPhone,
    logo,
    pageUrl,
    advisor: { name: advisor.name, phone: advisor.phone, email: advisor.email, mailbox: advisor.mailbox, role: advisor.role, personalPhone: advisor.personal_phone },
    greeting: toName ? `Dear ${toName},` : "Hello,",
    message: (input.message || "").trim() || " ",
    quote: input.quote,
  });
  const styles = await readEmailStyles(sql);
  return {
    html: applyEmailStyle(letter.html, styles.advisor, styles.colors),
    from: advisor.mailbox ? `${advisor.name} <${advisor.mailbox}>` : advisor.name,
    to: toEmail ? `${toName || "Lead"} <${toEmail}>` : toName || "Lead",
    subject: (input.subject || "").trim() || "(no subject)",
  };
}

export async function sendInboxMail(
  sql: Sql,
  input: { advisorId: string; toEmail: string; toName: string; subject: string; message: string; quote?: string; leadId?: string },
) {
  const advisors = await sql<{ id: string; name: string; phone: string; email: string; mailbox: string; role: string; personal_phone: string }>`
    select id, name, phone, email, coalesce(mailbox, '') as mailbox, coalesce(role, '') as role, coalesce(personal_phone, '') as personal_phone
    from advisors where id = ${input.advisorId}
  `;
  const advisor = advisors[0];
  if (!advisor?.mailbox.trim()) throw new Error("This advisor has no verified mailbox to send from.");
  const to = input.toEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("Enter a valid recipient.");
  const subject = input.subject.trim().slice(0, 300);
  const message = input.message.trim().slice(0, 8000);
  if (!subject || !message) throw new Error("Add a subject and a message.");
  const companyRows = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('company_name', 'company_phone', 'email_logo', 'public_domain')`;
  const company = companyRows.find((row) => row.key === "company_name")?.value?.trim() || "Account Holding";
  const companyPhone = companyRows.find((row) => row.key === "company_phone")?.value?.trim() || "";
  const logo = companyRows.find((row) => row.key === "email_logo")?.value || null;
  const pageUrl = companyRows.find((row) => row.key === "public_domain")?.value || "";
  const logoFile = emailLogoFile(logo);
  const letter = advisorNoteLetter({
    company,
    companyPhone,
    logo,
    pageUrl,
    logoCid: logoFile?.filename || "",
    advisor: { name: advisor.name, phone: advisor.phone, email: advisor.email, mailbox: advisor.mailbox, role: advisor.role, personalPhone: advisor.personal_phone },
    greeting: input.toName.trim() ? `Dear ${input.toName.trim()},` : "Hello,",
    message,
  });
  const styles = await readEmailStyles(sql);
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(advisor.email) ? advisor.email : advisor.mailbox;
  const sent = await sendFromMailbox(sql, {
    to,
    subject,
    text: letter.text,
    html: applyEmailStyle(letter.html, styles.advisor, styles.colors),
    fromAddress: advisor.mailbox,
    replyTo,
    replyName: advisor.name,
    attachments: logoFile ? [logoFile] : [],
  });
  if (sent.delivery !== "sent") throw new Error(sent.error || "The message was not accepted. Check the advisor mailbox in SMTP2GO.");
  await ensureInbox(sql);
  await sql`
    insert into inbox_messages (
      id, advisor_id, direction, uid, from_name, from_email, to_name, to_email, subject, body_text, lead_id, received_at, seen
    ) values (
      ${crypto.randomUUID()},
      ${advisor.id},
      'out',
      0,
      ${advisor.name},
      ${advisor.mailbox},
      ${input.toName.trim().slice(0, 160)},
      ${to},
      ${subject},
      ${message},
      ${input.leadId || ""},
      ${new Date().toISOString()},
      true
    )
  `;
  const who = input.toName.trim() ? `${input.toName.trim()} <${to}>` : to;
  const { sendTelegramNotice } = await import("@/lib/mail.server");
  const notice = await sendTelegramNotice(
    sql,
    `Inbox email from ${advisor.name}`,
    [`To: ${who}`, `Subject: ${subject}`].join("\n"),
    letter.text,
  ).catch((error: unknown) => ({ delivery: "failed", error: error instanceof Error ? error.message : "Telegram did not accept the notice." }));
  if (notice.delivery !== "sent") console.error("[inbox] Telegram notice failed:", notice.error || notice.delivery);
  return { telegram: notice.delivery === "sent" };
}

const globalRef = globalThis as typeof globalThis & { __inboxTimer?: ReturnType<typeof setInterval>; __inboxRunning?: boolean };

export function ensureInboxSchedule() {
  if (globalRef.__inboxTimer) return;
  globalRef.__inboxTimer = setInterval(() => void runInboxSync(), 2 * 60 * 1000);
  void runInboxSync();
}

async function runInboxSync() {
  if (globalRef.__inboxRunning) return;
  globalRef.__inboxRunning = true;
  try {
    const { getSql } = await import("@/lib/db");
    await syncInboxes(await getSql());
  } catch (error) {
    console.error("[inbox] sync failed:", error);
  } finally {
    globalRef.__inboxRunning = false;
  }
}
