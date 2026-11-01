import { DEFAULT_COMPANY_NAME } from "@/lib/company";
import type { Sql } from "@/lib/db";
import { renderStep, type MailStep } from "@/lib/email-templates";
import { env } from "@/lib/env.server";

export type { MailStep };

const ADMIN_EMAIL = "admin@accountholding.com";

export async function ensureMailColumn(sql: Sql) {
  await sql`alter table notifications add column if not exists html text not null default ''`;
  await sql`alter table notifications add column if not exists read_at timestamptz`;
  await sql`alter table notifications add column if not exists resend_id text not null default ''`;
  await sql`alter table notifications add column if not exists mail_status text not null default ''`;
  await sql`alter table notifications add column if not exists status_at timestamptz`;
  await sql`alter table notifications add column if not exists mail_provider text not null default ''`;
}

async function readDeskEmail(sql: Sql) {
  const rows = await sql<{ value: string }>`select value from site_settings where key = 'desk_email'`;
  return rows[0]?.value?.trim().toLowerCase() || "";
}

export async function notifyStep(
  sql: Sql,
  input: {
    step: MailStep;
    clientEmail: string;
    clientName: string;
    detail: string;
    adminDetail?: string;
    attachments?: MailFile[];
    relatedId?: string;
    skipAdmin?: boolean;
    extraHtml?: string;
    replyTo?: string;
    replyName?: string;
    fromAddress?: string;
    subject?: string;
  },
) {
  const companyName = await readCompanyName(sql);
  const companyPhone = await readCompanyPhone(sql);
  const emailLogo = await readEmailLogo(sql);
  const origin = await portalOrigin(sql);
  const client = renderStep(input.step, "client", {
    name: input.clientName,
    email: input.clientEmail,
    detail: input.detail,
    companyName,
    companyPhone,
    emailLogo,
    portalUrl: origin,
    extraHtml: input.extraHtml,
  });
  const admin = renderStep(input.step, "admin", {
    name: input.clientName,
    email: input.clientEmail,
    detail: input.adminDetail || input.detail,
    companyName,
    companyPhone,
    emailLogo,
    extraHtml: input.extraHtml,
  });
  const adminTo = (await readDeskEmail(sql)) || env("ADMIN_EMAIL") || ADMIN_EMAIL;
  const messages = [
    { audience: "client" as const, recipient: input.clientEmail, mail: client, attachments: [] as MailFile[] },
    ...(input.skipAdmin ? [] : [{ audience: "admin" as const, recipient: adminTo, mail: admin, attachments: input.attachments ?? [] }]),
  ];
  await ensureMailColumn(sql);
  for (const message of messages) {
    const subject = message.audience === "client" && input.subject?.trim() ? input.subject.trim() : message.mail.subject;
    const advisorMail = message.audience === "client" && Boolean(input.replyTo);
    const result = await deliver(message.recipient, subject, message.mail.text, message.mail.html, companyName, sql, message.attachments, advisorMail ? input.replyTo || "" : "", advisorMail ? input.replyName || "" : "", advisorMail ? input.fromAddress || "" : "");
    await sql`
      insert into notifications (id, audience, recipient, step, subject, body, html, related_id, delivery, resend_id, mail_status, mail_provider)
      values (
        ${crypto.randomUUID()},
        ${message.audience},
        ${message.recipient},
        ${input.step},
        ${subject},
        ${message.mail.text},
        ${message.mail.html},
        ${input.relatedId ?? ""},
        ${result.delivery},
        ${result.messageId},
        ${result.delivery === "sent" ? "sent" : ""},
        ${result.provider}
      )
    `;
  }
}

async function portalOrigin(sql: Sql) {
  const rows = await sql<{ value: string }>`select value from site_settings where key = 'public_domain'`;
  const configured = rows[0]?.value?.trim().replace(/\/$/, "") || "";
  if (/^https?:\/\//i.test(configured)) return configured;
  return requestOrigin();
}

async function requestOrigin() {
  const configured = env("APP_URL") || env("PUBLIC_URL");
  if (configured) return configured.replace(/\/$/, "");
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const url = new URL(request.url);
    const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || url.protocol.replace(":", "");
    const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host") || url.host;
    if (host) return `${proto}://${host}`;
  } catch {
    return "";
  }
  return "";
}

