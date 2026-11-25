import { DEFAULT_COMPANY_NAME } from "@/lib/company";
import { amountRange, formatBonus, formatOfferDate, parseApy, type PromoOffer } from "@/lib/promo";
import { sampleWealthIntroLetter } from "@/lib/wealth-letter";

export type MailStep =
  | "application_submitted"
  | "application_approved"
  | "portal_login"
  | "application_hold"
  | "application_pending"
  | "investment_submitted"
  | "terms_accepted"
  | "approved_phone"
  | "instructions_sent"
  | "payment_uploaded"
  | "payment_rejected"
  | "payment_approved"
  | "investment_cancelled"
  | "lead_intro"
  | "lead_application"
  | "lead_promo"
  | "lead_invite_reminder"
  | "lead_extension"
  | "lead_htr"
  | "lead_htr_call"
  | "lead_followup"
  | "lead_promo_reminder"
  | "lead_exclusive"
  | "lead_exclusive_fdic"
  | "lead_cdars"
  | "lead_cdars_intro"
  | "lead_wealth"
  | "lead_account_ready"
  | "invoice_advisor"
  | "inbox_note";

export function mailStepLabel(step: string) {
  return STEPS[step as MailStep]?.label || step;
}

export const ADVISOR_MAIL_STEPS = new Set<MailStep>(["lead_intro", "lead_application", "lead_promo", "lead_invite_reminder", "lead_extension", "lead_htr", "lead_htr_call", "lead_followup", "lead_promo_reminder", "lead_exclusive", "lead_exclusive_fdic", "lead_cdars", "lead_cdars_intro", "lead_wealth", "lead_account_ready", "invoice_advisor", "inbox_note"]);

export type MailAudience = "client" | "admin";

export type RenderedEmail = {
  step: MailStep;
  audience: MailAudience;
  label: string;
  subject: string;
  text: string;
  html: string;
};

type StepCopy = {
  label: string;
  clientSubject: string;
  clientLead: string;
  clientNext: string;
  adminSubject: string;
  adminLead: string;
};

const STEPS: Record<MailStep, StepCopy> = {
  application_submitted: {
    label: "Application received",
    clientSubject: "We received your application",
    clientLead: "We received your {{company}} application.",
    clientNext: "We will review it and email you when there is an update.",
    adminSubject: "New application from {{name}}",
    adminLead: "{{name}} ({{email}}) submitted an application.",
  },
  application_approved: {
    label: "Application approved",
    clientSubject: "Your investor portal is open",
    clientLead: "Your application is approved. The investor portal is open for this email address.",
    clientNext: "Sign in with this email and the password from your application. Open Funding to choose a certificate.",
    adminSubject: "Application approved for {{name}}",
    adminLead: "{{name}} ({{email}}) was approved. Their investor sign-in is active.",
  },
  portal_login: {
    label: "Portal sign-in",
    clientSubject: "Your investor portal sign-in",
    clientLead: "A sign-in for the investor portal is ready. Use the email and temporary password below.",
    clientNext: "After you sign in, open Manage and choose Change password. Enter the temporary password, then a new password of at least 8 characters, and save it.",
    adminSubject: "Portal sign-in sent to {{name}}",
    adminLead: "A portal sign-in was emailed to {{name}} ({{email}}). The temporary password is not included here.",
  },
  application_hold: {
    label: "Application on hold",
    clientSubject: "Your application is on hold",
    clientLead: "Your application is on hold while the desk reviews it. The investor portal stays closed.",
    clientNext: "No funding can start yet. Watch for another email when the application moves back to review or is approved.",
    adminSubject: "Application on hold for {{name}}",
    adminLead: "{{name}} ({{email}}) was placed on hold.",
  },
  application_pending: {
    label: "Application in review",
    clientSubject: "Your application is in review",
    clientLead: "Your application is in review again. The investor portal stays closed until it is approved.",
    clientNext: "Nothing else is required unless the desk asks for another document.",
    adminSubject: "Application returned to review for {{name}}",
    adminLead: "{{name}} ({{email}}) was returned to pending review.",
  },
  investment_submitted: {
    label: "Certificate requested",
    clientSubject: "We received your certificate request",
    clientLead: "Your certificate request is recorded. It is not funded until you accept the terms and the advisor confirms payment.",
    clientNext: "Sign in, open the certificate, and accept the terms. Do not send a wire yet.",
    adminSubject: "New certificate request from {{name}}",
    adminLead: "{{name}} ({{email}}) requested a certificate.",
  },
  terms_accepted: {
    label: "Terms accepted",
    clientSubject: "Your certificate terms are accepted",
    clientLead: "Your application signature is now on this certificate. The request is waiting for an advisor call.",
    clientNext: "Wait for your advisor. If you asked not to be called, they will use email. Do not send funds until funding instructions are in the portal.",
    adminSubject: "{{name}} accepted certificate terms",
    adminLead: "{{name}} ({{email}}) accepted the investment terms.",
  },
  approved_phone: {
    label: "Approved by phone",
    clientSubject: "Your certificate was approved by phone",
    clientLead: "Your advisor approved this certificate by phone. It is still not active.",
    clientNext: "Wait for the invoice in your portal. Send the wire only after that invoice is there.",
    adminSubject: "Certificate approved by phone for {{name}}",
    adminLead: "{{name}} ({{email}}) was marked approved by phone.",
  },
  instructions_sent: {
    label: "Invoice generated",
    clientSubject: "Your payment invoice is ready",
    clientLead: "Your payment invoice is ready in the portal. The certificate stays pending until the wire is confirmed.",
    clientNext: "Send the wire using the invoice in the portal, then upload the bank confirmation on this certificate.",
    adminSubject: "Invoice generated for {{name}}",
    adminLead: "An invoice was generated for {{name}} ({{email}}).",
  },
  payment_uploaded: {
    label: "Wire confirmation",
    clientSubject: "We received your wire confirmation",
    clientLead: "Your wire confirmation is with your advisor. The certificate is not active yet.",
    clientNext: "Nothing else is required. The certificate moves to Active CDs after the advisor approves the payment.",
    adminSubject: "Wire confirmation from {{name}}",
    adminLead: "{{name}} ({{email}}) uploaded a wire confirmation.",
  },
  payment_rejected: {
    label: "Wire confirmation rejected",
    clientSubject: "Please upload the wire confirmation again",
    clientLead: "The wire confirmation was not accepted.",
    clientNext: "Upload a new confirmation from the investment. The certificate stays inactive until your advisor approves the payment.",
    adminSubject: "Wire confirmation rejected for {{name}}",
    adminLead: "The wire confirmation for {{name}} ({{email}}) was rejected.",
  },
  payment_approved: {
    label: "Payment receipt",
    clientSubject: "Your payment receipt",
    clientLead: "Your advisor approved the payment. This certificate is active. The payment receipt is attached.",
    clientNext: "Open Active CDs in the portal to see the term, APY, and maturity date. Keep the receipt with your records.",
    adminSubject: "Payment receipt for {{name}}",
    adminLead: "Payment was approved for {{name}} ({{email}}). The certificate is active and the receipt is attached.",
  },
  investment_cancelled: {
    label: "Certificate cancelled",
    clientSubject: "Your certificate request was cancelled",
    clientLead: "This certificate request was cancelled and will not be funded.",
    clientNext: "No wire is due for this request. Sign in if you want to open a new certificate.",
    adminSubject: "Certificate cancelled for {{name}}",
    adminLead: "A certificate for {{name}} ({{email}}) was cancelled.",
  },
  lead_intro: {
    label: "Lead introduction",
    clientSubject: "Current CD rates for {{name}}",
    clientLead: "",
    clientNext: "",
    adminSubject: "Intro sent to {{name}}",
    adminLead: "An introduction with the current promo rates was sent to {{name}} ({{email}}).",
  },
  lead_application: {
    label: "Lead application",
    clientSubject: "CD application form for {{name}}",
    clientLead: "",
    clientNext: "",
    adminSubject: "Application email sent to {{name}}",
    adminLead: "A custom-term application email was sent to {{name}} ({{email}}).",
  },
  lead_promo: {
    label: "Lead promotional application",
    clientSubject: "Promotional CD application for {{name}}",
    clientLead: "",
    clientNext: "",
    adminSubject: "Promotional application email sent to {{name}}",
    adminLead: "A promotional application email was sent to {{name}} ({{email}}).",
  },
  lead_invite_reminder: {
    label: "Application link reminder",
    clientSubject: "Your application link expires soon",
    clientLead: "",
    clientNext: "",
    adminSubject: "Application reminder for {{name}}",
    adminLead: "A reminder was sent to {{name}} ({{email}}) because the application link is about to expire.",
  },
  lead_extension: {
    label: "Rate extension",
    clientSubject: "Our New Account Promotional CD Offer is extended through November 6",
    clientLead: "",
    clientNext: "",
    adminSubject: "Rate extension sent to {{name}}",
    adminLead: "The extended promotional CD offer was sent to {{name}} ({{email}}).",
  },
  lead_htr: {
    label: "HTR follow-up",
    clientSubject: "Following Up on Your CD Information Request",
    clientLead: "",
    clientNext: "",
    adminSubject: "HTR follow-up sent to {{name}}",
    adminLead: "A follow-up was sent to {{name}} ({{email}}) after they could not be reached.",
  },
  lead_htr_call: {
    label: "HTR with form",
    clientSubject: "Following Up on Your CD Information Request",
    clientLead: "",
    clientNext: "",
    adminSubject: "HTR with form sent to {{name}}",
    adminLead: "A follow-up with a call form was sent to {{name}} ({{email}}).",
  },
  lead_followup: {
    label: "Promo application follow-up",
    clientSubject: "Follow-Up: 10 & 22 Month Promotional CD Opportunities",
    clientLead: "",
    clientNext: "",
    adminSubject: "Promo application follow-up sent to {{name}}",
    adminLead: "A 10 and 22 month application follow-up was sent to {{name}} ({{email}}).",
  },
  lead_promo_reminder: {
    label: "Promo application reminder",
    clientSubject: "Follow-Up: 10 & 22 Month Promotional CD Opportunities",
    clientLead: "",
    clientNext: "",
    adminSubject: "Promo application reminder sent to {{name}}",
    adminLead: "A promotional application reminder was sent to {{name}} ({{email}}).",
  },
  lead_exclusive: {
    label: "Promo rates 250+",
    clientSubject: "Exclusive new-client CD promotion",
    clientLead: "",
    clientNext: "",
    adminSubject: "Promo rates 250+ sent to {{name}}",
    adminLead: "Promo rates 250+ was sent to {{name}} ({{email}}).",
  },
  lead_exclusive_fdic: {
    label: "Promo rates",
    clientSubject: "Exclusive new-client CD promotion",
    clientLead: "",
    clientNext: "",
    adminSubject: "Promo rates sent to {{name}}",
    adminLead: "Promo rates was sent to {{name}} ({{email}}).",
  },
  lead_cdars: {
    label: "CDARS application",
    clientSubject: "Certificate of Deposit Account Registry Service (CDARS)",
    clientLead: "",
    clientNext: "",
    adminSubject: "CDARS application sent to {{name}}",
    adminLead: "A CDARS application was sent to {{name}} ({{email}}).",
  },
  lead_cdars_intro: {
    label: "CDARS introduction",
    clientSubject: "An introduction to CDARS",
    clientLead: "",
    clientNext: "",
    adminSubject: "CDARS introduction sent to {{name}}",
    adminLead: "A CDARS introduction was sent to {{name}} ({{email}}).",
  },
  lead_wealth: {
    label: "Featured CD introduction",
    clientSubject: "Featured brokered CD rates",
    clientLead: "",
    clientNext: "",
    adminSubject: "Featured CD introduction sent to {{name}}",
    adminLead: "A featured brokered CD introduction was sent to {{name}} ({{email}}).",
  },
  lead_account_ready: {
    label: "Application and ID received",
    clientSubject: "Your Promotional CD account is ready for funding",
    clientLead: "",
    clientNext: "",
    adminSubject: "Account ready notice sent to {{name}}",
    adminLead: "The application and photo identification were confirmed received for {{name}} ({{email}}).",
  },
  invoice_advisor: {
    label: "Advisor invoice letter",
    clientSubject: "Your CD is ready for funding",
    clientLead: "",
    clientNext: "",
    adminSubject: "Advisor invoice letter sent to {{name}}",
    adminLead: "An advisor sent {{name}} ({{email}}) a personal invoice letter.",
  },
  inbox_note: {
    label: "Inbox email",
    clientSubject: "A note from your advisor",
    clientLead: "",
    clientNext: "",
    adminSubject: "Inbox email sent to {{name}}",
    adminLead: "An advisor sent {{name}} ({{email}}) a message from the inbox.",
  },
};

export const SAMPLE_EMAIL = {
  name: "Jonah Hale",
  email: "jonah.hale@example.com",
  detail: "22-month · 4.40% APY\n$250,000.00",
  companyName: DEFAULT_COMPANY_NAME,
};

export const EMAIL_STYLES = [
  { id: "classic", label: "Classic blue", note: "Blue bar, blue buttons, the current letter." },
  { id: "letterhead", label: "Letterhead", note: "White letterhead, black rule, serif type." },
  { id: "ledger", label: "Ledger", note: "Charcoal header, square corners, gray paper." },
  { id: "counsel", label: "Counsel", note: "Navy header, serif type, ivory paper." },
] as const;

export type EmailStyle = (typeof EMAIL_STYLES)[number]["id"];

export function normalizeEmailStyle(value: string | null | undefined): EmailStyle {
  return EMAIL_STYLES.some((item) => item.id === value) ? (value as EmailStyle) : "classic";
}

