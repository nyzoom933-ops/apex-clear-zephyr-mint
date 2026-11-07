import { DEFAULT_COMPANY_NAME } from "@/lib/company";
import type { Sql } from "@/lib/db";
import { renderStep, type MailStep } from "@/lib/email-templates";
import { env } from "@/lib/env.server";

export type { MailStep };

export async function ensureMailColumn(sql: Sql) {
  await sql`alter table notifications add column if not exists html text not null default ''`;
  await sql`alter table notifications add column if not exists read_at timestamptz`;
  await sql`alter table notifications add column if not exists resend_id text not null default ''`;
  await sql`alter table notifications add column if not exists mail_status text not null default ''`;
  await sql`alter table notifications add column if not exists status_at timestamptz`;
  await sql`alter table notifications add column if not exists mail_provider text not null default ''`;
  await sql`alter table notifications add column if not exists advisor_id text not null default ''`;
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
    clientAttachments?: MailFile[];
    relatedId?: string;
    skipAdmin?: boolean;
    extraHtml?: string;
    replyTo?: string;
    replyName?: string;
    fromAddress?: string;
    subject?: string;
    advisorId?: string;
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
  const adminTo = (await readTelegram(sql)).chatId || "telegram";
  const messages = [
    { audience: "client" as const, recipient: input.clientEmail, mail: client, attachments: input.clientAttachments ?? [] },
    ...(input.skipAdmin ? [] : [{ audience: "admin" as const, recipient: adminTo, mail: admin, attachments: input.attachments ?? [] }]),
  ];
  await ensureMailColumn(sql);
  for (const message of messages) {
    const subject = message.audience === "client" && input.subject?.trim() ? input.subject.trim() : message.mail.subject;
    const advisorMail = message.audience === "client" && Boolean(input.replyTo);
    const result = message.audience === "admin"
      ? await deliverTelegram(sql, subject, message.mail.text, message.attachments)
      : await deliver(message.recipient, subject, message.mail.text, message.mail.html, companyName, sql, message.attachments, advisorMail ? input.replyTo || "" : "", advisorMail ? input.replyName || "" : "", advisorMail ? input.fromAddress || "" : "");
    await sql`
      insert into notifications (id, audience, recipient, step, subject, body, html, related_id, delivery, resend_id, mail_status, mail_provider, advisor_id)
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
        ${result.provider},
        ${input.advisorId ?? ""}
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
    select key, value from site_settings where key in ('resend_api_key', 'mail_from', 'smtp2go_api_key', 'telegram_bot_token', 'telegram_chat_id', 'telegram_enabled', 'backup_schedule')
  `;
  let key = env("RESEND_API_KEY") || "";
  let from = env("MAIL_FROM") || "";
  let smtpKey = env("SMTP2GO_API_KEY") || "";
  let telegramToken = env("TELEGRAM_BOT_TOKEN") || "";
  let telegramChat = env("TELEGRAM_CHAT_ID") || "";
  let telegramEnabled = true;
  let backupSchedule = true;
  for (const row of rows) {
    if (row.key === "resend_api_key" && row.value.trim()) key = row.value.trim();
    if (row.key === "mail_from" && row.value.trim()) from = row.value.trim();
    if (row.key === "smtp2go_api_key" && row.value.trim()) smtpKey = row.value.trim();
    if (row.key === "telegram_bot_token" && row.value.trim()) telegramToken = row.value.trim();
    if (row.key === "telegram_chat_id" && row.value.trim()) telegramChat = row.value.trim();
    if (row.key === "telegram_enabled") telegramEnabled = row.value !== "0";
    if (row.key === "backup_schedule") backupSchedule = row.value !== "0";
  }
  return { key, from, smtpKey, telegramToken, telegramChat, telegramEnabled, backupSchedule };
}

async function readTelegram(sql: Sql) {
  const mail = await readMailConfig(sql);
  return { token: mail.telegramToken, chatId: mail.telegramChat, enabled: mail.telegramEnabled };
}

export async function mailSetupView(sql: Sql) {
  const mail = await readMailConfig(sql);
  return {
    hasKey: Boolean(mail.key),
    keyHint: mail.key ? `…${mail.key.slice(-4)}` : "",
    mailFrom: mail.from,
    hasSmtpKey: Boolean(mail.smtpKey),
    smtpKeyHint: mail.smtpKey ? `…${mail.smtpKey.slice(-4)}` : "",
    hasTelegram: Boolean(mail.telegramToken && mail.telegramChat),
    telegramHint: mail.telegramToken ? `…${mail.telegramToken.slice(-4)}` : "",
    telegramChat: mail.telegramChat,
    telegramEnabled: mail.telegramEnabled,
    backupSchedule: mail.backupSchedule,
  };
}

export function cleanTelegramToken(value: string) {
  const token = value.trim();
  if (!token) return "";
  if (!/^\d{6,}:[A-Za-z0-9_-]{20,}$/.test(token) || token.length > 120) throw new Error("Paste the bot token from BotFather. It looks like 123456:ABC…");
  return token;
}

export function cleanTelegramChat(value: string) {
  const chat = value.trim();
  if (!chat) return "";
  if (!/^-?\d{1,20}$/.test(chat)) throw new Error("The chat id is a number. For a group it usually starts with -100.");
  return chat;
}

function escapeTelegram(value: string) {
  return value.replace(/&/g, "&" + "amp;").replace(/</g, "&" + "lt;").replace(/>/g, "&" + "gt;");
}

async function deliverTelegram(sql: Sql, subject: string, text: string, attachments: MailFile[]) {
  const telegram = await readTelegram(sql);
  if (!telegram.enabled) return { delivery: "stored", messageId: "", provider: "telegram", error: "Desk notices are turned off." };
  if (!telegram.token || !telegram.chatId) return { delivery: "stored", messageId: "", provider: "telegram", error: "Save the bot token and chat id." };
  const sent = await postTelegram(telegram.token, telegram.chatId, subject, text, attachments);
  return { delivery: sent.ok ? "sent" : "failed", messageId: sent.id, provider: "telegram", error: sent.error || "" };
}

export async function sendTelegramNotice(sql: Sql, subject: string, text: string) {
  const sent = await deliverTelegram(sql, subject, text, []);
  return { delivery: sent.delivery, error: sent.error };
}

export async function sendTelegramBackup(sql: Sql, subject: string, text: string, files: MailFile[]) {
  const telegram = await readTelegram(sql);
  if (!telegram.token || !telegram.chatId) return "skipped" as const;
  const sent = await postTelegram(telegram.token, telegram.chatId, subject, text, files);
  return sent.ok ? "sent" as const : "failed" as const;
}

export async function lookupTelegramChats(sql: Sql, tokenInput: string) {
  const saved = await readTelegram(sql);
  const token = cleanTelegramToken(tokenInput) || saved.token;
  if (!token) throw new Error("Paste the bot token first.");
  const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, { signal: AbortSignal.timeout(12000) });
  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    description?: string;
    result?: Array<{ message?: { chat?: TelegramChat }; edited_message?: { chat?: TelegramChat }; channel_post?: { chat?: TelegramChat }; my_chat_member?: { chat?: TelegramChat } }>;
  };
  if (!response.ok || !payload.ok) {
    if (response.status === 404) throw new Error("Telegram does not recognize this bot token. Copy it again from BotFather, with no spaces.");
    throw new Error(payload.description || "Telegram did not return chats.");
  }
  const chats = new Map<string, { id: string; label: string; type: string }>();
  for (const update of payload.result || []) {
    const chat = update.message?.chat || update.edited_message?.chat || update.channel_post?.chat || update.my_chat_member?.chat;
    if (!chat?.id) continue;
    const id = String(chat.id);
    const label = chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || (chat.username ? `@${chat.username}` : id);
    chats.set(id, { id, label, type: chat.type || "" });
  }
  if (!chats.size) throw new Error("The bot has not seen a message yet. Open the bot in Telegram, press Start, then look again.");
  return { chats: [...chats.values()] };
}

