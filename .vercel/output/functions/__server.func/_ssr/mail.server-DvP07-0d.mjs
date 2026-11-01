import { s as env } from "./env.server-CXxi_iUv.mjs";
import { o as renderStep } from "./email-templates-C0jVmMQF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mail.server-DvP07-0d.js
var ADMIN_EMAIL = "admin@accountholding.com";
async function ensureMailColumn(sql) {
	await sql`alter table notifications add column if not exists html text not null default ''`;
	await sql`alter table notifications add column if not exists read_at timestamptz`;
	await sql`alter table notifications add column if not exists resend_id text not null default ''`;
	await sql`alter table notifications add column if not exists mail_status text not null default ''`;
	await sql`alter table notifications add column if not exists status_at timestamptz`;
	await sql`alter table notifications add column if not exists mail_provider text not null default ''`;
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
		portalUrl: origin,
		extraHtml: input.extraHtml
	});
	const admin = renderStep(input.step, "admin", {
		name: input.clientName,
		email: input.clientEmail,
		detail: input.adminDetail || input.detail,
		companyName,
		emailLogo,
		extraHtml: input.extraHtml
	});
	const adminTo = await readDeskEmail(sql) || env("ADMIN_EMAIL") || ADMIN_EMAIL;
	const messages = [{
		audience: "client",
		recipient: input.clientEmail,
		mail: client,
		attachments: []
	}, ...input.skipAdmin ? [] : [{
		audience: "admin",
		recipient: adminTo,
		mail: admin,
		attachments: input.attachments ?? []
	}]];
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
async function portalOrigin(sql) {
	const configured = (await sql`select value from site_settings where key = 'public_domain'`)[0]?.value?.trim().replace(/\/$/, "") || "";
	if (/^https?:\/\//i.test(configured)) return configured;
	return requestOrigin();
}
async function requestOrigin() {
	const configured = env("APP_URL") || env("PUBLIC_URL");
	if (configured) return configured.replace(/\/$/, "");
	try {
		const { getRequest } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
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
	return {
		key,
		from,
		smtpKey
	};
}
async function mailSetupView(sql) {
	const mail = await readMailConfig(sql);
	return {
		hasKey: Boolean(mail.key),
		keyHint: mail.key ? `…${mail.key.slice(-4)}` : "",
		mailFrom: mail.from,
		hasSmtpKey: Boolean(mail.smtpKey),
		smtpKeyHint: mail.smtpKey ? `…${mail.smtpKey.slice(-4)}` : ""
	};
}
function cleanResendKey(value) {
	const key = value.trim();
	if (!key) return "";
	if (!/^re_[A-Za-z0-9_-]{8,}$/.test(key) || key.length > 200) throw new Error("Paste a Resend API key that starts with re_.");
	return key;
}
function cleanSmtpKey(value) {
	const key = value.trim();
	if (!key) return "";
	if (key.length < 8 || key.length > 200) throw new Error("Paste the SMTP2GO API key.");
	return key;
}
function cleanMailFrom(value) {
	const from = value.trim();
	if (!from) return "";
	const email = from.match(/<([^>]+)>$/)?.[1] ?? from;
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || from.length > 160) throw new Error("Use an email, or Name <email@domain.com>.");
	return from;
}
function senderAddress(from, name) {
	const email = from.match(/<([^>]+)>/)?.[1] ?? from;
	const safeName = name.replace(/[<>"]/g, "").trim();
	return safeName ? `${safeName} <${email}>` : from;
}
async function deliver(to, subject, text, html, companyName, sql, attachments = [], replyTo = "", replyName = "", fromAddress = "") {
	const mail = await readMailConfig(sql);
	if (replyTo) return deliverSmtp2go(to, subject, text, html, mail.smtpKey, fromAddress, replyTo, replyName, attachments);
	if (!mail.key) return {
		delivery: "stored",
		messageId: "",
		provider: ""
	};
	try {
		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${mail.key}`,
				"Content-Type": "application/json"
			},
			signal: AbortSignal.timeout(8e3),
			body: JSON.stringify({
				from: mail.from || `${companyName} <notifications@accountholding.com>`,
				to: [to],
				subject,
				text,
				html,
				...attachments.length ? { attachments } : {}
			})
		});
		const payload = await response.json().catch(() => ({}));
		return {
			delivery: response.ok ? "sent" : "failed",
			messageId: response.ok && payload.id ? String(payload.id) : "",
			provider: response.ok ? "resend" : ""
		};
	} catch {
		return {
			delivery: "failed",
			messageId: "",
			provider: ""
		};
	}
}
async function deliverSmtp2go(to, subject, text, html, apiKey, from, replyTo, replyName, attachments) {
	if (!apiKey || !from) return {
		delivery: "failed",
		messageId: "",
		provider: "smtp2go"
	};
	try {
		const response = await fetch("https://api.smtp2go.com/v3/email/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Smtp2go-Api-Key": apiKey,
				accept: "application/json"
			},
			signal: AbortSignal.timeout(8e3),
			body: JSON.stringify({
				sender: senderAddress(from, replyName),
				to: [to],
				subject,
				html_body: html,
				text_body: text,
				custom_headers: [{
					header: "Reply-To",
					value: replyTo
				}],
				...attachments.length ? { attachments: attachments.map((file) => ({
					filename: file.filename,
					fileblob: file.content,
					mimetype: "application/octet-stream"
				})) } : {}
			})
		});
		const payload = await response.json().catch(() => ({}));
		const emailId = payload.data?.email_id ? String(payload.data.email_id) : "";
		const ok = response.ok && Boolean(emailId) && !payload.data?.failed;
		return {
			delivery: ok ? "sent" : "failed",
			messageId: ok ? emailId : "",
			provider: "smtp2go"
		};
	} catch {
		return {
			delivery: "failed",
			messageId: "",
			provider: "smtp2go"
		};
	}
}
var STATUS_RANK = {
	sent: 1,
	processed: 1,
	delivered: 2,
	bounced: 4,
	opened: 5,
	clicked: 6
};
function rankStatus(event) {
	if (event === "hard-bounced" || event === "soft-bounced" || event === "rejected" || event === "spam") return "bounced";
	if (event === "processed") return "sent";
	return STATUS_RANK[event] ? event : "";
}
async function syncResendStatuses(sql) {
	const mail = await readMailConfig(sql);
	await ensureMailColumn(sql);
	const rows = await sql`
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
		const end = /* @__PURE__ */ new Date();
		const start = /* @__PURE__ */ new Date(end.getTime() - 12096e5);
		const stamp = (date) => date.toISOString().slice(0, 10);
		const response = await fetch("https://api.smtp2go.com/v3/activity/search", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Smtp2go-Api-Key": mail.smtpKey,
				accept: "application/json"
			},
			signal: AbortSignal.timeout(8e3),
			body: JSON.stringify({
				start_date: stamp(start),
				end_date: stamp(end),
				event_types: [
					"opened",
					"clicked",
					"delivered",
					"hard-bounced",
					"soft-bounced",
					"rejected",
					"spam"
				],
				limit: 1e3
			})
		});
		if (!response.ok) throw new Error("SMTP2GO could not return open events.");
		const payload = await response.json();
		const best = /* @__PURE__ */ new Map();
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
	if (resendRows.length && mail.key) for (const row of resendRows) try {
		const response = await fetch(`https://api.resend.com/emails/${encodeURIComponent(row.resend_id)}`, {
			headers: { Authorization: `Bearer ${mail.key}` },
			signal: AbortSignal.timeout(8e3)
		});
		if (!response.ok) continue;
		const status = ((await response.json()).last_event || "sent").slice(0, 40);
		await sql`update notifications set mail_status = ${status}, status_at = now() where id = ${row.id}`;
		updated += 1;
		if (status === "opened" || status === "clicked") opened += 1;
	} catch {
		continue;
	}
	return {
		updated,
		opened,
		checked: rows.length
	};
}
//#endregion
export { cleanMailFrom, cleanResendKey, cleanSmtpKey, ensureMailColumn, mailSetupView, notifyStep, readMailConfig, syncResendStatuses };