export const EMAIL_FONTS = [
  { id: "style", label: "Match the letter style", stack: "" },
  { id: "arial", label: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { id: "verdana", label: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { id: "tahoma", label: "Tahoma", stack: "Tahoma, Geneva, sans-serif" },
  { id: "trebuchet", label: "Trebuchet", stack: "'Trebuchet MS', Helvetica, sans-serif" },
  { id: "georgia", label: "Georgia", stack: "Georgia, 'Times New Roman', serif" },
  { id: "times", label: "Times New Roman", stack: "'Times New Roman', Times, serif" },
  { id: "garamond", label: "Garamond", stack: "Garamond, Palatino, serif" },
  { id: "courier", label: "Courier", stack: "'Courier New', Courier, monospace" },
] as const;

export type EmailFont = (typeof EMAIL_FONTS)[number]["id"];

export function normalizeEmailFont(value: string | null | undefined): EmailFont {
  return EMAIL_FONTS.some((item) => item.id === value) ? (value as EmailFont) : "style";
}

function emailFontStack(value: string | null | undefined) {
  return EMAIL_FONTS.find((item) => item.id === normalizeEmailFont(value))?.stack || "";
}

export const EMAIL_COLOR_FIELDS = [
  { id: "header", label: "Header" },
  { id: "button", label: "Buttons" },
  { id: "heading", label: "Headings and footer" },
  { id: "accent", label: "Labels" },
  { id: "paper", label: "Paper" },
  { id: "card", label: "Cards" },
  { id: "text", label: "Text" },
  { id: "border", label: "Borders" },
  { id: "muted", label: "Muted text" },
] as const;

export type EmailColorKey = (typeof EMAIL_COLOR_FIELDS)[number]["id"];
export type EmailColors = Record<EmailColorKey, string>;

export const DEFAULT_EMAIL_COLORS: EmailColors = {
  header: "#006fcf",
  button: "#006fcf",
  heading: "#12315c",
  accent: "#1d8ece",
  paper: "#f2f5f8",
  card: "#f7fbfe",
  text: "#3d3d3d",
  border: "#d6e4ef",
  muted: "#8c8c8c",
};

const STYLE_PALETTES: Record<EmailStyle, EmailColors> = {
  classic: { ...DEFAULT_EMAIL_COLORS },
  letterhead: { ...DEFAULT_EMAIL_COLORS, header: "#ffffff", button: "#1a1a1a", accent: "#5c5c5c", text: "#1a1a1a", muted: "#5c5c5c" },
  ledger: { ...DEFAULT_EMAIL_COLORS, header: "#2a2a2a", button: "#2a2a2a", heading: "#1f1f1f", accent: "#4a4a4a", paper: "#f3f3f3", card: "#f7f7f7", border: "#d0d0d0" },
  counsel: { ...DEFAULT_EMAIL_COLORS, header: "#0e2744", button: "#0e2744", heading: "#0e2744", accent: "#0e2744", paper: "#f6f3ec", card: "#fbf8f2", border: "#ddd6c8" },
};

export function normalizeEmailHex(value: string | null | undefined) {
  const raw = (value || "").trim();
  const match = raw.match(/^#?([0-9a-fA-F]{6})$/);
  return match ? `#${match[1].toLowerCase()}` : "";
}

export function normalizeEmailColors(value: Partial<EmailColors> | null | undefined): EmailColors {
  const next = { ...DEFAULT_EMAIL_COLORS };
  for (const field of EMAIL_COLOR_FIELDS) {
    const hex = normalizeEmailHex(value?.[field.id]);
    if (hex) next[field.id] = hex;
  }
  return next;
}

export type EmailPaint = Partial<EmailColors> & { font?: string; buttonText?: string; headerText?: string };

export function applyEmailStyle(html: string, style: EmailStyle | string | null | undefined, colors?: EmailPaint | null) {
  if (!html || typeof html !== "string") return typeof html === "string" ? html : "";
  const chosen = normalizeEmailStyle(style);
  const palette = paletteFor(chosen, colors);
  let next = paintEmailRoles(html, palette);
  const customHeader = normalizeEmailHex(colors?.headerText);
  const headerInk = customHeader || inkOn(palette.header);
  const buttonInk = normalizeEmailHex(colors?.buttonText) || inkOn(palette.button);
  const headingInk = inkOn(palette.heading);
  const headerSoft = customHeader || (headerInk === "#ffffff" ? "#d6ebff" : palette.muted);
  next = next
    .replaceAll("letter-spacing:1px; color:#ffffff;", `letter-spacing:1px; color:${headerInk};`)
    .replaceAll("letter-spacing:0.14em;color:#ffffff;", `letter-spacing:0.14em;color:${headerInk};`)
    .replaceAll("color:#ffffff; text-decoration:none;", `color:${buttonInk}; text-decoration:none;`)
    .replaceAll("color:#ffffff;text-decoration:none;", `color:${buttonInk}; text-decoration:none;`)
    .replaceAll("color:#ffffff; font-weight:700;", `color:${headerInk}; font-weight:700;`)
    .replaceAll("color:#fff; font-size:12px;", `color:${headerInk}; font-size:12px;`)
    .replaceAll("color:#d6ebff;", `color:${headerSoft};`)
    .replaceAll("color:#d6ecfa;", `color:${headerSoft};`)
    .replaceAll(`background:${palette.heading}; padding:18px 32px; color:#ffffff;`, `background:${palette.heading}; padding:18px 32px; color:${headingInk};`)
    .replaceAll("font-weight:700; color:#ffffff;\">We’re here to help.", `font-weight:700; color:${headingInk};">We’re here to help.`)
    .replaceAll("line-height:21px; color:#ffffff;\">For assistance", `line-height:21px; color:${headingInk};">For assistance`);
  if (chosen === "letterhead" || chosen === "counsel") {
    next = next
      .replaceAll("Arial, Helvetica, sans-serif", "Georgia, 'Times New Roman', serif")
      .replaceAll("Arial,sans-serif", "Georgia, 'Times New Roman', serif");
  }
  const stack = emailFontStack(colors?.font);
  if (stack) {
    next = next
      .replaceAll("Georgia, 'Times New Roman', serif", stack)
      .replaceAll("Arial, Helvetica, sans-serif", stack)
      .replaceAll("Arial,sans-serif", stack);
  }
  if (chosen !== "classic") {
    next = next
      .replaceAll("border-radius:12px", "border-radius:0")
      .replaceAll("border-radius:8px", "border-radius:0")
      .replaceAll("border-radius:6px", "border-radius:0")
      .replaceAll("border-radius:2px", "border-radius:0");
  }
  if (chosen === "letterhead") {
    next = next
      .replaceAll(`background:${palette.header}; padding:16px 32px;`, `background:${palette.header};border-bottom:1px solid ${palette.button};padding:16px 32px;`)
      .replaceAll(`background:${palette.header};padding:18px 32px;`, `background:${palette.header};border-bottom:1px solid ${palette.button};padding:18px 32px;`)
      .replaceAll(`background:${palette.heading}; height:4px; font-size:0; line-height:0;`, `background:${palette.button}; height:1px; font-size:0; line-height:0;`);
  }
  return next;
}

function mailButton(href: string, label: string, margin = "0") {
  const link = escapeHtml(href || "#");
  const text = escapeHtml(label);
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:${margin};"><tr><td align="center" bgcolor="#006fcf" style="background:#006fcf; border-radius:6px;"><a href="${link}" target="_blank" style="display:inline-block; padding:14px 28px; font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:700; letter-spacing:0.3px; line-height:20px; color:#ffffff; text-decoration:none; background:#006fcf; border:1px solid #006fcf; border-radius:6px;">${text}</a></td></tr></table>`;
}

function paletteFor(style: EmailStyle, colors?: Partial<EmailColors> | null): EmailColors {
  const next = { ...STYLE_PALETTES[style] };
  if (!colors) return next;
  for (const field of EMAIL_COLOR_FIELDS) {
    const hex = normalizeEmailHex(colors[field.id]);
    if (hex && hex !== DEFAULT_EMAIL_COLORS[field.id]) next[field.id] = hex;
  }
  return next;
}

function paintEmailRoles(html: string, palette: EmailColors) {
  return html
    .replaceAll("background:#006fcf; padding:16px 32px;", `background:${palette.header}; padding:16px 32px;`)
    .replaceAll("background:#006fcf;padding:18px 32px;", `background:${palette.header};padding:18px 32px;`)
    .replaceAll("background:#006fcf; padding:10px;", `background:${palette.header}; padding:10px;`)
    .replaceAll("background:#006fcf; padding:8px;", `background:${palette.header}; padding:8px;`)
    .replaceAll("background:#006fcf;", `background:${palette.button};`)
    .replaceAll("background:#006fcf", `background:${palette.button}`)
    .replaceAll("#006fcf", palette.button)
    .replaceAll("#12315c", palette.heading)
    .replaceAll("#1d8ece", palette.accent)
    .replaceAll("#f2f5f8", palette.paper)
    .replaceAll("#fbfbfb", palette.paper)
    .replaceAll("#f7fbfe", palette.card)
    .replaceAll("#f7f7f7", palette.card)
    .replaceAll("#e7f3fb", palette.card)
    .replaceAll("#d6e4ef", palette.border)
    .replaceAll("#e0e0e0", palette.border)
    .replaceAll("#3d3d3d", palette.text)
    .replaceAll("#262626", palette.text)
    .replaceAll("#8c8c8c", palette.muted)
    .replaceAll("#5a6a7a", palette.muted);
}

function inkOn(hex: string) {
  const raw = hex.replace("#", "");
  const red = Number.parseInt(raw.slice(0, 2), 16);
  const green = Number.parseInt(raw.slice(2, 4), 16);
  const blue = Number.parseInt(raw.slice(4, 6), 16);
  if (![red, green, blue].every((part) => Number.isFinite(part))) return "#ffffff";
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255 > 0.62 ? "#1a1a1a" : "#ffffff";
}

const CERTIFICATE_STEPS = new Set<MailStep>([
  "investment_submitted",
  "terms_accepted",
  "approved_phone",
  "instructions_sent",
  "payment_uploaded",
  "payment_rejected",
  "payment_approved",
  "investment_cancelled",
]);

export function renderStep(
  step: MailStep,
  audience: MailAudience,
  input: { name: string; email: string; detail: string; companyName?: string; companyPhone?: string; emailLogo?: string | null; portalUrl?: string; extraHtml?: string; advisor?: MailAdvisor; advisorStyle?: string | null; transactionalStyle?: string | null; emailColors?: EmailPaint | null; copy?: { subject?: string; lead?: string; next?: string } },
): RenderedEmail {
  const item = STEPS[step];
  const company = input.companyName?.trim() || DEFAULT_COMPANY_NAME;
  const name = input.name.trim() || "Investor";
  const lead = fill(input.copy?.lead ?? (audience === "client" ? item.clientLead : item.adminLead), name, input.email, company);
  const subject = fill(input.copy?.subject ?? (audience === "client" ? item.clientSubject : item.adminSubject), name, input.email, company);
  const nextRaw = input.copy?.next ?? item.clientNext;
  const next = audience === "client" && nextRaw ? fill(nextRaw, name, input.email, company) : "";
  const fullLetterStep = step === "lead_intro" || step === "lead_application" || step === "lead_promo" || step === "lead_invite_reminder" || step === "lead_extension" || step === "lead_htr" || step === "lead_htr_call" || step === "lead_followup" || step === "lead_promo_reminder" || step === "lead_exclusive" || step === "lead_exclusive_fdic" || step === "lead_cdars" || step === "lead_cdars_intro" || step === "lead_wealth" || step === "lead_account_ready" || step === "invoice_advisor";
  const isFullLetter = fullLetterStep && audience === "client";
  const portalUrl = audience === "client" ? (fullLetterStep ? applicationUrl(input.portalUrl) : cleanPortalUrl(input.portalUrl)) : "";
  const lines = isFullLetter || input.extraHtml ? [] : input.detail.split("\n").map((line) => line.trim()).filter(Boolean);
  if (audience === "client" && CERTIFICATE_STEPS.has(step)) {
    if (!lines.some((line) => line.startsWith("Promo APY"))) lines.push("Promo APY +1.125%");
    if (!lines.some((line) => line.startsWith("Final APY"))) lines.push("Final APY 5.525%");
  }
  const greeting = isFullLetter ? "" : audience === "client" ? `Hello ${name},` : "Operations desk,";
  const text = isFullLetter
    ? [input.detail.trim() || "The letter is in the HTML version.", portalUrl ? `Application\n${portalUrl}` : ""].filter(Boolean).join("\n\n")
    : [greeting, "", lead, ...(input.detail.trim() ? ["", input.detail.trim()] : []), ...(next ? ["", "What happens next", next] : []), ...(portalUrl ? ["", "Open the investor portal", portalUrl] : []), ...(audience === "client" ? ["", trustBlocks().text] : []), "", "Please do not reply to this email. This mailbox is not monitored.", input.companyPhone?.trim() ? `We're here to help. Call ${input.companyPhone.trim()}.` : "We're here to help.", "", company].join("\n");
  const fullLetter = !isFullLetter
    ? ""
    : input.extraHtml ||
      (step === "invoice_advisor" ? sampleInvoiceAdvisorLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_account_ready" ? sampleAccountReadyLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_wealth" ? sampleWealthIntroLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_cdars_intro" ? sampleCdarsIntroLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_cdars" ? sampleCdarsLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_exclusive_fdic" ? sampleExclusiveLetter(input.portalUrl, input.advisor, input.companyPhone, "standard") : step === "lead_exclusive" ? sampleExclusiveLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_promo_reminder" ? samplePromoReminderLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_followup" ? sampleFollowupLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_htr_call" ? sampleHtrCallLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_htr" ? sampleHtrLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_intro" ? sampleLeadLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_extension" ? sampleExtensionLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_promo" ? samplePromoLetter(input.portalUrl, input.advisor, input.companyPhone) : step === "lead_invite_reminder" ? sampleReminderLetter(input.portalUrl, input.advisor, input.companyPhone) : sampleApplicationLetter(input.portalUrl, input.advisor, input.companyPhone));
  const chosenStyle = isFullLetter ? input.advisorStyle : input.transactionalStyle;
  return {
    step,
    audience,
    label: item.label,
    subject,
    text,
    html: applyEmailStyle(fullLetter || layout({ eyebrow: item.label, greeting, lead, lines, next, audience, company, companyPhone: input.companyPhone, logo: input.emailLogo, portalUrl, portalLabel: "Open the investor portal", extraHtml: fullLetterStep ? "" : input.extraHtml || "" }), chosenStyle, input.emailColors),
  };
}

export function applicationApprovedDefaults(name: string, email: string, company = DEFAULT_COMPANY_NAME) {
  const item = STEPS.application_approved;
  const investor = name.trim() || "Investor";
  const address = email.trim();
  const firm = company.trim() || DEFAULT_COMPANY_NAME;
  return {
    subject: fill(item.clientSubject, investor, address, firm),
    lead: fill(item.clientLead, investor, address, firm),
    next: fill(item.clientNext, investor, address, firm),
  };
}

export function renderPair(step: MailStep, input: { name: string; email: string; detail: string; companyName?: string; emailLogo?: string | null; portalUrl?: string }) {
  return {
    client: renderStep(step, "client", input),
    admin: renderStep(step, "admin", input),
  };
}

export function templateCatalog(companyName = DEFAULT_COMPANY_NAME, emailLogo: string | null = null, portalUrl = "", advisor?: MailAdvisor, companyPhone = "", styles?: { advisor?: string | null; transactional?: string | null; font?: string | null; buttonText?: string | null; headerText?: string | null; colors?: EmailPaint | null }) {
  const sample = { ...SAMPLE_EMAIL, companyName, emailLogo, portalUrl, advisor, companyPhone, advisorStyle: styles?.advisor, transactionalStyle: styles?.transactional, emailColors: { ...(styles?.colors || {}), font: styles?.font || styles?.colors?.font, buttonText: styles?.buttonText ?? styles?.colors?.buttonText, headerText: styles?.headerText ?? styles?.colors?.headerText } };
  return (Object.keys(STEPS) as MailStep[]).filter((step) => step !== "inbox_note").flatMap((step) => [
    renderStep(step, "client", sample),
    renderStep(step, "admin", sample),
  ]);
}

function applicationUrl(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!/^https?:\/\//i.test(trimmed)) return "";
  return trimmed.replace(/\/$/, "") + "/application";
}

export type MailAdvisor = { name: string; phone: string; email: string; mailbox?: string; role?: string; personalPhone?: string };

function contactLink(value: string, href: string) {
  const label = escapeHtml(value);
  if (!href) return `<strong style="color:#ffffff;">${label}</strong>`;
  return `<a href="${escapeHtml(href)}" style="color:#ffffff !important; text-decoration:underline; font-weight:700;"><span style="color:#ffffff !important;">${label}</span></a>`;
}

function phoneLink(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return contactLink(phone, digits ? `tel:${digits}` : "");
}

function mailLink(email: string) {
  return contactLink(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : "");
}

function companyCredit(company: string) {
  return `${escapeHtml(company)}. © ${new Date().getFullYear()}`;
}

function trustBlocks() {
  const items = [
    ["Security you can trust", "Deposits are protected with FDIC coverage on the terms in this letter."],
    ["Competitive CD rates", "Choose the term that fits your goals and earn a rate that works for you."],
    ["Terms that fit your plans", "10-month and 22-month options to save on your schedule."],
  ];
  const cell = (title: string, body: string) => `<td width="33%" valign="top" style="padding:6px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7fbfe; border-top:3px solid #006fcf;"><tr><td style="padding:14px 12px; font-family:Arial, Helvetica, sans-serif;">
    <p style="margin:0; font-size:14px; line-height:18px; font-weight:700; color:#12315c;">${escapeHtml(title)}</p>
    <p style="margin:6px 0 0 0; font-size:12px; line-height:17px; color:#3d3d3d;">${escapeHtml(body)}</p>
  </td></tr></table></td>`;
  return {
    html: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:22px;"><tr>${items.map(([title, body]) => cell(title, body)).join("")}</tr></table>`,
    text: items.map(([title, body]) => `${title}\n${body}`).join("\n\n"),
  };
}

function advisorSignature(advisor: MailAdvisor | undefined, company: string, extra?: { closing?: string }) {
  const name = advisor?.name?.trim() || company;
  const direct = advisor?.personalPhone?.trim() || advisor?.phone?.trim() || "";
  const email = advisor?.email?.trim() || advisor?.mailbox?.trim() || "";
  const role = advisor?.role?.trim() || "";
  const firm = company.trim() && company.trim().toLowerCase() !== name.toLowerCase() ? company.trim() : "";
  const closing = extra?.closing?.trim() || "Best regards";
  const row = (label: string, value: string) => `<tr><td style="padding:1px 12px 1px 0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:18px; color:#5a6a7a; vertical-align:top;">${label}</td><td style="padding:1px 0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:18px; color:#1a1a1a;">${value}</td></tr>`;
  const phone = direct ? signatureTextLink(direct, `tel:${direct.replace(/[^\d+]/g, "")}`) : "";
  const mail = email ? signatureTextLink(email, `mailto:${email}`) : "";
  const rows = [phone ? row("Direct", phone) : "", mail ? row("Email", mail) : ""].join("");
  const html = `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0; border-collapse:collapse; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
    <tr><td style="padding:0 0 8px 0; font-size:15px; line-height:22px;">${escapeHtml(closing)},</td></tr>
    <tr><td style="border-left:3px solid #006fcf; padding:0 0 0 12px;">
      <p style="margin:0; font-size:16px; line-height:22px; font-weight:700; color:#12315c;">${escapeHtml(name)}</p>
      ${role ? `<p style="margin:2px 0 0 0; font-size:13px; line-height:18px; color:#3d3d3d;">${escapeHtml(role)}</p>` : ""}
      ${firm ? `<p style="margin:1px 0 0 0; font-size:13px; line-height:18px; color:#3d3d3d;">${escapeHtml(firm)}</p>` : ""}
      ${rows ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;">${rows}</table>` : ""}
    </td></tr>
  </table>`;
  const text = [closing + ",", "", name, role, firm, direct ? `Direct: ${direct}` : "", email ? `Email: ${email}` : ""].filter(Boolean).join("\n");
  return { html, text };
}

function signatureTextLink(label: string, href: string) {
  const safe = escapeHtml(label);
  if (!href) return safe;
  return `<a href="${escapeHtml(href)}" style="color:#1a1a1a; text-decoration:none;">${safe}</a>`;
}

export function advisorNoteLetter(input: { company: string; companyPhone?: string; logo?: string | null; advisor: MailAdvisor; greeting: string; message: string; quote?: string; pageUrl?: string; logoCid?: string }) {
  const sign = advisorSignature(input.advisor, input.company);
  const message = messageHtml(input.message);
  const quote = input.quote?.trim()
    ? `<tr><td style="padding:8px 36px 8px 36px;"><p style="margin:0; padding:12px 14px; border-left:3px solid #d6e4ef; color:#5a6a7a; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:20px;">${escapeHtml(input.quote.trim()).replace(/\n/g, "<br>")}</p></td></tr>`
    : "";
  const logo = input.logoCid ? `cid:${input.logoCid}` : emailLogoSrc(input.logo, input.pageUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(input.company)}" height="32" style="display:block;height:32px;width:auto;max-width:180px;border:0;">`
    : `<p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13px; letter-spacing:1px; color:#ffffff;">${escapeHtml(input.company.toUpperCase())}</p>`;
  const phone = input.companyPhone?.trim() || "";
  const help = phone ? `please call:<br>${phoneLink(phone)}` : "please reply to this email.";
  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
        <tr><td style="background:#006fcf; padding:16px 32px;">${mark}</td></tr>
        <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 36px 8px 36px;">
          <p style="margin:0; font-size:15px; line-height:23px;">${escapeHtml(input.greeting)}</p>
          <div style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${message}</div>
        </td></tr>
        ${quote}
        <tr><td style="padding:4px 36px 8px 36px;">${sign.html}</td></tr>
        <tr><td class="help-bar" style="background:#12315c; padding:18px 32px; color:#ffffff; font-family:Arial, Helvetica, sans-serif;">
          <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#ffffff;">We’re here to help.</p>
          <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text = [input.greeting, "", input.message, input.quote?.trim() ? `\n${input.quote.trim()}` : "", "", sign.text, phone ? `We're here to help. Call ${phone}.` : ""].filter(Boolean).join("\n");
  return { html, text };
}

function messageHtml(source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let index = 0;
  while (index < lines.length) {
    if (!lines[index].trim()) {
      index += 1;
      continue;
    }
    if (tableAt(lines, index)) {
      const rows: string[] = [];
      while (index < lines.length && lines[index].includes("|")) {
        rows.push(lines[index]);
        index += 1;
      }
      blocks.push(mailTable(rows));
      continue;
    }
    const bullet = /^[-*]\s+/.test(lines[index].trim());
    const numbered = /^\d+\.\s+/.test(lines[index].trim());
    if (bullet || numbered) {
      const items: string[] = [];
      const pattern = bullet ? /^[-*]\s+/ : /^\d+\.\s+/;
      while (index < lines.length && pattern.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(pattern, ""));
        index += 1;
      }
      const tag = bullet ? "ul" : "ol";
      blocks.push(`<${tag} style="margin:0 0 14px 18px; padding:0; font-size:15px; line-height:23px;">${items.map((item) => `<li style="margin:0 0 4px 0;">${inlineMarkdown(item)}</li>`).join("")}</${tag}>`);
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !tableAt(lines, index) && !/^[-*]\s+/.test(lines[index].trim()) && !/^\d+\.\s+/.test(lines[index].trim())) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(`<p style="margin:0 0 14px 0; font-size:15px; line-height:23px;">${inlineMarkdown(paragraph.join("\n")).replace(/\n/g, "<br>")}</p>`);
  }
  if (blocks.length) {
    const last = blocks.length - 1;
    blocks[last] = blocks[last].replace('style="margin:0 0 14px 0;', 'style="margin:0;').replace('style="margin:0 0 14px 18px;', 'style="margin:0 0 0 18px;');
  }
  return blocks.join("") || `<p style="margin:0; font-size:15px; line-height:23px;">&nbsp;</p>`;
}

function tableAt(lines: string[], index: number) {
  return Boolean(lines[index]?.includes("|") && lines[index + 1] && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1]));
}