type TelegramChat = { id?: number; type?: string; title?: string; username?: string; first_name?: string; last_name?: string };

export async function sendTelegramTest(sql: Sql) {
  const telegram = await readTelegram(sql);
  if (!telegram.token || !telegram.chatId) throw new Error("Save the bot token and chat id first.");
  const sent = await postTelegram(telegram.token, telegram.chatId, "Desk notices", "This chat will receive desk notices instead of email.", []);
  if (!sent.ok) throw new Error(sent.error || "Telegram did not accept the test message.");
  return { ok: true as const };
}

async function postTelegram(token: string, chatId: string, subject: string, text: string, attachments: MailFile[]) {
  const chunks = telegramChunks(`<b>${escapeTelegram(subject)}</b>\n\n${escapeTelegram(text.trim())}`);
  let id = "";
  for (const chunk of chunks) {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({ chat_id: chatId, text: chunk, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; description?: string; result?: { message_id?: number } };
    if (!response.ok || !payload.ok) return { ok: false, id, error: payload.description || "Telegram rejected the message." };
    if (payload.result?.message_id) id = String(payload.result.message_id);
  }
  for (const file of attachments) {
    const form = new FormData();
    form.set("chat_id", chatId);
    form.set("caption", file.filename.slice(0, 200));
    const bytes = Buffer.from(file.content, "base64");
    form.set("document", new Blob([new Uint8Array(bytes)]), file.filename || "attachment");
    const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      body: form,
    });
    const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; description?: string; result?: { message_id?: number } };
    if (!response.ok || !payload.ok) return { ok: false, id, error: payload.description || "Telegram rejected an attachment." };
    if (payload.result?.message_id) id = String(payload.result.message_id);
  }
  return { ok: true, id, error: "" };
}