async function readCompanyPhone(sql: Sql) {
  const rows = await sql<{ value: string }>`select value from site_settings where key = 'company_phone'`;
  return rows[0]?.value?.trim() || "";
}

async function readCompanyName(sql: Sql) {
  const rows = await sql<{ value: string }>`select value from site_settings where key = 'company_name'`;
  return rows[0]?.value?.trim() || DEFAULT_COMPANY_NAME;
}

async function readEmailLogo(sql: Sql) {
  const rows = await sql<{ value: string }>`select value from site_settings where key = 'email_logo'`;
  return rows[0]?.value || null;
}

export async function readMailConfig(sql: Sql) {
  const rows = await sql<{ key: string; value: string }>`
    select key, value from site_settings where key in ('resend_api_key', 'mail_from', 'smtp2go_api_key')
  `;
  let key = env("RESEND_API_KEY") || "";
  let from = env("MAIL_FROM") || "";
  let smtpKey = env("SMTP2GO_API_KEY") || "";
  for (const row of rows) {
    if (row.key === "resend_api_key" && row.value.trim()) key = row.value.trim();
    if (row.key === "mail_from" && row.value.trim()) from = row.value.trim();
    if (row.key === "smtp2go_api_key" && row.value.trim()) smtpKey = row.value.trim();
  }
  return { key, from, smtpKey };
}

export async function mailSetupView(sql: Sql) {
  const mail = await readMailConfig(sql);
  return {
    hasKey: Boolean(mail.key),
    keyHint: mail.key ? `…${mail.key.slice(-4)}` : "",
    mailFrom: mail.from,
    hasSmtpKey: Boolean(mail.smtpKey),
    smtpKeyHint: mail.smtpKey ? `…${mail.smtpKey.slice(-4)}` : "",
  };
}

export function cleanResendKey(value: string) {
  const key = value.trim();
  if (!key) return "";
  if (!/^re_[A-Za-z0-9_-]{8,}$/.test(key) || key.length > 200) throw new Error("Paste a Resend API key that starts with re_.");
  return key;
}

export function cleanSmtpKey(value: string) {
  const key = value.trim();
  if (!key) return "";
  if (key.length < 8 || key.length > 200) throw new Error("Paste the SMTP2GO API key.");
  return key;
}

export function cleanMailFrom(value: string) {
  const from = value.trim();
  if (!from) return "";
  const email = from.match(/<([^>]+)>$/)?.[1] ?? from;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || from.length > 160) {
    throw new Error("Use an email, or Name <email@domain.com>.");
  }
  return from;
}

export type MailFile = { filename: string; content: string };

