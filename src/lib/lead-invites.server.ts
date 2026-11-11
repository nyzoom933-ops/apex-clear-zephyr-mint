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
  advisor_role: string;
  advisor_personal_phone: string;
  expires_at: string | Date;
};

export async function createLeadInvite(
  sql: Sql,
  input: { email: string; name: string; months: number; promoCode: string; kind: "custom" | "promo"; advisor: { name: string; phone: string; email: string; mailbox: string; role?: string; personalPhone?: string } },
) {
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * HOUR).toISOString();
  await sql`alter table lead_invites add column if not exists advisor_role text not null default ''`;
  await sql`alter table lead_invites add column if not exists advisor_personal_phone text not null default ''`;
  await sql`
    insert into lead_invites (token, email, name, months, promo_code, kind, advisor_name, advisor_phone, advisor_email, advisor_mailbox, advisor_role, advisor_personal_phone, expires_at)
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
      ${input.advisor.role || ""},
      ${input.advisor.personalPhone || ""},
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
  await ensureInviteColumns(sql);
  const rows = await sql<InviteRow & { used_at: string | Date | null; renew_requested_at: string | Date | null }>`
    select token, email, name, months, promo_code, kind, advisor_name, advisor_phone, advisor_email, expires_at, used_at, renew_requested_at
    from lead_invites
    where token = ${token}
    limit 1
  `;
  const row = rows[0];
  if (!row) return { status: "missing" as const };
  if (row.used_at) return { status: "used" as const };
  const expiresAt = new Date(row.expires_at);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
    await noteExpiredVisit(sql, row);
    return { status: "expired" as const, requested: Boolean(row.renew_requested_at) };
  }
  return {
    status: "open" as const,
    name: row.name,
    months: Number(row.months),
    promoCode: row.promo_code,
    kind: row.kind,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function requestNewLeadInvite(sql: Sql, token: string) {
  await ensureInviteColumns(sql);
  const rows = await sql<InviteRow & { used_at: string | Date | null; renew_requested_at: string | Date | null }>`
    select token, email, name, months, advisor_name, expires_at, used_at, renew_requested_at
    from lead_invites
    where token = ${token}
    limit 1
  `;
  const row = rows[0];
  if (!row) throw new Error("This link is not recognized.");
  if (row.used_at) throw new Error("This application was already submitted.");
  if (new Date(row.expires_at).getTime() > Date.now()) throw new Error("This link is still open.");
  const claimed = await sql<{ token: string }>`
    update lead_invites set renew_requested_at = now()
    where token = ${token} and renew_requested_at is null and used_at is null
    returning token
  `;
  if (!claimed[0]) return { ok: true as const, already: true as const };
  const { sendTelegramNotice } = await import("@/lib/mail.server");
  await sendTelegramNotice(
    sql,
    "New application link requested",
    [`${row.name || "A lead"} (${row.email}) asked for a new application link.`, row.months ? `Term: ${row.months} months.` : "", row.advisor_name ? `Advisor: ${row.advisor_name}` : ""].filter(Boolean).join("\n"),
  );
  return { ok: true as const, already: false as const };
}

async function ensureInviteColumns(sql: Sql) {
  await sql`alter table lead_invites add column if not exists advisor_role text not null default ''`;
  await sql`alter table lead_invites add column if not exists advisor_personal_phone text not null default ''`;
  await sql`alter table lead_invites add column if not exists expired_notified_at timestamptz`;
  await sql`alter table lead_invites add column if not exists renew_requested_at timestamptz`;
}

async function noteExpiredVisit(sql: Sql, row: { token: string; email: string; name: string; advisor_name: string; months: number }) {
  const claimed = await sql<{ token: string }>`
    update lead_invites set expired_notified_at = now()
    where token = ${row.token} and expired_notified_at is null
    returning token
  `;
  if (!claimed[0]) return;
  try {
    const { sendTelegramNotice } = await import("@/lib/mail.server");
    await sendTelegramNotice(
      sql,
      "Promo link expired",
      [`${row.name || "A lead"} (${row.email}) opened an expired application link.`, row.months ? `Term: ${row.months} months.` : "", row.advisor_name ? `Advisor: ${row.advisor_name}` : ""].filter(Boolean).join("\n"),
    );
  } catch (error) {
    await sql`update lead_invites set expired_notified_at = null where token = ${row.token}`;
    console.error("[invite] Expired-link notice failed:", error);
  }
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
  await sql`alter table lead_invites add column if not exists advisor_role text not null default ''`;
  await sql`alter table lead_invites add column if not exists advisor_personal_phone text not null default ''`;
  const due = new Date(Date.now() + REMINDER_WINDOW_MS).toISOString();
  const rows = await sql<InviteRow>`
    select token, email, name, months, promo_code, kind, advisor_name, advisor_phone, advisor_email, coalesce(advisor_mailbox, '') as advisor_mailbox, coalesce(advisor_role, '') as advisor_role, coalesce(advisor_personal_phone, '') as advisor_personal_phone, expires_at
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
      const settings = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('email_logo', 'public_domain', 'company_name', 'company_phone')`;
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
        advisor: { name: row.advisor_name, phone: row.advisor_phone, email: row.advisor_email, mailbox: row.advisor_mailbox, role: row.advisor_role, personalPhone: row.advisor_personal_phone },
        companyPhone: settings.find((item) => item.key === "company_phone")?.value || "",
      });
      const advisors = await sql<{ id: string }>`
        select id from advisors
        where lower(email) = lower(${row.advisor_email}) or name = ${row.advisor_name}
        limit 1
      `;
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
        advisorId: advisors[0]?.id || "",
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