function telegramChunks(value: string) {
  const limit = 3900;
  if (value.length <= limit) return [value];
  const parts: string[] = [];
  let rest = value;
  while (rest.length) {
    parts.push(rest.slice(0, limit));
    rest = rest.slice(limit);
  }
  return parts;
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
  if (mail.smtpKey && mail.from) {
    const sent = await deliverSmtp2go(to, subject, text, html, mail.smtpKey, mail.from, "", companyName, attachments);
    if (sent.delivery === "sent") return sent;
  }
  if (!mail.key) return { delivery: mail.smtpKey ? "failed" : "stored", messageId: "", provider: mail.smtpKey ? "smtp2go" : "" };
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
  if (!apiKey) return { delivery: "failed", messageId: "", provider: "smtp2go", error: "Save the SMTP2GO API key in Misc settings." };
  if (!from) return { delivery: "failed", messageId: "", provider: "smtp2go", error: "This advisor has no verified mailbox." };
  try {
    const response = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Smtp2go-Api-Key": apiKey, accept: "application/json" },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        sender: senderAddress(from, replyName),
        to: [to],
        subject,
        html_body: html,
        text_body: text,
        ...(replyTo ? { custom_headers: [{ header: "Reply-To", value: replyTo }] } : {}),
        ...(attachments.length ? { attachments: attachments.map((file) => ({ filename: file.filename, fileblob: file.content, mimetype: "application/octet-stream" })) } : {}),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { data?: { email_id?: string; failed?: number; error?: string; error_code?: string } };
    const emailId = payload.data?.email_id ? String(payload.data.email_id) : "";
    const ok = response.ok && Boolean(emailId) && !payload.data?.failed;
    const error = payload.data?.error || payload.data?.error_code || "";
    return { delivery: ok ? "sent" : "failed", messageId: ok ? emailId : "", provider: "smtp2go", error: ok ? "" : error || "SMTP2GO did not accept the message." };
  } catch (caught) {
    return { delivery: "failed", messageId: "", provider: "smtp2go", error: caught instanceof Error && caught.message ? caught.message : "SMTP2GO did not respond." };
  }
}

