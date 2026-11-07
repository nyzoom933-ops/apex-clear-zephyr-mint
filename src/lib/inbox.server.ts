import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import type { Sql } from "@/lib/db";
import { advisorNoteLetter } from "@/lib/email-templates";
import { sendFromMailbox } from "@/lib/mail.server";

const DAY = 24 * 60 * 60 * 1000;

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
  await ensureInbox(sql);
  const advisors = await sql<MailboxRow>`
    select id, name, imap_host, imap_port, imap_user, imap_password, imap_secure, coalesce(imap_last_uid, 0) as imap_last_uid
    from advisors
    where imap_host <> '' and imap_user <> '' and imap_password <> ''
  `;
  let added = 0;
  const errors: string[] = [];
  for (const advisor of advisors) {
    try {
      added += await syncAdvisor(sql, advisor);
    } catch (caught) {
      const detail = caught instanceof Error && caught.message ? caught.message : "could not connect";
      errors.push(`${advisor.name || advisor.imap_user}: ${detail}`);
    }
  }
  return { added, checked: advisors.length, errors };
}

async function syncAdvisor(sql: Sql, advisor: MailboxRow) {
  const client = new ImapFlow({
    host: advisor.imap_host,
    port: Number(advisor.imap_port) || 993,
    secure: advisor.imap_secure !== false,
    auth: { user: advisor.imap_user, pass: advisor.imap_password },
    logger: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });
  let added = 0;
  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    const first = !advisor.imap_last_uid;
    const since = new Date(Date.now() - 14 * DAY);
    const found = first ? await client.search({ since }, { uid: true }) : await client.search({ uid: `${advisor.imap_last_uid + 1}:*` }, { uid: true });
    const uids = (found || []).map((uid) => Number(uid)).filter((uid) => uid > advisor.imap_last_uid).slice(-40);
    let max = advisor.imap_last_uid;
    for (const uid of uids) {
      const message = await client.fetchOne(String(uid), { source: true, internalDate: true }, { uid: true });
      if (!message || !message.source) continue;
      const parsed = await simpleParser(message.source);
      const from = parsed.from?.value?.[0];
      const to = parsed.to && !Array.isArray(parsed.to) ? parsed.to.value?.[0] : Array.isArray(parsed.to) ? parsed.to[0]?.value?.[0] : undefined;
      const fromEmail = (from?.address || "").trim().toLowerCase();
      const lead = fromEmail
        ? await sql<{ id: string }>`select id from crm_leads where lower(email) = ${fromEmail} order by received_at desc limit 1`
        : [];
      const rawHtml = typeof parsed.html === "string" ? parsed.html : "";
      const body = (parsed.text || rawHtml.replace(/<[^>]+>/g, " ") || "").replace(/\s+\n/g, "\n").trim().slice(0, 20000);
      const receivedAt = parsed.date instanceof Date ? parsed.date : message.internalDate instanceof Date ? message.internalDate : new Date();
      const existing = await sql<{ id: string }>`
        select id from inbox_messages where advisor_id = ${advisor.id} and direction = 'in' and uid = ${uid} limit 1
      `;
      if (existing[0]) {
        max = Math.max(max, uid);
        continue;
      }
      await sql`
        insert into inbox_messages (
          id, advisor_id, direction, uid, message_id, from_name, from_email, to_name, to_email, subject, body_text, lead_id, received_at, seen
        ) values (
          ${crypto.randomUUID()},
          ${advisor.id},
          'in',
          ${uid},
          ${(parsed.messageId || "").slice(0, 300)},
          ${(from?.name || "").slice(0, 160)},
          ${fromEmail.slice(0, 160)},
          ${(to?.name || "").slice(0, 160)},
          ${(to?.address || advisor.imap_user).slice(0, 160)},
          ${(parsed.subject || "(no subject)").slice(0, 300)},
          ${body},
          ${lead[0]?.id || ""},
          ${receivedAt.toISOString()},
          false
        )
      `;
      added += 1;
      max = Math.max(max, uid);
      if (!first) {
        const { sendTelegramNotice } = await import("@/lib/mail.server");
        const who = from?.name?.trim() ? `${from.name.trim()} <${fromEmail}>` : fromEmail || "Unknown sender";
        const preview = body.replace(/\s+/g, " ").trim().slice(0, 280);
        await sendTelegramNotice(
          sql,
          `New email for ${advisor.name || advisor.imap_user}`,
          [`From: ${who}`, `Subject: ${parsed.subject || "(no subject)"}`, lead[0] ? "Matched a lead." : "", preview].filter(Boolean).join("\n"),
        ).catch(() => undefined);
      }
    }
    await sql`update advisors set imap_last_uid = ${max} where id = ${advisor.id}`;
  } finally {
    lock.release();
    await client.logout().catch(() => undefined);
  }
  return added;
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
    body: row.body_text,
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
  const company = companyRows.find((row) => row.key === "company_name")?.value.trim() || "Account Holding";
  const companyPhone = companyRows.find((row) => row.key === "company_phone")?.value.trim() || "";
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
  const company = companyRows.find((row) => row.key === "company_name")?.value.trim() || "Account Holding";
  const companyPhone = companyRows.find((row) => row.key === "company_phone")?.value.trim() || "";
  const logo = companyRows.find((row) => row.key === "email_logo")?.value || null;
  const letter = advisorNoteLetter({
    company,
    companyPhone,
    logo,
    advisor: { name: advisor.name, phone: advisor.phone, email: advisor.email, mailbox: advisor.mailbox, role: advisor.role, personalPhone: advisor.personal_phone },
    greeting: input.toName.trim() ? `Dear ${input.toName.trim()},` : "Hello,",
    message,
    quote: input.quote,
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
  if (sent.delivery !== "sent") throw new Error("The message was not accepted. Check the advisor mailbox in SMTP2GO.");
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
  globalRef.__inboxTimer = setInterval(() => void runInboxSync(), 5 * 60 * 1000);
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
