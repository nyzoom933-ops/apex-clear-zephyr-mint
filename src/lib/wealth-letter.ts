import { amountRange, formatBonus, parseApy, type PromoOffer } from "@/lib/promo";

export type WealthOffer = {
  id: string;
  badge: string;
  bank: string;
  member: string;
  term: string;
  minimum: string;
  apy: string;
};

export const WEALTH_OFFERS: WealthOffer[] = [
  { id: "chase", badge: "Highest APY", bank: "Chase", member: "Member FDIC", term: "12 Month CD", minimum: "$250,000 minimum", apy: "5.50%" },
  { id: "cit", badge: "Brokered CD", bank: "CIT Bank", member: "Member FDIC · Online", term: "12 Month CD", minimum: "$100,000 minimum", apy: "5.20%" },
  { id: "truist", badge: "Brokered CD", bank: "Truist", member: "Member FDIC", term: "18 Month CD", minimum: "$50,000 minimum", apy: "4.95%" },
  { id: "bofa", badge: "Brokered CD", bank: "Bank of America", member: "Member FDIC", term: "18 Month CD", minimum: "$20,000 minimum", apy: "4.60%" },
];

export function wealthOfferById(id: string, offers: WealthOffer[] = WEALTH_OFFERS) {
  return offers.find((offer) => offer.id === id) || null;
}

export function normalizeBrokeredOffers(value: unknown, fallback = true): WealthOffer[] {
  const source = Array.isArray(value) ? value : [];
  const offers: WealthOffer[] = [];
  for (const item of source) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<WealthOffer>;
    const bank = String(row.bank || "").trim().slice(0, 80);
    const apyRaw = String(row.apy || "").trim().slice(0, 20);
    if (!bank || !apyRaw) continue;
    const id = String(row.id || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40) || `bank-${offers.length + 1}`;
    offers.push({
      id,
      badge: String(row.badge || "Brokered CD").trim().slice(0, 40) || "Brokered CD",
      bank,
      member: String(row.member || "Member FDIC").trim().slice(0, 80) || "Member FDIC",
      term: String(row.term || "").trim().slice(0, 60),
      minimum: String(row.minimum || "").trim().slice(0, 60),
      apy: apyRaw.includes("%") ? apyRaw : `${apyRaw}%`,
    });
  }
  const unique = offers.filter((offer, index) => offers.findIndex((item) => item.id === offer.id) === index).slice(0, 12);
  if (!unique.length && fallback) return WEALTH_OFFERS;
  return unique;
}

function bonusTable(terms: { months: number; apy: string }[], offer?: PromoOffer | null) {
  const tiers = offer?.tiers || [];
  if (!tiers.length || !terms.length) return { html: "", text: "" };
  const total = (apy: string, bonus: number) => {
    const final = parseApy(apy) * 100 + bonus;
    const digits = Math.round(final * 1000) % 10 === 0 ? 2 : 3;
    return `${final.toFixed(digits)}%`;
  };
  const rows = tiers.map((tier, index) => {
    const shown = terms.filter((term) => tier.months.includes(term.months)).map((term) => total(term.apy, tier.bonusPercent));
    const unique = [...new Set(shown)];
    const cell = unique.length ? unique.join(" / ") : "—";
    const last = index === tiers.length - 1;
    const background = last ? "#e7f3fb" : index % 2 ? "#f7fbfe" : "#ffffff";
    return `<tr>
      <td style="padding:11px 14px; background:${background}; ${last ? "font-weight:700;" : "border-bottom:1px solid #e7eef4;"}">${escapeHtml(amountRange(tier))}</td>
      <td align="center" style="padding:11px 14px; background:${background}; ${last ? "font-weight:700;" : "border-bottom:1px solid #e7eef4;"}">${escapeHtml(formatBonus(tier.bonusPercent))}</td>
      <td align="center" style="padding:11px 14px; background:${background}; color:#006fcf; font-weight:700; ${last ? "" : "border-bottom:1px solid #e7eef4;"}">${escapeHtml(cell)}</td>
    </tr>`;
  }).join("");
  const text = tiers.map((tier) => {
    const shown = terms.filter((term) => tier.months.includes(term.months)).map((term) => `${total(term.apy, tier.bonusPercent)} (${term.months}-month)`);
    return `${amountRange(tier)} · ${formatBonus(tier.bonusPercent)} · ${shown.join(", ") || "—"}`;
  }).join("\n");
  const html = `<p style="margin:0 0 8px 0; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:700; color:#12315c;">Promotional bonus rates</p>
    <p style="margin:0 0 12px 0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:19px; color:#4d6272;">These bonuses apply to our promotional certificate terms, based on the qualifying deposit.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d6e4ef;">
      <tr>
        <td style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700;">Qualifying Deposit</td>
        <td align="center" style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700;">Additional Bonus</td>
        <td align="center" style="background:#12315c; color:#ffffff; padding:10px 14px; font-size:11px; font-weight:700;">Total Promotional APY</td>
      </tr>
      ${rows}
    </table>`;
  return { html, text };
}