export async function sendFromMailbox(
  sql: Sql,
  input: { to: string; subject: string; text: string; html: string; fromAddress: string; replyTo: string; replyName: string },
) {
  const mail = await readMailConfig(sql);
  return deliverSmtp2go(input.to, input.subject, input.text, input.html, mail.smtpKey, input.fromAddress, input.replyTo, input.replyName, []);
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
  const name = event.trim().toLowerCase();
  if (name === "open") return "opened";
  if (name === "click") return "clicked";
  if (name === "hard-bounced" || name === "soft-bounced" || name === "rejected" || name === "spam") return "bounced";
  if (name === "processed") return "sent";
  return STATUS_RANK[name] ? name : "";
}

type ActivityEvent = { email_id?: string; event?: string; recipient?: string; to?: string; subject?: string };

const SMTP_ACTIVITY_URLS = ["https://us-api.smtp2go.com/v3/activity/search", "https://api.smtp2go.com/v3/activity/search", "https://eu-api.smtp2go.com/v3/activity/search"];

function smtpStamp(date: Date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

async function searchSmtpActivity(apiKey: string) {
  const end = new Date();
  const start = new Date(end.getTime() - 4 * 24 * 60 * 60 * 1000);
  const events: ActivityEvent[] = [];
  let sawOk = false;
  let lastStatus = 0;
  let lastError = "";
  for (const url of SMTP_ACTIVITY_URLS) {
    let token = "";
    let hostEvents = 0;
    for (let page = 0; page < 6; page += 1) {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Smtp2go-Api-Key": apiKey, accept: "application/json" },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          start_date: smtpStamp(start),
          end_date: smtpStamp(end),
          event_types: ["opened", "clicked", "delivered", "hard-bounced", "soft-bounced", "rejected", "spam"],
          limit: 100,
          ...(token ? { continue_token: token } : {}),
        }),
      });
      if (!response.ok) {
        lastStatus = response.status;
        const text = await response.text().catch(() => "");
        try {
          const parsed = JSON.parse(text) as { data?: { error?: string } };
          lastError = parsed.data?.error || text.slice(0, 180);
        } catch {
          lastError = text.slice(0, 180);
        }
        break;
      }
      sawOk = true;
      const payload = (await response.json()) as { data?: { events?: ActivityEvent[]; continue_token?: string } };
      const batch = payload.data?.events ?? [];
      events.push(...batch);
      hostEvents += batch.length;
      token = payload.data?.continue_token || "";
      if (!token || batch.length === 0) break;
    }
    if (hostEvents > 0) break;
  }
  return { events, sawOk, lastStatus, lastError };
}

function activityKey(recipient: string, subject: string) {
  const clean = subject.trim().toLowerCase().replace(/[—–]/g, "-").replace(/\s+/g, " ");
  return `${recipient.trim().toLowerCase()}|${clean}`;
}

type SentMail = { email_id?: string; recipient?: string; to?: string; subject?: string; status?: string };

async function searchSentMail(apiKey: string, emailIds: string[], flag?: "opened" | "clicked") {
  const end = new Date();
  const start = new Date(end.getTime() - 4 * 24 * 60 * 60 * 1000);
  const ids = emailIds.map((id) => id.trim()).filter(Boolean).slice(0, 50);
  if (!ids.length) return { ok: false, emails: [] as SentMail[], lastError: "" };
  const urls = ["https://us-api.smtp2go.com/v3/email/search", "https://api.smtp2go.com/v3/email/search"];
  let lastError = "";
  for (const url of urls) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Smtp2go-Api-Key": apiKey, accept: "application/json" },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        start_date: smtpStamp(start),
        end_date: smtpStamp(end),
        email_id: ids,
        limit: 100,
        ...(flag ? { [flag]: true } : {}),
      }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      try {
        const parsed = JSON.parse(text) as { data?: { error?: string } };
        lastError = parsed.data?.error || text.slice(0, 180);
      } catch {
        lastError = text.slice(0, 180);
      }
      continue;
    }
    const payload = (await response.json()) as { data?: { emails?: SentMail[] } };
    return { ok: true, emails: payload.data?.emails ?? [], lastError: "" };
  }
  return { ok: false, emails: [] as SentMail[], lastError };
}

