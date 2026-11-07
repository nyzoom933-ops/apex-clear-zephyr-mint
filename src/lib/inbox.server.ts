import { lookup } from "node:dns/promises";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import type { Sql } from "@/lib/db";
import { advisorNoteLetter } from "@/lib/email-templates";
import { sendFromMailbox } from "@/lib/mail.server";

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
  return fresh || "No new text. The rest repeats an earlier message.";
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
  await sql`alter table inbox_messages add column if not exists folder text not null default 'INBOX'`;
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

async function reportInboxFailure(sql: Sql, text: string) {
  const rows = await sql<{ value: string }>`select value from site_settings where key = 'inbox_sync_error'`;
  if (rows[0]?.value === text) return;
  await sql`
    insert into site_settings (key, value) values ('inbox_sync_error', ${text.slice(0, 500)})
    on conflict (key) do update set value = excluded.value
  `;
  const { sendTelegramNotice } = await import("@/lib/mail.server");
  await sendTelegramNotice(sql, "Inbox sync failed", text).catch(() => undefined);
}

async function openMailbox(advisor: MailboxRow) {
  const name = advisor.imap_host.trim().replace(/^[a-z]+:\/\//i, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
  const savedPort = Number(advisor.imap_port) || 993;
  let address = name;
  try {
    address = (await lookup(name, { family: 4 })).address;
  } catch {
    address = name;
  }
  const attempts = savedPort === 993 ? [{ port: 993, secure: true }, { port: 143, secure: false }] : [{ port: savedPort, secure: advisor.imap_secure !== false }, { port: 993, secure: true }];
  let last = "Could not reach the mailbox.";
  for (const attempt of attempts) {
    const client = new ImapFlow({
      host: address,
      port: attempt.port,
      secure: attempt.secure,
      auth: { user: advisor.imap_user, pass: advisor.imap_password },
      tls: { rejectUnauthorized: false, servername: name },
      logger: false,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
      disableAutoIdle: true,
    });
    client.on("error", () => undefined);
    try {
      await client.connect();
      return client;
    } catch (caught) {
      const message = caught instanceof Error && caught.message ? caught.message : "could not connect";
      last = /required time/i.test(message) ? `Could not reach ${name} on port ${attempt.port}. Use the mail server host, usually mail.yourdomain.com.` : message;
      try {
        client.close();
      } catch {
        /* the failed socket is already closed */
      }
    }
  }
  throw new Error(last);
}

async function syncAdvisor(sql: Sql, advisor: MailboxRow) {
  const client = await openMailbox(advisor);
  let added = 0;
  const fresh: string[] = [];
  const notes: string[] = [];
  try {
    for (const folder of ["INBOX", "INBOX.Junk", "INBOX.spam", "Junk", "Spam"]) {
      try {
        const result = await readFolder(sql, client, advisor, folder, fresh);
        added += result.added;
        if (result.detail) notes.push(result.detail);
      } catch (error) {
        if (folder === "INBOX") throw error;
      }
    }
  } finally {
    await client.logout().catch(() => undefined);
  }
  const notice = await notifyInbox(sql, advisor, fresh);
  return { added, notified: notice.sent, telegram: notice.note, detail: notes.join(" · ") };
}

async function readFolder(sql: Sql, client: ImapFlow, advisor: MailboxRow, folder: string, fresh: string[]) {
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
    const start = Math.max(1, exists - 14);
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
      const body = latestMessageText(parsed.text || rawHtml.replace(/<[^>]+>/g, " ") || "").slice(0, 20000);
      const receivedAt = message.internalDate instanceof Date ? message.internalDate : parsed.date instanceof Date && !Number.isNaN(parsed.date.getTime()) ? parsed.date : new Date();
      latest = `${parsed.subject || "(no subject)"} from ${fromEmail || "unknown"}`;
      if (folder !== "INBOX" && Date.now() - receivedAt.getTime() > 2 * DAY) continue;
      const existing = await sql<{ id: string }>`
        select id from inbox_messages where advisor_id = ${advisor.id} and direction = 'in' and uid = ${uid} and coalesce(folder, 'INBOX') = ${folder} limit 1
      `;
      if (existing[0]) continue;
      const messageId = (parsed.messageId || "").slice(0, 300);
      if (messageId) {
        const duplicate = await sql<{ id: string }>`
          select id from inbox_messages where direction = 'in' and message_id = ${messageId} limit 1
        `;
        if (duplicate[0]) continue;
      }
      const id = crypto.randomUUID();
      await sql`
        insert into inbox_messages (
          id, advisor_id, direction, uid, message_id, from_name, from_email, to_name, to_email, subject, body_text, lead_id, received_at, seen, folder
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
          ${(parsed.subject || "(no subject)").slice(0, 300)},
          ${body},
          ${lead[0]?.id || ""},
          ${receivedAt.toISOString()},
          false,
          ${folder}
        )
      `;
      fresh.push(id);
      added += 1;
    }
  } finally {
    lock.release();
  }
  return { added, detail: latest ? `${folder}: latest “${latest}”` : "" };
}

