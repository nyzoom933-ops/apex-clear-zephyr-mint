import { randomBytes } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/lead-invites.server-DBOhEbbT.js
var HOUR = 36e5;
var REMINDER_WINDOW_MS = 2 * HOUR;
async function createLeadInvite(sql, input) {
	const token = randomBytes(24).toString("hex");
	const expiresAt = new Date(Date.now() + 24 * HOUR).toISOString();
	await sql`alter table lead_invites add column if not exists advisor_role text not null default ''`;
	await sql`
    insert into lead_invites (token, email, name, months, promo_code, kind, advisor_name, advisor_phone, advisor_email, advisor_mailbox, advisor_role, expires_at)
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
      ${expiresAt}
    )
  `;
	return token;
}
function inviteApplicationUrl(origin, token) {
	const base = origin.trim().replace(/\/$/, "");
	if (!/^https?:\/\//i.test(base)) return "";
	return `${base}/application?invite=${token}`;
}
async function readLeadInvite(sql, token) {
	const row = (await sql`
    select token, email, name, months, promo_code, kind, advisor_name, advisor_phone, advisor_email, expires_at, used_at
    from lead_invites
    where token = ${token}
    limit 1
  `)[0];
	if (!row) return { status: "missing" };
	const expiresAt = new Date(row.expires_at);
	if (row.used_at || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) return { status: "expired" };
	return {
		status: "open",
		name: row.name,
		months: Number(row.months),
		promoCode: row.promo_code,
		kind: row.kind,
		expiresAt: expiresAt.toISOString()
	};
}
async function remindDueInvites() {
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { inviteReminderLetter } = await import("./email-templates-C0jVmMQF.mjs").then((n) => n.i).then((n) => n.i);
	const { notifyStep } = await import("./mail.server-DvP07-0d.mjs");
	const sql = await getSql();
	await sql`alter table lead_invites add column if not exists advisor_role text not null default ''`;
	const rows = await sql`
    select token, email, name, months, promo_code, kind, advisor_name, advisor_phone, advisor_email, coalesce(advisor_mailbox, '') as advisor_mailbox, coalesce(advisor_role, '') as advisor_role, expires_at
    from lead_invites
    where used_at is null
      and reminded_at is null
      and expires_at > now()
      and expires_at <= ${new Date(Date.now() + REMINDER_WINDOW_MS).toISOString()}
  `;
	let sent = 0;
	for (const row of rows) {
		if (!(await sql`
      update lead_invites set reminded_at = now()
      where token = ${row.token} and reminded_at is null and used_at is null
      returning token
    `)[0]) continue;
		try {
			const settings = await sql`select key, value from site_settings where key in ('email_logo', 'public_domain', 'company_name')`;
			const link = inviteApplicationUrl(settings.find((item) => item.key === "public_domain")?.value || "", row.token);
			const terms = await sql`select apy from cd_terms where months = ${row.months} limit 1`;
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
				advisor: {
					name: row.advisor_name,
					phone: row.advisor_phone,
					email: row.advisor_email,
					mailbox: row.advisor_mailbox,
					role: row.advisor_role
				}
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
				relatedId: row.token
			});
			sent += 1;
		} catch (error) {
			await sql`update lead_invites set reminded_at = null where token = ${row.token}`;
			console.error("[invite] Reminder failed:", error);
		}
	}
	return {
		ok: true,
		sent
	};
}
function ensureInviteReminderSchedule() {
	const globalRef = globalThis;
	if (globalRef.__inviteReminderTimer) return;
	const tick = () => void remindDueInvites().catch((error) => console.error("[invite] Reminder check failed:", error));
	globalRef.__inviteReminderTimer = setInterval(tick, 9e5);
	setTimeout(tick, 2e4);
}
//#endregion
export { createLeadInvite, ensureInviteReminderSchedule, inviteApplicationUrl, readLeadInvite, remindDueInvites };