type WealthAdvisor = {
  name?: string;
  phone?: string;
  email?: string;
  mailbox?: string;
  role?: string;
  personalPhone?: string;
};

function emailLogoSrc(logo: string | null | undefined) {
  const stored = logo?.trim() || "";
  if (!/^data:image\//i.test(stored)) return "";
  let hash = 0;
  const sample = `${stored.length}:${stored.slice(0, 240)}`;
  for (let index = 0; index < sample.length; index += 1) hash = (hash * 33 + sample.charCodeAt(index)) >>> 0;
  return `/email-logo?v=${hash.toString(36)}`;
}

function article(value: string) {
  return /^[aeiou]/i.test(value.trim()) ? "an" : "a";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => (char === "&" ? "&amp;" : char === "<" ? "&lt;" : char === ">" ? "&gt;" : "&quot;"));
}

function offerLink(base: string, id: string) {
  const link = base.trim();
  if (!/^https?:\/\//i.test(link)) return "";
  return `${link}${link.includes("?") ? "&" : "?"}offer=${encodeURIComponent(id)}`;
}

function rateDate(date = new Date()) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const day = date.getUTCDate();
  const teen = day % 100;
  const suffix = teen >= 11 && teen <= 13 ? "th" : day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th";
  return `${day}${suffix} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function applyButton(href: string) {
  const label = "Apply now";
  const link = escapeHtml(href || "#");
  const text = escapeHtml(label);
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;"><tr><td align="center" bgcolor="#006fcf" style="background:#006fcf; border-radius:6px;"><a href="${link}" target="_blank" style="display:inline-block; padding:12px 18px; font-family:Arial, Helvetica, sans-serif; font-size:14px; font-weight:700; letter-spacing:0.2px; line-height:18px; color:#ffffff; text-decoration:none; background:#006fcf; border:1px solid #006fcf; border-radius:6px;">${text}</a></td></tr></table>`;
}