function mailTable(rows: string[]) {
  const header = splitRow(rows[0]);
  const align = splitRow(rows[1]).map((cell) => (cell.trim().endsWith(":") && cell.trim().startsWith(":") ? "center" : cell.trim().endsWith(":") ? "right" : "left"));
  const body = rows.slice(2).map(splitRow);
  const head = header
    .map((cell, cellIndex) => `<td align="${align[cellIndex] || "left"}" style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700; letter-spacing:0.3px;">${inlineMarkdown(cell)}</td>`)
    .join("");
  const lines = body
    .map((cells, rowIndex) => {
      const background = rowIndex % 2 ? "#f7fbfe" : "#ffffff";
      const rule = rowIndex === body.length - 1 ? "" : "border-bottom:1px solid #e7eef4;";
      return `<tr>${cells
        .map((cell, cellIndex) => `<td align="${align[cellIndex] || "left"}" style="padding:11px 14px; background:${background}; ${rule} font-size:14px; line-height:20px; color:#1a1a1a;">${inlineMarkdown(cell)}</td>`)
        .join("")}</tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d6e4ef; margin:0 0 14px 0;"><tr>${head}</tr>${lines}</table>`;
}

function splitRow(row: string) {
  return row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function inlineMarkdown(value: string) {
  let html = escapeHtml(value);
  html = html.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, '<a href="$2" style="color:#006fcf; text-decoration:underline;">$1</a>');
  html = html.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:]|$)/g, "$1<em>$2</em>");
  return html;
}

function companyHelp(phone?: string) {
  const number = phone?.trim() || "";
  return number ? `please call:<br>${phoneLink(number)}` : "please contact the main office.";
}

export type LeadCopy = {
  subject: string;
  headline: string;
  welcome: string;
  certificate: string;
  offer: string;
  protection: string;
  ready: string;
  thanks: string;
};

export function defaultLeadCopy(input: { leadName: string; company: string; advisorName?: string; offerIntro?: string; protection?: string }): LeadCopy {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const advisor = input.advisorName?.trim();
  return {
    subject: `Current CD rates for ${name}`,
    headline: `Lock in a fixed rate with ${company}.`,
    welcome: `We are delighted to welcome you to ${company}. This new-client-only special promo is built to help you save with a fixed return over a term you choose. ${advisor ? `${advisor} can walk through the options with you.` : "Your advisor can walk through the options with you."}`,
    certificate: "Choose a term that fits your plans and earn a fixed rate for that term. A penalty may apply if you withdraw before maturity.",
    offer: input.offerIntro?.trim() || "A tiered introductory bonus for new clients. The bonus applies for the full duration of the CD and increases with the amount you place.",
    protection: input.protection?.trim() || "Deposits are FDIC insured. Capital protection covers the first $250,000 per individual or $500,000 per joint account.",
    ready: "Opening a promotional CD starts with your advisor. Confirm that the new-money and new-client rules apply to you.",
    thanks: `Thank you for considering ${company}. We look forward to helping you with your savings plans.`,
  };
}

function chosenMonths(published: number[], picked?: number[]) {
  const allowed = (picked || []).filter((month) => Number.isInteger(month) && month > 0);
  if (!allowed.length) return published;
  const set = new Set(allowed);
  return published.filter((month) => set.has(month));
}

