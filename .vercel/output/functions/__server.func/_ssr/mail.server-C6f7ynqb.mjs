import { s as env } from "./env.server-CXxi_iUv.mjs";
import { t as renderStep } from "./email-templates-8axwok5k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mail.server-C6f7ynqb.js
var ADMIN_EMAIL = "admin@accountholding.com";
async function ensureMailColumn(sql) {
	await sql`alter table notifications add column if not exists html text not null default ''`;
	await sql`alter table notifications add column if not exists read_at timestamptz`;
}
async function readDeskEmail(sql) {
	return (await sql`select value from site_settings where key = 'desk_email'`)[0]?.value?.trim().toLowerCase() || "";
}
async function notifyStep(sql, input) {
	const companyName = await readCompanyName(sql);
	const emailLogo = await readEmailLogo(sql);
	const origin = await portalOrigin(sql);
	const client = renderStep(input.step, "client", {
		name: input.clientName,
		email: input.clientEmail,
		detail: input.detail,
		companyName,
		emailLogo,
		portalUrl: origin
	});
	const admin = renderStep(input.step, "admin", {
		name: input.clientName,
		email: input.clientEmail,
		detail: input.adminDetail || input.detail,
		companyName,
		emailLogo
	});
	const adminTo = await readDeskEmail(sql) || env("ADMIN_EMAIL") || ADMIN_EMAIL;
	const messages = [{
		audience: "client",
		recipient: input.clientEmail,
		mail: client,
		attachments: []
	}, {
		audience: "admin",
		recipient: adminTo,
		mail: admin,
		attachments: input.attachments ?? []
	}];
	await ensureMailColumn(sql);
	for (const message of messages) {
		const delivery = await deliver(message.recipient, message.mail.subject, message.mail.text, message.mail.html, companyName, sql, message.attachments);
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
async function portalOrigin(sql) {
	const configured = (await sql`select value from site_settings where key = 'public_domain'`)[0]?.value?.trim().replace(/\/$/, "") || "";
	if (/^https?:\/\//i.test(configured)) return configured;
	return requestOrigin();
}
async function requestOrigin() {
	const configured = env("APP_URL") || env("PUBLIC_URL");
	if (configured) return configured.replace(/\/$/, "");
	try {
		const { getRequest } = await import("./ssr.mjs").then((n) => n.o).then((n) => n.t);
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
async function readCompanyName(sql) {
	return (await sql`select value from site_settings where key = 'company_name'`)[0]?.value?.trim() || "Account Holding";
}
async function readEmailLogo(sql) {
	return (await sql`select value from site_settings where key = 'email_logo'`)[0]?.value || null;
}
async function readMailConfig(sql) {
	const rows = await sql`
    select key, value from site_settings where key in ('resend_api_key', 'mail_from')
  `;
	let key = env("RESEND_API_KEY") || "";
	let from = env("MAIL_FROM") || "";
	for (const row of rows) {
		if (row.key === "resend_api_key" && row.value.trim()) key = row.value.trim();
		if (row.key === "mail_from" && row.value.trim()) from = row.value.trim();
	}
	return {
		key,
		from
	};
}
async function mailSetupView(sql) {
	const rows = await sql`select value from site_settings where key = 'resend_api_key'`;
	const fromRows = await sql`select value from site_settings where key = 'mail_from'`;
	const active = rows[0]?.value?.trim() || env("RESEND_API_KEY") || "";
	return {
		hasKey: Boolean(active),
		keyHint: active ? `…${active.slice(-4)}` : "",
		mailFrom: fromRows[0]?.value?.trim() || env("MAIL_FROM") || ""
	};
}
function cleanResendKey(value) {
	const key = value.trim();
	if (!key) return "";
	if (!/^re_[A-Za-z0-9_-]{8,}$/.test(key) || key.length > 200) throw new Error("Paste a Resend API key that starts with re_.");
	return key;
}
function cleanMailFrom(value) {
	const from = value.trim();
	if (!from) return "";
	const email = from.match(/<([^>]+)>$/)?.[1] ?? from;
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || from.length > 160) throw new Error("Use an email, or Name <email@domain.com>.");
	return from;
}
async function deliver(to, subject, text, html, companyName, sql, attachments = []) {
	const mail = await readMailConfig(sql);
	if (!mail.key) return "stored";
	try {
		return (await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${mail.key}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				from: mail.from || `${companyName} <notifications@accountholding.com>`,
				to: [to],
				subject,
				text,
				html,
				...attachments.length ? { attachments } : {}
			})
		})).ok ? "sent" : "failed";
	} catch {
		return "failed";
	}
}
//#endregion
export { cleanMailFrom, cleanResendKey, ensureMailColumn, mailSetupView, notifyStep, readMailConfig };