function senderAddress(from: string, name: string) {
  const email = from.match(/<([^>]+)>/)?.[1] ?? from;
  const safeName = name.replace(/[<>"]/g, "").trim();
  return safeName ? `${safeName} <${email}>` : from;
}

async function deliver(to: string, subject: string, text: string, html: string, companyName: string, sql: Sql, attachments: MailFile[] = [], replyTo = "", replyName = "", fromAddress = "") {
  const mail = await readMailConfig(sql);
  if (replyTo) return deliverSmtp2go(to, subject, text, html, mail.smtpKey, fromAddress, replyTo, replyName, attachments);
  if (!mail.key) return { delivery: "stored", messageId: "", provider: "" };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${mail.key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        from: mail.from || `${companyName} <notifications@accountholding.com>`,
        to: [to],
        subject,
        text,
        html,
        ...(attachments.length ? { attachments } : {}),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { id?: string };
    return { delivery: response.ok ? "sent" : "failed", messageId: response.ok && payload.id ? String(payload.id) : "", provider: response.ok ? "resend" : "" };
  } catch {
    return { delivery: "failed", messageId: "", provider: "" };
  }
}

async function deliverSmtp2go(to: string, subject: string, text: string, html: string, apiKey: string, from: string, replyTo: string, replyName: string, attachments: MailFile[]) {
  if (!apiKey || !from) return { delivery: "failed", messageId: "", provider: "smtp2go" };
  try {
    const response = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Smtp2go-Api-Key": apiKey, accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        sender: senderAddress(from, replyName),
        to: [to],
        subject,
        html_body: html,
        text_body: text,
        custom_headers: [{ header: "Reply-To", value: replyTo }],
        ...(attachments.length ? { attachments: attachments.map((file) => ({ filename: file.filename, fileblob: file.content, mimetype: "application/octet-stream" })) } : {}),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { data?: { email_id?: string; failed?: number } };
    const emailId = payload.data?.email_id ? String(payload.data.email_id) : "";
    const ok = response.ok && Boolean(emailId) && !payload.data?.failed;
    return { delivery: ok ? "sent" : "failed", messageId: ok ? emailId : "", provider: "smtp2go" };
  } catch {
    return { delivery: "failed", messageId: "", provider: "smtp2go" };
  }
}

const STATUS_RANK: Record<string, number> = {
  sent: 1,
  processed: 1,
  delivered: 2,
  bounced: 4,
  opened: 5,
  clicked: 6,
};

function rankStatus(event: string) {
  if (event === "hard-bounced" || event === "soft-bounced" || event === "rejected" || event === "spam") return "bounced";
  if (event === "processed") return "sent";
  return STATUS_RANK[event] ? event : "";
}

export async function syncResendStatuses(sql: Sql) {
  const mail = await readMailConfig(sql);
  await ensureMailColumn(sql);
  const rows = await sql<{ id: string; resend_id: string; mail_provider: string }>`
    select id, resend_id, coalesce(mail_provider, '') as mail_provider from notifications
    where resend_id <> ''
      and coalesce(mail_status, '') not in ('bounced', 'complained', 'clicked')
    order by created_at desc
    limit 40
  `;
  let updated = 0;
  let opened = 0;
  const smtpRows = rows.filter((row) => row.mail_provider === "smtp2go");
  const resendRows = rows.filter((row) => row.mail_provider !== "smtp2go");
  if (smtpRows.length) {
    if (!mail.smtpKey) throw new Error("Add the SMTP2GO API key in Settings before syncing advisor mail.");
    const end = new Date();
    const start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000);
    const stamp = (date: Date) => date.toISOString().slice(0, 10);
    const response = await fetch("https://api.smtp2go.com/v3/activity/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Smtp2go-Api-Key": mail.smtpKey, accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        start_date: stamp(start),
        end_date: stamp(end),
        event_types: ["opened", "clicked", "delivered", "hard-bounced", "soft-bounced", "rejected", "spam"],
        limit: 1000,
      }),
    });
    if (!response.ok) throw new Error("SMTP2GO could not return open events.");
    const payload = (await response.json()) as { data?: { events?: { email_id?: string; event?: string }[] } };
    const best = new Map<string, string>();
    for (const event of payload.data?.events ?? []) {
      const id = event.email_id || "";
      const next = rankStatus(event.event || "");
      if (!id || !next) continue;
      const current = best.get(id) || "";
      if ((STATUS_RANK[next] || 0) >= (STATUS_RANK[current] || 0)) best.set(id, next);
    }
    for (const row of smtpRows) {
      const status = best.get(row.resend_id);
      if (!status) continue;
      await sql`update notifications set mail_status = ${status}, status_at = now() where id = ${row.id}`;
      updated += 1;
      if (status === "opened" || status === "clicked") opened += 1;
    }
  }
  if (resendRows.length && mail.key) {
    for (const row of resendRows) {
      try {
        const response = await fetch(`https://api.resend.com/emails/${encodeURIComponent(row.resend_id)}`, {
          headers: { Authorization: `Bearer ${mail.key}` },
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) continue;
        const payload = (await response.json()) as { last_event?: string };
        const status = (payload.last_event || "sent").slice(0, 40);
        await sql`update notifications set mail_status = ${status}, status_at = now() where id = ${row.id}`;
        updated += 1;
        if (status === "opened" || status === "clicked") opened += 1;
      } catch {
        continue;
      }
    }
  }
  return { updated, opened, checked: rows.length };
}