export function leadLetter(input: {
  leadName: string;
  company: string;
  terms: { months: number; apy: string }[];
  offer: PromoOffer;
  advisor?: MailAdvisor;
  minimum?: string;
  protection?: string;
  logo?: string | null;
  portalUrl?: string;
  companyPhone?: string;
  copy?: LeadCopy | null;
  months?: number[];
}) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const advisor = input.advisor;
  const protection = input.offer.protection.trim() || input.protection?.trim() || "Deposits are FDIC insured. Capital protection covers the first $250,000 per individual or $500,000 per joint account.";
  const bandFloors = input.offer.tiers.map((tier) => tier.minAmount).filter((amount) => Number.isFinite(amount) && amount > 0);
  const minimum = bandFloors.length ? `$${Math.min(...bandFloors).toLocaleString("en-US")}` : input.minimum?.trim() || "$100,000";
  const fine = input.offer.finePrint.trim();
  const window = input.offer.startsOn && input.offer.endsOn ? `Offer available from ${formatOfferDate(input.offer.startsOn)} – ${formatOfferDate(input.offer.endsOn)}` : "";
  const partnerNote = `*Certain Promotional Certificate of Deposit (CD) offerings are facilitated through affiliated partner banks. The issuing and holding institution may differ from ${company}.`;
  const fallback = defaultLeadCopy({
    leadName: name,
    company,
    advisorName: advisor?.name,
    offerIntro: input.offer.intro,
    protection,
  });
  const copy = input.copy;
  const headline = copy?.headline.trim() || fallback.headline;
  const welcome = copy?.welcome.trim() || fallback.welcome;
  const certificate = copy?.certificate.trim() || fallback.certificate;
  const offerText = copy?.offer.trim() || fallback.offer;
  const protectionText = copy?.protection.trim() || fallback.protection;
  const ready = copy?.ready.trim() || fallback.ready;
  const thanks = copy?.thanks.trim() || fallback.thanks;
  const months = chosenMonths([...new Set(input.offer.tiers.flatMap((tier) => tier.months))].sort((a, b) => a - b), input.months);
  const cards = months.map((month) => {
    const term = input.terms.find((item) => item.months === month);
    const apy = (term?.apy || "—").replace(/\s*APY/i, "");
    return { month, apy };
  });
  const logo = emailLogoSrc(input.logo, input.portalUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">`
    : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
  const termList = cards.map((card) => `${card.month}-month`).join(cards.length === 2 ? " and " : ", ") || "the terms below";
  const cardRows: string[] = [];
  const perRow = cards.length === 3 ? 3 : 2;
  for (let index = 0; index < cards.length; index += perRow) {
    const pair = cards.slice(index, index + perRow);
    const cells = pair
      .map((card, cell) => {
        const width = pair.length === 3 ? "33%" : pair.length === 1 ? "100%" : "50%";
        const gap = pair.length === 1 ? "" : cell === 0 ? "padding-right:6px;" : cell === pair.length - 1 ? "padding-left:6px;" : "padding-left:6px;padding-right:6px;";
        return `<td class="stack" width="${width}" valign="top" style="${gap}">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d6e4ef;">
            <tr><td style="background:#006fcf; padding:10px; text-align:center; color:#ffffff; font-weight:700; letter-spacing:0.6px;">${card.month}-MONTH CD</td></tr>
            <tr><td style="padding:18px; text-align:center; background:#f7fbfe;"><span style="font-size:36px; font-weight:700; color:#12315c;">${escapeHtml(card.apy)}</span><br><span style="color:#006fcf; font-weight:700; letter-spacing:1px;">APY</span></td></tr>
          </table>
        </td>`;
      })
      .join("");
    cardRows.push(`<tr>${cells}</tr>`);
  }
  const bonuses = input.offer.tiers
    .map((tier, index) => {
      const last = index === input.offer.tiers.length - 1;
      const background = last ? "#e7f3fb" : index % 2 ? "#f7fbfe" : "#ffffff";
      const rule = last ? "" : "border-bottom:1px solid #e7eef4;";
      const total = promotionalTotal(input.terms.filter((term) => months.includes(term.months)), tier.months.filter((month) => months.includes(month)), tier.bonusPercent);
      return `<tr>
        <td style="padding:11px 14px; background:${background}; ${rule} ${last ? "font-weight:700; color:#12315c;" : ""}">${escapeHtml(amountRange(tier))}</td>
        <td align="right" style="padding:11px 14px; background:${background}; ${rule} font-weight:700; color:${last ? "#006fcf" : "#12315c"};">${escapeHtml(formatBonus(tier.bonusPercent))}</td>
        <td align="right" style="padding:11px 14px; background:${background}; ${rule} font-weight:700; color:${last ? "#006fcf" : "#12315c"};">${total}</td>
      </tr>`;
    })
    .join("");
  const sign = advisorSignature(advisor, company);
  const help = companyHelp(input.companyPhone);
  const preheader = cards.slice(0, 2).map((card) => `${card.month}-month CD ${card.apy} APY`).join(" and ") || "Current certificate rates";
  const text = [
    `Dear ${name},`,
    welcome,
    cards.map((card) => `${card.month}-month CD ${card.apy} APY`).join("\n"),
    `Early withdrawal penalties may apply. Minimum balance to open: ${minimum} new money required.`,
    offerText,
    input.offer.tiers.map((tier) => `${amountRange(tier)} · additional bonus ${formatBonus(tier.bonusPercent)} · total promotional APY ${promotionalTotal(input.terms.filter((term) => months.includes(term.months)), tier.months.filter((month) => months.includes(month)), tier.bonusPercent, "text")}`).join("\n"),
    partnerNote,
    window,
    protectionText,
    ready,
    thanks,
    sign.text,
    input.companyPhone?.trim() ? `We're here to help. Call ${input.companyPhone.trim()}.` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const html = `<!DOCTYPE html>
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
              <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${richText(welcome)}</p>
              <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;"><strong>Certificates of Deposit (CDs):</strong> ${richText(certificate)}</p>
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
              <p style="margin:0 0 12px 0; font-size:14px; line-height:21px;">${richText(offerText)}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d6e4ef;">
                <tr>
                  <td style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700; letter-spacing:0.3px;">Qualifying Deposit</td>
                  <td align="right" style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700; letter-spacing:0.3px;">Additional Bonus</td>
                  <td align="right" style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700; letter-spacing:0.3px;">Total Promotional APY</td>
                </tr>
                ${bonuses || `<tr><td colspan="3" style="padding:11px 14px;">No bonus tiers are set.</td></tr>`}
              </table>
              <p style="margin:10px 0 0 0; text-align:center; font-size:13px; font-style:italic; color:#333;">${escapeHtml(partnerNote)}</p>
              ${window ? `<p style="margin:10px 0 0 0; text-align:center; font-size:13px; font-style:italic; color:#333;">${escapeHtml(window)}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px 4px 36px;">
              <p style="margin:0 0 6px 0; font-size:16px; font-weight:700; color:#12315c;">FDIC coverage</p>
              <p style="margin:0; font-size:14px; line-height:21px;">${richText(protectionText)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px 8px 36px;">
              <p style="margin:0 0 6px 0; font-size:16px; font-weight:700; color:#12315c;">Ready to get started?</p>
              <p style="margin:0; font-size:14px; line-height:21px;">${richText(ready)}</p>
              <p style="margin:14px 0 0 0; font-size:14px; line-height:21px;">${richText(thanks)}</p>
              <div style="margin:12px 0 0 0;">${sign.html}</div>
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
              <p style="margin:8px 0 0 0; font-size:11px; line-height:16px; color:#8a9aaa;">${companyCredit(company)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { text, html };
}

export type ApplicationCopy = {
  subject: string;
  headline: string;
  hope: string;
  ready: string;
  instruction: string;
  codeNote: string;
  followUp: string;
  thanks: string;
  promoCode: string;
};

export function defaultApplicationCopy(input: { leadName: string; company: string; months: number; advisorName?: string; variant?: "custom" | "promo" | "exclusive" }): ApplicationCopy {
  const months = input.months || 0;
  const term = months ? `${months}-month` : "CD";
  const promo = input.variant === "promo";
  const exclusive = input.variant === "exclusive";
  return {
    subject: exclusive ? `Exclusive CD application — ${term}` : promo ? (months ? `Promotional CD application — ${term}` : "Promotional CD application") : months ? `CD application form — ${term}` : "CD application form",
    headline: exclusive ? `Your exclusive ${term} CD application is ready.` : promo ? (months ? `Your promotional ${term} CD application is ready.` : "Your promotional CD application is ready.") : months ? `Your ${term} CD application is ready.` : "Your CD application is ready.",
    hope: exclusive
      ? "This certificate term and rate were prepared for you alone. They do not appear on any other application."
      : promo
      ? "Your promotional Certificate of Deposit application is ready for completion."
      : "I hope you're doing well.",
    ready: exclusive
      ? "This personal link expires 48 hours after this email is sent."
      : promo
      ? "Your personalized application link is valid for **48 hours from the time this email is sent.**"
      : "Your certificate application is ready. This personal link expires 48 hours after this email is sent.",
    instruction: promo
      ? "Please use the button below to access your application. **There is no need to create a password.** Once submitted, your advisor will coordinate the remaining account-opening process."
      : "Use the button below before the link expires.",
    codeNote: "Enter this code on your application to apply the promotional rate.",
    followUp: promo
      ? "Please complete your application within the 48-hour validity period. If your link expires before you have an opportunity to complete the application, please contact us to request a new one."
      : "Please finish within 48 hours. If the link expires, ask your advisor for a new one.",
    thanks: promo
      ? "Thank you for your interest. We appreciate the opportunity to assist you with your Certificate of Deposit needs and look forward to receiving your application."
      : "Thank you for your prompt attention. We look forward to receiving your application.",
    promoCode: "",
  };
}

export function applicationLetter(input: {
  leadName: string;
  company: string;
  months: number;
  apy: string;
  offer: PromoOffer;
  advisor?: MailAdvisor;
  minimum?: string;
  logo?: string | null;
  portalUrl?: string;
  link?: string;
  companyPhone?: string;
  variant?: "custom" | "promo" | "exclusive";
  copy?: ApplicationCopy | null;
  terms?: { months: number; apy: string }[];
}) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const months = Number(input.months) || 0;
  const apy = (input.apy || "—").replace(/\s*APY/i, "");
  const advisor = input.advisor;
  const fallback = defaultApplicationCopy({ leadName: name, company, months, advisorName: advisor?.name, variant: input.variant });
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
  const rateTerms = months
    ? [{ months, apy: input.apy }]
    : (input.terms || []).filter((term) => term.months > 0);
  const listed = input.variant === "promo" ? input.offer.tiers.filter((tier) => !months || tier.months.includes(months)) : [];
  const rows = listed
    .map((tier, index, list) => {
      const last = index === list.length - 1;
      const background = last ? "#e7f3fb" : index % 2 ? "#f7fbfe" : "#ffffff";
      const rule = last ? "" : "border-bottom:1px solid #e7eef4;";
      const total = promotionalTotal(rateTerms, months ? [months] : tier.months, tier.bonusPercent);
      return `<tr>
        <td style="padding:11px 14px; background:${background}; ${rule} ${last ? "font-weight:700; color:#12315c;" : ""}">${escapeHtml(amountRange(tier))}</td>
        <td align="right" style="padding:11px 14px; background:${background}; ${rule} font-weight:700; color:${last ? "#006fcf" : "#12315c"};">${escapeHtml(formatBonus(tier.bonusPercent))}</td>
        <td align="right" style="padding:11px 14px; background:${background}; ${rule} font-weight:700; color:${last ? "#006fcf" : "#12315c"};">${total}</td>
      </tr>`;
    })
    .join("");
  const link = input.link?.trim() || applicationLink(input.portalUrl, months, promoCode);
  const logo = emailLogoSrc(input.logo, input.portalUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">`
    : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
  const sign = advisorSignature(advisor, company);
  const help = companyHelp(input.companyPhone);
  const buttonLabel = input.variant === "promo" || !months ? "Click here for application" : `${months}-Month CD Application`;
  const buttonHref = link || "#";
  const button = mailButton(buttonHref, buttonLabel);
  const codeBox = promoCode
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e7f3fb; border-left:4px solid #006fcf;"><tr><td style="padding:16px 18px;">
        <p style="margin:0 0 4px 0; font-size:12px; font-weight:700; letter-spacing:0.8px; color:#006fcf;">YOUR PROMOTIONAL CODE</p>
        <p style="margin:0; font-size:22px; font-weight:700; letter-spacing:1px; color:#12315c;">${escapeHtml(promoCode)}</p>
        <p style="margin:8px 0 0 0; font-size:14px; line-height:21px; color:#333333;">${escapeHtml(codeNote)}</p>
      </td></tr></table>`
    : "";
  const badge = input.variant === "promo" ? "Promotional offer<br>48-hour application link" : "Certificate<br>application";
  const promo = input.variant === "promo";
  const bonusBlock = rows
    ? `<p style="margin:18px 0 4px 0; font-size:16px; font-weight:700; color:#12315c;">${promo ? "Promotional Bonus Structure" : "Relationship bonus for the full term"}</p>
          ${promo ? `<p style="margin:0 0 8px 0; font-size:14px; line-height:21px; color:#333;">Additional bonus applies for the full CD term based on qualifying deposit amount.</p>` : ""}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d6e4ef;">
            <tr>
              <td style="background:#12315c; color:#fff; padding:10px 14px; font-size:11px; font-weight:700; letter-spacing:0.3px;">Qualifying Deposit</td>
              <td align="right" style="background:#12315c; color:#fff; padding:10px 14px; font-size:11px; font-weight:700; letter-spacing:0.3px;">Additional Bonus</td>
              <td align="right" style="background:#12315c; color:#fff; padding:10px 14px; font-size:11px; font-weight:700; letter-spacing:0.3px;">Total Promotional APY</td>
            </tr>
            ${rows}
          </table>`
    : "";
  const rateCards = rateTerms.map((term) => {
    const shown = (term.apy || "—").replace(/\s*APY/i, "");
    const width = rateTerms.length >= 3 ? `${Math.floor(100 / rateTerms.length)}%` : rateTerms.length === 2 ? "50%" : "220";
    return `<td class="stack" width="${width}" valign="top" style="padding:0 6px 10px 0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="border:1px solid #d6e4ef;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr><td style="background:#006fcf; padding:8px; text-align:center; color:#fff; font-size:12px; font-weight:700;">${term.months}-MONTH CD</td></tr>
          <tr><td style="padding:14px; text-align:center; background:#f7fbfe; font-size:28px; font-weight:700; color:#12315c;">${escapeHtml(shown)} <span style="font-size:12px; color:#006fcf;">APY</span></td></tr>
        </table>
      </td></tr></table>
    </td>`;
  }).join("");
  const termNames = rateTerms.map((term) => `${term.months}-month`).join(rateTerms.length === 2 ? " and " : ", ");
  const rateBlock = rateTerms.length
    ? `<p style="margin:18px 0 4px 0; font-size:16px; font-weight:700; color:#12315c;">${promo ? "Choose Your Promotional CD Term" : rateTerms.length > 1 ? "Choose either promotional term on the application" : "New-client rate on this application"}</p>
       ${promo ? `<p style="margin:0 0 8px 0; font-size:14px; line-height:21px; color:#333;">${rateTerms.length === 2 ? "Select either promotional term when completing your application." : "Select a promotional term when completing your application."}</p>` : ""}
       <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>${rateCards}</tr></table>`
    : "";
  const fine = promo
    ? "Promotional rates are subject to eligibility requirements, qualifying deposit amounts, and applicable account terms. Rates are subject to change. Please refer to the applicable account disclosures for complete details."
    : `This personal application link expires 48 hours after it is sent. Minimum to open: ${minimum}. A penalty may be imposed for early withdrawal.`;
  const trust = promo
    ? [
        ["FDIC insured", "Eligible deposits are protected subject to applicable FDIC coverage limits and requirements."],
        ["Competitive CD rates", "Take advantage of promotional rates designed to help maximize your savings."],
        ["Promotional terms", termNames ? `Choose between ${termNames} CD options.` : "Choose between 10-month and 22-month CD options."],
      ]
    : [
        ["Security you can trust", "Deposits are protected with FDIC coverage on the terms in this letter."],
        ["Competitive CD rates", "Choose the term that fits your goals and earn a rate that works for you."],
        ["Terms that fit your plans", months ? `A ${months}-month term to save on your schedule.` : "A term that fits your schedule."],
      ];
  const trustRow = trust.map(([title, body], index) => `<td class="stack" width="33%" valign="top" style="padding:8px;${index === 1 ? "" : " background:#f7fbfe;"}"><p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#006fcf;">${escapeHtml(title)}</p><p style="margin:0; font-size:12px; line-height:18px; color:#333;">${escapeHtml(body)}</p></td>`).join("");
  const letterClose = `${codeBox}
          ${promo ? `${rateBlock}${bonusBlock}` : ""}
          <p style="margin:16px 0 0 0; font-size:14px; line-height:21px;">${inlineMarkdown(followUp)}</p>
          <p style="margin:14px 0 0 0; font-size:14px; line-height:21px;">${inlineMarkdown(thanks)}</p>
          <div style="margin:12px 0 0 0;">${sign.html}</div>`;
  const text = [`Dear ${name},`, hope, ready, instruction, promoCode ? `Promotional code: ${promoCode}` : "", rateTerms.map((term) => `${term.months}-month CD ${(term.apy || "—").replace(/\s*APY/i, "")} APY`).join("\n"), followUp, thanks, link ? `${buttonLabel}: ${link}` : "", sign.text, input.companyPhone?.trim() ? `We're here to help. Call ${input.companyPhone.trim()}.` : ""].filter(Boolean).join("\n\n");
  const html = `<!DOCTYPE html>
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
          <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${inlineMarkdown(hope)}</p>
          <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${inlineMarkdown(ready)}</p>
          <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${inlineMarkdown(instruction)}</p>
        </td></tr>
        <tr><td style="padding:8px 36px 6px 36px;" align="center">${button}</td></tr>
        <tr><td style="padding:18px 36px 8px 36px;">
          ${letterClose}
        </td></tr>
        ${promo ? "" : `<tr><td style="padding:10px 36px 6px 36px;">
          ${rateBlock}
          ${bonusBlock}
        </td></tr>`}
        <tr><td style="padding:12px 28px 20px 28px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
            ${trustRow}
          </tr></table>
        </td></tr>
        <tr><td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
          <p style="margin:0 0 4px 0; font-size:14px; font-weight:700;">We’re here to help.</p>
          <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
        </td></tr>
        <tr><td style="padding:16px 36px 22px 36px; background:#f7fbfe;">
          <p style="margin:0; font-size:11px; line-height:16px; color:#5a6a7a;">${escapeHtml(fine)}</p>
          <p style="margin:8px 0 0 0; font-size:11px; line-height:16px; color:#8a9aaa;">${companyCredit(company)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  return { text, html, subject: copy?.subject.trim() || fallback.subject };
}

function applicationLink(origin: string | undefined, months: number, code: string) {
  const base = applicationUrl(origin);
  if (!base) return "";
  const params = new URLSearchParams();
  if (months) params.set("term", String(months));
  if (code) params.set("code", code);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

function sampleApplicationLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  return applicationLetter({
    leadName: "Jonah Hale",
    company: DEFAULT_COMPANY_NAME,
    months: 12,
    apy: "3.65%",
    portalUrl,
    link: applicationLink(portalUrl, 12, "") || "#",
    variant: "custom",
    advisor: advisor ?? { name: "Alex Morgan", phone: "(202) 555-0148", email: "alex@example.com" },
    offer: {
      intro: "",
      protection: "",
      finePrint: "",
      startsOn: "2026-10-01",
      endsOn: "2026-10-31",
      tiers: [
        { id: "a", minAmount: 100000, maxAmount: 174999, bonusPercent: 0.75, months: [10] },
        { id: "b", minAmount: 500000, maxAmount: null, bonusPercent: 1.25, months: [10] },
      ],
    },
    minimum: "$100,000",
    companyPhone,
  }).html;
}

function samplePromoLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  return applicationLetter({
    leadName: "Jonah Hale",
    company: DEFAULT_COMPANY_NAME,
    months: 10,
    apy: "4.40%",
    variant: "promo",
    portalUrl,
    link: applicationLink(portalUrl, 10, "CD48K2MP") || "#",
    copy: { ...defaultApplicationCopy({ leadName: "Jonah Hale", company: DEFAULT_COMPANY_NAME, months: 10, variant: "promo" }), promoCode: "CD48K2MP" },
    offer: {
      intro: "",
      protection: "",
      finePrint: "",
      startsOn: "2026-10-01",
      endsOn: "2026-10-31",
      tiers: [
        { id: "a", minAmount: 100000, maxAmount: 174999, bonusPercent: 0.75, months: [10] },
        { id: "b", minAmount: 500000, maxAmount: null, bonusPercent: 1.25, months: [10] },
      ],
    },
    advisor: advisor ?? { name: "Alex Morgan", phone: "(202) 555-0148", email: "alex@example.com" },
    companyPhone,
    minimum: "$100,000",
  }).html;
}

function sampleReminderLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  const link = applicationLink(portalUrl, 10, "CD48K2MP") || "https://example.com/application?invite=preview";
  return inviteReminderLetter({
    leadName: "Jonah Hale",
    company: DEFAULT_COMPANY_NAME,
    months: 10,
    apy: "4.40%",
    promoCode: "CD48K2MP",
    link,
    advisorName: advisor?.name || "Alex Morgan",
    advisor,
    companyPhone,
  }).html;
}

export function inviteReminderLetter(input: { leadName: string; company: string; months: number; apy: string; promoCode: string; link: string; logo?: string | null; advisorName?: string; advisor?: MailAdvisor; companyPhone?: string }) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const apy = (input.apy || "—").replace(/\s*APY/i, "");
  const logo = emailLogoSrc(input.logo, input.link);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">`
    : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
  const button = mailButton(input.link || "#", "Open the application");
  const code = input.promoCode.trim()
    ? `<p style="margin:16px 0 0 0; font-size:14px; line-height:21px;">Your promotional code is <strong>${escapeHtml(input.promoCode.trim())}</strong>.</p>`
    : "";
  const sign = advisorSignature(input.advisor ?? (input.advisorName ? { name: input.advisorName, phone: "", email: "" } : undefined), company);
  const help = companyHelp(input.companyPhone);
  const subject = "Your application link expires soon";
  const term = input.months > 0 ? `${input.months}-month certificate` : "promotional certificate";
  const text = [`Dear ${name},`, `Your ${term} application link expires in about 2 hours.`, input.promoCode ? `Promotional code: ${input.promoCode}` : "", input.link ? `Open the application\n${input.link}` : ""].filter(Boolean).join("\n\n");
  const html = `<!DOCTYPE html>
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
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">The link for your ${escapeHtml(term)}${input.months > 0 && apy && apy !== "—" ? ` at ${escapeHtml(apy)} APY` : ""} is still open, and it expires in about 2 hours. Use the button below to finish the application. ${input.months > 0 ? "" : "Choose the promotional term on the form."}</p>
        ${code}
        <p style="margin:18px 0 0 0;">${button}</p>
        <div style="margin:12px 0 0 0;">${sign.html}</div>
      </td></tr>
      <tr><td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
        <p style="margin:0 0 4px 0; font-size:14px; font-weight:700;">We’re here to help.</p>
        <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  return { subject, text, html };
}

export function leadRatesChart(terms: { months: number; apy: string }[], offer: PromoOffer) {
  const months = [...new Set(offer.tiers.flatMap((tier) => tier.months))].sort((a, b) => a - b);
  const textRows = offer.tiers.map((tier) => `${amountRange(tier)} · additional bonus ${formatBonus(tier.bonusPercent)} · total promotional APY ${promotionalTotal(terms, tier.months, tier.bonusPercent, "text")}`);
  const body = offer.tiers
    .map((tier) => `<tr><td style="padding:8px;border:1px solid #e0e0e0;">${escapeHtml(amountRange(tier))}</td><td style="padding:8px;border:1px solid #e0e0e0;text-align:right;">${escapeHtml(formatBonus(tier.bonusPercent))}</td><td style="padding:8px;border:1px solid #e0e0e0;text-align:right;"><strong>${promotionalTotal(terms, tier.months, tier.bonusPercent)}</strong></td></tr>`)
    .join("");
  const html = months.length && offer.tiers.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;"><tr><th style="padding:8px;border:1px solid #e0e0e0;text-align:left;color:#12315c;">Qualifying Deposit</th><th style="padding:8px;border:1px solid #e0e0e0;text-align:right;color:#12315c;">Additional Bonus</th><th style="padding:8px;border:1px solid #e0e0e0;text-align:right;color:#12315c;">Total Promotional APY</th></tr>${body}</table>`
    : `<p style="margin:0;font-size:14px;color:#3d3d3d;">Promotional rates are not published yet.</p>`;
  return { text: textRows.join("\n"), html };
}

function promotionalTotal(terms: { months: number; apy: string }[], months: number[], bonusPercent: number, mode: "html" | "text" = "html") {
  const labeled = terms
    .filter((term) => months.includes(term.months))
    .map((term) => ({ months: term.months, total: finalApy(term.apy, bonusPercent) }));
  if (!labeled.length) return "—";
  const unique = [...new Set(labeled.map((item) => item.total))];
  if (unique.length === 1) return escapeHtml(unique[0] || "—");
  const lines = labeled.map((item) => `${item.total} (${item.months}-mo)`);
  return mode === "text" ? lines.join(", ") : lines.map((line) => escapeHtml(line)).join("<br>");
}

function finalApy(apy: string, bonusPercent: number) {
  const final = parseApy(apy) * 100 + bonusPercent;
  const digits = Math.round(final * 1000) % 10 === 0 ? 2 : 3;
  return `${final.toFixed(digits)}%`;
}

const EXTENSION_RATES = [
  ["$100,000 – $174,999", "+0.75%", "5.25% APY"],
  ["$175,000 – $249,999", "+0.99%", "5.49% APY"],
  ["$250,000 – $499,999", "+1.125%", "5.625% APY"],
  ["$500,000 and above", "+1.25%", "5.75% APY"],
] as const;

export type ExtensionCopy = {
  subject: string;
  announce: string;
  base: string;
  flexibility: string;
  opportunity: string;
  contact: string;
  urgency: string;
  closing: string;
};

export function defaultExtensionCopy(): ExtensionCopy {
  return {
    subject: "Our New Account Promotional CD Offer is extended through November 6",
    announce: "We are pleased to announce that our New Account Promotional CD Offer has been extended through **Friday, November 6 (the end of this week)**, and we've increased our rates on both our **10-month and 22-month CD terms**!",
    base: "Both terms now feature a base rate of **4.50% APY**, with additional New Account Promotional Bonuses available based on your deposit amount.",
    flexibility: "These promotional rates are available on both the 10-month and 22-month terms, giving you the flexibility to choose the maturity period that best fits your financial objectives.",
    opportunity: "If you've been considering taking advantage of our high-yield CD offerings, this is an excellent opportunity to secure an enhanced rate while our promotion remains available.",
    contact: "To learn more or get started, simply reply to this email or call the 1-800 number listed below to speak directly with one of our representatives. We would be happy to walk you through the available options and assist with the application process.",
    urgency: "**With the promotion ending this Friday, November 6, we encourage you to reach out before the end of this week to take advantage of these enhanced rates.**",
    closing: "We look forward to hearing from you!",
  };
}

export function extensionLetter(input: { leadName: string; company: string; advisor?: MailAdvisor; logo?: string | null; portalUrl?: string; companyPhone?: string; copy?: ExtensionCopy | null }) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const fallback = defaultExtensionCopy();
  const copy = input.copy;
  const subject = copy?.subject.trim() || fallback.subject;
  const announce = copy?.announce.trim() || fallback.announce;
  const base = copy?.base.trim() || fallback.base;
  const flexibility = copy?.flexibility.trim() || fallback.flexibility;
  const opportunity = copy?.opportunity.trim() || fallback.opportunity;
  const contact = copy?.contact.trim() || fallback.contact;
  const urgency = copy?.urgency.trim() || fallback.urgency;
  const closing = copy?.closing.trim() || fallback.closing;
  const logo = emailLogoSrc(input.logo, input.portalUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">`
    : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
  const sign = advisorSignature(input.advisor, company);
  const help = companyHelp(input.companyPhone);
  const rows = EXTENSION_RATES.map((row, index) => {
    const last = index === EXTENSION_RATES.length - 1;
    const background = last ? "#e7f3fb" : index % 2 ? "#f7fbfe" : "#ffffff";
    const rule = last ? "" : "border-bottom:1px solid #e7eef4;";
    return `<tr>
      <td style="padding:11px 14px; background:${background}; ${rule}">${escapeHtml(row[0])}</td>
      <td align="right" style="padding:11px 14px; background:${background}; ${rule} font-weight:700; color:#12315c;">${escapeHtml(row[1])}</td>
      <td align="right" style="padding:11px 14px; background:${background}; ${rule} font-weight:700; color:#006fcf;">${escapeHtml(row[2])}</td>
    </tr>`;
  }).join("");
  const paragraph = (value: string) => `<p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${richText(value)}</p>`;
  const text = [`Dear ${name},`, stripMarks(announce), stripMarks(base), "New Account Promotional Rates", ...EXTENSION_RATES.map((row) => `${row[0]} · ${row[1]} · ${row[2]}`), stripMarks(flexibility), stripMarks(opportunity), stripMarks(contact), stripMarks(urgency), stripMarks(closing), sign.text, input.companyPhone?.trim() ? `We're here to help. Call ${input.companyPhone.trim()}.` : ""].filter(Boolean).join("\n\n");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">The New Account Promotional CD Offer is extended through Friday, November 6. 10-month and 22-month CDs now start at 4.50% APY.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
        <tr><td style="background:#006fcf; padding:16px 32px;">${mark}</td></tr>
        <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 36px 8px 36px;">
          <p style="margin:0 0 4px 0; font-size:13px; letter-spacing:1.2px; text-transform:uppercase; color:#006fcf; font-weight:700;">New account promotional CD</p>
          <h1 style="margin:0; font-size:26px; line-height:32px; color:#12315c;">Extended through November 6</h1>
          <p style="margin:16px 0 0 0; font-size:15px; line-height:23px;">Dear ${escapeHtml(name)},</p>
          ${paragraph(announce)}
          ${paragraph(base)}
          <p style="margin:22px 0 10px 0; font-size:18px; font-weight:700; color:#12315c;">New Account Promotional Rates</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d6e4ef;">
            <tr>
              <td style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700;">Qualifying Deposit</td>
              <td align="right" style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700;">Additional Bonus</td>
              <td align="right" style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700;">Total Promotional APY</td>
            </tr>
            ${rows}
          </table>
          ${paragraph(flexibility)}
          ${paragraph(opportunity)}
          ${paragraph(contact)}
          ${paragraph(urgency)}
          ${paragraph(closing)}
          <div style="margin:12px 0 0 0;">${sign.html}</div>
        </td></tr>
        <tr><td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
          <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#ffffff;">We’re here to help.</p>
          <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
        </td></tr>
        <tr><td style="padding:16px 36px 22px 36px; background:#f7fbfe;">
          <p style="margin:0; font-size:11px; line-height:16px; color:#5a6a7a;">Promotional rates are for new accounts on the 10-month and 22-month certificates and are available through Friday, November 6. A penalty may be imposed for early withdrawal. Offer subject to account requirements and availability.</p>
          <p style="margin:8px 0 0 0; font-size:11px; line-height:16px; color:#8a9aaa;">${companyCredit(company)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return { subject, text, html };
}

export type HtrCopy = {
  subject: string;
  opening: string;
  offer: string;
  decline: string;
  closing: string;
};

export function defaultHtrCopy(): HtrCopy {
  return {
    subject: "Following Up on Your CD Information Request",
    opening: "We are reaching out regarding the Certificate of Deposit (CD) information request you recently submitted through our online inquiry form. We have attempted to connect with you to discuss the high-yield CD options currently available but have not yet been able to reach you.",
    offer: "If you are still exploring CD opportunities, we would be happy to speak with you and review the options available. Please reply to this email with the best day, time, and phone number to reach you, or feel free to contact us directly at the number below.",
    decline: "If you have already found a CD solution that meets your needs or are no longer interested at this time, simply reply to this email and let us know. We will update our records and remove you from our follow-up list.",
    closing: "We appreciate your interest and look forward to the opportunity to assist you.",
  };
}

export function htrLetter(input: { leadName: string; company: string; advisor?: MailAdvisor; logo?: string | null; portalUrl?: string; companyPhone?: string; copy?: HtrCopy | null; link?: string; schedule?: boolean }) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const fallback = defaultHtrCopy();
  const copy = input.copy;
  const subject = copy?.subject.trim() || fallback.subject;
  const opening = copy?.opening.trim() || fallback.opening;
  const offer = copy?.offer.trim() || fallback.offer;
  const decline = copy?.decline.trim() || fallback.decline;
  const closing = copy?.closing.trim() || fallback.closing;
  const link = input.schedule ? input.link?.trim() || "" : "";
  const ask = input.schedule ? "Use the button below to ask for a call. Include the best day, time, time zone, and phone number, and an advisor will call you." : "";
  const logo = emailLogoSrc(input.logo, input.portalUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">`
    : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
  const sign = advisorSignature(input.advisor, company, { closing: "Sincerely" });
  const help = companyHelp(input.companyPhone);
  const paragraph = (value: string) => `<p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${richText(value)}</p>`;
  const button = link
    ? mailButton(link, "Request an advisor call", "16px 0 0")
    : "";
  const text = [`Dear ${name},`, stripMarks(opening), stripMarks(offer), ask, link ? `Request an advisor call: ${link}` : "", stripMarks(decline), stripMarks(closing), sign.text, input.companyPhone?.trim() ? `We're here to help. Call ${input.companyPhone.trim()}.` : ""].filter(Boolean).join("\n\n");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">Following up on your Certificate of Deposit information request.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
        <tr><td style="background:#006fcf; padding:16px 32px;">${mark}</td></tr>
        <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 36px 8px 36px;">
          <p style="margin:0 0 4px 0; font-size:13px; letter-spacing:1.2px; text-transform:uppercase; color:#006fcf; font-weight:700;">Certificate of Deposit</p>
          <h1 style="margin:0; font-size:26px; line-height:32px; color:#12315c;">Following up on your request</h1>
          <p style="margin:16px 0 0 0; font-size:15px; line-height:23px;">Dear ${escapeHtml(name)},</p>
          ${paragraph(opening)}
          ${paragraph(offer)}
          ${input.schedule ? paragraph(ask) : ""}
          ${button}
          ${paragraph(decline)}
          ${paragraph(closing)}
          <div style="margin:12px 0 0 0;">${sign.html}</div>
        </td></tr>
        <tr><td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
          <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#ffffff;">We’re here to help.</p>
          <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
        </td></tr>
        <tr><td style="padding:16px 36px 22px 36px; background:#f7fbfe;">
          <p style="margin:0; font-size:11px; line-height:16px; color:#8a9aaa;">${companyCredit(company)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return { subject, text, html };
}

function sampleHtrLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  return htrLetter({ leadName: "Jonah Hale", company: DEFAULT_COMPANY_NAME, portalUrl, advisor, companyPhone }).html;
}

function sampleHtrCallLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  const base = (portalUrl || "").trim().replace(/\/$/, "");
  return htrLetter({ leadName: "Jonah Hale", company: DEFAULT_COMPANY_NAME, portalUrl, advisor, companyPhone, schedule: true, link: `${base || "https://preview.local"}/call?token=preview` }).html;
}

export type FollowupCopy = {
  subject: string;
  opening: string;
  proceed: string;
  formTitle: string;
  expireTitle: string;
  expire: string;
  time: string;
  assist: string;
  urge: string;
  changeTitle: string;
  change: string;
  other: string;
  thanks: string;
  codeNote: string;
  promoCode: string;
};

export function defaultFollowupCopy(): FollowupCopy {
  return {
    subject: "Follow-Up: 10 & 22 Month Promotional CD Opportunities",
    opening: "We are following up regarding the **10 & 22 Month Promotional CD Rates** we previously discussed with you.",
    proceed: "To move forward and secure the promotional terms discussed, please complete and return the application form below. Once received and processed, we can proceed with establishing your account and securing the applicable promotional rate for your selected term.",
    formTitle: "Application Form — Please Complete and Return",
    expireTitle: "Important: Application Expiration & Assistance",
    expire: "Please note that the application form will expire **48 hours** after it is issued.",
    time: "If you need additional time to complete the application, simply let us know when you expect to be available, and we can arrange to have it sent closer to your preferred time.",
    assist: "If you would prefer assistance from a representative, please provide your preferred date and time, and we will arrange for someone from our team to reach out and walk you through the application process.",
    urge: "We encourage you to complete the application at your earliest convenience, as promotional rates are subject to availability and may change without notice.",
    changeTitle: "Need a Different Term or Have Your Plans Changed?",
    change: "We understand that financial plans and priorities can change. If the **10-month or 22-month term** is no longer what you are looking for, please let us know. We may have other promotional CD options available that better suit your needs.",
    other: "If you have decided not to proceed at this time, simply reply to this email so we can update our records accordingly. We appreciate the opportunity to assist you and would welcome the opportunity to reconnect in the future.",
    thanks: "Thank you for your time and consideration. We look forward to assisting you.",
    codeNote: "Enter this code on the application to apply the promotional rate.",
    promoCode: "",
  };
}

export function followupLetter(input: {
  leadName: string;
  company: string;
  advisor?: MailAdvisor;
  logo?: string | null;
  portalUrl?: string;
  companyPhone?: string;
  copy?: FollowupCopy | null;
  promoCode?: string;
  link?: string;
  kicker?: string;
  title?: string;
  trust?: boolean;
}) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const fallback = defaultFollowupCopy();
  const copy = input.copy;
  const pick = (value: string | undefined, standard: string) => value?.trim() || standard;
  const subject = pick(copy?.subject, fallback.subject);
  const opening = pick(copy?.opening, fallback.opening);
  const proceed = pick(copy?.proceed, fallback.proceed);
  const formTitle = pick(copy?.formTitle, fallback.formTitle);
  const expireTitle = pick(copy?.expireTitle, fallback.expireTitle);
  const expire = pick(copy?.expire, fallback.expire);
  const time = pick(copy?.time, fallback.time);
  const assist = pick(copy?.assist, fallback.assist);
  const urge = pick(copy?.urge, fallback.urge);
  const changeTitle = pick(copy?.changeTitle, fallback.changeTitle);
  const change = pick(copy?.change, fallback.change);
  const other = pick(copy?.other, fallback.other);
  const thanks = pick(copy?.thanks, fallback.thanks);
  const codeNote = pick(copy?.codeNote, fallback.codeNote);
  const promoCode = (input.promoCode || copy?.promoCode || "").trim();
  const link = input.link?.trim() || "";
  const logo = emailLogoSrc(input.logo, input.portalUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">`
    : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
  const sign = advisorSignature(input.advisor, company, { closing: "Sincerely" });
  const help = companyHelp(input.companyPhone);
  const paragraph = (value: string) => value.trim() ? `<p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${richText(value)}</p>` : "";
  const heading = (value: string) => `<p style="margin:22px 0 0 0; font-size:18px; line-height:24px; font-weight:700; color:#12315c;">${richText(value)}</p>`;
  const button = link
    ? mailButton(link, "Click here for application", "10px 0 0")
    : "";
  const codeBox = promoCode
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px; background:#e7f3fb; border-left:4px solid #006fcf;"><tr><td style="padding:16px 18px;">
        <p style="margin:0 0 4px 0; font-size:12px; font-weight:700; letter-spacing:0.8px; color:#006fcf;">PROMOTIONAL CODE</p>
        <p style="margin:0; font-size:22px; font-weight:700; letter-spacing:1px; color:#12315c;">${escapeHtml(promoCode)}</p>
        <p style="margin:8px 0 0 0; font-size:14px; line-height:21px; color:#333333;">${escapeHtml(codeNote)}</p>
      </td></tr></table>`
    : "";
  const trust = input.trust ? trustBlocks() : null;
  const text = [
    `Dear ${name},`,
    stripMarks(opening),
    stripMarks(proceed),
    stripMarks(formTitle),
    link ? `Click here for application: ${link}` : "",
    promoCode ? `Promotional code: ${promoCode}` : "",
    codeNote,
    stripMarks(expireTitle),
    stripMarks(expire),
    stripMarks(time),
    stripMarks(assist),
    stripMarks(urge),
    stripMarks(changeTitle),
    stripMarks(change),
    stripMarks(other),
    stripMarks(thanks),
    sign.text,
    input.companyPhone?.trim() ? `We're here to help. Call ${input.companyPhone.trim()}.` : "",
    trust?.text || "",
  ].filter(Boolean).join("\n\n");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">Your 10 and 22 month promotional CD application is ready and expires in 48 hours.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
        <tr><td style="background:#006fcf; padding:16px 32px;">${mark}</td></tr>
        <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 36px 24px 36px;">
          <p style="margin:0 0 4px 0; font-size:13px; letter-spacing:1.2px; ${input.trust ? "" : "text-transform:uppercase; "}color:#006fcf; font-weight:700;">${escapeHtml(input.kicker?.trim() || "Promotional certificate")}</p>
          <h1 style="margin:0; font-size:26px; line-height:32px; color:#12315c;">${escapeHtml(input.title?.trim() || "10 & 22 month application")}</h1>
          <p style="margin:16px 0 0 0; font-size:15px; line-height:23px;">Dear ${escapeHtml(name)},</p>
          ${paragraph(opening)}
          ${paragraph(proceed)}
          ${heading(formTitle)}
          ${button}
          ${codeBox}
          ${heading(expireTitle)}
          ${paragraph(expire)}
          ${paragraph(time)}
          ${paragraph(assist)}
          ${paragraph(urge)}
          ${heading(changeTitle)}
          ${paragraph(change)}
          ${paragraph(other)}
          ${paragraph(thanks)}
          <div style="margin:12px 0 0 0;">${sign.html}</div>
        </td></tr>
        <tr><td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
          <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#ffffff;">We’re here to help.</p>
          <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
        </td></tr>
        ${trust ? `<tr><td style="padding:8px 30px 18px 30px; background:#ffffff;">${trust.html}</td></tr>` : ""}
        <tr><td style="padding:16px 36px 22px 36px; background:#f7fbfe;">
          <p style="margin:0; font-size:11px; line-height:16px; color:#5a6a7a;">Each application link expires 48 hours after this email is sent. Promotional rates are subject to availability and may change. A penalty may be imposed for early withdrawal.</p>
          <p style="margin:8px 0 0 0; font-size:11px; line-height:16px; color:#8a9aaa;">${companyCredit(company)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return { subject, text, html };
}

function sampleFollowupLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  const base = applicationUrl(portalUrl);
  return followupLetter({
    leadName: "Jonah Hale",
    company: DEFAULT_COMPANY_NAME,
    portalUrl,
    advisor,
    companyPhone,
    promoCode: "CDPROMO",
    link: base || "#",
  }).html;
}

export function defaultPromoReminderCopy(): FollowupCopy {
  return {
    ...defaultFollowupCopy(),
    subject: "Follow-Up: 10 & 22 Month Promotional CD Opportunities",
    opening: "This is a reminder regarding the **10- and 22-Month Promotional CD Rates** we previously discussed with you.",
  };
}

export function promoReminderLetter(input: {
  leadName: string;
  company: string;
  advisor?: MailAdvisor;
  logo?: string | null;
  portalUrl?: string;
  companyPhone?: string;
  copy?: FollowupCopy | null;
  promoCode?: string;
  link?: string;
}) {
  const base = defaultPromoReminderCopy();
  const copy = input.copy;
  const merged = copy
    ? {
        subject: copy.subject.trim() || base.subject,
        opening: copy.opening.trim() || base.opening,
        proceed: copy.proceed.trim() || base.proceed,
        formTitle: copy.formTitle.trim() || base.formTitle,
        expireTitle: copy.expireTitle.trim() || base.expireTitle,
        expire: copy.expire.trim() || base.expire,
        time: copy.time.trim() || base.time,
        assist: copy.assist.trim() || base.assist,
        urge: copy.urge.trim() || base.urge,
        changeTitle: copy.changeTitle.trim() || base.changeTitle,
        change: copy.change.trim() || base.change,
        other: copy.other.trim() || base.other,
        thanks: copy.thanks.trim() || base.thanks,
        codeNote: copy.codeNote.trim() || base.codeNote,
        promoCode: copy.promoCode.trim(),
      }
    : base;
  return followupLetter({
    ...input,
    copy: merged,
    kicker: "10- and 22-Month promotional CD",
    title: "Application reminder",
    trust: true,
  });
}

function samplePromoReminderLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  const base = applicationUrl(portalUrl);
  return promoReminderLetter({
    leadName: "Jonah Hale",
    company: DEFAULT_COMPANY_NAME,
    portalUrl,
    advisor,
    companyPhone,
    promoCode: "CDPROMO",
    link: base || "#",
  }).html;
}

export function accountReadyLetter(input: {
  leadName: string;
  company: string;
  amount: string;
  apy: string;
  months: number;
  advisor?: MailAdvisor;
  logo?: string | null;
  portalUrl?: string;
  companyPhone?: string;
}) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const subject = "Status Update: Promotional CD Application";
  const amount = formatAccountAmount(input.amount);
  const apy = formatAccountApy(input.apy);
  const term = `${input.months}-Month CD`;
  const established = `Your Promotional CD account for the amount of ${amount}, with a ${apy} APY - ${term}, has now been successfully established and is ready for funding.`;
  const logo = emailLogoSrc(input.logo, input.portalUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">`
    : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
  const sign = advisorSignature(input.advisor, company, { closing: "Sincerely" });
  const help = companyHelp(input.companyPhone);
  const text = [
    `Dear ${name},`,
    "This email is to confirm that your application for the Promotional CD account, along with the photo identification have been received and approved.",
    established,
    "Once you confirm that you are ready to proceed, we will provide the funding instructions and one of our Senior Advisors will assist you through the process.",
    sign.text,
    input.companyPhone?.trim() ? `We're here to help. Call ${input.companyPhone.trim()}.` : "",
  ].filter(Boolean).join("\n\n");
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">Your application and photo identification have been received. The promotional CD account is ready for funding.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;"><tr><td align="center" style="padding:20px 10px;">
    <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
      <tr><td style="background:#006fcf; padding:16px 32px;">${mark}</td></tr>
      <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 36px 24px 36px;">
        <p style="margin:0; font-size:13px; letter-spacing:1.2px; text-transform:uppercase; color:#006fcf; font-weight:700;">Promotional CD</p>
        <h1 style="margin:8px 0 0 0; font-size:26px; line-height:32px; color:#12315c;">Application and identification completed</h1>
        <p style="margin:16px 0 0 0; font-size:15px; line-height:23px;">Dear ${escapeHtml(name)},</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">This email is to confirm that your application for the Promotional CD account, along with the photo identification have been received and approved.</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">Your Promotional CD account for the amount of <strong>${escapeHtml(amount)}</strong>, with a <strong>${escapeHtml(apy)} APY</strong> - <strong>${escapeHtml(term)}</strong>, has now been successfully established and is ready for funding.</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">Once you confirm that you are ready to proceed, we will provide the funding instructions and one of our Senior Advisors will assist you through the process.</p>
        <div style="margin:12px 0 0 0;">${sign.html}</div>
      </td></tr>
      <tr><td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
        <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#ffffff;">We’re here to help.</p>
        <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
      </td></tr>
      <tr><td style="padding:16px 36px 22px 36px; background:#f7fbfe;">
        <p style="margin:0; font-size:11px; line-height:16px; color:#5a6a7a;">This notice confirms receipt and approval of the application and photo identification. Funding instructions are sent only after you confirm that you are ready to proceed. A penalty may apply to an early withdrawal.</p>
        <p style="margin:8px 0 0 0; font-size:11px; line-height:16px; color:#8a9aaa;">${companyCredit(company)}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  return { subject, text, html };
}

function formatAccountAmount(raw: string) {
  const cleaned = raw.trim().replace(/[$\s]/g, "");
  const grouped = cleaned.includes(",") ? /^\d{1,3}(,\d{3})+(\.\d{1,2})?$/ : /^\d+(\.\d{1,2})?$/;
  if (!grouped.test(cleaned)) return raw.trim() || "$0";
  const value = Number(cleaned.replace(/,/g, ""));
  if (!Number.isFinite(value)) return raw.trim();
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value % 1 ? 2 : 0 });
}

