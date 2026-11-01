import { a as matchTier, r as formatBonus } from "./promo-a-oE9-Iz.mjs";
import { a as cleanPublicDomain, c as isWorkspacePreview, i as cleanCompanyName, n as cleanBackupEmail, r as cleanCloudflareCode, t as DEFAULT_COMPANY_NAME } from "./env.server-CXxi_iUv.mjs";
import { n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-C6LS9On_.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var DEFAULT_INVOICE_BILLING = {
	brand: "AMERICAN EXPRESS",
	bankName: "AMERICAN EXPRESS NATIONAL BANK",
	accountName: "ECN",
	beneficiaryAddress: "115 WEST TOWNE RIDGE PARKWAY, SANDY, UT 84070",
	accountNumber: "400114254784",
	routingNumber: "124303243",
	crn: "",
	purpose: "",
	contactName: "American Express National Bank",
	contactAddress: "P.O. Box 30381\nSalt Lake City, UT 84130-9997",
	phone: "+1 800-430-3272",
	fdic: "27471"
};
function invoiceCrn(name, reference) {
	const clean = reference.replace(/[^A-Za-z0-9]/g, "");
	if (clean) return clean.slice(0, 16).toUpperCase();
	return `${(name.split(" ").filter(Boolean).pop() ?? "CLIENT").replace(/[^A-Za-z]/g, "").slice(0, 8).toUpperCase()}17`;
}
function resolveInvoiceBilling(raw, clientName, reference) {
	const stored = raw && typeof raw === "object" ? raw : {};
	const text = (value, fallback) => typeof value === "string" && value.trim() ? value.trim() : fallback;
	const crn = text(stored.crn, invoiceCrn(clientName, reference));
	return {
		brand: text(stored.brand, DEFAULT_INVOICE_BILLING.brand),
		bankName: text(stored.bankName, DEFAULT_INVOICE_BILLING.bankName),
		accountName: text(stored.accountName, DEFAULT_INVOICE_BILLING.accountName),
		beneficiaryAddress: text(stored.beneficiaryAddress, DEFAULT_INVOICE_BILLING.beneficiaryAddress),
		accountNumber: text(stored.accountNumber, DEFAULT_INVOICE_BILLING.accountNumber),
		routingNumber: text(stored.routingNumber, DEFAULT_INVOICE_BILLING.routingNumber),
		crn,
		purpose: text(stored.purpose, `CRN#${crn}`),
		contactName: text(stored.contactName, DEFAULT_INVOICE_BILLING.contactName),
		contactAddress: text(stored.contactAddress, DEFAULT_INVOICE_BILLING.contactAddress),
		phone: text(stored.phone, DEFAULT_INVOICE_BILLING.phone),
		fdic: text(stored.fdic, DEFAULT_INVOICE_BILLING.fdic)
	};
}
var COOKIE = "ah_admin";
var PREVIEW_EMAIL = "admin@accountholding.com";
var PREVIEW_PASSWORD = "holding-admin";
function cookieOptions(maxAge) {
	return {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: !isWorkspacePreview(),
		maxAge
	};
}
function tokenHash(token) {
	return createHash("sha256").update(token).digest("hex");
}
function sameToken(left, right) {
	const a = Buffer.from(left);
	const b = Buffer.from(right);
	return a.length === b.length && timingSafeEqual(a, b);
}
async function saveSetting(sql, key, value) {
	await sql`
    insert into site_settings (key, value) values (${key}, ${value})
    on conflict (key) do update set value = excluded.value
  `;
}
async function readDesk(sql) {
	const rows = await sql`
    select key, value from site_settings where key in ('desk_email', 'desk_password_hash', 'desk_session')
  `;
	const desk = {
		email: "",
		passwordHash: "",
		session: ""
	};
	for (const row of rows) {
		if (row.key === "desk_email") desk.email = row.value.trim().toLowerCase();
		if (row.key === "desk_password_hash") desk.passwordHash = row.value;
		if (row.key === "desk_session") desk.session = row.value;
	}
	if (!desk.passwordHash && isWorkspacePreview()) {
		const { hashPassword } = await import("./passwords.server-CdYSBfy_.mjs");
		desk.email = PREVIEW_EMAIL;
		desk.passwordHash = await hashPassword(PREVIEW_PASSWORD);
		await saveSetting(sql, "desk_email", desk.email);
		await saveSetting(sql, "desk_password_hash", desk.passwordHash);
	}
	return desk;
}
async function startDeskSession(sql) {
	const token = randomBytes(32).toString("hex");
	await saveSetting(sql, "desk_session", tokenHash(token));
	const { setCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	setCookie(COOKIE, token, cookieOptions(43200));
}
async function readSignedIn() {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const token = getCookie(COOKIE);
	if (!token) return false;
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const desk = await readDesk(await getSql());
	return Boolean(desk.session) && sameToken(tokenHash(token), desk.session);
}
function stripSecrets(input) {
	const { password: _password, confirmPassword: _confirm, ...rest } = input;
	return rest;
}
async function requireAdmin() {
	if (!await readSignedIn()) throw new Error("Sign in required.");
}
var getAdminSession_createServerFn_handler = createServerRpc({
	id: "e79aab6a9c5d4179f7a176a6a650c1161fe7e7439ce653697dcfba8240b8006e",
	name: "getAdminSession",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminSession.__executeServer(opts));
var getAdminSession = createServerFn({ method: "GET" }).handler(getAdminSession_createServerFn_handler, async () => {
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const desk = await readDesk(await getSql());
	return {
		signedIn: await readSignedIn(),
		needsSetup: !desk.passwordHash
	};
});
var adminLogin_createServerFn_handler = createServerRpc({
	id: "89f029f4fc21ed092423cd54f44fb61078423691288a3a89663a6e0973cd86ea",
	name: "adminLogin",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminLogin.__executeServer(opts));
var adminLogin = createServerFn({ method: "POST" }).validator((input) => input).handler(adminLogin_createServerFn_handler, async ({ data }) => {
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { verifyPassword } = await import("./passwords.server-CdYSBfy_.mjs");
	const sql = await getSql();
	const desk = await readDesk(sql);
	const email = data.email.trim().toLowerCase();
	if (!desk.passwordHash || email !== desk.email || !await verifyPassword(data.password, desk.passwordHash)) throw new Error("Those credentials are not recognized.");
	await startDeskSession(sql);
	return { ok: true };
});
var createDeskLogin_createServerFn_handler = createServerRpc({
	id: "6e1efb263437baa4a649ac0395fdbd6290df839cd5f5e0afeb5b6fd9c9ff443f",
	name: "createDeskLogin",
	filename: "src/lib/admin.functions.ts"
}, (opts) => createDeskLogin.__executeServer(opts));
var createDeskLogin = createServerFn({ method: "POST" }).validator((input) => input).handler(createDeskLogin_createServerFn_handler, async ({ data }) => {
	const email = data.email.trim().toLowerCase();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a desk email.");
	if (data.password.length < 8) throw new Error("Use a password of at least 8 characters.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { hashPassword } = await import("./passwords.server-CdYSBfy_.mjs");
	const sql = await getSql();
	if ((await readDesk(sql)).passwordHash) throw new Error("The desk login already exists.");
	await saveSetting(sql, "desk_email", email);
	await saveSetting(sql, "desk_password_hash", await hashPassword(data.password));
	await startDeskSession(sql);
	return { ok: true };
});
var saveDeskLogin_createServerFn_handler = createServerRpc({
	id: "765c7c71751ca870f5f7258b7f800a304c6a7ca77be480b2eeb48d9bf4356d6d",
	name: "saveDeskLogin",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveDeskLogin.__executeServer(opts));
var saveDeskLogin = createServerFn({ method: "POST" }).validator((input) => input).handler(saveDeskLogin_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const email = data.email.trim().toLowerCase();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a desk email.");
	if (data.newPassword && data.newPassword.length < 8) throw new Error("Use a password of at least 8 characters.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { hashPassword, verifyPassword } = await import("./passwords.server-CdYSBfy_.mjs");
	const sql = await getSql();
	const desk = await readDesk(sql);
	if (!desk.passwordHash || !await verifyPassword(data.currentPassword, desk.passwordHash)) throw new Error("The current password is not recognized.");
	await saveSetting(sql, "desk_email", email);
	if (data.newPassword) await saveSetting(sql, "desk_password_hash", await hashPassword(data.newPassword));
	return { ok: true };
});
var adminLogout_createServerFn_handler = createServerRpc({
	id: "b778199f0067dc3af0626a35537d9640eabb3a694e5f097e062cd440c74c2c03",
	name: "adminLogout",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminLogout.__executeServer(opts));
var adminLogout = createServerFn({ method: "POST" }).handler(adminLogout_createServerFn_handler, async () => {
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { setCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	await (await getSql())`delete from site_settings where key = 'desk_session'`;
	setCookie(COOKIE, "", cookieOptions(0));
	return { ok: true };
});
var submitApplication_createServerFn_handler = createServerRpc({
	id: "8f2bb3bdd3e9a32bf9d20870c5b92b09afddb820fe7293f95701022b9848bc75",
	name: "submitApplication",
	filename: "src/lib/admin.functions.ts"
}, (opts) => submitApplication.__executeServer(opts));
var submitApplication = createServerFn({ method: "POST" }).validator((input) => {
	if (!input.password || input.password.length < 8) throw new Error("A password is required.");
	return input;
}).handler(submitApplication_createServerFn_handler, async ({ data }) => {
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { hashPassword } = await import("./passwords.server-CdYSBfy_.mjs");
	const sql = await getSql();
	const id = crypto.randomUUID();
	const email = data.email.trim().toLowerCase();
	const inviteToken = data.inviteToken?.trim() || "";
	let invited = null;
	if (inviteToken) {
		const { readLeadInvite } = await import("./lead-invites.server-DBOhEbbT.mjs");
		const invite = await readLeadInvite(sql, inviteToken);
		if (invite.status !== "open") throw new Error("This application link has expired.");
		invited = {
			months: invite.months,
			promoCode: invite.promoCode
		};
	}
	const payload = {
		...stripSecrets(data),
		currency: "USD"
	};
	const { inviteToken: _inviteToken, ...stored } = payload;
	if (invited) {
		stored.preferredTerm = String(invited.months);
		stored.promoCode = invited.promoCode;
	}
	const name = [
		stored.firstName,
		stored.middleName,
		stored.surname
	].filter(Boolean).join(" ");
	const passwordHash = await hashPassword(data.password);
	await sql`
      insert into applications (id, applicant_name, email, account_type, currency, payload, password_hash)
      values (${id}, ${name}, ${email}, ${stored.accountType}, ${stored.currency}, ${JSON.stringify(stored)}::jsonb, ${passwordHash})
    `;
	if (inviteToken) await sql`update lead_invites set used_at = now() where token = ${inviteToken} and used_at is null`;
	await sendStep(sql, {
		step: "application_submitted",
		clientEmail: email,
		clientName: name,
		detail: [`${payload.accountType} account`, `Sign-in email ${email}`].join("\n"),
		adminDetail: applicationDeskDetail(payload),
		attachments: applicationFiles(payload),
		relatedId: id
	});
	return { id };
});
var getLeadInvite_createServerFn_handler = createServerRpc({
	id: "ea4f60a01a023ec8cd6db20b195514b2ab1f80974d6ac0d3302fc7b691665a83",
	name: "getLeadInvite",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getLeadInvite.__executeServer(opts));
var getLeadInvite = createServerFn({ method: "GET" }).validator((input) => ({ token: (input.token || "").trim().slice(0, 80) })).handler(getLeadInvite_createServerFn_handler, async ({ data }) => {
	if (!data.token) return { status: "missing" };
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { readLeadInvite } = await import("./lead-invites.server-DBOhEbbT.mjs");
	return readLeadInvite(await getSql(), data.token);
});
var listApplications_createServerFn_handler = createServerRpc({
	id: "1b59404f5dd7ebf22a4802040e66ad34f86c454a3111963b9acb931d6cb5f54e",
	name: "listApplications",
	filename: "src/lib/admin.functions.ts"
}, (opts) => listApplications.__executeServer(opts));
var listApplications = createServerFn({ method: "GET" }).handler(listApplications_createServerFn_handler, async () => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { ensureDemoApplications } = await import("./seed-applications.server-B84F_Z_Y.mjs");
	const sql = await getSql();
	await ensureDemoApplications(sql);
	return (await sql`
    select id, status, to_char(submitted_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as submitted_at,
           applicant_name, email, account_type, currency, payload
    from applications
    order by submitted_at desc
  `).map((row) => ({
		id: row.id,
		status: row.status,
		submittedAt: row.submitted_at,
		applicantName: row.applicant_name,
		email: row.email,
		accountType: row.account_type,
		currency: row.currency,
		payload: typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload
	}));
});
var setApplicationStatus_createServerFn_handler = createServerRpc({
	id: "dd2a8c89ce3736258bb458077f853a2565c444665a699be34aede0a82db3cbaf",
	name: "setApplicationStatus",
	filename: "src/lib/admin.functions.ts"
}, (opts) => setApplicationStatus.__executeServer(opts));
var setApplicationStatus = createServerFn({ method: "POST" }).validator((input) => {
	if (![
		"pending",
		"approved",
		"hold"
	].includes(input.status)) throw new Error("Unknown status.");
	return input;
}).handler(setApplicationStatus_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	const rows = await sql`
      select email, applicant_name, account_type, password_hash, status from applications where id = ${data.id}
    `;
	if (!rows[0]) throw new Error("Application not found.");
	if (rows[0].status === data.status) return {
		ok: true,
		loginEmail: data.status === "approved" ? String(rows[0].email).trim().toLowerCase() : null
	};
	if (data.status === "approved" && !rows[0].password_hash) throw new Error("This application has no password, so a login cannot be created.");
	await sql`update applications set status = ${data.status} where id = ${data.id}`;
	const email = String(rows[0].email).trim().toLowerCase();
	await sendStep(sql, {
		step: data.status === "approved" ? "application_approved" : data.status === "hold" ? "application_hold" : "application_pending",
		clientEmail: email,
		clientName: rows[0].applicant_name,
		detail: [`${rows[0].account_type} account`, `Sign-in email ${email}`].join("\n"),
		relatedId: data.id
	});
	if (data.status === "approved") {
		await sql`
        insert into investor_users (email, password_hash, application_id)
        values (${email}, ${rows[0].password_hash}, ${data.id})
        on conflict (email) do update
        set password_hash = excluded.password_hash, application_id = excluded.application_id
      `;
		return {
			ok: true,
			loginEmail: email
		};
	}
	await sql`delete from investor_users where application_id = ${data.id}`;
	return {
		ok: true,
		loginEmail: null
	};
});
var deleteApplication_createServerFn_handler = createServerRpc({
	id: "7123a0f1827ab182e080b8ee5731e8656bf3eda9f728947ac3649ee265ee4bda",
	name: "deleteApplication",
	filename: "src/lib/admin.functions.ts"
}, (opts) => deleteApplication.__executeServer(opts));
var deleteApplication = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteApplication_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	const rows = await sql`select email from applications where id = ${data.id}`;
	if (!rows[0]) throw new Error("Application not found.");
	const email = String(rows[0].email).trim().toLowerCase();
	await sql`
      delete from notifications
      where lower(recipient) = ${email}
         or related_id = ${data.id}
         or related_id in (select id from fundings where lower(email) = ${email})
    `;
	await sql`delete from fundings where lower(email) = ${email}`;
	await sql`
      delete from investor_users
      where application_id = ${data.id}
         or (lower(email) = ${email} and not exists (
           select 1 from applications where lower(email) = ${email} and id <> ${data.id}
         ))
    `;
	await sql`delete from applications where id = ${data.id}`;
	return { ok: true };
});
var clearDatabase_createServerFn_handler = createServerRpc({
	id: "343321a975f0f5b1926cf4a4b702a28553cc355cbf8a5f1ca79197a7593bb8cf",
	name: "clearDatabase",
	filename: "src/lib/admin.functions.ts"
}, (opts) => clearDatabase.__executeServer(opts));
var clearDatabase = createServerFn({ method: "POST" }).handler(clearDatabase_createServerFn_handler, async () => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureCrmLeads(sql);
	await sql`delete from notifications`;
	await sql`delete from fundings`;
	await sql`delete from investor_users`;
	await sql`delete from applications`;
	await sql`delete from crm_leads`;
	return { ok: true };
});
var deleteFunding_createServerFn_handler = createServerRpc({
	id: "4e0ee8356c5ccf6f9221df4d98ab36de6079de15b47569f344278a4287a5594b",
	name: "deleteFunding",
	filename: "src/lib/admin.functions.ts"
}, (opts) => deleteFunding.__executeServer(opts));
var deleteFunding = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteFunding_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	const rows = await sql`select id, status from fundings where id = ${data.id}`;
	if (!rows[0]) throw new Error("Investment not found.");
	if (rows[0].status === "payment_approved") throw new Error("An active CD is removed only when the client is deleted.");
	await sql`delete from notifications where related_id = ${data.id}`;
	await sql`delete from fundings where id = ${data.id}`;
	return { ok: true };
});
var signInAsClient_createServerFn_handler = createServerRpc({
	id: "c50efd40f7ae5cda51cd811e78d0e181402c25d11e95d42ed97f5803896f8074",
	name: "signInAsClient",
	filename: "src/lib/admin.functions.ts"
}, (opts) => signInAsClient.__executeServer(opts));
var signInAsClient = createServerFn({ method: "POST" }).validator((input) => input).handler(signInAsClient_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const rows = await (await getSql())`
      select email, status from applications where id = ${data.id}
    `;
	if (!rows[0] || rows[0].status !== "approved") throw new Error("Only an approved client can be opened.");
	const email = String(rows[0].email).trim().toLowerCase();
	const { setCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	setCookie("ah_investor", email, cookieOptions(43200));
	return { ok: true };
});
var investorLogin_createServerFn_handler = createServerRpc({
	id: "15bb4887dde39d3cd45f0ac0f1099831bb1e30bc708e9002486e6ac16d71333a",
	name: "investorLogin",
	filename: "src/lib/admin.functions.ts"
}, (opts) => investorLogin.__executeServer(opts));
var investorLogin = createServerFn({ method: "POST" }).validator((input) => input).handler(investorLogin_createServerFn_handler, async ({ data }) => {
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { verifyPassword } = await import("./passwords.server-CdYSBfy_.mjs");
	const { ensureDemoApplications } = await import("./seed-applications.server-B84F_Z_Y.mjs");
	const sql = await getSql();
	await ensureDemoApplications(sql);
	const email = data.email.trim().toLowerCase();
	const rows = await sql`
      select status, password_hash from applications
      where email = ${email}
      order by submitted_at desc
      limit 1
    `;
	const hash = rows[0]?.password_hash;
	if (!hash || !await verifyPassword(data.password, hash)) throw new Error("Those credentials are not recognized.");
	const { setCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	setCookie("ah_investor", email, cookieOptions(43200));
	return { destination: rows[0].status === "approved" ? "portal" : "application" };
});
var DEFAULT_THEME = {
	colorAction: "#006fcf",
	colorHeading: "#12315c",
	colorText: "#3d3d3d",
	colorLabel: "#262626",
	colorBorder: "#e0e0e0",
	colorBackground: "#fbfbfb"
};
function readHex(value, fallback) {
	const next = value.trim();
	return /^#[0-9a-fA-F]{6}$/.test(next) ? next.toLowerCase() : fallback;
}
function cleanHex(value, fallback) {
	const next = (value || "").trim();
	if (!next) return fallback;
	if (!/^#[0-9a-fA-F]{6}$/.test(next)) throw new Error("Use a color like #006fcf.");
	return next.toLowerCase();
}
function assertPageBackground(value) {
	if (!value || value === "none") return value === "none" ? "none" : null;
	return assertShareImage(value);
}
function assertShareImage(value) {
	if (!value) return null;
	if (!/^data:image\/(png|jpeg);base64,/.test(value) || value.length > 14e5) throw new Error("Use a JPEG or PNG under 1 MB.");
	return value;
}
function assertImage(value) {
	if (!value) return null;
	if (!value.startsWith("data:image/") || value.length > 5e5) throw new Error("Use an image under 400 KB.");
	return value;
}
async function publishSocialCard(dataUrl) {
	const { access, copyFile, unlink, writeFile } = await import("node:fs/promises");
	const { join } = await import("node:path");
	const dir = join(process.cwd(), "public");
	const jpg = join(dir, "og.jpg");
	const png = join(dir, "og.png");
	const backup = join(dir, "og-default.jpg");
	const exists = async (path) => access(path).then(() => true, () => false);
	if (!await exists(backup) && await exists(jpg)) await copyFile(jpg, backup);
	if (!dataUrl) {
		await unlink(png).catch(() => void 0);
		if (await exists(backup)) await copyFile(backup, jpg);
		return;
	}
	const match = dataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/i);
	if (!match) return;
	const encoded = match[2];
	if (match[1].toLowerCase() === "png") {
		await writeFile(png, Buffer.from(encoded, "base64"));
		await unlink(jpg).catch(() => void 0);
	} else {
		await writeFile(jpg, Buffer.from(encoded, "base64"));
		await unlink(png).catch(() => void 0);
	}
}
var getSiteBrand_createServerFn_handler = createServerRpc({
	id: "48d5a6ea211957ef115da61e253a9c39f785ebf602da2d8a44e4178e61018144",
	name: "getSiteBrand",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getSiteBrand.__executeServer(opts));
var getSiteBrand = createServerFn({ method: "GET" }).handler(getSiteBrand_createServerFn_handler, async () => {
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const rows = await (await getSql())`
    select key, value from site_settings where key in ('logo', 'favicon', 'company_name', 'cloudflare_code', 'cover', 'social_banner', 'email_logo', 'footer_logo', 'footer_text', 'backup_email', 'backup_at', 'public_domain', 'color_action', 'color_heading', 'color_text', 'color_label', 'color_border', 'color_background', 'page_background')
  `;
	const brand = {
		logo: null,
		favicon: null,
		companyName: DEFAULT_COMPANY_NAME,
		cloudflareCode: "",
		cover: null,
		socialBanner: null,
		emailLogo: null,
		footerLogo: null,
		footerText: "",
		backupEmail: "",
		lastBackupAt: "",
		publicDomain: "",
		...DEFAULT_THEME,
		pageBackground: null
	};
	for (const row of rows) {
		if (row.key === "logo" || row.key === "favicon" || row.key === "cover") brand[row.key] = row.value;
		if (row.key === "social_banner") brand.socialBanner = row.value;
		if (row.key === "email_logo") brand.emailLogo = row.value;
		if (row.key === "footer_logo") brand.footerLogo = row.value;
		if (row.key === "footer_text") brand.footerText = row.value;
		if (row.key === "backup_email") brand.backupEmail = row.value;
		if (row.key === "backup_at") brand.lastBackupAt = row.value;
		if (row.key === "company_name" && row.value.trim()) brand.companyName = row.value.trim();
		if (row.key === "cloudflare_code") brand.cloudflareCode = row.value;
		if (row.key === "public_domain") brand.publicDomain = row.value;
		if (row.key === "color_action") brand.colorAction = readHex(row.value, DEFAULT_THEME.colorAction);
		if (row.key === "color_heading") brand.colorHeading = readHex(row.value, DEFAULT_THEME.colorHeading);
		if (row.key === "color_text") brand.colorText = readHex(row.value, DEFAULT_THEME.colorText);
		if (row.key === "color_label") brand.colorLabel = readHex(row.value, DEFAULT_THEME.colorLabel);
		if (row.key === "color_border") brand.colorBorder = readHex(row.value, DEFAULT_THEME.colorBorder);
		if (row.key === "color_background") brand.colorBackground = readHex(row.value, DEFAULT_THEME.colorBackground);
		if (row.key === "page_background") brand.pageBackground = row.value === "none" || row.value.startsWith("data:image/") ? row.value : null;
	}
	return brand;
});
var setSiteBrand_createServerFn_handler = createServerRpc({
	id: "46b1c2c15b64cae3a5f34e1f1853ec2283ddfdfe186c71434db5870369340362",
	name: "setSiteBrand",
	filename: "src/lib/admin.functions.ts"
}, (opts) => setSiteBrand.__executeServer(opts));
var setSiteBrand = createServerFn({ method: "POST" }).validator((input) => ({
	logo: assertImage(input.logo),
	favicon: assertImage(input.favicon),
	companyName: cleanCompanyName(input.companyName || "Account Holding"),
	cloudflareCode: input.cloudflareCode || "",
	cover: assertShareImage(input.cover),
	socialBanner: assertShareImage(input.socialBanner),
	emailLogo: assertImage(input.emailLogo),
	footerLogo: assertImage(input.footerLogo),
	footerText: (input.footerText || "").slice(0, 800),
	backupEmail: cleanBackupEmail(input.backupEmail || ""),
	lastBackupAt: input.lastBackupAt || "",
	publicDomain: cleanPublicDomain(input.publicDomain || ""),
	colorAction: cleanHex(input.colorAction, DEFAULT_THEME.colorAction),
	colorHeading: cleanHex(input.colorHeading, DEFAULT_THEME.colorHeading),
	colorText: cleanHex(input.colorText, DEFAULT_THEME.colorText),
	colorLabel: cleanHex(input.colorLabel, DEFAULT_THEME.colorLabel),
	colorBorder: cleanHex(input.colorBorder, DEFAULT_THEME.colorBorder),
	colorBackground: cleanHex(input.colorBackground, DEFAULT_THEME.colorBackground),
	pageBackground: assertPageBackground(input.pageBackground)
})).handler(setSiteBrand_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	for (const key of [
		"logo",
		"favicon",
		"cover",
		"socialBanner",
		"emailLogo",
		"footerLogo"
	]) {
		const column = key === "socialBanner" ? "social_banner" : key === "emailLogo" ? "email_logo" : key === "footerLogo" ? "footer_logo" : key;
		const value = data[key];
		if (!value) await sql`delete from site_settings where key = ${column}`;
		else await sql`
          insert into site_settings (key, value) values (${column}, ${value})
          on conflict (key) do update set value = excluded.value
        `;
	}
	await publishSocialCard(data.socialBanner || data.cover);
	await sql`
      insert into site_settings (key, value) values ('company_name', ${data.companyName})
      on conflict (key) do update set value = excluded.value
    `;
	const cloudflare = cleanCloudflareCode(data.cloudflareCode);
	if (cloudflare === "") await sql`delete from site_settings where key = 'cloudflare_code'`;
	else if (cloudflare) await sql`
        insert into site_settings (key, value) values ('cloudflare_code', ${cloudflare})
        on conflict (key) do update set value = excluded.value
      `;
	if (!data.footerText.trim()) await sql`delete from site_settings where key = 'footer_text'`;
	else await sql`
        insert into site_settings (key, value) values ('footer_text', ${data.footerText.trim()})
        on conflict (key) do update set value = excluded.value
      `;
	if (!data.backupEmail) await sql`delete from site_settings where key = 'backup_email'`;
	else await sql`
        insert into site_settings (key, value) values ('backup_email', ${data.backupEmail})
        on conflict (key) do update set value = excluded.value
      `;
	if (!data.publicDomain) await sql`delete from site_settings where key = 'public_domain'`;
	else await sql`
        insert into site_settings (key, value) values ('public_domain', ${data.publicDomain})
        on conflict (key) do update set value = excluded.value
      `;
	const colors = [
		["color_action", data.colorAction],
		["color_heading", data.colorHeading],
		["color_text", data.colorText],
		["color_label", data.colorLabel],
		["color_border", data.colorBorder],
		["color_background", data.colorBackground]
	];
	for (const [key, value] of colors) await sql`
        insert into site_settings (key, value) values (${key}, ${value})
        on conflict (key) do update set value = excluded.value
      `;
	if (!data.pageBackground) await sql`delete from site_settings where key = 'page_background'`;
	else await sql`
        insert into site_settings (key, value) values ('page_background', ${data.pageBackground})
        on conflict (key) do update set value = excluded.value
      `;
	return data;
});
var runDatabaseBackup_createServerFn_handler = createServerRpc({
	id: "6d04e2b2142ca7fdd455d85b986e7dc11f966e7df5a2ab55be070d017bdfb090",
	name: "runDatabaseBackup",
	filename: "src/lib/admin.functions.ts"
}, (opts) => runDatabaseBackup.__executeServer(opts));
var runDatabaseBackup = createServerFn({ method: "POST" }).handler(runDatabaseBackup_createServerFn_handler, async () => {
	await requireAdmin();
	const { runBackup } = await import("./backup.server-skMXqjk0.mjs");
	const result = await runBackup();
	if (!result.ok) throw new Error(result.error);
	return result;
});
var getMailSetup_createServerFn_handler = createServerRpc({
	id: "19f1231488dc5a012a40246146c49a527b94c53d3a06a4387cc28d0d8f08e030",
	name: "getMailSetup",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getMailSetup.__executeServer(opts));
var getMailSetup = createServerFn({ method: "GET" }).handler(getMailSetup_createServerFn_handler, async () => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { mailSetupView } = await import("./mail.server-DvP07-0d.mjs");
	return mailSetupView(await getSql());
});
var saveMailSetup_createServerFn_handler = createServerRpc({
	id: "1b0a37303ffbd8eb9e7d9ffb7033bf9c04a2d7776b7ca0438dc0376b0f8319cb",
	name: "saveMailSetup",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveMailSetup.__executeServer(opts));
var saveMailSetup = createServerFn({ method: "POST" }).validator((input) => ({
	apiKey: input.apiKey || "",
	mailFrom: input.mailFrom || "",
	clearKey: Boolean(input.clearKey)
})).handler(saveMailSetup_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { cleanMailFrom, cleanResendKey } = await import("./mail.server-DvP07-0d.mjs");
	const apiKey = cleanResendKey(data.apiKey);
	const mailFrom = cleanMailFrom(data.mailFrom);
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	if (data.clearKey) await sql`delete from site_settings where key = 'resend_api_key'`;
	else if (apiKey) await sql`
        insert into site_settings (key, value) values ('resend_api_key', ${apiKey})
        on conflict (key) do update set value = excluded.value
      `;
	if (!mailFrom) await sql`delete from site_settings where key = 'mail_from'`;
	else await sql`
        insert into site_settings (key, value) values ('mail_from', ${mailFrom})
        on conflict (key) do update set value = excluded.value
      `;
	const { mailSetupView } = await import("./mail.server-DvP07-0d.mjs");
	return mailSetupView(sql);
});
var saveSmtpSetup_createServerFn_handler = createServerRpc({
	id: "53eddeec68c65dab79a58ff3da78a86c23a311a0fd114a80d1bce986b77ddd5d",
	name: "saveSmtpSetup",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveSmtpSetup.__executeServer(opts));
var saveSmtpSetup = createServerFn({ method: "POST" }).validator((input) => ({
	apiKey: input.apiKey || "",
	clearKey: Boolean(input.clearKey)
})).handler(saveSmtpSetup_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { cleanSmtpKey } = await import("./mail.server-DvP07-0d.mjs");
	const apiKey = cleanSmtpKey(data.apiKey);
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	if (data.clearKey) await sql`delete from site_settings where key = 'smtp2go_api_key'`;
	else if (apiKey) await sql`
        insert into site_settings (key, value) values ('smtp2go_api_key', ${apiKey})
        on conflict (key) do update set value = excluded.value
      `;
	const { mailSetupView } = await import("./mail.server-DvP07-0d.mjs");
	return mailSetupView(sql);
});
var getInvestorSession_createServerFn_handler = createServerRpc({
	id: "d1ae43cae6d0be2d1f69d39a6ad79c690664eebd84c9b6bfd72617c644ea6513",
	name: "getInvestorSession",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getInvestorSession.__executeServer(opts));
var getInvestorSession = createServerFn({ method: "GET" }).handler(getInvestorSession_createServerFn_handler, async () => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { ensureDemoApplications } = await import("./seed-applications.server-B84F_Z_Y.mjs");
	const email = getCookie("ah_investor");
	if (!email) return null;
	const sql = await getSql();
	await ensureDemoApplications(sql);
	const row = (await sql`
    select status, applicant_name, email, account_type, currency
    from applications
    where email = ${email}
    order by submitted_at desc
    limit 1
  `)[0];
	if (!row) return null;
	return {
		email: row.email,
		name: row.applicant_name,
		status: row.status,
		accountType: row.account_type,
		currency: row.currency,
		destination: row.status === "approved" ? "portal" : "application"
	};
});
var getInvestorPortal_createServerFn_handler = createServerRpc({
	id: "8822e6aa5afc9ef8a0275f464bef174b9273dd274d0ef1ea1c5de2610cd2b22d",
	name: "getInvestorPortal",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getInvestorPortal.__executeServer(opts));
var getInvestorPortal = createServerFn({ method: "GET" }).handler(getInvestorPortal_createServerFn_handler, async () => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { ensureDemoApplications } = await import("./seed-applications.server-B84F_Z_Y.mjs");
	const email = getCookie("ah_investor");
	if (!email) throw new Error("Sign in required.");
	const sql = await getSql();
	await ensureDemoApplications(sql);
	const row = (await sql`
    select status, to_char(submitted_at at time zone 'UTC', 'YYYY-MM-DD') as submitted_at,
           applicant_name, email, account_type, currency, payload
    from applications
    where email = ${email}
    order by submitted_at desc
    limit 1
  `)[0];
	if (!row || row.status !== "approved") throw new Error("Sign in required.");
	const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
	return {
		name: row.applicant_name,
		email: row.email,
		accountType: row.account_type,
		currency: row.currency,
		openedOn: row.submitted_at,
		payload
	};
});
var investorLogout_createServerFn_handler = createServerRpc({
	id: "238daabfda5c31e82d6a467078e892b727c983c5c9d29aa504fae0102a20f263",
	name: "investorLogout",
	filename: "src/lib/admin.functions.ts"
}, (opts) => investorLogout.__executeServer(opts));
var investorLogout = createServerFn({ method: "POST" }).handler(investorLogout_createServerFn_handler, async () => {
	const { setCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	setCookie("ah_investor", "", cookieOptions(0));
	return { ok: true };
});
function mapInvestment(row) {
	return {
		id: row.id,
		name: row.name,
		issuer: row.issuer,
		structure: row.structure,
		currency: row.currency,
		jurisdiction: row.jurisdiction,
		interestRate: row.interest_rate,
		couponType: row.coupon_type,
		minimumInvestment: row.minimum_investment,
		term: row.term,
		paymentFrequencies: row.payment_frequencies.split("|").map((item) => item.trim()).filter(Boolean),
		creditRating: row.credit_rating,
		capitalProtection: row.capital_protection
	};
}
var getCdTerms_createServerFn_handler = createServerRpc({
	id: "1d916ce53ed1636f14f29e607d03cd01c89f6e35b988da74a2dc466789b5ee25",
	name: "getCdTerms",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getCdTerms.__executeServer(opts));
var getCdTerms = createServerFn({ method: "GET" }).handler(getCdTerms_createServerFn_handler, async () => {
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	return (await (await getSql())`
    select id, apy, months, featured from cd_terms order by featured desc, sort_order asc, months asc
  `).map((row) => ({
		id: row.id,
		apy: row.apy,
		months: Number(row.months),
		featured: Boolean(row.featured)
	}));
});
var saveCdTerms_createServerFn_handler = createServerRpc({
	id: "cd1fbe67fd52ea928df985cb29f4a0ad9e2a1ba0b044e5e598e5be1cbb04b220",
	name: "saveCdTerms",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveCdTerms.__executeServer(opts));
var saveCdTerms = createServerFn({ method: "POST" }).validator((input) => input).handler(saveCdTerms_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await sql`delete from cd_terms`;
	const ordered = [...data].sort((a, b) => Number(b.featured) - Number(a.featured));
	for (let index = 0; index < ordered.length; index += 1) {
		const term = ordered[index];
		const months = Number(term.months);
		if (!term.apy.trim() || !Number.isFinite(months) || months <= 0) throw new Error("Each term needs an APY and a length.");
		await sql`
        insert into cd_terms (id, apy, months, featured, sort_order)
        values (${term.id || crypto.randomUUID()}, ${term.apy.trim()}, ${months}, ${Boolean(term.featured)}, ${index})
      `;
	}
	return { ok: true };
});
function mapPromo(settings, tiers) {
	return {
		intro: settings.intro,
		protection: settings.protection,
		finePrint: settings.fine_print,
		startsOn: String(settings.starts_on).slice(0, 10),
		endsOn: String(settings.ends_on).slice(0, 10),
		tiers: tiers.map((tier) => ({
			id: tier.id,
			minAmount: Number(tier.min_amount),
			maxAmount: tier.max_amount == null || tier.max_amount === "" ? null : Number(tier.max_amount),
			bonusPercent: Number(tier.bonus_percent),
			months: tier.months.split("|").map(Number).filter((month) => month > 0)
		}))
	};
}
async function loadPromo(sql) {
	const settings = await sql`
    select intro, protection, fine_print, starts_on::text, ends_on::text from promo_settings where id = 'current'
  `;
	const tiers = await sql`
    select id, min_amount, max_amount, bonus_percent, months from promo_tiers order by sort_order asc, min_amount asc
  `;
	if (!settings[0]) return {
		intro: "",
		protection: "",
		finePrint: "",
		startsOn: "",
		endsOn: "",
		tiers: []
	};
	return mapPromo(settings[0], tiers);
}
var getPromo_createServerFn_handler = createServerRpc({
	id: "28f25c5a8580090bdf548d7bf75d08544cfe13fdbdcb7b4bd24ed2098d8f3703",
	name: "getPromo",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getPromo.__executeServer(opts));
var getPromo = createServerFn({ method: "GET" }).handler(getPromo_createServerFn_handler, async () => {
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	return loadPromo(await getSql());
});
var savePromo_createServerFn_handler = createServerRpc({
	id: "fe12b8e84d6c20adda97886a656f77d13598a1a522761d051162002f72576797",
	name: "savePromo",
	filename: "src/lib/admin.functions.ts"
}, (opts) => savePromo.__executeServer(opts));
var savePromo = createServerFn({ method: "POST" }).validator((input) => input).handler(savePromo_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	if (!data.startsOn || !data.endsOn) throw new Error("Set the offer dates.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await sql`
      insert into promo_settings (id, intro, protection, fine_print, starts_on, ends_on)
      values ('current', ${data.intro}, ${data.protection}, ${data.finePrint}, ${data.startsOn}, ${data.endsOn})
      on conflict (id) do update set
        intro = excluded.intro,
        protection = excluded.protection,
        fine_print = excluded.fine_print,
        starts_on = excluded.starts_on,
        ends_on = excluded.ends_on
    `;
	await sql`delete from promo_tiers`;
	for (let index = 0; index < data.tiers.length; index += 1) {
		const tier = data.tiers[index];
		const min = Number(tier.minAmount);
		const max = tier.maxAmount == null || String(tier.maxAmount) === "" ? null : Number(tier.maxAmount);
		const bonus = Number(tier.bonusPercent);
		const months = [...new Set(tier.months.map(Number).filter((month) => month > 0))];
		if (!Number.isFinite(min) || min < 0 || !Number.isFinite(bonus) || bonus < 0 || months.length === 0) throw new Error("Each tier needs an amount, a bonus, and at least one term.");
		if (max != null && (!Number.isFinite(max) || max < min)) throw new Error("The maximum must be at least the minimum.");
		await sql`
        insert into promo_tiers (id, min_amount, max_amount, bonus_percent, months, sort_order)
        values (${tier.id || crypto.randomUUID()}, ${min}, ${max}, ${bonus}, ${months.join("|")}, ${index})
      `;
	}
	return { ok: true };
});
var getInvestmentTypes_createServerFn_handler = createServerRpc({
	id: "0188318a2c47fa577e85feac06e6f5e249d0b6c7e53b943032e8bf9cbd432ce9",
	name: "getInvestmentTypes",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getInvestmentTypes.__executeServer(opts));
var getInvestmentTypes = createServerFn({ method: "GET" }).handler(getInvestmentTypes_createServerFn_handler, async () => {
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	return (await (await getSql())`select * from investment_types where id = 'cd'`).map(mapInvestment);
});
var saveInvestmentType_createServerFn_handler = createServerRpc({
	id: "5edd854841c5220bfdf7cd162ccff167680add27784ef7b26a1accec376751da",
	name: "saveInvestmentType",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveInvestmentType.__executeServer(opts));
var saveInvestmentType = createServerFn({ method: "POST" }).validator((input) => input).handler(saveInvestmentType_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	if (data.id !== "cd" && data.id !== "bond") throw new Error("Unknown investment type.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	const frequencies = data.paymentFrequencies.map((item) => item.trim()).filter(Boolean).join("|");
	await sql`
      update investment_types set
        name = ${data.name},
        issuer = ${data.issuer},
        structure = ${data.structure},
        currency = ${data.currency},
        jurisdiction = ${data.jurisdiction},
        interest_rate = ${data.interestRate},
        coupon_type = ${data.couponType},
        minimum_investment = ${data.minimumInvestment},
        term = ${data.term},
        payment_frequencies = ${frequencies},
        credit_rating = ${data.creditRating},
        capital_protection = ${data.capitalProtection}
      where id = ${data.id}
    `;
	return { ok: true };
});
var getMyFundings_createServerFn_handler = createServerRpc({
	id: "371eaa94c7375a34014cafb3e1a903c29a0227fb832652248e5dfd387c9b158c",
	name: "getMyFundings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getMyFundings.__executeServer(opts));
var getMyFundings = createServerFn({ method: "GET" }).handler(getMyFundings_createServerFn_handler, async () => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const email = getCookie("ah_investor");
	if (!email) throw new Error("Sign in required.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureFundingExtras(sql);
	const { ensureDemoApplications } = await import("./seed-applications.server-B84F_Z_Y.mjs");
	await ensureDemoApplications(sql);
	return (await sql`
    select f.id, f.type_id, t.name, t.issuer, t.structure, t.currency, t.jurisdiction, t.coupon_type,
           t.minimum_investment, t.credit_rating, t.capital_protection,
           f.amount, f.frequency, f.term_label, f.status,
           a.name as advisor_name, a.phone as advisor_phone,
           (f.signed_at is not null) as signed,
           f.signer_name,
           to_char(f.signed_at at time zone 'UTC', 'YYYY-MM-DD') as signed_on,
           to_char(f.payment_approved_at at time zone 'UTC', 'YYYY-MM-DD') as confirmed_on,
           f.deposit_code, f.deposit_number, f.account_number, f.reference_number,
           f.payment_file_name, f.promo_apy, f.final_apy,
           to_char(f.created_at at time zone 'UTC', 'YYYY-MM-DD') as created_at
    from fundings f
    join investment_types t on t.id = f.type_id
    left join advisors a on a.id = f.advisor_id
    where f.email = ${email}
    order by f.created_at desc
  `).map((row) => ({
		id: row.id,
		typeId: row.type_id,
		name: row.name,
		issuer: row.issuer,
		structure: row.structure,
		currency: row.currency,
		jurisdiction: row.jurisdiction,
		couponType: row.coupon_type,
		minimumInvestment: row.minimum_investment,
		creditRating: row.credit_rating,
		capitalProtection: row.capital_protection,
		amount: row.amount,
		frequency: row.frequency,
		termLabel: row.term_label,
		status: row.status,
		advisorName: row.advisor_name ?? "",
		advisorPhone: row.advisor_phone ?? "",
		signed: Boolean(row.signed),
		signerName: row.signer_name ?? "",
		signedOn: row.signed_on ?? "",
		confirmedOn: row.confirmed_on ?? "",
		depositCode: row.deposit_code ?? "",
		depositNumber: row.deposit_number ?? "",
		accountNumber: row.account_number ?? "",
		referenceNumber: row.reference_number ?? "",
		paymentFileName: row.payment_file_name ?? "",
		promoApy: row.promo_apy ?? "",
		finalApy: row.final_apy ?? "",
		createdAt: row.created_at
	}));
});
var submitFunding_createServerFn_handler = createServerRpc({
	id: "e7d636636dc82c29558eb161011e78a0c993c313f396b7945fbd947e74255a10",
	name: "submitFunding",
	filename: "src/lib/admin.functions.ts"
}, (opts) => submitFunding.__executeServer(opts));
var submitFunding = createServerFn({ method: "POST" }).validator((input) => input).handler(submitFunding_createServerFn_handler, async ({ data }) => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const email = getCookie("ah_investor");
	if (!email) throw new Error("Sign in required.");
	if (data.typeId !== "cd") throw new Error("Choose a certificate term.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureFundingExtras(sql);
	const type = (await sql`select * from investment_types where id = 'cd'`)[0];
	if (!type) throw new Error("Certificates are not available.");
	const term = (await sql`select apy, months from cd_terms where id = ${data.termId}`)[0];
	if (!term) throw new Error("Choose a certificate term.");
	const minimum = Number(type.minimum_investment.replace(/[^0-9.]/g, ""));
	const amount = Number(data.amount.replace(/[^0-9.]/g, ""));
	if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter an investment amount.");
	if (Number.isFinite(minimum) && minimum > 0 && amount < minimum) throw new Error(`Minimum investment is ${type.minimum_investment}.`);
	const id = crypto.randomUUID();
	const formatted = amount.toLocaleString("en-US", {
		style: "currency",
		currency: "USD"
	});
	const label = `${Number(term.months)}-month · ${term.apy} APY`;
	const { nextFundingCodes } = await import("./funding-codes.server-CxOcBhrI.mjs");
	const codes = await nextFundingCodes(sql);
	const rates = ratesFor(label, formatted, (await loadPromo(sql)).tiers);
	await sql`
      insert into fundings (id, email, type_id, amount, frequency, term_label, status, deposit_code, deposit_number, account_number, reference_number, promo_apy, final_apy)
      values (${id}, ${email}, ${"cd"}, ${formatted}, ${""}, ${label}, ${"pending"}, ${codes.depositCode}, ${codes.depositNumber}, ${codes.accountNumber}, ${codes.referenceNumber}, ${rates.promo}, ${rates.final})
    `;
	await sendStep(sql, {
		step: "investment_submitted",
		clientEmail: email,
		clientName: await investorName(sql, email),
		detail: [
			`${label}`,
			formatted,
			`Promo APY ${rates.promo}`,
			`Final APY ${rates.final}`,
			`Reference ${codes.referenceNumber}`,
			`Deposit code ${codes.depositCode}`,
			`Account ${codes.accountNumber}`
		].join("\n"),
		relatedId: id,
		skipAdmin: true
	});
	return { id };
});
var cancelFunding_createServerFn_handler = createServerRpc({
	id: "7a25bb9444ff54d726f867aa071c78571c98f0852fce3af75bf6e281aaee9022",
	name: "cancelFunding",
	filename: "src/lib/admin.functions.ts"
}, (opts) => cancelFunding.__executeServer(opts));
var cancelFunding = createServerFn({ method: "POST" }).validator((input) => input).handler(cancelFunding_createServerFn_handler, async ({ data }) => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const email = getCookie("ah_investor");
	if (!email) throw new Error("Sign in required.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	if ((await sql`
      update fundings set status = 'cancelled'
      where id = ${data.id} and email = ${email} and status = 'pending'
      returning id
    `)[0]) {
		const detail = await fundingDetail(sql, data.id);
		await sendStep(sql, {
			step: "investment_cancelled",
			clientEmail: email,
			clientName: await investorName(sql, email),
			detail: await detailText(sql, detail),
			relatedId: data.id
		});
	}
	return { ok: true };
});
var sendLeadIntro_createServerFn_handler = createServerRpc({
	id: "46006108a43b5955e153161c38d4a991ad7fb79bc7fb49b43872dc805a179a48",
	name: "sendLeadIntro",
	filename: "src/lib/admin.functions.ts"
}, (opts) => sendLeadIntro.__executeServer(opts));
var sendLeadIntro = createServerFn({ method: "POST" }).validator((input) => {
	const name = input.name.trim().replace(/\s+/g, " ");
	const email = input.email.trim().toLowerCase();
	if (name.length < 2 || name.length > 80) throw new Error("Enter the lead's name.");
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter the lead's email.");
	if (!input.advisorId) throw new Error("Select an advisor.");
	const clip = (value, max) => (value || "").trim().slice(0, max);
	const copy = input.copy ? {
		subject: clip(input.copy.subject, 140),
		headline: clip(input.copy.headline, 180),
		welcome: clip(input.copy.welcome, 800),
		certificate: clip(input.copy.certificate, 500),
		offer: clip(input.copy.offer, 800),
		protection: clip(input.copy.protection, 500),
		ready: clip(input.copy.ready, 500),
		thanks: clip(input.copy.thanks, 400)
	} : null;
	return {
		advisorId: input.advisorId,
		name,
		email,
		copy
	};
}).handler(sendLeadIntro_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { leadLetter } = await import("./email-templates-C0jVmMQF.mjs").then((n) => n.i).then((n) => n.i);
	const sql = await getSql();
	await sql`alter table advisors add column if not exists role text not null default ''`;
	const advisor = (await sql`select name, phone, email, coalesce(mailbox, '') as mailbox, coalesce(role, '') as role from advisors where id = ${data.advisorId}`)[0];
	if (!advisor) throw new Error("Select an advisor.");
	if (!advisor.mailbox.trim()) throw new Error("Add this advisor's verified mailbox on the Advisors tab.");
	const terms = await sql`select apy, months from cd_terms order by months asc`;
	const types = await sql`select minimum_investment, capital_protection from investment_types where id = 'cd'`;
	const offer = await loadPromo(sql);
	const settings = await sql`select key, value from site_settings where key in ('email_logo', 'public_domain')`;
	const logo = settings.find((row) => row.key === "email_logo")?.value || null;
	const portalUrl = settings.find((row) => row.key === "public_domain")?.value || "";
	const letter = leadLetter({
		leadName: data.name,
		company: await readCompanyName(sql),
		terms: terms.map((term) => ({
			months: Number(term.months),
			apy: term.apy
		})),
		offer,
		advisor,
		minimum: types[0]?.minimum_investment,
		protection: types[0]?.capital_protection,
		logo,
		portalUrl,
		copy: data.copy
	});
	await sendStep(sql, {
		step: "lead_intro",
		clientEmail: data.email,
		clientName: data.name,
		detail: letter.text,
		extraHtml: letter.html,
		subject: data.copy?.subject,
		replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(advisor.email) ? advisor.email : advisor.mailbox,
		replyName: advisor.name,
		fromAddress: advisor.mailbox,
		relatedId: data.advisorId
	});
	return { ok: true };
});
var sendLeadApplication_createServerFn_handler = createServerRpc({
	id: "d4250d8ea37b0b6b6cc32aa247924d01849410ab372bc6eae17665d3df82d42e",
	name: "sendLeadApplication",
	filename: "src/lib/admin.functions.ts"
}, (opts) => sendLeadApplication.__executeServer(opts));
var sendLeadApplication = createServerFn({ method: "POST" }).validator((input) => {
	const name = input.name.trim().replace(/\s+/g, " ");
	const email = input.email.trim().toLowerCase();
	const months = Number(input.months);
	const kind = input.kind === "promo" ? "promo" : "custom";
	if (name.length < 2 || name.length > 80) throw new Error("Enter the lead's name.");
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter the lead's email.");
	if (!input.advisorId) throw new Error("Select an advisor.");
	if (!Number.isFinite(months) || months <= 0) throw new Error("Choose a certificate term.");
	const clip = (value, max) => (value || "").trim().slice(0, max);
	const copy = input.copy ? {
		subject: clip(input.copy.subject, 140),
		headline: clip(input.copy.headline, 180),
		hope: clip(input.copy.hope, 240),
		ready: clip(input.copy.ready, 800),
		instruction: clip(input.copy.instruction, 400),
		codeNote: clip(input.copy.codeNote, 400),
		followUp: clip(input.copy.followUp, 800),
		thanks: clip(input.copy.thanks, 400),
		promoCode: clip(input.copy.promoCode, 40)
	} : null;
	return {
		advisorId: input.advisorId,
		name,
		email,
		months,
		kind,
		copy
	};
}).handler(sendLeadApplication_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { applicationLetter } = await import("./email-templates-C0jVmMQF.mjs").then((n) => n.i).then((n) => n.i);
	const sql = await getSql();
	await sql`alter table advisors add column if not exists role text not null default ''`;
	const advisor = (await sql`select name, phone, email, coalesce(mailbox, '') as mailbox, coalesce(role, '') as role from advisors where id = ${data.advisorId}`)[0];
	if (!advisor) throw new Error("Select an advisor.");
	if (!advisor.mailbox.trim()) throw new Error("Add this advisor's verified mailbox on the Advisors tab.");
	const terms = await sql`select apy, months from cd_terms where months = ${data.months} limit 1`;
	if (!terms[0]) throw new Error("Choose a certificate term.");
	const types = await sql`select minimum_investment from investment_types where id = 'cd'`;
	const offer = await loadPromo(sql);
	const promoMonths = new Set(offer.tiers.flatMap((tier) => tier.months));
	if (data.kind === "promo" && !promoMonths.has(data.months)) throw new Error("Choose a promotional term.");
	if (data.kind === "custom" && promoMonths.has(data.months)) throw new Error("Choose a term that is not on promotion.");
	const settings = await sql`select key, value from site_settings where key in ('email_logo', 'public_domain')`;
	const origin = settings.find((row) => row.key === "public_domain")?.value || "";
	if (!/^https?:\/\//i.test(origin.trim())) throw new Error("Set the public domain in Settings before sending this email.");
	const { createLeadInvite, inviteApplicationUrl } = await import("./lead-invites.server-DBOhEbbT.mjs");
	const kind = data.kind === "promo" ? "promo" : "custom";
	const promoCode = kind === "promo" ? data.copy?.promoCode || `CD${randomBytes(3).toString("hex").toUpperCase()}` : data.copy?.promoCode || "";
	const token = await createLeadInvite(sql, {
		email: data.email,
		name: data.name,
		months: data.months,
		promoCode,
		kind,
		advisor
	});
	const letter = applicationLetter({
		leadName: data.name,
		company: await readCompanyName(sql),
		months: data.months,
		apy: terms[0].apy,
		offer,
		advisor,
		minimum: types[0]?.minimum_investment,
		logo: settings.find((row) => row.key === "email_logo")?.value || null,
		portalUrl: origin,
		link: inviteApplicationUrl(origin, token),
		variant: kind,
		copy: data.copy ? {
			...data.copy,
			promoCode
		} : {
			subject: "",
			headline: "",
			hope: "",
			ready: "",
			instruction: "",
			codeNote: "",
			followUp: "",
			thanks: "",
			promoCode
		}
	});
	await sendStep(sql, {
		step: kind === "promo" ? "lead_promo" : "lead_application",
		clientEmail: data.email,
		clientName: data.name,
		detail: letter.text,
		extraHtml: letter.html,
		subject: letter.subject,
		replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(advisor.email) ? advisor.email : advisor.mailbox,
		replyName: advisor.name,
		fromAddress: advisor.mailbox,
		relatedId: token
	});
	return { ok: true };
});
async function ensureCrmLeads(sql) {
	await sql`
    create table if not exists crm_leads (
      id text primary key,
      name text not null,
      email text not null default '',
      phone text not null default '',
      amount text not null default '',
      term text not null default '',
      objective text not null default '',
      liquidity text not null default '',
      source text not null default '',
      received_at timestamptz not null default now(),
      created_at timestamptz not null default now()
    )
  `;
}
var listCrmLeads_createServerFn_handler = createServerRpc({
	id: "a1d7ac3394c7cf21e5123b186412df53214aea42f0c665a9437b989c15ea8a03",
	name: "listCrmLeads",
	filename: "src/lib/admin.functions.ts"
}, (opts) => listCrmLeads.__executeServer(opts));
var listCrmLeads = createServerFn({ method: "GET" }).handler(listCrmLeads_createServerFn_handler, async () => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureCrmLeads(sql);
	return (await sql`
    select id, name, email, phone, amount, term, objective, liquidity, source, received_at
    from crm_leads
    order by received_at desc, created_at desc
  `).map((row) => ({
		id: row.id,
		name: row.name,
		email: row.email,
		phone: row.phone,
		amount: row.amount,
		term: row.term,
		objective: row.objective,
		liquidity: row.liquidity,
		source: row.source,
		receivedAt: new Date(row.received_at).toISOString()
	}));
});
var saveCrmLead_createServerFn_handler = createServerRpc({
	id: "320d5ad8293a8028b17b2a0c8ba59e0d25494a6dafccb7a8797177a2d0495ec8",
	name: "saveCrmLead",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveCrmLead.__executeServer(opts));
var saveCrmLead = createServerFn({ method: "POST" }).validator((input) => {
	const name = input.name.trim().replace(/\s+/g, " ");
	const email = input.email.trim().toLowerCase();
	if (name.length < 2) throw new Error("Enter the lead's name.");
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email or leave it blank.");
	const received = new Date(input.receivedAt || Date.now());
	if (Number.isNaN(received.getTime())) throw new Error("Enter when the lead was received.");
	const clip = (value) => (value || "").trim().slice(0, 240);
	return {
		id: input.id || "",
		name: name.slice(0, 120),
		email,
		phone: clip(input.phone),
		amount: clip(input.amount),
		term: clip(input.term),
		objective: clip(input.objective),
		liquidity: clip(input.liquidity),
		source: clip(input.source),
		receivedAt: received.toISOString()
	};
}).handler(saveCrmLead_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureCrmLeads(sql);
	const id = data.id || crypto.randomUUID();
	await sql`
      insert into crm_leads (id, name, email, phone, amount, term, objective, liquidity, source, received_at)
      values (
        ${id},
        ${data.name},
        ${data.email},
        ${data.phone},
        ${data.amount},
        ${data.term},
        ${data.objective},
        ${data.liquidity},
        ${data.source},
        ${data.receivedAt}
      )
      on conflict (id) do update set
        name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        amount = excluded.amount,
        term = excluded.term,
        objective = excluded.objective,
        liquidity = excluded.liquidity,
        source = excluded.source,
        received_at = excluded.received_at
    `;
	return { id };
});
var deleteCrmLead_createServerFn_handler = createServerRpc({
	id: "1d3491e9a27c290f295bfb69f2dd0ee4ad31f715b28d28a35caa1a9795dd1685",
	name: "deleteCrmLead",
	filename: "src/lib/admin.functions.ts"
}, (opts) => deleteCrmLead.__executeServer(opts));
var deleteCrmLead = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteCrmLead_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureCrmLeads(sql);
	await sql`delete from crm_leads where id = ${data.id}`;
	return { ok: true };
});
var listAdvisors_createServerFn_handler = createServerRpc({
	id: "0a4e4b3c4401fa3b3502245b8864092fe1dfbf357dc425ac9e606cc03de423a5",
	name: "listAdvisors",
	filename: "src/lib/admin.functions.ts"
}, (opts) => listAdvisors.__executeServer(opts));
var listAdvisors = createServerFn({ method: "GET" }).handler(listAdvisors_createServerFn_handler, async () => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await sql`alter table advisors add column if not exists role text not null default ''`;
	return sql`select id, name, phone, email, coalesce(mailbox, '') as mailbox, coalesce(role, '') as role from advisors order by name`;
});
var saveAdvisor_createServerFn_handler = createServerRpc({
	id: "c22e4f32fb4962874ec7588e1e0ddec4eddb22eaa12f9f6151d706503efd2f50",
	name: "saveAdvisor",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveAdvisor.__executeServer(opts));
var saveAdvisor = createServerFn({ method: "POST" }).validator((input) => input).handler(saveAdvisor_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	if (!data.name.trim()) throw new Error("Name is required.");
	const { cleanMailFrom } = await import("./mail.server-DvP07-0d.mjs");
	const mailbox = data.mailbox?.trim() ? cleanMailFrom(data.mailbox) : "";
	const role = (data.role || "").trim().slice(0, 80);
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await sql`alter table advisors add column if not exists role text not null default ''`;
	const id = data.id || crypto.randomUUID();
	await sql`
      insert into advisors (id, name, phone, email, mailbox, role)
      values (${id}, ${data.name.trim()}, ${data.phone.trim()}, ${data.email.trim()}, ${mailbox}, ${role})
      on conflict (id) do update set name = excluded.name, phone = excluded.phone, email = excluded.email, mailbox = excluded.mailbox, role = excluded.role
    `;
	return { id };
});
var deleteAdvisor_createServerFn_handler = createServerRpc({
	id: "adcbca43e56dbbae11c96adf856861fa5bc00e25f0f7449583c4ec9b411e38d6",
	name: "deleteAdvisor",
	filename: "src/lib/admin.functions.ts"
}, (opts) => deleteAdvisor.__executeServer(opts));
var deleteAdvisor = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteAdvisor_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await sql`update fundings set advisor_id = null where advisor_id = ${data.id}`;
	await sql`delete from advisors where id = ${data.id}`;
	return { ok: true };
});
async function ensureFundingExtras(sql) {
	await sql`alter table fundings add column if not exists promo_apy text not null default ''`;
	await sql`alter table fundings add column if not exists final_apy text not null default ''`;
	await sql`alter table fundings add column if not exists payment_approved_at timestamptz`;
	await sql`
    update fundings
    set payment_approved_at = coalesce(payment_uploaded_at, created_at)
    where status = 'payment_approved' and payment_approved_at is null
  `;
	const open = await sql`
    select id, term_label, amount from fundings where final_apy = ''
  `;
	if (open.length === 0) return;
	const offer = await loadPromo(sql);
	for (const row of open) {
		const rates = ratesFor(row.term_label, row.amount, offer.tiers);
		await sql`update fundings set promo_apy = ${rates.promo}, final_apy = ${rates.final} where id = ${row.id} and final_apy = ''`;
	}
}
async function ensureContactColumns(sql) {
	await sql`alter table fundings add column if not exists contact_phone text not null default ''`;
	await sql`alter table fundings add column if not exists contact_by text not null default 'call'`;
}
async function ensureInvoiceBillingColumn(sql) {
	await sql`alter table fundings add column if not exists invoice_billing jsonb not null default '{}'::jsonb`;
}
var listFundings_createServerFn_handler = createServerRpc({
	id: "fcde75496a4a883be99631cbde15fcf5e2c6609cc6764c5351fe6366e3922405",
	name: "listFundings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => listFundings.__executeServer(opts));
var listFundings = createServerFn({ method: "GET" }).handler(listFundings_createServerFn_handler, async () => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureInvoiceBillingColumn(sql);
	await ensureContactColumns(sql);
	await ensureFundingExtras(sql);
	const { ensureDemoApplications } = await import("./seed-applications.server-B84F_Z_Y.mjs");
	await ensureDemoApplications(sql);
	return (await sql`
    select f.id, f.email, f.type_id, t.name, t.issuer, t.structure, t.currency, t.jurisdiction,
           t.coupon_type, t.minimum_investment, t.credit_rating, t.capital_protection,
           f.amount, f.frequency, f.term_label, f.status, f.advisor_id,
           a.name as advisor_name, a.phone as advisor_phone,
           (f.signed_at is not null) as signed,
           f.signer_name,
           to_char(f.signed_at at time zone 'UTC', 'YYYY-MM-DD') as signed_on,
           to_char(f.payment_approved_at at time zone 'UTC', 'YYYY-MM-DD') as confirmed_on,
           f.deposit_code, f.deposit_number, f.account_number, f.reference_number,
           f.payment_file_name, f.promo_apy, f.final_apy, f.invoice_billing, f.contact_phone, f.contact_by,
           to_char(f.created_at at time zone 'UTC', 'YYYY-MM-DD') as created_at
    from fundings f
    join investment_types t on t.id = f.type_id
    left join advisors a on a.id = f.advisor_id
    order by f.created_at desc
  `).map((row) => ({
		id: row.id,
		email: row.email,
		typeId: row.type_id,
		name: row.name,
		issuer: row.issuer,
		structure: row.structure,
		currency: row.currency,
		jurisdiction: row.jurisdiction,
		couponType: row.coupon_type,
		minimumInvestment: row.minimum_investment,
		creditRating: row.credit_rating,
		capitalProtection: row.capital_protection,
		amount: row.amount,
		frequency: row.frequency,
		termLabel: row.term_label,
		status: row.status,
		advisorId: row.advisor_id ?? "",
		advisorName: row.advisor_name ?? "",
		advisorPhone: row.advisor_phone ?? "",
		signed: Boolean(row.signed),
		signerName: row.signer_name ?? "",
		signedOn: row.signed_on ?? "",
		confirmedOn: row.confirmed_on ?? "",
		depositCode: row.deposit_code ?? "",
		depositNumber: row.deposit_number ?? "",
		accountNumber: row.account_number ?? "",
		referenceNumber: row.reference_number ?? "",
		paymentFileName: row.payment_file_name ?? "",
		promoApy: row.promo_apy ?? "",
		finalApy: row.final_apy ?? "",
		contactPhone: row.contact_phone ?? "",
		contactBy: row.contact_by ?? "call",
		createdAt: row.created_at,
		billing: resolveInvoiceBilling(row.invoice_billing, row.signer_name || row.email, row.reference_number ?? "")
	}));
});
var updateFunding_createServerFn_handler = createServerRpc({
	id: "2f83f4b9946b9da9bedd5b26404c83efb0b680df2d872ad2ea3fa0ce99fcd863",
	name: "updateFunding",
	filename: "src/lib/admin.functions.ts"
}, (opts) => updateFunding.__executeServer(opts));
var updateFunding = createServerFn({ method: "POST" }).validator((input) => {
	if (![
		"pending",
		"approved_phone",
		"instructions_sent",
		"payment_approved",
		"cancelled"
	].includes(input.status)) throw new Error("Unknown status.");
	const depositCode = input.depositCode.trim();
	const depositNumber = input.depositNumber.trim();
	const accountNumber = input.accountNumber.trim();
	const referenceNumber = input.referenceNumber.trim();
	if (!depositCode || !depositNumber || !accountNumber || !referenceNumber) throw new Error("Fill in every reference field.");
	const openedOn = input.openedOn.trim();
	if (!/^\d{4}-\d{2}-\d{2}$/.test(openedOn)) throw new Error("Enter the certificate date.");
	const numeric = Number(input.amount.replace(/[^0-9.]/g, ""));
	if (!Number.isFinite(numeric) || numeric <= 0) throw new Error("Enter an investment amount.");
	const amount = numeric.toLocaleString("en-US", {
		style: "currency",
		currency: "USD"
	});
	return {
		...input,
		depositCode,
		depositNumber,
		accountNumber,
		referenceNumber,
		amount,
		openedOn
	};
}).handler(updateFunding_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureFundingExtras(sql);
	if ((await sql`
      select id from fundings
      where id <> ${data.id}
        and (
          deposit_code = ${data.depositCode}
          or deposit_number = ${data.depositNumber}
          or account_number = ${data.accountNumber}
          or reference_number = ${data.referenceNumber}
        )
      limit 1
    `)[0]) throw new Error("That number is already used on another investment.");
	const current = await fundingDetail(sql, data.id);
	if (!current) throw new Error("Investment not found.");
	if (data.status !== current.status) {
		const from = current.status;
		const to = data.status;
		if (!((from === "pending" || from === "approved_phone") && (to === "pending" || to === "approved_phone" || to === "cancelled") || from === "instructions_sent" && to === "cancelled")) throw new Error("Create the invoice on the Invoices tab. Confirm the payment there after the wire file is attached.");
	}
	const rates = current.amount === data.amount ? null : ratesFor(current.term_label, data.amount, (await loadPromo(sql)).tiers);
	await sql`
      update fundings
      set status = ${data.status},
          advisor_id = ${data.advisorId || null},
          deposit_code = ${data.depositCode},
          deposit_number = ${data.depositNumber},
          account_number = ${data.accountNumber},
          reference_number = ${data.referenceNumber},
          amount = ${data.amount},
          promo_apy = ${rates ? rates.promo : current.promo_apy ?? ""},
          final_apy = ${rates ? rates.final : current.final_apy ?? ""},
          created_at = ${data.openedOn}::timestamp
      where id = ${data.id}
    `;
	if (current && current.status !== data.status) {
		const step = fundingStep(data.status);
		if (step) await sendStep(sql, {
			step,
			clientEmail: current.email,
			clientName: await investorName(sql, current.email),
			detail: await detailText(sql, {
				...current,
				amount: data.amount
			}),
			relatedId: data.id
		});
	}
	return { ok: true };
});
var PAYMENT_FILE = /^data:(application\/pdf|image\/png|image\/jpeg);base64,/;
var uploadPaymentConfirmation_createServerFn_handler = createServerRpc({
	id: "7dfd9b8a9038d0c6d84532cfdd58c0318d9fd8830fd7a88e28882e95dfaf5b9a",
	name: "uploadPaymentConfirmation",
	filename: "src/lib/admin.functions.ts"
}, (opts) => uploadPaymentConfirmation.__executeServer(opts));
var uploadPaymentConfirmation = createServerFn({ method: "POST" }).validator((input) => input).handler(uploadPaymentConfirmation_createServerFn_handler, async ({ data }) => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const email = getCookie("ah_investor");
	if (!email) throw new Error("Sign in required.");
	if (!data.fileName.trim() || !PAYMENT_FILE.test(data.file) || data.file.length > 7e6) throw new Error("Attach a PDF or image under 5 MB.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	if (!(await sql`
      update fundings
      set payment_file_name = ${data.fileName.trim()}, payment_file = ${data.file}, payment_uploaded_at = now()
      where id = ${data.id} and email = ${email} and status = 'instructions_sent'
      returning id
    `)[0]) throw new Error("The invoice has not been generated for this investment.");
	const detail = await fundingDetail(sql, data.id);
	await sendStep(sql, {
		step: "payment_uploaded",
		clientEmail: email,
		clientName: await investorName(sql, email),
		detail: `${await detailText(sql, detail)}\nFile: ${data.fileName.trim()}`,
		relatedId: data.id
	});
	return { ok: true };
});
var getPaymentFile_createServerFn_handler = createServerRpc({
	id: "670101ceb9a8c4921096966f8043a6883d6040bc7c4869c99684ec1805a93a9d",
	name: "getPaymentFile",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getPaymentFile.__executeServer(opts));
var getPaymentFile = createServerFn({ method: "POST" }).validator((input) => input).handler(getPaymentFile_createServerFn_handler, async ({ data }) => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	const investor = getCookie("ah_investor");
	const own = (investor ? await sql`
          select payment_file_name, payment_file from fundings where id = ${data.id} and email = ${investor}
        ` : [])[0];
	if (own?.payment_file) return {
		fileName: own.payment_file_name,
		file: own.payment_file
	};
	await requireAdmin();
	const file = (await sql`
      select payment_file_name, payment_file from fundings where id = ${data.id}
    `)[0];
	if (!file?.payment_file) throw new Error("No payment confirmation is attached.");
	return {
		fileName: file.payment_file_name,
		file: file.payment_file
	};
});
var approvePayment_createServerFn_handler = createServerRpc({
	id: "be572942eeb298238365c54abae7a3b9a7377c3f9af2e62338f4a18ac7ca30c6",
	name: "approvePayment",
	filename: "src/lib/admin.functions.ts"
}, (opts) => approvePayment.__executeServer(opts));
var approvePayment = createServerFn({ method: "POST" }).validator((input) => input).handler(approvePayment_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	if (!(await sql`
      update fundings set status = 'payment_approved', payment_approved_at = now()
      where id = ${data.id} and payment_file <> '' and status = 'instructions_sent'
      returning id
    `)[0]) throw new Error("A wire confirmation is required before approval.");
	const detail = await fundingDetail(sql, data.id);
	if (detail) await sendStep(sql, {
		step: "payment_approved",
		clientEmail: detail.email,
		clientName: await investorName(sql, detail.email),
		detail: await detailText(sql, detail),
		relatedId: data.id
	});
	return { ok: true };
});
var rejectPayment_createServerFn_handler = createServerRpc({
	id: "2e2eafc3c130800cd476299ebeff265ed2f9d9548eb67737a5d554f9e06a20e8",
	name: "rejectPayment",
	filename: "src/lib/admin.functions.ts"
}, (opts) => rejectPayment.__executeServer(opts));
var rejectPayment = createServerFn({ method: "POST" }).validator((input) => input).handler(rejectPayment_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	if (!(await sql`
      update fundings
      set payment_file_name = '', payment_file = '', payment_uploaded_at = null
      where id = ${data.id} and status = 'instructions_sent' and payment_file <> ''
      returning id
    `)[0]) throw new Error("There is no wire confirmation to reject.");
	const detail = await fundingDetail(sql, data.id);
	if (detail) await sendStep(sql, {
		step: "payment_rejected",
		clientEmail: detail.email,
		clientName: await investorName(sql, detail.email),
		detail: await detailText(sql, detail),
		relatedId: data.id
	});
	return { ok: true };
});
var signFunding_createServerFn_handler = createServerRpc({
	id: "36d26e5dce43d3d3a77fb6d34d8199bf57c9136b23385e8382c2cf06b4630848",
	name: "signFunding",
	filename: "src/lib/admin.functions.ts"
}, (opts) => signFunding.__executeServer(opts));
var signFunding = createServerFn({ method: "POST" }).validator((input) => ({
	id: input.id,
	signature: input.signature,
	contactPhone: (input.contactPhone || "").trim().slice(0, 80),
	contactBy: input.contactBy === "email" ? "email" : "call"
})).handler(signFunding_createServerFn_handler, async ({ data }) => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const email = getCookie("ah_investor");
	if (!email) throw new Error("Sign in required.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureContactColumns(sql);
	const apps = await sql`
      select id, applicant_name, payload from applications
      where lower(email) = ${email.toLowerCase()}
      order by submitted_at desc nulls last
      limit 1
    `;
	const payload = apps[0]?.payload ? typeof apps[0].payload === "string" ? JSON.parse(apps[0].payload) : apps[0].payload : null;
	const drawn = data.signature?.startsWith("data:image/png;base64,") ? data.signature : "";
	const signature = drawn || payload?.signature || "";
	if (!signature.startsWith("data:image/png;base64,")) throw new Error("Draw your signature.");
	if (data.contactBy === "call" && data.contactPhone.replace(/\D/g, "").length < 7) throw new Error("Enter the number to call.");
	if (drawn && apps[0]) {
		const next = {
			...payload ?? {},
			signature: drawn
		};
		await sql`update applications set payload = ${JSON.stringify(next)}::jsonb where id = ${apps[0].id}`;
	}
	const signerName = apps[0]?.applicant_name || [payload?.firstName, payload?.surname].filter(Boolean).join(" ") || email;
	if (!(await sql`
      update fundings
      set signer_name = ${signerName}, signature = ${signature}, signed_at = now(),
          contact_phone = ${data.contactPhone}, contact_by = ${data.contactBy}
      where id = ${data.id} and lower(email) = ${email.toLowerCase()} and status in ('pending', 'approved_phone', 'instructions_sent') and signed_at is null
      returning id
    `)[0]) throw new Error("These terms cannot be accepted.");
	const detail = await fundingDetail(sql, data.id);
	const contact = data.contactBy === "email" ? `Do not call. Use email ${email}` : `Call ${data.contactPhone}`;
	await sendStep(sql, {
		step: "terms_accepted",
		clientEmail: email,
		clientName: signerName,
		detail: [await detailText(sql, detail), contact].filter(Boolean).join("\n"),
		relatedId: data.id
	});
	return { ok: true };
});
var downloadInvestmentPdf_createServerFn_handler = createServerRpc({
	id: "77d03951a209f31c50c597255d022704b13de997f740c7fb04bbbdb2cc02d8ee",
	name: "downloadInvestmentPdf",
	filename: "src/lib/admin.functions.ts"
}, (opts) => downloadInvestmentPdf.__executeServer(opts));
var downloadInvestmentPdf = createServerFn({ method: "POST" }).validator((input) => input).handler(downloadInvestmentPdf_createServerFn_handler, async ({ data }) => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const email = getCookie("ah_investor");
	if (!email) throw new Error("Sign in required.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureFundingExtras(sql);
	const row = (await sql`
      select f.id, f.status, f.email, f.amount, f.frequency, f.term_label, f.signer_name, f.signature,
             to_char(f.signed_at at time zone 'UTC', 'YYYY-MM-DD') as signed_on,
             to_char(f.created_at at time zone 'UTC', 'YYYY-MM-DD') as opened_on,
             to_char(f.payment_approved_at at time zone 'UTC', 'YYYY-MM-DD') as confirmed_on,
             f.promo_apy, f.final_apy,
             t.issuer, t.structure, t.currency, t.jurisdiction, t.coupon_type,
             t.minimum_investment, t.credit_rating, t.capital_protection,
             a.name as advisor_name, a.phone as advisor_phone,
             f.deposit_code, f.deposit_number, f.account_number, f.reference_number,
             app.applicant_name, app.payload
      from fundings f
      join investment_types t on t.id = f.type_id
      left join advisors a on a.id = f.advisor_id
      left join lateral (
        select applicant_name, payload from applications
        where email = f.email
        order by submitted_at desc nulls last
        limit 1
      ) app on true
      where f.id = ${data.id} and f.email = ${email}
    `)[0];
	if (!row) throw new Error("Investment not found.");
	const { buildConfirmationPdf, buildInvestmentPdf } = await import("./investment-pdf.server-BLyp4GzH.mjs");
	const promo = await loadPromo(sql);
	const rates = row.final_apy ? {
		promo: row.promo_apy || "—",
		final: row.final_apy
	} : ratesFor(row.term_label, row.amount, promo.tiers);
	const months = Number(row.term_label.match(/(\d+)-month/)?.[1] ?? 0);
	const payload = row.payload ? typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload : null;
	const clientName = row.applicant_name || [payload?.firstName, payload?.surname].filter(Boolean).join(" ") || row.signer_name || row.email;
	const storedSignature = row.signature.startsWith("data:image/png;base64,") ? row.signature : payload?.signature ?? "";
	const png = storedSignature.startsWith("data:image/png;base64,") ? new Uint8Array(Buffer.from(storedSignature.replace(/^data:image\/png;base64,/, ""), "base64")) : void 0;
	const address = [
		[payload?.street, payload?.apt].filter(Boolean).join(" "),
		[
			payload?.city,
			payload?.region,
			payload?.postal
		].filter(Boolean).join(", "),
		payload?.country ?? ""
	].filter(Boolean);
	const shared = {
		investor: clientName,
		email: row.email,
		issuer: row.issuer,
		structure: row.structure,
		currency: row.currency,
		jurisdiction: row.jurisdiction,
		couponType: row.coupon_type,
		minimum: row.minimum_investment,
		creditRating: row.credit_rating,
		capitalProtection: row.capital_protection,
		termLabel: row.term_label,
		amount: row.amount,
		frequency: row.frequency,
		promoApy: rates.promo,
		finalApy: rates.final,
		signerName: row.signer_name || clientName,
		signedOn: row.signed_on || (png ? "Signed on the account application" : ""),
		signaturePng: png,
		companyName: await readCompanyName(sql)
	};
	return {
		pdf: row.status === "payment_approved" ? await buildConfirmationPdf({
			...shared,
			clientName,
			address,
			issueDate: usDate(row.opened_on),
			maturityDate: plusMonths(row.opened_on, months),
			confirmationDate: usDate(row.confirmed_on || row.opened_on),
			termMonths: months,
			depositCode: row.deposit_code,
			depositNumber: row.deposit_number,
			accountNumber: row.account_number,
			referenceNumber: row.reference_number,
			advisorName: row.advisor_name ?? "",
			advisorPhone: row.advisor_phone ?? ""
		}) : await buildInvestmentPdf(shared),
		sheet: {
			issuer: row.issuer,
			structure: row.structure,
			currency: row.currency,
			jurisdiction: row.jurisdiction,
			couponType: row.coupon_type,
			minimum: row.minimum_investment,
			creditRating: row.credit_rating,
			capitalProtection: row.capital_protection,
			termLabel: row.term_label,
			amount: row.amount,
			frequency: row.frequency,
			promoApy: rates.promo,
			finalApy: rates.final,
			signerName: row.signer_name || (png ? clientName : ""),
			signedOn: row.signed_on || (png ? "Signed on the account application" : ""),
			email: row.email
		}
	};
});
var downloadInvoicePdf_createServerFn_handler = createServerRpc({
	id: "219438d22bbc21708bd4abc3bd7eddea3cd96ec5b11376a18ba34dd62bba657c",
	name: "downloadInvoicePdf",
	filename: "src/lib/admin.functions.ts"
}, (opts) => downloadInvoicePdf.__executeServer(opts));
var downloadInvoicePdf = createServerFn({ method: "POST" }).validator((input) => input).handler(downloadInvoicePdf_createServerFn_handler, async ({ data }) => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const email = getCookie("ah_investor");
	const admin = await readSignedIn();
	if (!email && !admin) throw new Error("Sign in required.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureInvoiceBillingColumn(sql);
	const row = (await sql`
      select f.id, f.status, f.email, f.amount, f.term_label, f.reference_number, f.signature,
             to_char(f.signed_at at time zone 'UTC', 'YYYY-MM-DD') as signed_on,
             app.applicant_name, app.payload, a.phone as advisor_phone, f.invoice_billing
      from fundings f
      left join advisors a on a.id = f.advisor_id
      left join lateral (
        select applicant_name, payload from applications
        where email = f.email
        order by submitted_at desc nulls last
        limit 1
      ) app on true
      where f.id = ${data.id}
    `)[0];
	const signed = Boolean(row?.signature) || Boolean(row?.signed_on);
	const generated = row?.status === "instructions_sent";
	const preview = generated || row?.status === "approved_phone";
	if (!row || !signed || !preview || !admin && !generated || !admin && row.email !== email) throw new Error("Invoice not found.");
	const payload = row.payload ? typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload : null;
	const clientName = row.applicant_name || [payload?.firstName, payload?.surname].filter(Boolean).join(" ") || row.email;
	const address = [
		[payload?.street, payload?.apt].filter(Boolean).join(" "),
		[
			payload?.city,
			payload?.region,
			payload?.postal
		].filter(Boolean).join(", "),
		payload?.country ?? ""
	].filter(Boolean);
	const { buildInvoicePdf } = await import("./investment-pdf.server-BLyp4GzH.mjs");
	return { pdf: await buildInvoicePdf({
		clientName,
		address,
		amount: row.amount,
		billing: resolveInvoiceBilling(row.invoice_billing, clientName, row.reference_number)
	}) };
});
var saveInvoiceBilling_createServerFn_handler = createServerRpc({
	id: "65a7a10b5c938741219fad35d71a6925b4094c3763aee671945a0ed540ab4900",
	name: "saveInvoiceBilling",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveInvoiceBilling.__executeServer(opts));
var saveInvoiceBilling = createServerFn({ method: "POST" }).validator((input) => {
	const billing = { ...input.billing };
	Object.keys(billing).forEach((key) => {
		billing[key] = String(billing[key] ?? "").trim();
	});
	if (!billing.bankName || !billing.accountName || !billing.beneficiaryAddress || !billing.accountNumber || !billing.routingNumber || !billing.crn || !billing.purpose) throw new Error("Fill in every billing field.");
	return {
		id: input.id,
		billing
	};
}).handler(saveInvoiceBilling_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureInvoiceBillingColumn(sql);
	await sql`update fundings set invoice_billing = ${JSON.stringify(data.billing)}::jsonb where id = ${data.id}`;
	return { billing: data.billing };
});
var approveInvoice_createServerFn_handler = createServerRpc({
	id: "bd6078a16a27d37284969ff6fdbb85e565608b225b79da5f7e5edee1af8cc404",
	name: "approveInvoice",
	filename: "src/lib/admin.functions.ts"
}, (opts) => approveInvoice.__executeServer(opts));
var approveInvoice = createServerFn({ method: "POST" }).validator((input) => {
	const billing = { ...input.billing };
	Object.keys(billing).forEach((key) => {
		billing[key] = String(billing[key] ?? "").trim();
	});
	if (!billing.bankName || !billing.accountName || !billing.beneficiaryAddress || !billing.accountNumber || !billing.routingNumber || !billing.crn || !billing.purpose) throw new Error("Fill in every billing field.");
	return {
		id: input.id,
		billing
	};
}).handler(approveInvoice_createServerFn_handler, async ({ data }) => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const sql = await getSql();
	await ensureInvoiceBillingColumn(sql);
	const current = await fundingDetail(sql, data.id);
	const signed = await sql`select signed_at is not null as signed from fundings where id = ${data.id}`;
	if (!current || !signed[0]?.signed) throw new Error("The client has not accepted the terms.");
	if (current.status !== "approved_phone" && current.status !== "instructions_sent") throw new Error("Approve the call before generating the invoice.");
	await sql`update fundings set invoice_billing = ${JSON.stringify(data.billing)}::jsonb where id = ${data.id}`;
	if (current.status === "approved_phone") {
		await sql`update fundings set status = 'instructions_sent' where id = ${data.id}`;
		await sendStep(sql, {
			step: "instructions_sent",
			clientEmail: current.email,
			clientName: await investorName(sql, current.email),
			detail: await detailText(sql, {
				...current,
				status: "instructions_sent"
			}),
			relatedId: data.id
		});
	}
	return { ok: true };
});
function usDate(iso) {
	const [year, month, day] = iso.split("-");
	if (!year || !month || !day) return iso;
	return `${Number(month)}/${Number(day)}/${year}`;
}
function plusMonths(iso, months) {
	const [year, month, day] = iso.split("-").map(Number);
	if (!year || !month || !day || !months) return iso;
	const date = new Date(Date.UTC(year, month - 1 + months, day));
	return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
}
function ratesFor(termLabel, amount, tiers) {
	const months = Number(termLabel.match(/(\d+)-month/)?.[1] ?? 0);
	const base = Number(termLabel.match(/([\d.]+)%/)?.[1] ?? 0);
	const value = Number(amount.replace(/[^0-9.]/g, ""));
	const promo = matchTier({
		intro: "",
		protection: "",
		finePrint: "",
		startsOn: "",
		endsOn: "",
		tiers
	}, months, value);
	const percent = (base / 100 + (promo ? promo.bonusPercent / 100 : 0)) * 100;
	const digits = Math.round(percent * 1e3) % 10 === 0 ? 2 : 3;
	return {
		promo: promo ? formatBonus(promo.bonusPercent) : "—",
		final: base ? `${percent.toFixed(digits)}%` : "—"
	};
}
async function readCompanyName(sql) {
	return (await sql`select value from site_settings where key = 'company_name'`)[0]?.value?.trim() || "Account Holding";
}
async function investorName(sql, email) {
	return (await sql`
    select applicant_name from applications
    where lower(email) = ${email.toLowerCase()}
    order by submitted_at desc nulls last
    limit 1
  `)[0]?.applicant_name || email;
}
async function fundingDetail(sql, id) {
	return (await sql`
    select f.email, f.term_label, f.amount, f.frequency, f.status,
           f.deposit_code, f.account_number, f.reference_number,
           f.promo_apy, f.final_apy,
           a.name as advisor_name, a.phone as advisor_phone
    from fundings f
    left join advisors a on a.id = f.advisor_id
    where f.id = ${id}
  `)[0] ?? null;
}
async function detailText(sql, row) {
	if (!row) return "";
	const rates = row.final_apy ? {
		promo: row.promo_apy || "—",
		final: row.final_apy
	} : ratesFor(row.term_label, row.amount, (await loadPromo(sql)).tiers);
	const status = STATUS_LABEL[row.status] || row.status;
	return [
		row.term_label,
		row.amount,
		`Promo APY ${rates.promo}`,
		`Final APY ${rates.final}`,
		status ? `Status ${status}` : "",
		row.reference_number ? `Reference ${row.reference_number}` : "",
		row.deposit_code ? `Deposit code ${row.deposit_code}` : "",
		row.account_number ? `Account ${row.account_number}` : "",
		row.advisor_name ? `Advisor ${row.advisor_name}${row.advisor_phone ? ` · ${row.advisor_phone}` : ""}` : ""
	].filter(Boolean).join("\n");
}
var STATUS_LABEL = {
	pending: "Pending call/email",
	approved_phone: "Approved by phone",
	instructions_sent: "Invoice generated",
	payment_approved: "Active",
	cancelled: "Cancelled"
};
function fundingStep(status) {
	if (status === "approved_phone") return "approved_phone";
	if (status === "instructions_sent") return "instructions_sent";
	if (status === "payment_approved") return "payment_approved";
	if (status === "cancelled") return "investment_cancelled";
	return null;
}
function applicationDeskDetail(payload) {
	const line = (label, value) => `${label}: ${value.trim() || "—"}`;
	return [
		line("Account", payload.accountType),
		line("Name", [
			payload.firstName,
			payload.middleName,
			payload.surname
		].filter(Boolean).join(" ")),
		line("Email", payload.email),
		line("Phone", `${payload.phoneCountry} ${payload.phone}`),
		line("Date of birth", [
			payload.dobDay,
			payload.dobMonth,
			payload.dobYear
		].filter(Boolean).join(" ")),
		line("Nationality", payload.nationality),
		line("Residence", payload.residence),
		line("Occupation", payload.occupation),
		line("Address", [
			payload.street,
			payload.apt,
			payload.city,
			payload.region,
			payload.postal,
			payload.country
		].filter(Boolean).join(", ")),
		line("Tax residence", payload.taxResidence),
		line("Tax ID", payload.taxId),
		line("Source of wealth", payload.sourceOfWealth),
		line("Source of funds", payload.sourceOfFunds),
		line("Purpose", payload.investmentPurpose),
		line("Net worth", payload.netWorth),
		line("Preferred amount", payload.preferredAmount || "—"),
		line("Preferred term", payload.preferredTerm ? `${payload.preferredTerm}-month` : "—"),
		line("Promotional code", payload.promoCode || "—"),
		line("Identity document", `${payload.idType}${payload.idFileName ? ` · ${payload.idFileName}` : " · not attached"}`),
		line("Address document", `${payload.addressDocType}${payload.addressFileName ? ` · ${payload.addressFileName}` : " · not attached"}`),
		line("Bank", payload.bankName),
		line("Account holder", payload.accountHolder),
		line("Bank address", [
			payload.bankStreet,
			payload.bankLine2,
			payload.bankCity,
			payload.bankState,
			payload.bankZip
		].filter(Boolean).join(", ")),
		line("Routing number", payload.routingNumber),
		line("Account number", payload.accountNumber),
		line("Information is accurate", payload.d1 ? "Yes" : "No"),
		line("Beneficial owner", payload.d2 ? "Yes" : "No"),
		line("Portfolio stays unavailable until approval", payload.d3 ? "Yes" : "No"),
		line("Agrees to account terms", payload.d4 ? "Yes" : "No"),
		line("Signature", payload.signature.startsWith("data:image/") ? "Attached" : "Not attached")
	].join("\n");
}
function applicationFiles(payload) {
	return [
		dataFile(payload.idFileName ? `identity-${payload.idFileName}` : "identity-document", payload.idFile),
		dataFile(payload.addressFileName ? `address-${payload.addressFileName}` : "address-document", payload.addressFile),
		dataFile("signature.png", payload.signature)
	].filter((file) => Boolean(file));
}
function dataFile(name, value) {
	const match = value.match(/^data:[^;]+;base64,([a-zA-Z0-9+/=\s]+)$/);
	if (!match) return null;
	const content = match[1].replace(/\s/g, "");
	if (!content) return null;
	return {
		filename: name.trim() || "document",
		content
	};
}
async function sendStep(sql, input) {
	try {
		const { notifyStep } = await import("./mail.server-DvP07-0d.mjs");
		await notifyStep(sql, input);
	} catch {}
}
var listNotifications_createServerFn_handler = createServerRpc({
	id: "7b50bd6e596679fe8759352efff6da788bf65b5c6f4458e7d4e70bcd96c23585",
	name: "listNotifications",
	filename: "src/lib/admin.functions.ts"
}, (opts) => listNotifications.__executeServer(opts));
var listNotifications = createServerFn({ method: "GET" }).handler(listNotifications_createServerFn_handler, async () => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { ensureMailColumn } = await import("./mail.server-DvP07-0d.mjs");
	const sql = await getSql();
	await ensureMailColumn(sql);
	const rows = await sql`
    select id, to_char(created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as created_at,
           audience, recipient, step, subject, body, html, delivery, resend_id, mail_status, related_id
    from notifications
    order by created_at desc
    limit 200
  `;
	const origin = ((await sql`select value from site_settings where key = 'public_domain'`)[0]?.value || "").trim().replace(/\/$/, "");
	const invites = await sql`
    select token, expires_at, used_at from lead_invites
  `;
	const byToken = new Map(invites.map((invite) => [invite.token, invite]));
	return rows.map((row) => {
		const fromHtml = row.html?.match(/invite=([a-f0-9]{16,})/i)?.[1] || "";
		const invite = byToken.get(row.related_id) || byToken.get(fromHtml);
		const token = invite?.token || "";
		const link = token && /^https?:\/\//i.test(origin) ? `${origin}/application?invite=${token}` : "";
		return {
			id: row.id,
			createdAt: row.created_at,
			audience: row.audience,
			recipient: row.recipient,
			step: row.step,
			subject: row.subject,
			body: row.body,
			html: row.html ?? "",
			delivery: row.delivery,
			resendId: row.resend_id || "",
			mailStatus: row.mail_status || "",
			link,
			expiresAt: invite?.expires_at ? new Date(invite.expires_at).toISOString() : "",
			usedAt: invite?.used_at ? new Date(invite.used_at).toISOString() : ""
		};
	});
});
var syncMailStatuses_createServerFn_handler = createServerRpc({
	id: "be53b2628abbad2d5bf831bbb6156af68ccb69338b6750eaa7b194b534d22dd9",
	name: "syncMailStatuses",
	filename: "src/lib/admin.functions.ts"
}, (opts) => syncMailStatuses.__executeServer(opts));
var syncMailStatuses = createServerFn({ method: "POST" }).handler(syncMailStatuses_createServerFn_handler, async () => {
	await requireAdmin();
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { syncResendStatuses } = await import("./mail.server-DvP07-0d.mjs");
	return syncResendStatuses(await getSql());
});
var listMyNotifications_createServerFn_handler = createServerRpc({
	id: "8b04ddee08d00402f35af241b8797321407d2743498150ff1167939f742f711c",
	name: "listMyNotifications",
	filename: "src/lib/admin.functions.ts"
}, (opts) => listMyNotifications.__executeServer(opts));
var listMyNotifications = createServerFn({ method: "GET" }).handler(listMyNotifications_createServerFn_handler, async () => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const email = getCookie("ah_investor");
	if (!email) throw new Error("Sign in required.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { ensureMailColumn } = await import("./mail.server-DvP07-0d.mjs");
	const sql = await getSql();
	await ensureMailColumn(sql);
	return (await sql`
    select id, to_char(created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as created_at, subject, read_at
    from notifications
    where audience = 'client' and lower(recipient) = ${email.toLowerCase()}
    order by created_at desc
    limit 50
  `).map((row) => ({
		id: row.id,
		createdAt: row.created_at,
		subject: row.subject,
		unread: !row.read_at
	}));
});
var markMyNotificationsRead_createServerFn_handler = createServerRpc({
	id: "15dca57f795e6ae56b7ab042755d2eeb7fb1aee841f555b937707d59a5fcbb88",
	name: "markMyNotificationsRead",
	filename: "src/lib/admin.functions.ts"
}, (opts) => markMyNotificationsRead.__executeServer(opts));
var markMyNotificationsRead = createServerFn({ method: "POST" }).handler(markMyNotificationsRead_createServerFn_handler, async () => {
	const { getCookie } = await import("./ssr.mjs").then((n) => n.a).then((n) => n.t);
	const email = getCookie("ah_investor");
	if (!email) throw new Error("Sign in required.");
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const { ensureMailColumn } = await import("./mail.server-DvP07-0d.mjs");
	const sql = await getSql();
	await ensureMailColumn(sql);
	await sql`
    update notifications
    set read_at = now()
    where audience = 'client' and lower(recipient) = ${email.toLowerCase()} and read_at is null
  `;
	return { ok: true };
});
//#endregion
export { adminLogin_createServerFn_handler, adminLogout_createServerFn_handler, approveInvoice_createServerFn_handler, approvePayment_createServerFn_handler, cancelFunding_createServerFn_handler, clearDatabase_createServerFn_handler, createDeskLogin_createServerFn_handler, deleteAdvisor_createServerFn_handler, deleteApplication_createServerFn_handler, deleteCrmLead_createServerFn_handler, deleteFunding_createServerFn_handler, downloadInvestmentPdf_createServerFn_handler, downloadInvoicePdf_createServerFn_handler, getAdminSession_createServerFn_handler, getCdTerms_createServerFn_handler, getInvestmentTypes_createServerFn_handler, getInvestorPortal_createServerFn_handler, getInvestorSession_createServerFn_handler, getLeadInvite_createServerFn_handler, getMailSetup_createServerFn_handler, getMyFundings_createServerFn_handler, getPaymentFile_createServerFn_handler, getPromo_createServerFn_handler, getSiteBrand_createServerFn_handler, investorLogin_createServerFn_handler, investorLogout_createServerFn_handler, listAdvisors_createServerFn_handler, listApplications_createServerFn_handler, listCrmLeads_createServerFn_handler, listFundings_createServerFn_handler, listMyNotifications_createServerFn_handler, listNotifications_createServerFn_handler, markMyNotificationsRead_createServerFn_handler, rejectPayment_createServerFn_handler, runDatabaseBackup_createServerFn_handler, saveAdvisor_createServerFn_handler, saveCdTerms_createServerFn_handler, saveCrmLead_createServerFn_handler, saveDeskLogin_createServerFn_handler, saveInvestmentType_createServerFn_handler, saveInvoiceBilling_createServerFn_handler, saveMailSetup_createServerFn_handler, savePromo_createServerFn_handler, saveSmtpSetup_createServerFn_handler, sendLeadApplication_createServerFn_handler, sendLeadIntro_createServerFn_handler, setApplicationStatus_createServerFn_handler, setSiteBrand_createServerFn_handler, signFunding_createServerFn_handler, signInAsClient_createServerFn_handler, submitApplication_createServerFn_handler, submitFunding_createServerFn_handler, syncMailStatuses_createServerFn_handler, updateFunding_createServerFn_handler, uploadPaymentConfirmation_createServerFn_handler };
