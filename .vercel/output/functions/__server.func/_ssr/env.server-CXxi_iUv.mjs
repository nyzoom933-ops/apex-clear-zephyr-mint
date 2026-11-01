//#region node_modules/.nitro/vite/services/ssr/assets/env.server-CXxi_iUv.js
var DEFAULT_COMPANY_NAME = "Account Holding";
function cleanCompanyName(value) {
	const name = value.trim().replace(/\s+/g, " ");
	if (!name || name.length > 80) throw new Error("Enter a company name up to 80 characters.");
	return name;
}
function cloudflareToken(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	const beacon = trimmed.match(/"token"\s*:\s*"([A-Za-z0-9_-]+)"/);
	if (beacon) return beacon[1];
	if (/^[A-Za-z0-9_-]{8,}$/.test(trimmed)) return trimmed;
	return "";
}
function cleanBackupEmail(value) {
	const email = value.trim().toLowerCase();
	if (!email) return "";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) throw new Error("Enter a backup email address.");
	return email;
}
function cleanPublicDomain(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
	let url;
	try {
		url = new URL(withScheme);
	} catch {
		throw new Error("Enter a public domain, such as https://example.com.");
	}
	if (!url.hostname || !url.hostname.includes(".")) throw new Error("Enter a public domain, such as https://example.com.");
	return url.origin;
}
function cleanCloudflareCode(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (trimmed.length > 2e3 || !cloudflareToken(trimmed)) return null;
	return trimmed;
}
function env(key) {
	return process.env[key]?.trim() || void 0;
}
/**
* Workspace preview vs deployed app. The deployer writes GROK_PROJECT_ID on
* every publish; the sandbox preview never has it. Single source of truth for
* the split — gate audience, gate endpoints and connector-token semantics all
* key off this predicate.
*/
function isWorkspacePreview() {
	return !env("GROK_PROJECT_ID");
}
//#endregion
export { cleanPublicDomain as a, isWorkspacePreview as c, cleanCompanyName as i, cleanBackupEmail as n, cloudflareToken as o, cleanCloudflareCode as r, env as s, DEFAULT_COMPANY_NAME as t };