function formatAccountApy(raw: string) {
  const value = raw.trim().replace(/\s*APY/i, "").replace(/%/g, "");
  return value ? `${value}%` : "—";
}

function sampleAccountReadyLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  return accountReadyLetter({
    leadName: "Jonah Hale",
    company: DEFAULT_COMPANY_NAME,
    portalUrl,
    advisor,
    companyPhone,
    amount: "500000",
    apy: "5.5%",
    months: 10,
  }).html;
}

export type CdHolding = {
  months: number;
  openedOn: string;
  apy: string;
  principal: number;
};

export function cdPortfolioValue(principal: number, apy: string, openedOn: string, asOf: string, months: number) {
  const rate = Number(String(apy).replace(/[^0-9.]/g, ""));
  const clean = roundCents(principal);
  if (!Number.isFinite(clean) || !Number.isFinite(rate) || !openedOn || !asOf) return { current: clean || 0, interest: 0 };
  const maturity = addCalendarMonths(openedOn, months);
  const open = Date.parse(`${openedOn.slice(0, 10)}T00:00:00.000Z`);
  const end = Date.parse(`${asOf.slice(0, 10)}T00:00:00.000Z`);
  const mature = maturity ? Date.parse(`${maturity}T00:00:00.000Z`) : end;
  if (!Number.isFinite(open) || !Number.isFinite(end) || end <= open) return { current: clean, interest: 0 };
  const capped = Math.min(end, Number.isFinite(mature) ? mature : end);
  const days = Math.max(0, Math.round((capped - open) / 86400000));
  const current = roundCents(clean * Math.pow(1 + rate / 100 / 365, days));
  return { current, interest: roundCents(current - clean) };
}

