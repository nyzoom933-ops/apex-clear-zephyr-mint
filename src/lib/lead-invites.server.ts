import { randomBytes } from "node:crypto";
import type { Sql } from "@/lib/db";

const HOUR = 60 * 60 * 1000;
const REMINDER_WINDOW_MS = 2 * HOUR;

type InviteRow = {
  token: string;
  email: string;
  name: string;
  months: number;
  promo_code: string;
  kind: string;
  advisor_name: string;
  advisor_phone: string;
  advisor_email: string;
  advisor_mailbox: string;
  expires_at: string | Date;
};

export async function createLeadInvite(
  sql: Sql,
  input: { email: string; name: string; months: number; promoCode: string; kind: "custom" | "promo"; advisor: { name: string; phone: string; email: string; mailbox: string } },
) {
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * HOUR).toISOString();
  await sql`
    insert into lead_invites (token, email, name, months, promo_code, kind, advisor_name, advisor_phone, advisor_email, advisor_mailbox, expires_at)
    values (
      ${token},
      ${input.email},
      ${input.name},
      ${input.months},
      ${input.promoCode},
      ${input.kind},
      ${input.advisor.name},
      ${input.advisor.phone},
      ${input.advisor.email},
      ${input.advisor.mailbox},
      ${expiresAt}
    )
  `;
  return token;
}

export function inviteApplicationUrl(origin: string, token: string) {
  const base = origin.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(base)) return "";
  return `${base}/application?invite=${token}`;
}

export async function readLeadInvite(sql: Sql, token: string) {
  const rows = await sql<InviteRow & { used_at: string | Date | null }>`
    select token, email, name, months, promo_code, kind, advisor_name, advisor_phone, advisor_email, expires_at, used_at
    from lead_invites
    where token = ${token}
    limit 1
  `;
  const row = rows[0];
  if (!row) return { status: "missing" as const };
  const expiresAt = new Date(row.expires_at);
  if (row.used_at || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) return { status: "expired" as const };
  return {
    status: "open" as const,
    name: row.name,
    months: Number(row.months),
    promoCode: row.promo_code,
    kind: row.kind,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function consumeLeadInvite(sql: Sql, token: string) {
  if (!token) return null;
  const rows = await sql<{ months: number; promo_code: string; expires_at: string | Date; used_at: string | Date | null }>`
    select months, promo_code, expires_at, used_at from lead_invites where token = ${token} limit 1
  `;
  const row = rows[0];
  if (!row || row.used_at) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) return null;
  await sql`update lead_invites set used_at = now() where token = ${token} and used_at is null`;
  return { months: Number(row.months), promoCode: row.promo_code };
}

export async function remindDueInvites() {
  const { getSql } = await import("@/lib/db");
  const { inviteReminderLetter } = await import("@/lib/email-templates");
  const { notifyStep } = await import("@/lib/mail.server");
  const sql = await getSql();
  const due = new Date(Date.now() + REMINDER_WINDOW_MS).toISOString();
  const rows = await sql<InviteRow>`
    select token, email, name, months, promo_code, kind, advisor_name, advisor_phone, advisor_email, coalesce(advisor_mailbox, '') as advisor_mailbox, expires_at
    from lead_invites
    where used_at is null
      and reminded_at is null
      and expires_at > now()
      and expires_at <= ${due}
  `;
  let sent = 0;
  for (const row of rows) {
    const claimed = await sql<{ token: string }>`
      update lead_invites set reminded_at = now()
      where token = ${row.token} and reminded_at is null and used_at is null
      returning token
    `;
    if (!claimed[0]) continue;
    try {
      const settings = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('email_logo', 'public_domain', 'company_name')`;
      const origin = settings.find((item) => item.key === "public_domain")?.value || "";
      const link = inviteApplicationUrl(origin, row.token);
      const terms = await sql<{ apy: string }>`select apy from cd_terms where months = ${row.months} limit 1`;
      const company = settings.find((item) => item.key === "company_name")?.value || "";
      const letter = inviteReminderLetter({
        leadName: row.name,
        company,
        months: Number(row.months),
        apy: terms[0]?.apy || "",
        promoCode: row.promo_code,
        link,
        logo: settings.find((item) => item.key === "email_logo")?.value || null,
        advisorName: row.advisor_name,
        advisor: { name: row.advisor_name, phone: row.advisor_phone, email: row.advisor_email, mailbox: row.advisor_mailbox },
      });
      await notifyStep(sql, {
        step: "lead_invite_reminder",
        clientEmail: row.email,
        clientName: row.name,
        detail: letter.text,
        extraHtml: letter.html,
        subject: letter.subject,
        skipAdmin: true,
        replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.advisor_email) ? row.advisor_email : row.advisor_mailbox,
        replyName: row.advisor_name,
        fromAddress: row.advisor_mailbox,
        relatedId: row.token,
      });
      sent += 1;
    } catch (error) {
      await sql`update lead_invites set reminded_at = null where token = ${row.token}`;
      console.error("[invite] Reminder failed:", error);
    }
  }
  return { ok: true as const, sent };
}

export function ensureInviteReminderSchedule() {
  const globalRef = globalThis as typeof globalThis & { __inviteReminderTimer?: ReturnType<typeof setInterval> };
  if (globalRef.__inviteReminderTimer) return;
  const tick = () => void remindDueInvites().catch((error) => console.error("[invite] Reminder check failed:", error));
  globalRef.__inviteReminderTimer = setInterval(tick, 15 * 60 * 1000);
  setTimeout(tick, 20_000);
}
