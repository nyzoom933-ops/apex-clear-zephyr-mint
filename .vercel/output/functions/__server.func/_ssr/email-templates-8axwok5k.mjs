import { t as DEFAULT_COMPANY_NAME } from "./env.server-CXxi_iUv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/email-templates-8axwok5k.js
var STEPS = {
	application_submitted: {
		label: "Application received",
		clientSubject: "We received your application",
		clientLead: "We received your {{company}} application. The desk will review it before the investor portal opens.",
		clientNext: "Keep the password you created. Sign-in stays closed until this application is approved. We will email you when it opens.",
		adminSubject: "New application from {{name}}",
		adminLead: "{{name}} ({{email}}) submitted an application."
	},
	application_approved: {
		label: "Application approved",
		clientSubject: "Your investor portal is open",
		clientLead: "Your application is approved. The investor portal is open for this email address.",
		clientNext: "Sign in with this email and the password from your application. Open Funding to choose a certificate.",
		adminSubject: "Application approved for {{name}}",
		adminLead: "{{name}} ({{email}}) was approved. Their investor sign-in is active."
	},
	application_hold: {
		label: "Application on hold",
		clientSubject: "Your application is on hold",
		clientLead: "Your application is on hold while the desk reviews it. The investor portal stays closed.",
		clientNext: "No funding can start yet. Watch for another email when the application moves back to review or is approved.",
		adminSubject: "Application on hold for {{name}}",
		adminLead: "{{name}} ({{email}}) was placed on hold."
	},
	application_pending: {
		label: "Application in review",
		clientSubject: "Your application is in review",
		clientLead: "Your application is in review again. The investor portal stays closed until it is approved.",
		clientNext: "Nothing else is required unless the desk asks for another document.",
		adminSubject: "Application returned to review for {{name}}",
		adminLead: "{{name}} ({{email}}) was returned to pending review."
	},
	investment_submitted: {
		label: "Certificate requested",
		clientSubject: "We received your certificate request",
		clientLead: "Your certificate request is recorded. It is not funded until you accept the terms and the advisor confirms payment.",
		clientNext: "Sign in, open the certificate, and accept the terms. A $4.99 dealing fee applies. Do not send a wire yet.",
		adminSubject: "New certificate request from {{name}}",
		adminLead: "{{name}} ({{email}}) requested a certificate."
	},
	terms_accepted: {
		label: "Terms accepted",
		clientSubject: "Your certificate terms are accepted",
		clientLead: "Your application signature is now on this certificate. The request is waiting for an advisor call.",
		clientNext: "Wait for the advisor listed below to call. Do not send funds until funding instructions are in the portal.",
		adminSubject: "{{name}} accepted certificate terms",
		adminLead: "{{name}} ({{email}}) accepted the investment terms."
	},
	approved_phone: {
		label: "Approved by phone",
		clientSubject: "Your certificate was approved by phone",
		clientLead: "Your advisor approved this certificate by phone. It is still not active.",
		clientNext: "Wait for the invoice in your portal. Send the wire only after that invoice is there.",
		adminSubject: "Certificate approved by phone for {{name}}",
		adminLead: "{{name}} ({{email}}) was marked approved by phone."
	},
	instructions_sent: {
		label: "Invoice generated",
		clientSubject: "Your payment invoice is ready",
		clientLead: "Your payment invoice is ready in the portal. The certificate stays pending until the wire is confirmed.",
		clientNext: "Send the wire using the invoice in the portal, then upload the bank confirmation on this certificate.",
		adminSubject: "Invoice generated for {{name}}",
		adminLead: "An invoice was generated for {{name}} ({{email}})."
	},
	payment_uploaded: {
		label: "Wire confirmation",
		clientSubject: "We received your wire confirmation",
		clientLead: "Your wire confirmation is with your advisor. The certificate is not active yet.",
		clientNext: "Nothing else is required. The certificate moves to Active CDs after the advisor approves the payment.",
		adminSubject: "Wire confirmation from {{name}}",
		adminLead: "{{name}} ({{email}}) uploaded a wire confirmation."
	},
	payment_rejected: {
		label: "Wire confirmation rejected",
		clientSubject: "Please upload the wire confirmation again",
		clientLead: "The wire confirmation was not accepted.",
		clientNext: "Upload a new confirmation from the investment. The certificate stays inactive until your advisor approves the payment.",
		adminSubject: "Wire confirmation rejected for {{name}}",
		adminLead: "The wire confirmation for {{name}} ({{email}}) was rejected."
	},
	payment_approved: {
		label: "Certificate active",
		clientSubject: "Your certificate is active",
		clientLead: "Your advisor confirmed the payment. This certificate is active.",
		clientNext: "Open Active CDs in the portal to see the term, APY, maturity date, and confirmation. A $4.99 dealing fee applies to this purchase.",
		adminSubject: "Payment approved for {{name}}",
		adminLead: "Payment was approved for {{name}} ({{email}}). The certificate is active."
	},
	investment_cancelled: {
		label: "Certificate cancelled",
		clientSubject: "Your certificate request was cancelled",
		clientLead: "This certificate request was cancelled and will not be funded.",
		clientNext: "No wire is due for this request. Sign in if you want to open a new certificate.",
		adminSubject: "Certificate cancelled for {{name}}",
		adminLead: "A certificate for {{name}} ({{email}}) was cancelled."
	}
};
var SAMPLE_EMAIL = {
	name: "Jonah Hale",
	email: "jonah.hale@example.com",
	detail: "22-month · 4.40% APY\n$250,000.00",
	companyName: DEFAULT_COMPANY_NAME
};
var CERTIFICATE_STEPS = /* @__PURE__ */ new Set([
	"investment_submitted",
	"terms_accepted",
	"approved_phone",
	"instructions_sent",
	"payment_uploaded",
	"payment_rejected",
	"payment_approved",
	"investment_cancelled"
]);
function renderStep(step, audience, input) {
	const item = STEPS[step];
	const company = input.companyName?.trim() || "Account Holding";
	const name = input.name.trim() || "Investor";
	const lead = fill(audience === "client" ? item.clientLead : item.adminLead, name, input.email, company);
	const subject = fill(audience === "client" ? item.clientSubject : item.adminSubject, name, input.email, company);
	const greeting = audience === "client" ? `Hello ${name},` : "Operations desk,";
	const next = audience === "client" && item.clientNext ? fill(item.clientNext, name, input.email, company) : "";
	const portalUrl = audience === "client" ? cleanPortalUrl(input.portalUrl) : "";
	const lines = input.detail.split("\n").map((line) => line.trim()).filter(Boolean);
	if (audience === "client" && CERTIFICATE_STEPS.has(step)) {
		if (!lines.some((line) => line.startsWith("Promo APY"))) lines.push("Promo APY +1.125%");
		if (!lines.some((line) => line.startsWith("Final APY"))) lines.push("Final APY 5.525%");
	}
	const text = [
		greeting,
		"",
		lead,
		...lines.length ? ["", ...lines] : [],
		...next ? [
			"",
			"What happens next",
			next
		] : [],
		...portalUrl ? [
			"",
			"Open the investor portal",
			portalUrl
		] : [],
		"",
		company
	].join("\n");
	return {
		step,
		audience,
		label: item.label,
		subject,
		text,
		html: layout({
			eyebrow: item.label,
			greeting,
			lead,
			lines,
			next,
			audience,
			company,
			logo: input.emailLogo,
			portalUrl
		})
	};
}
function templateCatalog(companyName = DEFAULT_COMPANY_NAME, emailLogo = null, portalUrl = "") {
	const sample = {
		...SAMPLE_EMAIL,
		companyName,
		emailLogo,
		portalUrl
	};
	return Object.keys(STEPS).flatMap((step) => [renderStep(step, "client", sample), renderStep(step, "admin", sample)]);
}
function cleanPortalUrl(value) {
	const trimmed = value?.trim() ?? "";
	if (!/^https?:\/\//i.test(trimmed)) return "";
	return trimmed.replace(/\/$/, "") + "/login";
}
function fill(value, name, email, company) {
	return value.replaceAll("{{name}}", name).replaceAll("{{email}}", email).replaceAll("{{company}}", company);
}
function layout(input) {
	const facts = input.lines.map((line) => `<p style="margin:0 0 6px;font-size:14px;line-height:1.4;color:#3d3d3d;">${escapeHtml(line)}</p>`).join("");
	const card = facts ? `<tr><td style="padding:0 32px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;border:1px solid #e0e0e0;border-radius:8px;"><tr><td style="padding:14px 16px;">${facts}</td></tr></table></td></tr>` : "";
	const next = input.next ? `<tr><td style="padding:0 32px 8px;font-family:Arial,sans-serif;"><p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#1d8ece;">What happens next</p><p style="margin:0;font-size:15px;line-height:1.5;color:#3d3d3d;">${escapeHtml(input.next)}</p></td></tr>` : "";
	const portal = input.portalUrl ? `<tr><td style="padding:16px 32px 8px;font-family:Arial,sans-serif;"><a href="${escapeHtml(input.portalUrl)}" style="display:inline-block;background:#006fcf;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 18px;border-radius:6px;">Open the investor portal</a></td></tr>` : "";
	const who = input.audience === "client" ? "Investor note" : "Desk note";
	const logo = safeImage(input.logo);
	return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#fbfbfb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbfbfb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#006fcf;padding:18px 32px;">
          ${logo ? `<img src="${logo}" alt="${escapeHtml(input.company)}" height="32" style="display:block;height:32px;width:auto;max-width:180px;border:0;">` : `<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;color:#ffffff;">${escapeHtml(input.company.toUpperCase())}</p>`}
          <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#d6ebff;">${escapeHtml(who)}</p>
        </td></tr>
        <tr><td style="padding:28px 32px 8px;font-family:Arial,sans-serif;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#1d8ece;">${escapeHtml(input.eyebrow)}</p>
          <p style="margin:0 0 12px;font-size:16px;color:#262626;">${escapeHtml(input.greeting)}</p>
          <p style="margin:0;font-size:15px;line-height:1.5;color:#3d3d3d;">${escapeHtml(input.lead)}</p>
        </td></tr>
        ${card}
        ${next}
        ${portal}
        <tr><td style="padding:8px 32px 28px;font-family:Arial,sans-serif;font-size:12px;color:#8c8c8c;">${escapeHtml(input.company)} · Investor accounts</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
function safeImage(value) {
	if (!value || !/^data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+$/.test(value)) return "";
	return value;
}
function escapeHtml(value) {
	return value.replace(/[&<>"]/g, (char) => {
		if (char === "&") return "&amp;";
		if (char === "<") return "&lt;";
		if (char === ">") return "&gt;";
		return "&quot;";
	});
}
//#endregion
export { templateCatalog as n, renderStep as t };