let inboxQueue: Promise<void> = Promise.resolve();

async function notifyInbox(sql: Sql, advisor: MailboxRow, fresh: string[]) {
  const ids = [...new Set(fresh.filter(Boolean))];
  let row: { id: string; from_name: string; from_email: string; subject: string; body_text: string; received_at: string; message_id: string } | undefined;
  for (const id of ids) {
    const extra = await sql<{ id: string; from_name: string; from_email: string; subject: string; body_text: string; received_at: string; message_id: string }>`
      select id, from_name, from_email, subject, body_text, received_at, coalesce(message_id, '') as message_id
      from inbox_messages
      where id = ${id} and telegram_notified = false
      limit 1
    `;
    if (extra[0] && (!row || String(extra[0].received_at) > String(row.received_at))) row = extra[0];
  }
  if (!row) return { sent: 0, note: "" };
  const claimed = await sql<{ id: string }>`
    update inbox_messages set telegram_notified = true
    where id = ${row.id} and telegram_notified = false
    returning id
  `;
  if (!claimed[0]) return { sent: 0, note: "" };
  if (row.message_id) {
    const prior = await sql<{ id: string }>`
      select id from inbox_messages
      where direction = 'in' and telegram_notified = true and message_id = ${row.message_id} and id <> ${row.id}
      limit 1
    `;
    if (prior[0]) return { sent: 0, note: "" };
  }
  const who = row.from_name?.trim() ? `${row.from_name.trim()} <${row.from_email}>` : row.from_email || "Unknown sender";
  const text = (row.body_text || "").trim().slice(0, 3000);
  const { sendTelegramNotice } = await import("@/lib/mail.server");
  try {
    const result = await sendTelegramNotice(
      sql,
      `New email for ${advisor.name || advisor.imap_user}`,
      [`From: ${who}`, `Subject: ${row.subject || "(no subject)"}`, "", text || "(no text)"].join("\n"),
    );
    if (result.delivery !== "sent") {
      await sql`update inbox_messages set telegram_notified = false where id = ${row.id}`;
      return { sent: 0, note: result.error || "Telegram did not accept the notice." };
    }
    if (row.message_id) {
      await sql`update inbox_messages set telegram_notified = true where direction = 'in' and message_id = ${row.message_id}`;
    }
    return { sent: 1, note: "" };
  } catch (error) {
    await sql`update inbox_messages set telegram_notified = false where id = ${row.id}`;
    return { sent: 0, note: error instanceof Error ? error.message : "Telegram did not accept the notice." };
  }
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
      }>`
        select m.id, m.advisor_id, coalesce(a.name, '') as advisor_name, m.direction,
          m.from_name, m.from_email, m.to_name, m.to_email, m.subject, m.body_text, m.lead_id,
          coalesce(l.name, '') as lead_name,
          to_char(m.received_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as received_at,
          m.seen
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
      }>`
        select m.id, m.advisor_id, coalesce(a.name, '') as advisor_name, m.direction,
          m.from_name, m.from_email, m.to_name, m.to_email, m.subject, m.body_text, m.lead_id,
          coalesce(l.name, '') as lead_name,
          to_char(m.received_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as received_at,
          m.seen
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
  }));
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
  const companyRows = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('company_name', 'company_phone', 'email_logo')`;
  const company = companyRows.find((row) => row.key === "company_name")?.value?.trim() || "Account Holding";
  const companyPhone = companyRows.find((row) => row.key === "company_phone")?.value?.trim() || "";
  const logo = companyRows.find((row) => row.key === "email_logo")?.value || null;
  const toName = (input.toName || "").trim();
  const toEmail = (input.toEmail || "").trim();
  const letter = advisorNoteLetter({
    company,
    companyPhone,
    logo,
    advisor: { name: advisor.name, phone: advisor.phone, email: advisor.email, mailbox: advisor.mailbox, role: advisor.role, personalPhone: advisor.personal_phone },
    greeting: toName ? `Dear ${toName},` : "Hello,",
    message: (input.message || "").trim() || " ",
    quote: input.quote,
  });
  return {
    html: letter.html,
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
  const companyRows = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('company_name', 'company_phone', 'email_logo')`;
  const company = companyRows.find((row) => row.key === "company_name")?.value?.trim() || "Account Holding";
  const companyPhone = companyRows.find((row) => row.key === "company_phone")?.value?.trim() || "";
  const logo = companyRows.find((row) => row.key === "email_logo")?.value || null;
  const letter = advisorNoteLetter({
    company,
    companyPhone,
    logo,
    advisor: { name: advisor.name, phone: advisor.phone, email: advisor.email, mailbox: advisor.mailbox, role: advisor.role, personalPhone: advisor.personal_phone },
    greeting: input.toName.trim() ? `Dear ${input.toName.trim()},` : "Hello,",
    message,
  });
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(advisor.email) ? advisor.email : advisor.mailbox;
  const sent = await sendFromMailbox(sql, {
    to,
    subject,
    text: letter.text,
    html: letter.html,
    fromAddress: advisor.mailbox,
    replyTo,
    replyName: advisor.name,
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