function roundCents(value: number) {
  return Math.round(value * 100) / 100;
}

function portfolioMoney(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function cdUpdateLetter(input: {
  leadName: string;
  company: string;
  asOf: string;
  holdings: CdHolding[];
  advisor?: MailAdvisor;
  logo?: string | null;
  portalUrl?: string;
  companyPhone?: string;
}) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const asOf = formatLongDate(input.asOf);
  const subject = `Update on Your CD Portfolio as of ${asOf}`;
  const rows = input.holdings
    .filter((item) => item.months > 0 && Number.isFinite(item.principal))
    .map((item) => {
      const value = cdPortfolioValue(item.principal, item.apy, item.openedOn, input.asOf, item.months);
      return {
        name: `${item.months}-Month CD`,
        opened: formatLongDate(item.openedOn),
        term: `${item.months} months`,
        rate: formatAccountApy(item.apy),
        principal: roundCents(item.principal),
        current: value.current,
        interest: value.interest,
      };
    });
  const totals = rows.reduce((sum, row) => ({
    principal: roundCents(sum.principal + row.principal),
    current: roundCents(sum.current + row.current),
    interest: roundCents(sum.interest + row.interest),
  }), { principal: 0, current: 0, interest: 0 });
  const intro = `As requested, I have provided you with a quick update on your current Certificates of Deposit (CDs) held with ${company} as of ${asOf}.`;
  const close = "Please let me know if you’d like to discuss purchasing an additional CD or if you’d like me to prepare projections through each maturity date.";
  const message = [
    intro,
    "",
    "CD | Open Date | Term | Rate | Principal | Interest Earned | Current Value",
    ":--- | :--- | :--- | ---: | ---: | ---: | ---:",
    ...rows.map((row) => `${row.name} | ${row.opened} | ${row.term} | ${row.rate} | ${portfolioMoney(row.principal)} | ${portfolioMoney(row.interest)} | ${portfolioMoney(row.current)}`),
    `**Total** |  |  |  | **${portfolioMoney(totals.principal)}** | **${portfolioMoney(totals.interest)}** | **${portfolioMoney(totals.current)}**`,
    "",
    close,
  ].join("\n");
  const advisor = input.advisor || { name: "Your advisor", phone: "", email: "", role: "" };
  const letter = advisorNoteLetter({
    company,
    companyPhone: input.companyPhone,
    logo: input.logo,
    pageUrl: input.portalUrl,
    advisor,
    greeting: `Dear ${name},`,
    message,
  });
  return { subject, text: letter.text, html: letter.html, message };
}

function formatLongDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso || "—";
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function addCalendarMonths(iso: string, months: number) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day || !months) return "";
  return new Date(Date.UTC(year, month - 1 + months, day)).toISOString().slice(0, 10);
}

export type ExclusiveCopy = {
  subject: string;
  title: string;
  yieldLine: string;
  intro: string;
  both: string;
  enhance: string;
  windowNote: string;
  fdic: string;
  readyTitle: string;
  ready: string;
  start: string;
  urge: string;
  closing: string;
  codeNote: string;
  promoCode: string;
  disclosures: string;
};

export function defaultExclusiveCopy(name = "Promo rates 250+"): ExclusiveCopy {
  return {
    subject: "Exclusive new-client CD promotion",
    title: name,
    yieldLine: "Earn up to **{{apy}}** Annual Percentage Yield (APY)",
    intro: "Thank you for your interest in {{company}}. Based on your interest, I wanted to share our current New-Client Promotional CD Offer, which features fixed rates and additional promotional rate enhancements for qualifying new deposits.",
    both: "Both {{terms}} are available, with total promotional APYs of up to **{{apy}}**, depending on the qualifying deposit amount.",
    enhance: "Qualifying deposits are eligible for an additional rate enhancement based on the total deposit amount. The applicable enhancement is reflected in the total promotional APY shown below.",
    windowNote: "Promotional offer valid {{window}}. Promotional APYs are available to qualifying new clients meeting applicable new-money and deposit requirements. Rates and availability are subject to change.",
    fdic: "All deposits placed at {{company}} are covered by the standard FDIC insurance amount of $250,000 per customer. If your deposits exceed this amount, we can help you unlock more insurance protection for greater peace of mind. We'll split your deposit into increments less than $250,000 and place these funds across our network of well-capitalized banks. By doing this, your entire deposit remains fully protected, while you continue to work with just one bank.",
    readyTitle: "Ready to secure your promotional rate?",
    ready: "If you are considering taking advantage of this offer, I would be happy to help you identify the most suitable term and promotional rate based on your intended deposit amount.",
    start: "**To get started, simply reply to this email with the approximate amount you are considering depositing and your preferred CD term ({{termChoice}}).** I can then walk you through the next steps and assist with getting your application underway.",
    urge: "Promotional rates are subject to availability and may change during the offer period, so I encourage you to reach out while the current promotion is available.",
    closing: "I look forward to helping you take advantage of this opportunity.",
    codeNote: "Enter this code on the application to apply the promotional rate.",
    promoCode: "",
    disclosures: "**Annual Percentage Yield (APY):** The advertised APYs reflect the annualized yield based on the applicable interest rate and compounding method. The total promotional APY is determined by the qualifying deposit amount and applicable promotional terms.\n\n**Interest Rate:** The interest rate is fixed for the selected CD term, subject to the applicable account agreement and promotional terms.\n\n**Early Withdrawal Penalty:** An early withdrawal penalty applies to withdrawals made before maturity. The applicable penalty is described in the account agreement and Truth in Savings disclosures. Early withdrawal may reduce earnings.\n\n**Minimum Deposit:** A minimum opening deposit of {{minimum}} in qualifying new funds is required.\n\n**Promotional Eligibility:** The promotional offer is available to qualifying new clients from {{window}}. Applicable deposit requirements and promotional eligibility must be satisfied.\n\n**FDIC Coverage:** FDIC insurance is subject to applicable coverage limits and ownership rules. Deposits held in the same ownership category at the same insured institution are generally aggregated.\n\nPlease review the applicable account agreement and Truth in Savings disclosures for complete account terms and conditions.",
  };
}

