import { DEFAULT_COMPANY_NAME } from "@/lib/company";
import type { Sql } from "@/lib/db";
import { renderPair, type MailStep } from "@/lib/email-templates";
import { env } from "@/lib/env.server";

export type { MailStep };

const ADMIN_EMAIL = "admin@accountholding.com";

export async function ensureMailColumn(sql: Sql) {
  await sql`alter table notifications add column if not exists html text not null default ''`;
}

export async function notifyStep(
  sql: Sql,
  input: { step: MailStep; clientEmail: string; clientName: string; detail: string; relatedId?: string },
) {
  const companyName = await readCompanyName(sql);
  const emailLogo = await readEmailLogo(sql);
  const pair = renderPair(input.step, {
    name: input.clientName,
    email: input.clientEmail,
    detail: input.detail,
    companyName,
    emailLogo,
  });
  const adminTo = env("ADMIN_EMAIL") || ADMIN_EMAIL;
  const messages = [
    { audience: "client" as const, recipient: input.clientEmail, mail: pair.client },
    { audience: "admin" as const, recipient: adminTo, mail: pair.admin },
  ];
  await ensureMailColumn(sql);
  for (const message of messages) {
    const delivery = await deliver(message.recipient, message.mail.subject, message.mail.text, message.mail.html, companyName, sql);
    await sql`
      insert into notifications (id, audience, recipient, step, subject, body, html, related_id, delivery)
      values (
        ${crypto.randomUUID()},
        ${message.audience},
        ${message.recipient},
        ${input.step},
        ${message.mail.subject},
        ${message.mail.text},
        ${message.mail.html},
        ${input.relatedId ?? ""},
        ${delivery}
      )
    `;
  }
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
    select key, value from site_settings where key in ('resend_api_key', 'mail_from')
  `;
  let key = env("RESEND_API_KEY") || "";
  let from = env("MAIL_FROM") || "";
  for (const row of rows) {
    if (row.key === "resend_api_key" && row.value.trim()) key = row.value.trim();
    if (row.key === "mail_from" && row.value.trim()) from = row.value.trim();
  }
  return { key, from };
}

export async function mailSetupView(sql: Sql) {
  const rows = await sql<{ value: string }>`select value from site_settings where key = 'resend_api_key'`;
  const fromRows = await sql<{ value: string }>`select value from site_settings where key = 'mail_from'`;
  const stored = rows[0]?.value?.trim() || "";
  const active = stored || env("RESEND_API_KEY") || "";
  return {
    hasKey: Boolean(active),
    keyHint: active ? `…${active.slice(-4)}` : "",
    mailFrom: fromRows[0]?.value?.trim() || env("MAIL_FROM") || "",
  };
}

export function cleanResendKey(value: string) {
  const key = value.trim();
  if (!key) return "";
  if (!/^re_[A-Za-z0-9_-]{8,}$/.test(key) || key.length > 200) throw new Error("Paste a Resend API key that starts with re_.");
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

async function deliver(to: string, subject: string, text: string, html: string, companyName: string, sql: Sql) {
  const mail = await readMailConfig(sql);
  if (!mail.key) return "stored";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${mail.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: mail.from || `${companyName} <notifications@accountholding.com>`,
        to: [to],
        subject,
        text,
        html,
      }),
    });
    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