function offerCard(offer: WealthOffer, href: string) {
  const details = [offer.term, offer.minimum, offer.member].filter(Boolean).map((line) => escapeHtml(line)).join("<br>");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d6e4ef;">
    <tr><td style="background:#006fcf; padding:10px; text-align:center; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-weight:700; letter-spacing:0.6px;">${escapeHtml(offer.bank)}</td></tr>
    <tr><td style="padding:18px 12px 6px; text-align:center; background:#f7fbfe; font-family:Arial, Helvetica, sans-serif;"><span style="font-size:32px; line-height:36px; font-weight:700; color:#12315c;">${escapeHtml(offer.apy.replace(/\s*APY/i, ""))}</span><br><span style="color:#006fcf; font-weight:700; letter-spacing:1px;">APY</span></td></tr>
    <tr><td style="padding:4px 12px 14px; text-align:center; background:#f7fbfe; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:18px; color:#3d3d3d;">${offer.badge ? `<span style="color:#006fcf; font-weight:700;">${escapeHtml(offer.badge)}</span><br>` : ""}${details}</td></tr>
    <tr><td align="center" style="padding:0 12px 16px; background:#f7fbfe;">${applyButton(href)}</td></tr>
  </table>`;
}

export function wealthIntroLetter(input: {
  leadName: string;
  company: string;
  advisor?: WealthAdvisor;
  portalUrl?: string;
  link?: string;
  callLink?: string;
  companyPhone?: string;
  logo?: string | null;
  offers?: WealthOffer[];
  terms?: { months: number; apy: string }[];
  promo?: PromoOffer | null;
}) {
  const company = input.company.trim() || "Wealth";
  const name = input.leadName.trim() || "Client";
  const advisor = input.advisor;
  const advisorName = advisor?.name?.trim() || company;
  const role = advisor?.role?.trim() || "";
  const phone = advisor?.personalPhone?.trim() || advisor?.phone?.trim() || input.companyPhone?.trim() || "";
  const email = advisor?.email?.trim() || advisor?.mailbox?.trim() || "";
  const shown = rateDate();
  const offers = input.offers?.length ? input.offers : WEALTH_OFFERS;
  const cards = offers.map((offer) => ({ offer, href: offerLink(input.link || "", offer.id) }));
  const bonus = bonusTable(input.terms || [], input.promo);
  const rows: string[] = [];
  const perRow = cards.length === 3 ? 3 : 2;
  for (let index = 0; index < cards.length; index += perRow) {
    const pair = cards.slice(index, index + perRow);
    rows.push(`<tr>${pair
      .map((card, cell) => {
        const width = pair.length === 3 ? "33%" : pair.length === 1 ? "100%" : "50%";
        const gap = pair.length === 1 ? "padding:0 0 12px;" : cell === 0 ? "padding:0 6px 12px 0;" : cell === pair.length - 1 ? "padding:0 0 12px 6px;" : "padding:0 6px 12px;";
        return `<td class="stack" width="${width}" valign="top" style="${gap}">${offerCard(card.offer, card.href)}</td>`;
      })
      .join("")}</tr>`);
  }
  const checks = [
    "Dedicated wealth guidance throughout the inquiry process",
    "Competitive fixed-rate CD opportunities from leading U.S. banks",
    "FDIC-eligible deposits, subject to applicable limits",
    "Ongoing cash-management and portfolio support",
  ]
    .map((item) => `<tr><td style="padding:3px 8px 3px 0; color:#14c8a8; font-size:14px;">✓</td><td style="padding:3px 0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:20px; color:#243746;">${item}</td></tr>`)
    .join("");
  const reasons = [
    ["Direct Access", "Clear points of contact when decisions need attention."],
    ["Integrated View", "Banking, investing and planning considered together."],
    ["Ongoing Review", "Strategies revisited as markets and priorities evolve."],
    ["Generational Focus", "Support for preserving and transitioning wealth over time."],
  ];
  const reasonCell = (title: string, body: string, shaded: boolean) => `<td class="stack" width="50%" valign="top" style="width:50%; background:${shaded ? "#f7fbfe" : "#ffffff"}; border:1px solid #d6e4ef; padding:16px 18px; font-family:Arial, Helvetica, sans-serif;">
        <p style="margin:0; font-size:14px; line-height:18px; font-weight:700; color:#12315c;">${title}</p>
        <p style="margin:6px 0 0 0; font-size:13px; line-height:18px; color:#3d3d3d;">${body}</p>
      </td>`;
  const reasonRows = [reasons.slice(0, 2), reasons.slice(2)].map((pair, row) => `<tr>${pair.map(([title, body], column) => reasonCell(title, body, (row + column) % 2 === 0)).join("")}</tr>`).join("");
  const contactHref = input.callLink?.trim() || "";
  const contact = contactHref
    ? `<a href="${escapeHtml(contactHref)}" style="display:inline-block; border:1px solid #12315c; color:#12315c; font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:0.6px; text-decoration:none; padding:10px 14px;">CONTACT</a>`
    : "";
  const text = [
    `Dear ${name},`,
    `${company} extends its warm regards and appreciation following your recent consultation with ${article(company)} ${company} financial advisor.`,
    "This week's brokered CD rates",
    cards.map((card) => `${card.offer.bank} ${card.offer.term} ${card.offer.apy} APY`).join("\n"),
    bonus.text,
    input.link ? `Apply\n${input.link}` : "",
    input.callLink ? `Request a call\n${input.callLink}` : "",
    "Best regards,",
    advisorName,
    role,
    phone,
    email,
  ]
    .filter(Boolean)
    .join("\n\n");
  const logoSrc = emailLogoSrc(input.logo);
  const mark = logoSrc
    ? `<img src="${logoSrc}" alt="${escapeHtml(company)}" height="32" style="display:block;height:32px;width:auto;max-width:180px;border:0;">`
    : `<p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:22px; font-weight:700; letter-spacing:0.4px; color:#ffffff;">${escapeHtml(company.toUpperCase())}</p>`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(company)} | Brokered CD rates</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    body { margin:0 !important; padding:0 !important; width:100% !important; }
    @media screen and (max-width:600px) {
      .email-container { width:100% !important; }
      .stack { display:block !important; width:100% !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#eef2f4; font-family:Arial, Helvetica, sans-serif; color:#1a1a1a;">
  <div style="display:none; max-height:0; overflow:hidden;">Brokered CD rates from ${escapeHtml(company)}.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef2f4;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" class="email-container" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
        <tr><td style="background:#006fcf; padding:16px 32px;">${mark}</td></tr>
        <tr><td style="background:#12315c; height:4px; font-size:0; line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr><td style="background:#12315c; padding:22px 32px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:26px; line-height:32px; font-weight:700; color:#ffffff;">Solutions today.</p>
              <p style="margin:2px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:26px; line-height:32px; font-weight:700; color:#ffffff;">Security for tomorrow.</p>
            </td></tr>
            <tr><td style="background:#f7fbfe; padding:16px 32px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:22px; color:#1d8ece;">We help you grow, preserve and transition wealth with confidence — so you can focus on what matters most.</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:22px 32px 8px 32px; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:23px; color:#243746;">
          <p style="margin:0 0 12px 0;">Dear ${escapeHtml(name)},</p>
          <p style="margin:0 0 12px 0;">${escapeHtml(company)} extends its warm regards and appreciation following your recent consultation with ${article(company)} ${escapeHtml(company)} financial advisor. The session was designed to be both insightful and valuable, helping to shape and strengthen each client's financial path. It is ${escapeHtml(company)}'s priority to ensure that every interaction provides meaningful guidance as clients move toward their financial goals.</p>
          <p style="margin:0;">As part of your ongoing investment and cash-management strategy, we wanted to share information about Certificates of Deposit (CDs), which may appeal to investors seeking safety, predictable returns and preservation of capital.</p>
        </td></tr>
        <tr><td style="padding:18px 26px 18px 26px;">
          <p style="margin:0 0 10px 0; font-family:Arial, Helvetica, sans-serif; font-size:12px; letter-spacing:1px; font-weight:700; color:#1d8ece;">WHAT WE OFFER</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              ${[
                ["Personalized Wealth Strategy", "Coordinated planning across investments, liquidity needs and long-term objectives."],
                ["Banking & Cash Management", "Deposit, savings and cash-flow solutions structured around your spending requirements."],
                ["Investment & Income Planning", "Diversified portfolio strategies focused on income, resilience and capital preservation."],
              ].map(([title, body]) => `<td class="stack" width="33%" valign="top" style="padding:6px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7fbfe; border-top:3px solid #006fcf;"><tr><td style="padding:14px 12px; font-family:Arial, Helvetica, sans-serif;"><p style="margin:0; font-size:14px; line-height:18px; font-weight:700; color:#12315c;">${title}</p><p style="margin:6px 0 0 0; font-size:12px; line-height:17px; color:#3d3d3d;">${body}</p></td></tr></table></td>`).join("")}
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr><td style="background:#12315c; padding:16px 32px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:18px; font-weight:700; color:#ffffff;">Strength. Stability. Stewardship.</p>
            </td></tr>
            <tr><td style="background:#f7fbfe; padding:16px 32px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:22px; color:#3d3d3d;">${escapeHtml(company)} is committed to building stronger futures for our clients and their families, with competitive deposit opportunities from leading U.S. banks.</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:8px 32px 4px 32px;">
          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#1d8ece; font-weight:700;">Brokered CD rates</p>
          <p style="margin:6px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:22px; line-height:28px; font-weight:700; color:#12315c;">Rates from other banks</p>
          <p style="margin:4px 0 14px 0; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#5a6a7a;">Rates shown as provided · ${escapeHtml(shown)}</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows.join("")}</table>
        </td></tr>
        ${bonus.html ? `<tr><td style="padding:18px 32px 8px 32px; background:#ffffff;">${bonus.html}</td></tr>` : ""}
        <tr><td style="padding:18px 32px 8px 32px;">
          <p style="margin:0 0 8px 0; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:700; color:#12315c;">Why invest through ${escapeHtml(company)}?</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">${checks}</table>
          <p style="margin:12px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:11px; line-height:16px; color:#6a7c8c;">Rates are subject to change. APY = Annual Percentage Yield. Confirm current availability, rate and terms with ${escapeHtml(company)} before opening. FDIC insurance is subject to applicable ownership categories and limits.</p>
        </td></tr>
        <tr><td style="padding:8px 32px 8px 32px;">
          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:700; color:#12315c;">CD Deposit Solutions</p>
          <p style="margin:4px 0 0 0; font-size:13px; line-height:19px; color:#4d6272;">Explore competitive rates and flexible terms designed to help you grow your cash with confidence.</p>
          <p style="margin:8px 0 0 0; font-size:13px; line-height:20px; color:#243746;">✓ Terms from 6 to 60 months<br>✓ Competitive fixed rates<br>✓ Eligible for FDIC coverage</p>
          <p style="margin:16px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:700; color:#12315c;">Fixed Income Solutions</p>
          <p style="margin:4px 0 0 0; font-size:13px; line-height:19px; color:#4d6272;">Build a resilient, income-generating portfolio across a broad range of fixed income investments — from government bonds to corporate bonds and certificates of deposit.</p>
        </td></tr>
        <tr><td style="padding:18px 32px 8px 32px;">
          <p style="margin:0 0 10px 0; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:700; color:#12315c;">Why clients choose ${escapeHtml(company)}</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">${reasonRows}</table>
        </td></tr>
        <tr><td style="padding:8px 32px 18px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f8f8;">
            <tr><td style="padding:16px;">
              <p style="margin:0; font-size:15px; font-weight:700; color:#12315c;">We're here for you</p>
              <p style="margin:4px 0 10px 0; font-size:13px; line-height:18px; color:#4d6272;">Continue the conversation with ${escapeHtml(advisorName)}.</p>
              ${contact}
            </td></tr>
          </table>
          <p style="margin:16px 0 0 0; font-size:16px; font-weight:700; color:#12315c;">${escapeHtml(advisorName)}</p>
          <p style="margin:2px 0 0 0; font-size:13px; line-height:18px; color:#4d6272;">${escapeHtml(role || company)}<br>${escapeHtml(company)}${phone ? `<br>${escapeHtml(phone)}` : ""}${email ? `<br>${escapeHtml(email)}` : ""}</p>
        </td></tr>
        <tr><td style="padding:16px 24px 22px 24px; background:#10233a;">
          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:11px; line-height:16px; color:#d5e4ee;">${escapeHtml(company)} banking products and services are subject to approval. Eligible deposits are insured by the FDIC up to $250,000 per depositor, per insured bank, per ownership category. Brokered CDs are obligations of the issuing bank, not of ${escapeHtml(company)}, and are subject to the issuing bank's terms.</p>
          <p style="margin:10px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:11px; line-height:16px; color:#d5e4ee;">Federal law requires us to obtain, verify and record information that identifies each person who opens an account. The information you provide may be used to verify your identity. This message is not an offer or a commitment to open an account.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  return {
    subject: `${company} | Brokered CD rates`,
    text,
    html,
  };
}

export function sampleWealthIntroLetter(portalUrl?: string, advisor?: WealthAdvisor, companyPhone?: string) {
  const origin = (portalUrl || "").trim().replace(/\/$/, "");
  return wealthIntroLetter({
    leadName: "Client",
    company: "Wealth",
    advisor,
    portalUrl: origin,
    companyPhone,
    link: origin ? `${origin}/onboarding?invite=preview` : "",
  }).html;
}