export async function syncResendStatuses(sql: Sql) {
  const mail = await readMailConfig(sql);
  await ensureMailColumn(sql);
  const rows = await sql<{ id: string; resend_id: string; mail_provider: string; recipient: string; subject: string; mail_status: string }>`
    select id, resend_id, coalesce(mail_provider, '') as mail_provider, recipient, subject, coalesce(mail_status, '') as mail_status
    from notifications
    where created_at > now() - interval '30 days'
      and coalesce(mail_status, '') not in ('bounced', 'complained', 'clicked')
    order by created_at desc
    limit 80
  `;
  let updated = 0;
  let opened = 0;
  const smtpRows = rows.filter((row) => row.mail_provider === "smtp2go");
  const resendRows = rows.filter((row) => row.mail_provider !== "smtp2go" && row.resend_id);
  if (smtpRows.length) {
    if (!mail.smtpKey) throw new Error("Add the SMTP2GO API key in Settings before syncing advisor mail.");
    const found = await searchSmtpActivity(mail.smtpKey);
    let events = found.events;
    if (!found.sawOk) {
      const detail = found.lastError || (found.lastStatus ? `SMTP2GO activity search failed (${found.lastStatus}).` : "SMTP2GO activity search did not respond.");
      if (!/permission/i.test(detail)) throw new Error(detail);
      const ids = smtpRows.map((row) => row.resend_id);
      const [clicked, openedMail, sent] = await Promise.all([
        searchSentMail(mail.smtpKey, ids, "clicked"),
        searchSentMail(mail.smtpKey, ids, "opened"),
        searchSentMail(mail.smtpKey, ids),
      ]);
      if (!clicked.ok && !openedMail.ok && !sent.ok) {
        throw new Error("Open tracking is already on. That only records opens inside SMTP2GO. Click the API key name itself, open Permissions, and turn on Reports. If that section is not there, add a new key with every permission enabled and paste it into Settings.");
      }
      events = [
        ...clicked.emails.map((email) => ({ ...email, event: "clicked" })),
        ...openedMail.emails.map((email) => ({ ...email, event: "opened" })),
        ...sent.emails.map((email) => ({ ...email, event: email.status || "delivered" })),
      ];
    }
    if (!events.length) throw new Error("SMTP2GO returned no events for the last 4 days.");
    const bestById = new Map<string, string>();
    const bestByLetter = new Map<string, string>();
    const keep = (current: string, next: string) => ((STATUS_RANK[next] || 0) >= (STATUS_RANK[current] || 0) ? next : current);
    for (const event of events) {
      const next = rankStatus(event.event || "");
      if (!next) continue;
      const id = (event.email_id || "").trim();
      if (id) bestById.set(id, keep(bestById.get(id) || "", next));
      const recipient = event.recipient || event.to || "";
      if (recipient && event.subject) bestByLetter.set(activityKey(recipient, event.subject), keep(bestByLetter.get(activityKey(recipient, event.subject)) || "", next));
    }
    for (const row of smtpRows) {
      const status = bestById.get(row.resend_id.trim()) || bestByLetter.get(activityKey(row.recipient, row.subject)) || "";
      if (!status || (STATUS_RANK[status] || 0) <= (STATUS_RANK[row.mail_status] || 0)) continue;
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
