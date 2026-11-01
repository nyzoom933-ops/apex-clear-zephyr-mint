import { r as __exportAll } from "../_runtime.mjs";
import { i as formatOfferDate, n as amountRange, r as formatBonus } from "./promo-a-oE9-Iz.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { t as DEFAULT_COMPANY_NAME } from "./env.server-CXxi_iUv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/email-templates-C0jVmMQF.js
var email_templates_C0jVmMQF_exports = /* @__PURE__ */ __exportAll({
	a: () => leadLetter,
	i: () => email_templates_exports,
	n: () => defaultApplicationCopy,
	o: () => renderStep,
	r: () => defaultLeadCopy,
	s: () => templateCatalog,
	t: () => applicationLetter
});
var email_templates_exports = /* @__PURE__ */ __exportAll$1({
	SAMPLE_EMAIL: () => SAMPLE_EMAIL,
	applicationLetter: () => applicationLetter,
	defaultApplicationCopy: () => defaultApplicationCopy,
	defaultLeadCopy: () => defaultLeadCopy,
	inviteReminderLetter: () => inviteReminderLetter,
	leadLetter: () => leadLetter,
	renderStep: () => renderStep,
	templateCatalog: () => templateCatalog
});
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
		clientNext: "Wait for your advisor. If you asked not to be called, they will use email. Do not send funds until funding instructions are in the portal.",
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
	},
	lead_intro: {
		label: "Lead introduction",
		clientSubject: "Current CD rates for {{name}}",
		clientLead: "",
		clientNext: "",
		adminSubject: "Intro sent to {{name}}",
		adminLead: "An introduction with the current promo rates was sent to {{name}} ({{email}})."
	},
	lead_application: {
		label: "Lead application",
		clientSubject: "CD application form for {{name}}",
		clientLead: "",
		clientNext: "",
		adminSubject: "Application email sent to {{name}}",
		adminLead: "A custom-term application email was sent to {{name}} ({{email}})."
	},
	lead_promo: {
		label: "Lead promotional application",
		clientSubject: "Promotional CD application for {{name}}",
		clientLead: "",
		clientNext: "",
		adminSubject: "Promotional application email sent to {{name}}",
		adminLead: "A promotional application email was sent to {{name}} ({{email}})."
	},
	lead_invite_reminder: {
		label: "Application link reminder",
		clientSubject: "Your application link expires soon",
		clientLead: "",
		clientNext: "",
		adminSubject: "Application reminder for {{name}}",
		adminLead: "A reminder was sent to {{name}} ({{email}}) because the application link is about to expire."
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
	const next = audience === "client" && item.clientNext ? fill(item.clientNext, name, input.email, company) : "";
	const fullLetterStep = step === "lead_intro" || step === "lead_application" || step === "lead_promo" || step === "lead_invite_reminder";
	const isFullLetter = fullLetterStep && audience === "client";
	const portalUrl = audience === "client" ? fullLetterStep ? applicationUrl(input.portalUrl) : cleanPortalUrl(input.portalUrl) : "";
	const lines = isFullLetter || input.extraHtml ? [] : input.detail.split("\n").map((line) => line.trim()).filter(Boolean);
	if (audience === "client" && CERTIFICATE_STEPS.has(step)) {
		if (!lines.some((line) => line.startsWith("Promo APY"))) lines.push("Promo APY +1.125%");
		if (!lines.some((line) => line.startsWith("Final APY"))) lines.push("Final APY 5.525%");
	}
	const greeting = isFullLetter ? "" : audience === "client" ? `Hello ${name},` : "Operations desk,";
	const text = isFullLetter ? [input.detail.trim() || "The letter is in the HTML version.", portalUrl ? `Application\n${portalUrl}` : ""].filter(Boolean).join("\n\n") : [
		greeting,
		"",
		lead,
		...input.detail.trim() ? ["", input.detail.trim()] : [],
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
	const fullLetter = !isFullLetter ? "" : input.extraHtml || (step === "lead_intro" ? sampleLeadLetter(input.portalUrl, input.advisor) : step === "lead_promo" ? samplePromoLetter(input.portalUrl, input.advisor) : step === "lead_invite_reminder" ? sampleReminderLetter(input.portalUrl, input.advisor) : sampleApplicationLetter(input.portalUrl, input.advisor));
	return {
		step,
		audience,
		label: item.label,
		subject,
		text,
		html: fullLetter || layout({
			eyebrow: item.label,
			greeting,
			lead,
			lines,
			next,
			audience,
			company,
			logo: input.emailLogo,
			portalUrl,
			portalLabel: "Open the investor portal",
			extraHtml: fullLetterStep ? "" : input.extraHtml || ""
		})
	};
}
function templateCatalog(companyName = DEFAULT_COMPANY_NAME, emailLogo = null, portalUrl = "", advisor) {
	const sample = {
		...SAMPLE_EMAIL,
		companyName,
		emailLogo,
		portalUrl,
		advisor
	};
	return Object.keys(STEPS).flatMap((step) => [renderStep(step, "client", sample), renderStep(step, "admin", sample)]);
}
function applicationUrl(value) {
	const trimmed = value?.trim() ?? "";
	if (!/^https?:\/\//i.test(trimmed)) return "";
	return trimmed.replace(/\/$/, "") + "/application";
}
function contactLink(value, href) {
	const label = escapeHtml(value);
	if (!href) return `<strong style="color:#ffffff;">${label}</strong>`;
	return `<a href="${escapeHtml(href)}" style="color:#ffffff !important; text-decoration:underline; font-weight:700;"><span style="color:#ffffff !important;">${label}</span></a>`;
}
function phoneLink(phone) {
	const digits = phone.replace(/[^\d+]/g, "");
	return contactLink(phone, digits ? `tel:${digits}` : "");
}
function mailLink(email) {
	return contactLink(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : "");
}
function advisorSignature(advisor, company) {
	const name = advisor?.name?.trim() || company;
	const phone = advisor?.phone?.trim() || "";
	const email = advisor?.email?.trim() || "";
	const role = advisor?.role?.trim() || "";
	const mailbox = advisor?.mailbox?.trim() && advisor.mailbox.trim().toLowerCase() !== email.toLowerCase() ? advisor.mailbox.trim() : "";
	return {
		html: `Best regards,<br><strong>${escapeHtml(name)}</strong>${phone ? `<br>${escapeHtml(phone)}` : ""}${email ? `<br>${escapeHtml(email)}` : ""}${mailbox ? `<br>${escapeHtml(mailbox)}` : ""}${role ? `<br>${escapeHtml(role)}` : ""}`,
		text: [
			"Best regards",
			name,
			phone,
			email,
			mailbox,
			role
		].filter(Boolean).join("\n")
	};
}
function defaultLeadCopy(input) {
	const company = input.company.trim() || "Account Holding";
	const name = input.leadName.trim() || "Client";
	const advisor = input.advisorName?.trim();
	return {
		subject: `Current CD rates for ${name}`,
		headline: `Lock in a fixed rate with a ${company} certificate of deposit.`,
		welcome: `We are delighted to welcome you to ${company}. This new-client-only special promo is built to help you save with a fixed return over a term you choose. ${advisor ? `${advisor} can walk through the options with you.` : "Your advisor can walk through the options with you."}`,
		certificate: "Choose a term that fits your plans and earn a fixed rate for that term. A penalty may apply if you withdraw before maturity.",
		offer: input.offerIntro?.trim() || "A tiered introductory bonus for new clients. The bonus applies for the full duration of the CD and increases with the amount you place.",
		protection: input.protection?.trim() || "Deposits are FDIC insured. Capital protection covers the first $250,000 per individual or $500,000 per joint account.",
		ready: "Opening a promotional CD starts with your advisor. Confirm that the new-money and new-client rules apply to you.",
		thanks: `Thank you for considering ${company}. We look forward to helping you with your savings plans.`
	};
}
function leadLetter(input) {
	const company = input.company.trim() || "Account Holding";
	const name = input.leadName.trim() || "Client";
	const advisor = input.advisor;
	const protection = input.offer.protection.trim() || input.protection?.trim() || "Deposits are FDIC insured. Capital protection covers the first $250,000 per individual or $500,000 per joint account.";
	const minimum = input.minimum?.trim() || "$100,000";
	const fine = input.offer.finePrint.trim();
	const window = input.offer.startsOn && input.offer.endsOn ? `Offer available from ${formatOfferDate(input.offer.startsOn)} – ${formatOfferDate(input.offer.endsOn)}` : "";
	const fallback = defaultLeadCopy({
		leadName: name,
		company,
		advisorName: advisor?.name,
		offerIntro: input.offer.intro,
		protection
	});
	const copy = input.copy;
	const headline = copy?.headline.trim() || fallback.headline;
	const welcome = copy?.welcome.trim() || fallback.welcome;
	const certificate = copy?.certificate.trim() || fallback.certificate;
	const offerText = copy?.offer.trim() || fallback.offer;
	const protectionText = copy?.protection.trim() || fallback.protection;
	const ready = copy?.ready.trim() || fallback.ready;
	const thanks = copy?.thanks.trim() || fallback.thanks;
	const cards = [...new Set(input.offer.tiers.flatMap((tier) => tier.months))].sort((a, b) => a - b).map((month) => {
		return {
			month,
			apy: (input.terms.find((item) => item.months === month)?.apy || "—").replace(/\s*APY/i, "")
		};
	});
	const logo = emailLogoSrc(input.logo, input.portalUrl);
	const mark = logo ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">` : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
	const termList = cards.map((card) => `${card.month}-month`).join(cards.length === 2 ? " and " : ", ") || "the terms below";
	const cardRows = [];
	for (let index = 0; index < Math.max(cards.length, 0); index += 2) {
		const pair = cards.slice(index, index + 2);
		const cells = pair.map((card, cell) => {
			const side = pair.length === 1 ? "" : cell === 0 ? "padding-right:6px;" : "padding-left:6px;";
			return `<td class="stack" width="${pair.length === 1 ? "100%" : "50%"}" valign="top" style="${side}">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d6e4ef;">
            <tr><td style="background:#006fcf; padding:10px; text-align:center; color:#ffffff; font-weight:700; letter-spacing:0.6px;">${card.month}-MONTH CD</td></tr>
            <tr><td style="padding:18px; text-align:center; background:#f7fbfe;"><span style="font-size:36px; font-weight:700; color:#12315c;">${escapeHtml(card.apy)}</span><br><span style="color:#006fcf; font-weight:700; letter-spacing:1px;">APY</span></td></tr>
          </table>
        </td>`;
		}).join("");
		cardRows.push(`<tr>${cells}</tr>`);
	}
	const bonuses = input.offer.tiers.map((tier, index) => {
		const last = index === input.offer.tiers.length - 1;
		const background = last ? "#e7f3fb" : index % 2 ? "#f7fbfe" : "#ffffff";
		const rule = last ? "" : "border-bottom:1px solid #e7eef4;";
		return `<tr>
        <td style="padding:11px 14px; background:${background}; ${rule} ${last ? "font-weight:700; color:#12315c;" : ""}">${escapeHtml(amountRange(tier))}</td>
        <td align="right" style="padding:11px 14px; background:${background}; ${rule} font-weight:700; color:${last ? "#006fcf" : "#12315c"};">${escapeHtml(formatBonus(tier.bonusPercent))}</td>
      </tr>`;
	}).join("");
	const sign = advisorSignature(advisor, company);
	const help = advisor?.phone ? `please call:<br>${phoneLink(advisor.phone)}` : advisor?.email ? `please write to:<br>${mailLink(advisor.email)}` : "please reply to this email.";
	const preheader = cards.slice(0, 2).map((card) => `${card.month}-month CD ${card.apy} APY`).join(" and ") || "Current certificate rates";
	return {
		text: [
			`Dear ${name},`,
			welcome,
			cards.map((card) => `${card.month}-month CD ${card.apy} APY`).join("\n"),
			`Early withdrawal penalties may apply. Minimum balance to open: ${minimum} new money required.`,
			offerText,
			input.offer.tiers.map((tier) => `${amountRange(tier)} ${formatBonus(tier.bonusPercent)}`).join("\n"),
			window,
			protectionText,
			ready,
			thanks,
			sign.text
		].filter(Boolean).join("\n\n"),
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>Current CD rates</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    body { margin:0 !important; padding:0 !important; width:100% !important; }
    .help-bar, .help-bar a, .help-bar span { color:#ffffff !important; }
    @media screen and (max-width:600px) {
      .email-container { width:100% !important; }
      .stack { display:block !important; width:100% !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">New client only special promo. ${escapeHtml(preheader)}.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" class="email-container" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
          <tr>
            <td style="background:#006fcf; padding:16px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>${mark}</td>
                  <td align="right" style="font-family:Arial, Helvetica, sans-serif; font-size:11px; letter-spacing:1px; color:#d6ecfa; text-transform:uppercase;">New client only<br>special promo</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:28px 36px 8px 36px;">
              <p style="margin:0 0 4px 0; font-family:Arial, Helvetica, sans-serif; font-size:13px; letter-spacing:1.2px; text-transform:uppercase; color:#006fcf; font-weight:700;">Online CD (Certificate of Deposit)</p>
              <h1 style="margin:0 0 8px 0; font-family:Arial, Helvetica, sans-serif; font-size:26px; line-height:32px; color:#12315c;">${escapeHtml(headline)}</h1>
              <p style="margin:16px 0 0 0; font-size:15px; line-height:23px;">Dear ${escapeHtml(name)},</p>
              <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${escapeHtml(welcome)}</p>
              <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;"><strong>Certificates of Deposit (CDs):</strong> ${escapeHtml(certificate)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 36px 6px 36px;">
              <p style="margin:0 0 12px 0; font-size:18px; font-weight:700; color:#12315c;">Special limited-time CDs</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${cardRows.join("") || `<tr><td style="padding:12px; border:1px solid #d6e4ef;">Promotional rates are not published yet.</td></tr>`}</table>
              <p style="margin:12px 0 0 0; font-size:13px; color:#5a6a7a; text-align:center;">Early withdrawal penalties may apply. Minimum balance to open: ${escapeHtml(minimum)} new money required.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 36px 8px 36px;">
              <p style="margin:0 0 6px 0; font-size:16px; font-weight:700; color:#12315c;">Promotional new-client offer</p>
              <p style="margin:0 0 12px 0; font-size:14px; line-height:21px;">${escapeHtml(offerText)}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d6e4ef;">
                <tr>
                  <td style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:12px; font-weight:700; letter-spacing:0.5px;">BALANCE</td>
                  <td align="right" style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:12px; font-weight:700; letter-spacing:0.5px;">BONUS</td>
                </tr>
                ${bonuses || `<tr><td colspan="2" style="padding:11px 14px;">No bonus tiers are set.</td></tr>`}
              </table>
              ${window ? `<p style="margin:10px 0 0 0; text-align:center; font-size:13px; font-style:italic; color:#333;">${escapeHtml(window)}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px 4px 36px;">
              <p style="margin:0 0 6px 0; font-size:16px; font-weight:700; color:#12315c;">FDIC coverage</p>
              <p style="margin:0; font-size:14px; line-height:21px;">${escapeHtml(protectionText)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px 8px 36px;">
              <p style="margin:0 0 6px 0; font-size:16px; font-weight:700; color:#12315c;">Ready to get started?</p>
              <p style="margin:0; font-size:14px; line-height:21px;">${escapeHtml(ready)}</p>
              <p style="margin:14px 0 0 0; font-size:14px; line-height:21px;">${escapeHtml(thanks)}</p>
              <p style="margin:16px 0 0 0; font-size:14px; line-height:21px;">${sign.html}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 20px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td class="stack" width="33%" valign="top" style="padding:8px; background:#f7fbfe;">
                    <p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#006fcf;">Security you can trust</p>
                    <p style="margin:0; font-size:12px; line-height:18px; color:#333;">Deposits are protected with FDIC coverage on the terms in this letter.</p>
                  </td>
                  <td class="stack" width="33%" valign="top" style="padding:8px;">
                    <p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#006fcf;">Competitive CD rates</p>
                    <p style="margin:0; font-size:12px; line-height:18px; color:#333;">Choose the term that fits your goals and earn a rate that works for you.</p>
                  </td>
                  <td class="stack" width="33%" valign="top" style="padding:8px; background:#f7fbfe;">
                    <p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#006fcf;">Terms that fit your plans</p>
                    <p style="margin:0; font-size:12px; line-height:18px; color:#333;">${escapeHtml(termList)} options to save on your schedule.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
              <p style="margin:0 0 4px 0; font-size:14px; font-weight:700;">We’re here to help.</p>
              <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px 22px 36px; background:#f7fbfe;">
              <p style="margin:0; font-size:11px; line-height:16px; color:#5a6a7a;">${escapeHtml(fine || `This message was sent regarding a new-account promotion for a certificate of deposit. Promotional bonuses require ${minimum} in new money${window ? ` and are available ${window.replace("Offer available from ", "")}` : ""}. A penalty may be imposed for early withdrawal. Offer subject to account requirements and availability.`)}</p>
              <p style="margin:8px 0 0 0; font-size:11px; line-height:16px; color:#8a9aaa;">${escapeHtml(company)}. © ${(/* @__PURE__ */ new Date()).getFullYear()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
	};
}
function defaultApplicationCopy(input) {
	const months = input.months || 0;
	const term = months ? `${months}-month` : "CD";
	const promo = input.variant === "promo";
	return {
		subject: promo ? `Promotional CD application — ${term}` : `CD application form — ${term}`,
		headline: promo ? `Your promotional ${term} CD application is ready.` : months ? `Your ${term} CD application is ready.` : "Your CD application is ready.",
		hope: "I hope you're doing well.",
		ready: promo ? "Your promotional certificate application is ready. This personal link expires 24 hours after this email is sent." : "Your certificate application is ready. This personal link expires 24 hours after this email is sent.",
		instruction: "Use the button below before the link expires.",
		codeNote: "Enter this code on the application to apply the promotional rate.",
		followUp: "Please finish within 24 hours. If the link expires, ask your advisor for a new one.",
		thanks: "Thank you for your prompt attention. We look forward to receiving your application.",
		promoCode: ""
	};
}
function applicationLetter(input) {
	const company = input.company.trim() || "Account Holding";
	const name = input.leadName.trim() || "Client";
	const months = Number(input.months) || 0;
	const apy = (input.apy || "—").replace(/\s*APY/i, "");
	const advisor = input.advisor;
	const fallback = defaultApplicationCopy({
		leadName: name,
		company,
		months,
		advisorName: advisor?.name,
		variant: input.variant
	});
	const copy = input.copy;
	const headline = copy?.headline.trim() || fallback.headline;
	const hope = copy?.hope.trim() || fallback.hope;
	const ready = copy?.ready.trim() || fallback.ready;
	const instruction = copy?.instruction.trim() || fallback.instruction;
	const codeNote = copy?.codeNote.trim() || fallback.codeNote;
	const followUp = copy?.followUp.trim() || fallback.followUp;
	const thanks = copy?.thanks.trim() || fallback.thanks;
	const promoCode = (copy?.promoCode ?? fallback.promoCode).trim();
	const minimum = input.minimum?.trim() || "$100,000";
	const window = input.offer.startsOn && input.offer.endsOn ? `${formatOfferDate(input.offer.startsOn)}–${formatOfferDate(input.offer.endsOn)}` : "";
	const rows = (input.variant === "promo" ? input.offer.tiers.filter((tier) => !months || tier.months.includes(months)) : []).map((tier, index, list) => {
		const last = index === list.length - 1;
		const background = last ? "#e7f3fb" : index % 2 ? "#f7fbfe" : "#ffffff";
		const rule = last ? "" : "border-bottom:1px solid #e7eef4;";
		return `<tr>
        <td style="padding:11px 14px; background:${background}; ${rule} ${last ? "font-weight:700; color:#12315c;" : ""}">${escapeHtml(amountRange(tier))}</td>
        <td align="right" style="padding:11px 14px; background:${background}; ${rule} font-weight:700; color:${last ? "#006fcf" : "#12315c"};">${escapeHtml(formatBonus(tier.bonusPercent))}</td>
      </tr>`;
	}).join("");
	const link = input.link?.trim() || applicationLink(input.portalUrl, months, promoCode);
	const logo = emailLogoSrc(input.logo, input.portalUrl);
	const mark = logo ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">` : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
	const sign = advisorSignature(advisor, company);
	const help = advisor?.phone ? `please call:<br>${phoneLink(advisor.phone)}` : advisor?.email ? `please write to:<br>${mailLink(advisor.email)}` : "please reply to this email.";
	const buttonLabel = months ? `${months}-Month CD Application` : "CD Application";
	const button = `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="background:#006fcf; border-radius:2px;"><a href="${escapeHtml(link || "#")}" style="display:inline-block; padding:14px 28px; font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none;">${escapeHtml(buttonLabel)}</a></td></tr></table>`;
	const codeBox = promoCode ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e7f3fb; border-left:4px solid #006fcf;"><tr><td style="padding:16px 18px;">
        <p style="margin:0 0 4px 0; font-size:12px; font-weight:700; letter-spacing:0.8px; color:#006fcf;">YOUR PROMOTIONAL CODE</p>
        <p style="margin:0; font-size:22px; font-weight:700; letter-spacing:1px; color:#12315c;">${escapeHtml(promoCode)}</p>
        <p style="margin:8px 0 0 0; font-size:14px; line-height:21px; color:#333333;">${escapeHtml(codeNote)}</p>
      </td></tr></table>` : "";
	const badge = input.variant === "promo" ? "Promotional offer<br>24-hour link" : "Certificate<br>application";
	const bonusBlock = rows ? `<p style="margin:16px 0 8px 0; font-size:13px; font-weight:700; color:#12315c;">Relationship bonus for the full term</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d6e4ef;">
            <tr>
              <td style="background:#12315c; color:#fff; padding:10px 14px; font-size:12px; font-weight:700; letter-spacing:0.5px;">BALANCE</td>
              <td align="right" style="background:#12315c; color:#fff; padding:10px 14px; font-size:12px; font-weight:700; letter-spacing:0.5px;">BONUS</td>
            </tr>
            ${rows}
          </table>` : "";
	const fine = input.variant === "promo" ? `This personal application link expires 24 hours after it is sent. The promotional APY is for new clients, requires ${minimum} in new money${window ? `, and is available ${window}` : ""}. A penalty may be imposed for early withdrawal.` : `This personal application link expires 24 hours after it is sent. Minimum to open: ${minimum}. A penalty may be imposed for early withdrawal.`;
	return {
		text: [
			`Dear ${name},`,
			hope,
			ready,
			instruction,
			promoCode ? `Promotional code: ${promoCode}` : "",
			`${months}-month CD ${apy} APY`,
			followUp,
			thanks,
			link ? `${buttonLabel}: ${link}` : "",
			sign.text
		].filter(Boolean).join("\n\n"),
		html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>CD Application Form</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    body { margin:0 !important; padding:0 !important; width:100% !important; }
    .help-bar, .help-bar a, .help-bar span { color:#ffffff !important; }
    @media screen and (max-width:600px) {
      .email-container { width:100% !important; }
      .stack { display:block !important; width:100% !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">Your ${escapeHtml(months ? `${months}-month` : "")} CD application form is ready.${promoCode ? ` Promo code ${escapeHtml(promoCode)}.` : ""}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" class="email-container" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
        <tr><td style="background:#006fcf; padding:16px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
            <td>${mark}</td>
            <td align="right" style="font-family:Arial, Helvetica, sans-serif; font-size:11px; letter-spacing:1px; color:#d6ecfa; text-transform:uppercase;">${badge}</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 36px 8px 36px;">
          <p style="margin:0 0 4px 0; font-size:13px; letter-spacing:1.2px; text-transform:uppercase; color:#006fcf; font-weight:700;">Certificate of Deposit</p>
          <h1 style="margin:0 0 8px 0; font-family:Arial, Helvetica, sans-serif; font-size:26px; line-height:32px; color:#12315c;">${escapeHtml(headline)}</h1>
          <p style="margin:16px 0 0 0; font-size:15px; line-height:23px;">Dear ${escapeHtml(name)},</p>
          <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${escapeHtml(hope)}</p>
          <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${escapeHtml(ready)}</p>
          <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${escapeHtml(instruction)}</p>
        </td></tr>
        <tr><td style="padding:8px 36px 6px 36px;" align="center">${button}</td></tr>
        <tr><td style="padding:18px 36px 8px 36px;">
          ${codeBox}
          <p style="margin:16px 0 0 0; font-size:14px; line-height:21px;">${escapeHtml(followUp)}</p>
          <p style="margin:14px 0 0 0; font-size:14px; line-height:21px;">${escapeHtml(thanks)}</p>
          <p style="margin:16px 0 0 0; font-size:14px; line-height:21px;">${sign.html}</p>
        </td></tr>
        <tr><td style="padding:10px 36px 6px 36px;">
          <p style="margin:0 0 8px 0; font-size:13px; font-weight:700; color:#12315c;">New-client rate on this application</p>
          <table role="presentation" width="280" cellspacing="0" cellpadding="0" border="0"><tr><td style="border:1px solid #d6e4ef;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr><td style="background:#006fcf; padding:8px; text-align:center; color:#fff; font-size:12px; font-weight:700;">${months || "—"}-MONTH CD</td></tr>
              <tr><td style="padding:14px; text-align:center; background:#f7fbfe; font-size:28px; font-weight:700; color:#12315c;">${escapeHtml(apy)} <span style="font-size:12px; color:#006fcf;">APY</span></td></tr>
            </table>
          </td></tr></table>
          ${bonusBlock}
        </td></tr>
        <tr><td style="padding:12px 28px 20px 28px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
            <td class="stack" width="33%" valign="top" style="padding:8px; background:#f7fbfe;"><p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#006fcf;">Security you can trust</p><p style="margin:0; font-size:12px; line-height:18px; color:#333;">Deposits are protected with FDIC coverage on the terms in this letter.</p></td>
            <td class="stack" width="33%" valign="top" style="padding:8px;"><p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#006fcf;">Competitive CD rates</p><p style="margin:0; font-size:12px; line-height:18px; color:#333;">Choose the term that fits your goals and earn a rate that works for you.</p></td>
            <td class="stack" width="33%" valign="top" style="padding:8px; background:#f7fbfe;"><p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#006fcf;">Terms that fit your plans</p><p style="margin:0; font-size:12px; line-height:18px; color:#333;">${escapeHtml(months ? `A ${months}-month term to save on your schedule.` : "A term that fits your schedule.")}</p></td>
          </tr></table>
        </td></tr>
        <tr><td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
          <p style="margin:0 0 4px 0; font-size:14px; font-weight:700;">We’re here to help.</p>
          <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
        </td></tr>
        <tr><td style="padding:16px 36px 22px 36px; background:#f7fbfe;">
          <p style="margin:0; font-size:11px; line-height:16px; color:#5a6a7a;">${escapeHtml(fine)}</p>
          <p style="margin:8px 0 0 0; font-size:11px; line-height:16px; color:#8a9aaa;">${escapeHtml(company)}. © ${(/* @__PURE__ */ new Date()).getFullYear()}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
		subject: copy?.subject.trim() || fallback.subject
	};
}
function applicationLink(origin, months, code) {
	const base = applicationUrl(origin);
	if (!base) return "";
	const params = new URLSearchParams();
	if (months) params.set("term", String(months));
	if (code) params.set("code", code);
	const query = params.toString();
	return query ? `${base}?${query}` : base;
}
function sampleApplicationLetter(portalUrl, advisor) {
	return applicationLetter({
		leadName: "Jonah Hale",
		company: DEFAULT_COMPANY_NAME,
		months: 12,
		apy: "3.65%",
		portalUrl,
		link: applicationLink(portalUrl, 12, "") || "#",
		variant: "custom",
		advisor: advisor ?? {
			name: "Alex Morgan",
			phone: "(202) 555-0148",
			email: "alex@example.com"
		},
		offer: {
			intro: "",
			protection: "",
			finePrint: "",
			startsOn: "2026-10-01",
			endsOn: "2026-10-31",
			tiers: [{
				id: "a",
				minAmount: 1e5,
				maxAmount: 174999,
				bonusPercent: .75,
				months: [10]
			}, {
				id: "b",
				minAmount: 5e5,
				maxAmount: null,
				bonusPercent: 1.25,
				months: [10]
			}]
		},
		minimum: "$100,000"
	}).html;
}
function samplePromoLetter(portalUrl, advisor) {
	return applicationLetter({
		leadName: "Jonah Hale",
		company: DEFAULT_COMPANY_NAME,
		months: 10,
		apy: "4.40%",
		variant: "promo",
		portalUrl,
		link: applicationLink(portalUrl, 10, "CD48K2MP") || "#",
		copy: {
			...defaultApplicationCopy({
				leadName: "Jonah Hale",
				company: DEFAULT_COMPANY_NAME,
				months: 10,
				variant: "promo"
			}),
			promoCode: "CD48K2MP"
		},
		offer: {
			intro: "",
			protection: "",
			finePrint: "",
			startsOn: "2026-10-01",
			endsOn: "2026-10-31",
			tiers: [{
				id: "a",
				minAmount: 1e5,
				maxAmount: 174999,
				bonusPercent: .75,
				months: [10]
			}, {
				id: "b",
				minAmount: 5e5,
				maxAmount: null,
				bonusPercent: 1.25,
				months: [10]
			}]
		},
		advisor: advisor ?? {
			name: "Alex Morgan",
			phone: "(202) 555-0148",
			email: "alex@example.com"
		},
		minimum: "$100,000"
	}).html;
}
function sampleReminderLetter(portalUrl, advisor) {
	const link = applicationLink(portalUrl, 10, "CD48K2MP") || "https://example.com/application?invite=preview";
	return inviteReminderLetter({
		leadName: "Jonah Hale",
		company: DEFAULT_COMPANY_NAME,
		months: 10,
		apy: "4.40%",
		promoCode: "CD48K2MP",
		link,
		advisorName: advisor?.name || "Alex Morgan",
		advisor
	}).html;
}
function inviteReminderLetter(input) {
	const company = input.company.trim() || "Account Holding";
	const name = input.leadName.trim() || "Client";
	const apy = (input.apy || "—").replace(/\s*APY/i, "");
	const logo = emailLogoSrc(input.logo, input.link);
	const mark = logo ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">` : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
	const button = `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="background:#006fcf;"><a href="${escapeHtml(input.link || "#")}" style="display:inline-block; padding:14px 28px; font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none;">Open the application</a></td></tr></table>`;
	const code = input.promoCode.trim() ? `<p style="margin:16px 0 0 0; font-size:14px; line-height:21px;">Your promotional code is <strong>${escapeHtml(input.promoCode.trim())}</strong>.</p>` : "";
	const sign = advisorSignature(input.advisor ?? (input.advisorName ? {
		name: input.advisorName,
		phone: "",
		email: ""
	} : void 0), company);
	const subject = "Your application link expires soon";
	return {
		subject,
		text: [
			`Dear ${name},`,
			`Your ${input.months}-month certificate application link expires in about 2 hours.`,
			input.promoCode ? `Promotional code: ${input.promoCode}` : "",
			input.link ? `Open the application\n${input.link}` : ""
		].filter(Boolean).join("\n\n"),
		html: `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;"><tr><td align="center" style="padding:20px 10px;">
    <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
      <tr><td style="background:#006fcf; padding:16px 32px;">${mark}</td></tr>
      <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 36px 24px 36px;">
        <p style="margin:0 0 4px 0; font-size:13px; letter-spacing:1.2px; text-transform:uppercase; color:#006fcf; font-weight:700;">Application link</p>
        <h1 style="margin:0 0 8px 0; font-size:26px; line-height:32px; color:#12315c;">Your link expires in about 2 hours.</h1>
        <p style="margin:16px 0 0 0; font-size:15px; line-height:23px;">Dear ${escapeHtml(name)},</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">The 24-hour link for your ${input.months}-month certificate${apy && apy !== "—" ? ` at ${escapeHtml(apy)} APY` : ""} is still open, and it expires soon. Use the button below to finish the application.</p>
        ${code}
        <p style="margin:18px 0 0 0;">${button}</p>
        <p style="margin:18px 0 0 0; font-size:14px; line-height:21px;">If the link expires, ask ${escapeHtml(input.advisor?.name || input.advisorName || "your advisor")} for a new one.</p>
        <p style="margin:16px 0 0 0; font-size:14px; line-height:21px;">${sign.html}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`
	};
}
function sampleLeadLetter(portalUrl, advisor) {
	return leadLetter({
		leadName: "Jonah Hale",
		company: DEFAULT_COMPANY_NAME,
		portalUrl,
		terms: [{
			months: 10,
			apy: "4.40%"
		}, {
			months: 22,
			apy: "4.40%"
		}],
		offer: {
			intro: "Our promotional new-client offer adds a bonus for the whole term of the certificate. The bonus rises with the amount you place.",
			protection: "FDIC insured. Capital protection covers the first $250,000 per individual or $500,000 per joint account.",
			finePrint: "Early withdrawal penalties may apply. Minimum balance to open: $100,000 of new money.",
			startsOn: "2026-10-01",
			endsOn: "2026-10-31",
			tiers: [
				{
					id: "a",
					minAmount: 1e5,
					maxAmount: 174999,
					bonusPercent: .75,
					months: [10, 22]
				},
				{
					id: "b",
					minAmount: 175e3,
					maxAmount: 249999,
					bonusPercent: .99,
					months: [10, 22]
				},
				{
					id: "c",
					minAmount: 25e4,
					maxAmount: 499999,
					bonusPercent: 1.125,
					months: [10, 22]
				},
				{
					id: "d",
					minAmount: 5e5,
					maxAmount: null,
					bonusPercent: 1.25,
					months: [10, 22]
				}
			]
		},
		advisor: advisor ?? {
			name: "Alex Morgan",
			phone: "(202) 555-0148",
			email: "alex@example.com"
		},
		minimum: "$100,000"
	}).html;
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
	const extra = input.extraHtml ? `<tr><td style="padding:16px 32px 8px;font-family:Arial,sans-serif;">${input.extraHtml}</td></tr>` : "";
	const portal = input.portalUrl ? `<tr><td style="padding:16px 32px 8px;font-family:Arial,sans-serif;"><a href="${escapeHtml(input.portalUrl)}" style="display:inline-block;background:#006fcf;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 18px;border-radius:6px;">${escapeHtml(input.portalLabel || "Open the investor portal")}</a></td></tr>` : "";
	const who = input.audience === "client" ? "Investor note" : "Desk note";
	const logo = emailLogoSrc(input.logo, input.portalUrl);
	const mark = logo ? `<img src="${logo}" alt="${escapeHtml(input.company)}" height="32" style="display:block;height:32px;width:auto;max-width:180px;border:0;">` : `<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;color:#ffffff;">${escapeHtml(input.company.toUpperCase())}</p>`;
	const opening = input.eyebrow || input.greeting || input.lead ? `<tr><td style="padding:28px 32px 8px;font-family:Arial,sans-serif;">
          ${input.eyebrow ? `<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#1d8ece;">${escapeHtml(input.eyebrow)}</p>` : ""}
          ${input.greeting ? `<p style="margin:0 0 12px;font-size:16px;color:#262626;">${escapeHtml(input.greeting)}</p>` : ""}
          ${input.lead ? `<p style="margin:0;font-size:15px;line-height:1.5;color:#3d3d3d;">${escapeHtml(input.lead)}</p>` : ""}
        </td></tr>` : "";
	return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#fbfbfb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbfbfb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#006fcf;padding:18px 32px;">
          ${mark}
          <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#d6ebff;">${escapeHtml(who)}</p>
        </td></tr>
        ${opening}
        ${card}
        ${extra}
        ${next}
        ${portal}
        <tr><td style="padding:8px 32px 28px;font-family:Arial,sans-serif;font-size:12px;color:#8c8c8c;">${escapeHtml(input.company)} · Investor accounts</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
function emailLogoSrc(logo, pageUrl) {
	const stored = logo?.trim() || "";
	const origin = publicOrigin(pageUrl);
	if (stored.startsWith("data:image/") && origin) return `${origin}/email-logo?v=${logoVersion(stored)}`;
	return safeImage(stored);
}
function publicOrigin(value) {
	const trimmed = value?.trim() ?? "";
	if (!/^https?:\/\//i.test(trimmed)) return "";
	try {
		return new URL(trimmed).origin;
	} catch {
		return "";
	}
}
function logoVersion(value) {
	let hash = 0;
	const sample = `${value.length}:${value.slice(0, 240)}`;
	for (let index = 0; index < sample.length; index += 1) hash = hash * 33 + sample.charCodeAt(index) >>> 0;
	return hash.toString(36);
}
function safeImage(value) {
	if (!value || !/^data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=\s]+$/.test(value)) return "";
	return value.replace(/\s/g, "");
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
export { leadLetter as a, email_templates_C0jVmMQF_exports as i, defaultApplicationCopy as n, renderStep as o, defaultLeadCopy as r, templateCatalog as s, applicationLetter as t };