export function exclusiveLetter(input: {
  leadName: string;
  company: string;
  terms: { months: number; apy: string }[];
  offer: PromoOffer;
  advisor?: MailAdvisor;
  logo?: string | null;
  portalUrl?: string;
  companyPhone?: string;
  minimum?: string;
  link?: string;
  promoCode?: string;
  copy?: ExclusiveCopy | null;
  months?: number[];
  fdicStyle?: "added" | "standard";
}) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const fallback = defaultExclusiveCopy();
  const copy = input.copy;
  const pick = (value: string | undefined, standard: string) => value?.trim() || standard;
  const months = chosenMonths([...new Set(input.offer.tiers.flatMap((tier) => tier.months))].sort((a, b) => a - b), input.months);
  const cards = months.map((month) => {
    const term = input.terms.find((item) => item.months === month);
    return { month, apy: (term?.apy || "—").replace(/\s*APY/i, "").replace(/%/g, "").trim() || "—" };
  });
  const shownTerms = input.terms.filter((term) => months.includes(term.months));
  const maxApy = maxPromotionalApy(shownTerms, {
    ...input.offer,
    tiers: input.offer.tiers.map((tier) => ({ ...tier, months: tier.months.filter((month) => months.includes(month)) })),
  }) || "—";
  const termLabel = cards.length ? cards.map((card) => `${card.month}-month`).join(" and ") + (cards.length === 1 ? " term" : " terms") : "10-month and 22-month terms";
  const termChoice = cards.length === 1
    ? `${cards[0].month} months`
    : cards.length === 2
      ? `${cards[0].month} or ${cards[1].month} months`
      : cards.length
        ? `${cards.slice(0, -1).map((card) => card.month).join(", ")}, or ${cards[cards.length - 1].month} months`
        : "10 or 22 months";
  const window = exclusiveWindow(input.offer);
  const bandFloors = input.offer.tiers
    .map((tier) => tier.minAmount)
    .filter((amount) => Number.isFinite(amount) && amount > 0);
  const minimum = bandFloors.length ? `$${Math.min(...bandFloors).toLocaleString("en-US")}` : input.minimum?.trim() || "$100,000";
  const rateNote = `Minimum opening deposit: ${minimum} in qualifying new funds.`;
  const fillCopy = (value: string) => value
    .replaceAll("{{company}}", company)
    .replaceAll("{{apy}}", maxApy)
    .replaceAll("{{terms}}", termLabel)
    .replaceAll("{{termChoice}}", termChoice)
    .replaceAll("(10 or 22 months)", `(${termChoice})`)
    .replaceAll("{{window}}", window)
    .replaceAll("{{minimum}}", minimum);
  const variantName = input.fdicStyle === "standard" ? "Promo rates" : "Promo rates 250+";
  const stockName = (value: string | undefined) => {
    const text = (value || "").trim();
    return !text || text === "Exclusive new-client CD promotion" || text === "Promo rates" || text === "Promo rates 250+" || text === fallback.subject || text === fallback.title;
  };
  const subject = fillCopy(stockName(copy?.subject) ? "Exclusive new-client CD promotion" : copy!.subject);
  const title = fillCopy(stockName(copy?.title) ? variantName : copy!.title);
  const yieldLine = fillCopy(pick(copy?.yieldLine, fallback.yieldLine)).replaceAll("5.75%", maxApy === "—" ? "5.75%" : maxApy);
  const intro = fillCopy(pick(copy?.intro, fallback.intro));
  const both = fillCopy(pick(copy?.both, fallback.both)).replaceAll("5.75%", maxApy === "—" ? "5.75%" : maxApy);
  const enhance = fillCopy(pick(copy?.enhance, fallback.enhance));
  const windowNote = fillCopy(pick(copy?.windowNote, fallback.windowNote));
  const standardFdic = "Eligible deposits are insured by the Federal Deposit Insurance Corporation (FDIC) up to **$250,000 per depositor, per insured bank, per ownership category**, including principal and accrued interest, subject to applicable FDIC rules.";
  const fdic = fillCopy(input.fdicStyle === "standard" ? standardFdic : pick(copy?.fdic, fallback.fdic));
  const fdicTitle = input.fdicStyle === "standard" ? "FDIC insured" : "Added FDIC Insurance on Your Deposits";
  const readyTitle = fillCopy(pick(copy?.readyTitle, fallback.readyTitle));
  const ready = fillCopy(pick(copy?.ready, fallback.ready));
  const start = fillCopy(pick(copy?.start, fallback.start));
  const urge = fillCopy(pick(copy?.urge, fallback.urge));
  const closing = fillCopy(pick(copy?.closing, fallback.closing));
  const disclosures = fillCopy(pick(copy?.disclosures, fallback.disclosures));
  const logo = emailLogoSrc(input.logo, input.portalUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">`
    : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
  const sign = advisorSignature(input.advisor, company, { closing: "Best regards" });
  const help = companyHelp(input.companyPhone);
  const paragraph = (value: string) => value.trim() ? `<p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${richText(value)}</p>` : "";
  const heading = (value: string) => `<p style="margin:22px 0 0 0; font-size:16px; line-height:22px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase; color:#12315c;">${richText(value)}</p>`;
  const termHeads = cards.map((card) => `<td style="background:#006fcf; color:#ffffff; padding:10px 8px; text-align:center; font-size:12px; font-weight:700; letter-spacing:0.4px;">${card.month}-MONTH CD</td>`).join("");
  const termRates = cards.map((card) => `<td style="background:#f7fbfe; padding:16px 8px; text-align:center; font-size:28px; font-weight:700; color:#12315c;">${escapeHtml(card.apy === "—" ? "—" : `${card.apy}%`)} <span style="font-size:12px; color:#006fcf;">APY</span></td>`).join("");
  const termFixed = cards.map(() => `<td style="padding:8px; text-align:center; font-size:13px; color:#333333; border-top:1px solid #d6e4ef;">Fixed Rate</td>`).join("");
  const termTable = cards.length
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d6e4ef;">
        <tr>${termHeads}</tr>
        <tr>${termRates}</tr>
        <tr>${termFixed}</tr>
      </table>`
    : `<p style="margin:0; font-size:14px; color:#5a6a7a;">Promotional rates are not published yet.</p>`;
  const tierRows = input.offer.tiers.map((tier, index) => {
    const last = index === input.offer.tiers.length - 1;
    const background = last ? "#e7f3fb" : index % 2 ? "#f7fbfe" : "#ffffff";
    const weight = last ? "font-weight:700;" : "";
    const rule = last ? "" : "border-bottom:1px solid #e7eef4;";
    const total = promotionalTotal(input.terms.filter((term) => months.includes(term.months)), tier.months.filter((month) => months.includes(month)), tier.bonusPercent);
    return `<tr>
      <td style="padding:11px 14px; background:${background}; ${rule} ${weight}">${escapeHtml(amountRange(tier))}</td>
      <td align="center" style="padding:11px 14px; background:${background}; ${rule} ${weight} color:#12315c;">${escapeHtml(formatBonus(tier.bonusPercent))}</td>
      <td align="center" style="padding:11px 14px; background:${background}; ${rule} ${weight} color:#006fcf;">${total}</td>
    </tr>`;
  }).join("");
  const disclosureHtml = disclosures.split(/\n{2,}/).map((part) => `<p style="margin:8px 0 0 0; font-size:11px; line-height:16px; color:#5a6a7a;">${richText(part.trim())}</p>`).join("");
  const trust = trustBlocks();
  const text = [
    company,
    "Member FDIC",
    stripMarks(title),
    stripMarks(yieldLine),
    `Dear ${name},`,
    stripMarks(intro),
    stripMarks(both),
    "Available CD terms",
    ...cards.map((card) => `${card.month}-month CD ${card.apy === "—" ? "—" : `${card.apy}%`} APY · Fixed Rate`),
    rateNote,
    "New-client promotional rate enhancements",
    stripMarks(enhance),
    ...input.offer.tiers.map((tier) => `${amountRange(tier)} · ${formatBonus(tier.bonusPercent)} · ${promotionalTotal(input.terms.filter((term) => months.includes(term.months)), tier.months.filter((month) => months.includes(month)), tier.bonusPercent, "text")}`),
    stripMarks(windowNote),
    fdicTitle,
    stripMarks(fdic),
    stripMarks(readyTitle),
    stripMarks(ready),
    stripMarks(start),
    stripMarks(urge),
    stripMarks(closing),
    sign.text,
    trust.text,
    "Account terms and disclosures",
    stripMarks(disclosures),
  ].filter(Boolean).join("\n\n");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${escapeHtml(stripMarks(title))}. Earn up to ${escapeHtml(maxApy)} APY.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
        <tr><td style="background:#006fcf; padding:16px 32px;">
          ${mark}
          <p style="margin:8px 0 0 0; font-size:11px; letter-spacing:0.8px; color:#d6ecfa;">Member FDIC</p>
        </td></tr>
        <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 36px 24px 36px;">
          <p style="margin:0; font-size:13px; letter-spacing:1.2px; text-transform:uppercase; color:#006fcf; font-weight:700;">${richText(title)}</p>
          <h1 style="margin:8px 0 0 0; font-size:26px; line-height:32px; color:#12315c;">${richText(yieldLine)}</h1>
          <p style="margin:16px 0 0 0; font-size:15px; line-height:23px;">Dear ${escapeHtml(name)},</p>
          ${paragraph(intro)}
          ${paragraph(both)}
          ${heading("Available CD terms")}
          <div style="margin-top:12px;">${termTable}</div>
          <p style="margin:12px 0 0 0; font-size:14px; line-height:21px;"><strong>${escapeHtml(rateNote)}</strong></p>
          ${heading("New-client promotional rate enhancements")}
          ${paragraph(enhance)}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px; border:1px solid #d6e4ef;">
            <tr>
              <td style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700;">Qualifying Deposit</td>
              <td align="center" style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700;">Additional Rate</td>
              <td align="center" style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700;">Total Promotional APY</td>
            </tr>
            ${tierRows || `<tr><td colspan="3" style="padding:11px 14px;">No promotional tiers are set.</td></tr>`}
          </table>
          <p style="margin:12px 0 0 0; font-size:13px; line-height:20px; font-style:italic; color:#333333;">${richText(windowNote)}</p>
          ${input.fdicStyle === "standard" ? heading(fdicTitle) : `<p style="margin:22px 0 0 0; font-size:16px; line-height:22px; font-weight:700; color:#12315c;">${escapeHtml(fdicTitle)}</p>`}
          ${paragraph(fdic)}
          ${heading(readyTitle)}
          ${paragraph(ready)}
          ${paragraph(start)}
          ${paragraph(urge)}
          ${paragraph(closing)}
          <div style="margin:12px 0 0 0;">${sign.html}</div>
        </td></tr>
        <tr><td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
          <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#ffffff;">We’re here to help.</p>
          <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
        </td></tr>
        <tr><td style="padding:8px 30px 18px 30px; background:#ffffff;">${trust.html}</td></tr>
        <tr><td style="padding:16px 36px 22px 36px; background:#f7fbfe;">
          <p style="margin:0 0 4px 0; font-size:11px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase; color:#12315c;">Account terms & disclosures</p>
          ${disclosureHtml}
          <p style="margin:12px 0 0 0; font-size:11px; line-height:16px; color:#8a9aaa;">${companyCredit(company)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return { subject, text, html };
}

function maxPromotionalApy(terms: { months: number; apy: string }[], offer: PromoOffer) {
  let best = 0;
  for (const tier of offer.tiers) {
    for (const term of terms) {
      if (!tier.months.includes(term.months)) continue;
      const value = parseApy(term.apy) * 100 + tier.bonusPercent;
      if (value > best) best = value;
    }
  }
  if (!best) return "";
  const digits = Math.round(best * 1000) % 10 === 0 ? 2 : 3;
  return `${best.toFixed(digits)}%`;
}

function exclusiveWindow(offer: PromoOffer) {
  if (!offer.startsOn || !offer.endsOn) return "November 1–30, 2026";
  const start = new Date(`${offer.startsOn.slice(0, 10)}T00:00:00Z`);
  const end = new Date(`${offer.endsOn.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return `${formatOfferDate(offer.startsOn)}–${formatOfferDate(offer.endsOn)}`;
  const startMonth = start.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const endMonth = end.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  if (start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth()) return `${startMonth} ${start.getUTCDate()}–${end.getUTCDate()}, ${start.getUTCFullYear()}`;
  return `${startMonth} ${start.getUTCDate()}, ${start.getUTCFullYear()} – ${endMonth} ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
}

function sampleExclusiveLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string, fdicStyle?: "added" | "standard") {
  return exclusiveLetter({
    leadName: "Jonah Hale",
    company: DEFAULT_COMPANY_NAME,
    portalUrl,
    advisor,
    companyPhone,
    minimum: "$100,000",
    fdicStyle,
    terms: [
      { months: 10, apy: "4.50%" },
      { months: 22, apy: "4.50%" },
    ],
    offer: {
      intro: "",
      protection: "",
      finePrint: "",
      startsOn: "2026-11-01",
      endsOn: "2026-11-30",
      tiers: [
        { id: "a", minAmount: 100000, maxAmount: 174999, bonusPercent: 0.75, months: [10, 22] },
        { id: "b", minAmount: 175000, maxAmount: 249999, bonusPercent: 0.99, months: [10, 22] },
        { id: "c", minAmount: 250000, maxAmount: 499999, bonusPercent: 1.125, months: [10, 22] },
        { id: "d", minAmount: 500000, maxAmount: null, bonusPercent: 1.25, months: [10, 22] },
      ],
    },
  }).html;
}

export function cdarsLetter(input: {
  leadName: string;
  company: string;
  terms: { months: number; apy: string }[];
  advisor?: MailAdvisor;
  logo?: string | null;
  portalUrl?: string;
  companyPhone?: string;
  link?: string;
}) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const subject = "Certificate of Deposit Account Registry Service (CDARS)";
  const terms = input.terms.filter((term) => term.apy.trim());
  const logo = emailLogoSrc(input.logo, input.portalUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">`
    : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
  const sign = advisorSignature(input.advisor, company, { closing: "Sincerely" });
  const help = companyHelp(input.companyPhone);
  const link = input.link?.trim() || "";
  const button = link
    ? mailButton(link, "Click here for application", "16px 0 0")
    : "";
  const heads = terms.map((term) => `<td style="background:#006fcf; color:#ffffff; padding:10px 8px; text-align:center; font-size:12px; font-weight:700;">${term.months}-MONTH</td>`).join("");
  const rates = terms.map((term) => `<td style="background:#f7fbfe; padding:16px 8px; text-align:center; font-size:22px; font-weight:700; color:#12315c;">${escapeHtml(term.apy.replace(/\s*APY/i, "").replace(/%/g, ""))}% <span style="font-size:12px; color:#006fcf;">APY</span></td>`).join("");
  const fixed = terms.map(() => `<td style="padding:8px; text-align:center; font-size:13px; color:#333333; border-top:1px solid #d6e4ef;">Fixed rate</td>`).join("");
  const table = terms.length
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px; border:1px solid #d6e4ef;"><tr>${heads}</tr><tr>${rates}</tr><tr>${fixed}</tr></table>`
    : `<p style="margin:12px 0 0 0; font-size:14px;">CDARS rates are not set yet.</p>`;
  const text = [
    `Dear ${name},`,
    "Looking for the security of a certificate of deposit, with FDIC insurance across more than one bank? CDARS may be the right placement.",
    "CDARS is an FDIC-insured certificate program. It places $500,000 to $50 million in certificates held at other FDIC-insured banks.",
    "Your funds are allocated so the amount at any one bank, including interest paid at maturity, stays within FDIC coverage — currently $250,000 per depositor, per institution.",
    "Terms are 1, 3, 6, and 12 months. You may name banks to exclude. One statement covers the whole placement.",
    ...terms.map((term) => `${term.months}-month CDARS ${term.apy} APY`),
    "One competitive rate is paid on the entire amount. The rate is fixed. Interest is compounded daily and paid at maturity. Early withdrawal is subject to a penalty.",
    link ? `Click here for application: ${link}` : "",
    sign.text,
  ].filter(Boolean).join("\n\n");
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">CDARS places $500,000 to $50 million in FDIC-insured certificates across banks.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;"><tr><td align="center" style="padding:20px 10px;">
    <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
      <tr><td style="background:#006fcf; padding:16px 32px;">${mark}</td></tr>
      <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 36px 24px 36px;">
        <p style="margin:0; font-size:13px; letter-spacing:1.2px; text-transform:uppercase; color:#006fcf; font-weight:700;">Certificate of deposit</p>
        <h1 style="margin:8px 0 0 0; font-size:26px; line-height:32px; color:#12315c;">Account Registry Service (CDARS)</h1>
        <p style="margin:16px 0 0 0; font-size:15px; line-height:23px;">Dear ${escapeHtml(name)},</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">Looking for the security of a certificate of deposit, with the additional safety of FDIC insurance across more than one bank? CDARS may be the right placement for you.</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">CDARS is an FDIC-insured certificate program. It lets you place <strong>$500,000 to $50 million</strong> in certificates held by other FDIC-insured banks, through one relationship with ${escapeHtml(company)}.</p>
        <p style="margin:22px 0 0 0; font-size:16px; line-height:22px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase; color:#12315c;">How CDARS works</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">Funds are allocated among banks so the amount at any one bank, including interest paid at maturity, does not exceed FDIC coverage — currently <strong>$250,000 per depositor, per institution</strong>.</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">You choose how long the funds stay placed. Terms are <strong>1, 3, 6, and 12 months</strong>. You may name banks you do not want used. However many banks hold the certificates, you receive one statement.</p>
        ${table}
        <p style="margin:12px 0 0 0; font-size:14px; line-height:21px;"><strong>Minimum placement: $500,000. Maximum placement: $50 million.</strong></p>
        <p style="margin:22px 0 0 0; font-size:16px; line-height:22px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase; color:#12315c;">What you receive</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">1. One competitive rate on the entire amount.<br>2. A fixed rate of return.<br>3. Interest compounded daily and paid at maturity.</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">Early withdrawal is subject to a penalty. To move forward, complete the application below and choose the term.</p>
        ${button}
        <div style="margin:12px 0 0 0;">${sign.html}</div>
      </td></tr>
      <tr><td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
        <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#ffffff;">We’re here to help.</p>
        <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
      </td></tr>
      <tr><td style="padding:16px 36px 22px 36px; background:#f7fbfe;">
        <p style="margin:0; font-size:11px; line-height:16px; color:#5a6a7a;">CDARS placements are certificates at FDIC-insured banks. Insurance is subject to FDIC limits and ownership rules, currently $250,000 per depositor, per insured bank, per ownership category. The application link expires 48 hours after this email is sent. A penalty may apply to an early withdrawal. Rates can change before the application is submitted.</p>
        <p style="margin:8px 0 0 0; font-size:11px; line-height:16px; color:#8a9aaa;">${companyCredit(company)}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  return { subject, text, html };
}

export function cdarsIntroLetter(input: {
  leadName: string;
  company: string;
  terms?: { months: number; apy: string }[];
  advisor?: MailAdvisor;
  logo?: string | null;
  portalUrl?: string;
  companyPhone?: string;
}) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.leadName.trim() || "Client";
  const subject = "An introduction to CDARS";
  const terms = (input.terms || []).filter((term) => term.apy.trim());
  const logo = emailLogoSrc(input.logo, input.portalUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">`
    : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
  const sign = advisorSignature(input.advisor, company, { closing: "Sincerely" });
  const help = companyHelp(input.companyPhone);
  const shown = (term: { apy: string }) => term.apy.replace(/\s*APY/i, "").replace(/%/g, "");
  const table = terms.length
    ? `<p style="margin:22px 0 0 0; font-size:16px; line-height:22px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase; color:#12315c;">Current terms</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px; border:1px solid #d6e4ef;"><tr>${terms.map((term) => `<td style="background:#006fcf; color:#ffffff; padding:10px 8px; text-align:center; font-size:12px; font-weight:700;">${term.months}-MONTH</td>`).join("")}</tr><tr>${terms.map((term) => `<td style="background:#f7fbfe; padding:16px 8px; text-align:center; font-size:22px; font-weight:700; color:#12315c;">${escapeHtml(shown(term))}% <span style="font-size:12px; color:#006fcf;">APY</span></td>`).join("")}</tr><tr>${terms.map(() => `<td style="padding:8px; text-align:center; font-size:13px; color:#333333; border-top:1px solid #d6e4ef;">Fixed rate</td>`).join("")}</tr></table>`
    : "";
  const text = [
    `Dear ${name},`,
    `Thank you for your interest in ${company}. I wanted to introduce a certificate program for larger placements that need FDIC insurance beyond a single bank.`,
    "CDARS, the Certificate of Deposit Account Registry Service, places $500,000 to $50 million in certificates held at other FDIC-insured banks. You keep one relationship with us and receive one statement for the whole placement.",
    "Funds are allocated so the amount at any one bank, including interest paid at maturity, stays within FDIC coverage. That limit is currently $250,000 per depositor, per insured bank, per ownership category.",
    "You choose a 1-month, 3-month, 6-month, or 12-month term. You may also name any banks that should not be used.",
    ...terms.map((term) => `${term.months}-month CDARS ${shown(term)}% APY, fixed`),
    "One competitive rate is paid on the entire amount. The rate is fixed for the term you choose. Interest is compounded daily and paid at maturity.",
    "The minimum placement is $500,000. The maximum is $50 million. An early withdrawal is subject to a penalty.",
    "If this fits what you are looking for, reply to this email or call us. We will walk through the terms and send the application when you are ready.",
    sign.text,
  ].filter(Boolean).join("\n\n");
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">CDARS places $500,000 to $50 million in certificates across FDIC-insured banks, with one statement.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;"><tr><td align="center" style="padding:20px 10px;">
    <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
      <tr><td style="background:#006fcf; padding:16px 32px;">${mark}</td></tr>
      <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 36px 24px 36px;">
        <p style="margin:0; font-size:13px; letter-spacing:1.2px; text-transform:uppercase; color:#006fcf; font-weight:700;">Certificate of deposit</p>
        <h1 style="margin:8px 0 0 0; font-size:26px; line-height:32px; color:#12315c;">An introduction to CDARS</h1>
        <p style="margin:16px 0 0 0; font-size:15px; line-height:23px;">Dear ${escapeHtml(name)},</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">Thank you for your interest in ${escapeHtml(company)}. I wanted to introduce a certificate program for larger placements that need FDIC insurance beyond a single bank.</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;"><strong>CDARS</strong>, the Certificate of Deposit Account Registry Service, places <strong>$500,000 to $50 million</strong> in certificates held at other FDIC-insured banks. You keep one relationship with ${escapeHtml(company)} and receive one statement for the whole placement.</p>
        <p style="margin:22px 0 0 0; font-size:16px; line-height:22px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase; color:#12315c;">How it works</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">Funds are allocated among banks so the amount at any one institution, including interest paid at maturity, stays within FDIC coverage. That limit is currently <strong>$250,000 per depositor, per insured bank, per ownership category</strong>.</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">You choose a <strong>1-month, 3-month, 6-month, or 12-month</strong> term. You may also name any banks that should not be used.</p>
        ${table}
        <p style="margin:22px 0 0 0; font-size:16px; line-height:22px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase; color:#12315c;">What the placement pays</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">1. One competitive rate on the entire amount.<br>2. A fixed rate for the term you choose.<br>3. Interest compounded daily and paid at maturity.</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">The minimum placement is <strong>$500,000</strong>. The maximum is <strong>$50 million</strong>. An early withdrawal is subject to a penalty.</p>
        <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">If this fits what you are looking for, reply to this email or call us. We will walk through the terms and send the application when you are ready.</p>
        <div style="margin:12px 0 0 0;">${sign.html}</div>
      </td></tr>
      <tr><td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
        <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#ffffff;">We’re here to help.</p>
        <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
      </td></tr>
      <tr><td style="padding:16px 36px 22px 36px; background:#f7fbfe;">
        <p style="margin:0; font-size:11px; line-height:16px; color:#5a6a7a;">CDARS placements are certificates issued by FDIC-insured banks. Insurance is subject to FDIC limits and ownership rules. Rates, if shown, can change before an application is submitted. A penalty may apply to an early withdrawal.</p>
        <p style="margin:8px 0 0 0; font-size:11px; line-height:16px; color:#8a9aaa;">${companyCredit(company)}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  return { subject, text, html };
}

function sampleCdarsIntroLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  return cdarsIntroLetter({
    leadName: "Jonah Hale",
    company: DEFAULT_COMPANY_NAME,
    portalUrl,
    advisor,
    companyPhone,
    terms: [
      { months: 1, apy: "4.00%" },
      { months: 3, apy: "4.10%" },
      { months: 6, apy: "4.20%" },
      { months: 12, apy: "4.35%" },
    ],
  }).html;
}

function sampleCdarsLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  const base = applicationUrl(portalUrl);
  return cdarsLetter({
    leadName: "Jonah Hale",
    company: DEFAULT_COMPANY_NAME,
    portalUrl,
    advisor,
    companyPhone,
    link: base || "#",
    terms: [
      { months: 1, apy: "4.00%" },
      { months: 3, apy: "4.10%" },
      { months: 6, apy: "4.20%" },
      { months: 12, apy: "4.35%" },
    ],
  }).html;
}

export function invoiceAdvisorLetter(input: {
  clientName: string;
  company: string;
  amount: string;
  finalApy: string;
  term: string;
  crn: string;
  promo: boolean;
  link: string;
  advisor?: MailAdvisor;
  logo?: string | null;
  portalUrl?: string;
  companyPhone?: string;
}) {
  const company = input.company.trim() || DEFAULT_COMPANY_NAME;
  const name = input.clientName.trim() || "Client";
  const rate = input.finalApy.includes("%") ? input.finalApy : `${input.finalApy}%`;
  const termMonths = input.term.match(/(\d+)/)?.[1];
  const termLabel = termMonths ? `${termMonths} months` : input.term.trim();
  const subject = "Your CD is ready for funding";
  const ready = `Thank you for choosing ${company} for your financial needs. We are pleased to inform you that your Certificate of Deposit (CD) is now ready for funding.`;
  const details = [
    ["Deposit amount:", input.amount],
    ["Interest Rate:", rate],
    ...(termLabel ? [["Term:", termLabel] as [string, string]] : []),
  ];
  const crnNote = input.promo
    ? `When making the payment, kindly pay extra attention to the Customer Reference Number (CRN). This number is the same as your Customer ID: ${input.crn} and is unique to you. It is crucial that this CRN is used correctly, as it will be used to confirm that the funds are allocated to the correct CD with your chosen promotional offer for new customers.`
    : `When making the payment, kindly pay extra attention to the Customer Reference Number (CRN). This number is the same as your Customer ID: ${input.crn} and is unique to you. It is crucial that this CRN is used correctly, as it will be used to confirm that the funds are allocated to the correct CD.`;
  const proof = "Once you have made payment into your CD, kindly reply to this email with proof of payment so I can follow it up with the accounts department.";
  const questions = "If you have any questions or need further assistance, please do not hesitate to reach out.";
  const logo = emailLogoSrc(input.logo, input.portalUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;border:0;">`
    : `<span style="font-family:Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; letter-spacing:1px; color:#ffffff;">${escapeHtml(company)}</span>`;
  const sign = advisorSignature(input.advisor, company, { closing: "Sincerely" });
  const help = companyHelp(input.companyPhone);
  const paragraph = (value: string) => `<p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">${escapeHtml(value)}</p>`;
  const button = mailButton(input.link || "#", "CD Payment Invoice", "18px 0 0");
  const text = [`Dear ${name},`, ready, "CD Details:", ...details.map(([label, value]) => `• ${label} ${value}`), "Please find the link to your invoice below:", input.link ? `CD Payment Invoice\n${input.link}` : "", crnNote, proof, questions, sign.text, input.companyPhone?.trim() ? `We're here to help. Call ${input.companyPhone.trim()}.` : ""].filter(Boolean).join("\n\n");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; background:#f2f5f8; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">Your certificate is ready for funding.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f5f8;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
        <tr><td style="background:#006fcf; padding:16px 32px;">${mark}</td></tr>
        <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 36px 8px 36px;">
          <p style="margin:0; font-size:15px; line-height:23px;">Dear ${escapeHtml(name)},</p>
          ${paragraph(ready)}
          <p style="margin:18px 0 8px 0; font-size:15px; line-height:23px; font-weight:700;">CD Details:</p>
          <ul style="margin:0; padding:0 0 0 20px; font-size:15px; line-height:23px;">
            ${details.map(([label, value]) => `<li style="margin:0 0 6px 0;"><strong>${escapeHtml(label)}</strong> ${escapeHtml(value)}</li>`).join("")}
          </ul>
          <p style="margin:14px 0 0 0; font-size:15px; line-height:23px;">Please find the link to your invoice below:</p>
          ${button}
          ${paragraph(crnNote)}
          ${paragraph(proof)}
          ${paragraph(questions)}
          <div style="margin:12px 0 0 0;">${sign.html}</div>
        </td></tr>
        <tr><td class="help-bar" style="background:#12315c; padding:18px 36px; color:#ffffff;">
          <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#ffffff;">We’re here to help.</p>
          <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${help}</p>
        </td></tr>
        <tr><td style="padding:16px 36px 22px 36px; background:#f7fbfe;">
          <p style="margin:0; font-size:11px; line-height:16px; color:#8a9aaa;">${companyCredit(company)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return { subject, text, html };
}

function sampleInvoiceAdvisorLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  return invoiceAdvisorLetter({
    clientName: "Jonah Hale",
    company: DEFAULT_COMPANY_NAME,
    amount: "$250,000.00",
    finalApy: "5.525%",
    term: "22-month",
    crn: "AH-004821",
    promo: true,
    link: portalUrl ? `${portalUrl.replace(/\/$/, "")}/invoice/sample` : "",
    advisor,
    portalUrl,
    companyPhone,
  }).html;
}

function richText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part) => (part.startsWith("**") && part.endsWith("**") ? `<strong>${escapeHtml(part.slice(2, -2))}</strong>` : escapeHtml(part)))
    .join("")
    .replace(/\n/g, "<br>");
}

function stripMarks(value: string) {
  return value.replace(/\*\*/g, "");
}

function sampleExtensionLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  return extensionLetter({ leadName: "Jonah Hale", company: DEFAULT_COMPANY_NAME, portalUrl, advisor, companyPhone }).html;
}

function sampleLeadLetter(portalUrl?: string, advisor?: MailAdvisor, companyPhone?: string) {
  return leadLetter({
    leadName: "Jonah Hale",
    company: DEFAULT_COMPANY_NAME,
    portalUrl,
    terms: [
      { months: 10, apy: "4.40%" },
      { months: 22, apy: "4.40%" },
    ],
    offer: {
      intro: "Our promotional new-client offer adds a bonus for the whole term of the certificate. The bonus rises with the amount you place.",
      protection: "FDIC insured. Capital protection covers the first $250,000 per individual or $500,000 per joint account.",
      finePrint: "Early withdrawal penalties may apply. Minimum balance to open: $100,000 of new money.",
      startsOn: "2026-10-01",
      endsOn: "2026-10-31",
      tiers: [
        { id: "a", minAmount: 100000, maxAmount: 174999, bonusPercent: 0.75, months: [10, 22] },
        { id: "b", minAmount: 175000, maxAmount: 249999, bonusPercent: 0.99, months: [10, 22] },
        { id: "c", minAmount: 250000, maxAmount: 499999, bonusPercent: 1.125, months: [10, 22] },
        { id: "d", minAmount: 500000, maxAmount: null, bonusPercent: 1.25, months: [10, 22] },
      ],
    },
    advisor: advisor ?? { name: "Alex Morgan", phone: "(202) 555-0148", email: "alex@example.com" },
    companyPhone,
    minimum: "$100,000",
  }).html;
}

function cleanPortalUrl(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!/^https?:\/\//i.test(trimmed)) return "";
  return trimmed.replace(/\/$/, "") + "/login";
}

function fill(value: string, name: string, email: string, company: string) {
  return value.replaceAll("{{name}}", name).replaceAll("{{email}}", email).replaceAll("{{company}}", company);
}

function helpFooter(phone: string | undefined) {
  const number = phone?.trim() || "";
  const call = number ? `please call:<br>${phoneLink(number)}` : "please sign in to your investor portal.";
  return `<tr><td style="background:#12315c; padding:18px 32px; color:#ffffff; font-family:Arial,sans-serif;">
    <p style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:#ffffff;">We’re here to help.</p>
    <p style="margin:0; font-size:14px; line-height:21px; color:#ffffff;">For assistance or to speak with a representative, ${call}</p>
  </td></tr>
  <tr><td style="padding:12px 32px 4px; font-family:Arial,sans-serif; font-size:12px; line-height:18px; color:#8c8c8c;">Please do not reply to this email. This mailbox is not monitored.</td></tr>`;
}

function layout(input: { eyebrow: string; greeting: string; lead: string; lines: string[]; next?: string; audience: MailAudience; company: string; companyPhone?: string; logo?: string | null; portalUrl?: string; portalLabel?: string; extraHtml?: string }) {
  const facts = input.lines
    .map((line) => `<p style="margin:0 0 6px;font-size:14px;line-height:1.4;color:#3d3d3d;">${escapeHtml(line)}</p>`)
    .join("");
  const card = facts
    ? `<tr><td style="padding:0 32px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;border:1px solid #e0e0e0;border-radius:8px;"><tr><td style="padding:14px 16px;">${facts}</td></tr></table></td></tr>`
    : "";
  const next = input.next
    ? `<tr><td style="padding:0 32px 8px;font-family:Arial,sans-serif;"><p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#1d8ece;">What happens next</p><p style="margin:0;font-size:15px;line-height:1.5;color:#3d3d3d;">${textBlock(input.next)}</p></td></tr>`
    : "";
  const extra = input.extraHtml
    ? `<tr><td style="padding:16px 32px 8px;font-family:Arial,sans-serif;">${input.extraHtml}</td></tr>`
    : "";
  const portal = input.portalUrl
    ? `<tr><td style="padding:20px 32px 0;font-family:Arial,sans-serif;">${mailButton(input.portalUrl, input.portalLabel || "Open the investor portal")}</td></tr>`
    : "";
  const trust = input.audience === "client"
    ? `<tr><td style="padding:8px 16px 28px;">${trustBlocks().html}</td></tr>`
    : "";
  const who = input.audience === "client" ? "Investor note" : "Desk note";
  const logo = emailLogoSrc(input.logo, input.portalUrl);
  const mark = logo
    ? `<img src="${logo}" alt="${escapeHtml(input.company)}" height="32" style="display:block;height:32px;width:auto;max-width:180px;border:0;">`
    : `<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;color:#ffffff;">${escapeHtml(input.company.toUpperCase())}</p>`;
  const opening = input.eyebrow || input.greeting || input.lead
    ? `<tr><td style="padding:28px 32px 8px;font-family:Arial,sans-serif;">
          ${input.eyebrow ? `<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#1d8ece;">${escapeHtml(input.eyebrow)}</p>` : ""}
          ${input.greeting ? `<p style="margin:0 0 12px;font-size:16px;color:#262626;">${escapeHtml(input.greeting)}</p>` : ""}
          ${input.lead ? `<p style="margin:0;font-size:15px;line-height:1.5;color:#3d3d3d;">${textBlock(input.lead)}</p>` : ""}
        </td></tr>`
    : "";
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
        ${trust}
        ${helpFooter(input.companyPhone)}
        <tr><td style="padding:8px 32px 28px;font-family:Arial,sans-serif;font-size:12px;color:#8c8c8c;">${escapeHtml(input.company)} · Investor accounts</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function emailLogoSrc(logo: string | null | undefined, _pageUrl: string | undefined) {
  const stored = logo?.trim() || "";
  if (/^data:image\//i.test(stored)) return `/email-logo?v=${logoVersion(stored)}`;
  return safeImage(stored);
}

function logoVersion(value: string) {
  let hash = 0;
  const sample = `${value.length}:${value.slice(0, 240)}`;
  for (let index = 0; index < sample.length; index += 1) hash = (hash * 33 + sample.charCodeAt(index)) >>> 0;
  return hash.toString(36);
}

function safeImage(value: string | null | undefined) {
  if (!value || !/^data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=\s]+$/.test(value)) return "";
  return value.replace(/\s/g, "");
}

function textBlock(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => {
    if (char === "&") return "&" + "amp;";
    if (char === "<") return "&" + "lt;";
    if (char === ">") return "&" + "gt;";
    return "&" + "quot;";
  });
}
