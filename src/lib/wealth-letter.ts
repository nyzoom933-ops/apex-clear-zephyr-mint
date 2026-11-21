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
  { id: "cit", badge: "Featured CD", bank: "CIT Bank", member: "Member FDIC · Online", term: "12 Month CD", minimum: "$100,000 minimum", apy: "5.20%" },
  { id: "truist", badge: "Featured CD", bank: "Truist", member: "Member FDIC", term: "18 Month CD", minimum: "$50,000 minimum", apy: "4.95%" },
  { id: "bofa", badge: "Featured CD", bank: "Bank of America", member: "Member FDIC", term: "18 Month CD", minimum: "$20,000 minimum", apy: "4.60%" },
];

export function wealthOfferById(id: string) {
  return WEALTH_OFFERS.find((offer) => offer.id === id) || null;
}

type WealthAdvisor = {
  name?: string;
  phone?: string;
  email?: string;
  mailbox?: string;
  role?: string;
  personalPhone?: string;
};

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
  const label = "APPLY NOW";
  if (!href) return `<span style="display:inline-block; background:#14c8a8; color:#062033; font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:0.4px; padding:10px 16px;">${label}</span>`;
  return `<a href="${escapeHtml(href)}" style="display:inline-block; background:#14c8a8; color:#062033; font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:0.4px; text-decoration:none; padding:10px 16px;">${label}</a>`;
}

function offerCard(offer: WealthOffer, href: string) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0c3148; border-radius:8px;">
    <tr><td style="padding:14px 16px 6px 16px; font-family:Arial, Helvetica, sans-serif; font-size:11px; letter-spacing:0.8px; text-transform:uppercase; color:#7ddec8; font-weight:700;">${escapeHtml(offer.badge)}</td></tr>
    <tr><td style="padding:4px 16px 8px 16px; font-family:Arial, Helvetica, sans-serif; font-size:22px; font-weight:700; color:#ffffff;">${escapeHtml(offer.bank)}</td></tr>
    <tr><td style="padding:0 16px 10px 16px; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:18px; color:#d5e4ee;">${escapeHtml(offer.member)}<br>${escapeHtml(offer.term)}<br>${escapeHtml(offer.minimum)}</td></tr>
    <tr><td style="padding:0 16px 4px 16px; font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#9fb4c4;">APY</td></tr>
    <tr><td style="padding:0 16px 12px 16px; font-family:Arial, Helvetica, sans-serif; font-size:32px; font-weight:700; color:#ffffff;">${escapeHtml(offer.apy)}</td></tr>
    <tr><td style="padding:0 16px 16px 16px;">${applyButton(href)}</td></tr>
  </table>`;
}

export function wealthIntroLetter(input: {
  leadName: string;
  company: string;
  advisor?: WealthAdvisor;
  portalUrl?: string;
  link?: string;
  companyPhone?: string;
}) {
  const company = input.company.trim() || "Wealth";
  const name = input.leadName.trim() || "Client";
  const advisor = input.advisor;
  const advisorName = advisor?.name?.trim() || company;
  const role = advisor?.role?.trim() || "";
  const phone = advisor?.personalPhone?.trim() || advisor?.phone?.trim() || input.companyPhone?.trim() || "";
  const email = advisor?.email?.trim() || advisor?.mailbox?.trim() || "";
  const shown = rateDate();
  const cards = WEALTH_OFFERS.map((offer) => ({ offer, href: offerLink(input.link || "", offer.id) }));
  const rows: string[] = [];
  for (let index = 0; index < cards.length; index += 2) {
    const pair = cards.slice(index, index + 2);
    rows.push(`<tr>${pair
      .map((card, cell) => `<td class="stack" width="50%" valign="top" style="${cell === 0 ? "padding:0 6px 12px 0;" : "padding:0 0 12px 6px;"}">${offerCard(card.offer, card.href)}</td>`)
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
  ]
    .map(
      ([title, body]) => `<td class="stack" width="25%" valign="top" style="padding:8px;">
        <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:700; color:#12315c;">${title}</p>
        <p style="margin:4px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:17px; color:#4d6272;">${body}</p>
      </td>`,
    )
    .join("");
  const contactHref = email ? `mailto:${email}` : input.link || "";
  const contact = contactHref
    ? `<a href="${escapeHtml(contactHref)}" style="display:inline-block; border:1px solid #12315c; color:#12315c; font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:700; letter-spacing:0.6px; text-decoration:none; padding:10px 14px;">CONTACT</a>`
    : "";
  const text = [
    `Dear ${name},`,
    `${company} extends its warm regards and appreciation following your recent consultation with a ${company} financial advisor.`,
    "This week's featured brokered CD rates",
    cards.map((card) => `${card.offer.bank} ${card.offer.term} ${card.offer.apy} APY`).join("\n"),
    input.link ? `Apply\n${input.link}` : "",
    "Best regards,",
    advisorName,
    role,
    phone,
    email,
  ]
    .filter(Boolean)
    .join("\n\n");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(company)} | Featured brokered CD rates</title>
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
  <div style="display:none; max-height:0; overflow:hidden;">This week's featured brokered CD rates from ${escapeHtml(company)}.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef2f4;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" class="email-container" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; width:100%; background:#ffffff;">
        <tr><td style="padding:22px 32px 8px 32px;">
          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:22px; font-weight:700; letter-spacing:0.4px; color:#10233a;">${escapeHtml(company.toUpperCase())}</p>
        </td></tr>
        <tr><td style="padding:8px 24px 0 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#071b33;">
            <tr><td style="padding:28px 28px 24px 28px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:28px; line-height:34px; font-weight:700; color:#ffffff;">Solutions today.</p>
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:28px; line-height:34px; font-weight:700; color:#2ee6c7;">Security for tomorrow.</p>
              <p style="margin:16px 0 0 0; width:48px; border-top:2px solid #2ee6c7; font-size:0; line-height:0;">&nbsp;</p>
              <p style="margin:14px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:21px; color:#d5e4ee;">We help you grow, preserve and transition wealth with confidence — so you can focus on what matters most.</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:22px 32px 8px 32px; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:23px; color:#243746;">
          <p style="margin:0 0 12px 0;">Dear ${escapeHtml(name)},</p>
          <p style="margin:0 0 12px 0;">${escapeHtml(company)} extends its warm regards and appreciation following your recent consultation with a ${escapeHtml(company)} financial advisor. The session was designed to be both insightful and valuable, helping to shape and strengthen each client's financial path. It is ${escapeHtml(company)}'s priority to ensure that every interaction provides meaningful guidance as clients move toward their financial goals.</p>
          <p style="margin:0;">As part of your ongoing investment and cash-management strategy, we wanted to share information about Certificates of Deposit (CDs), which may appeal to investors seeking safety, predictable returns and preservation of capital.</p>
        </td></tr>
        <tr><td style="padding:8px 32px 8px 32px;">
          <p style="margin:0 0 10px 0; font-family:Arial, Helvetica, sans-serif; font-size:12px; letter-spacing:1px; font-weight:700; color:#6a7c8c;">WHAT WE OFFER</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="stack" width="33%" valign="top" style="padding-right:8px;"><p style="margin:0; font-size:14px; font-weight:700; color:#12315c;">Personalized Wealth Strategy</p><p style="margin:4px 0 0 0; font-size:12px; line-height:17px; color:#4d6272;">Coordinated planning across investments, liquidity needs and long-term objectives.</p></td>
              <td class="stack" width="33%" valign="top" style="padding:0 4px;"><p style="margin:0; font-size:14px; font-weight:700; color:#12315c;">Banking & Cash Management</p><p style="margin:4px 0 0 0; font-size:12px; line-height:17px; color:#4d6272;">Deposit, savings and cash-flow solutions structured around your spending requirements.</p></td>
              <td class="stack" width="34%" valign="top" style="padding-left:8px;"><p style="margin:0; font-size:14px; font-weight:700; color:#12315c;">Investment & Income Planning</p><p style="margin:4px 0 0 0; font-size:12px; line-height:17px; color:#4d6272;">Diversified portfolio strategies focused on income, resilience and capital preservation.</p></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:12px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#071b33;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:700; color:#2ee6c7;">Strength. Stability. Stewardship.</p>
              <p style="margin:6px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:19px; color:#d5e4ee;">${escapeHtml(company)} is committed to building stronger futures for our clients and their families, with competitive deposit opportunities from leading U.S. banks.</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:8px 24px 4px 24px; background:#071b33;">
          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; letter-spacing:1px; font-weight:700; color:#2ee6c7;">WEEKLY CD RATES</p>
          <p style="margin:4px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:20px; font-weight:700; color:#ffffff;">This week's featured brokered CD rates</p>
          <p style="margin:4px 0 12px 0; font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#9fb4c4;">Rates shown as provided · ${escapeHtml(shown)}</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows.join("")}</table>
        </td></tr>
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
        <tr><td style="padding:8px 24px 8px 24px;">
          <p style="margin:0 0 6px 16px; font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:700; color:#12315c;">Why clients choose ${escapeHtml(company)}</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>${reasons}</tr></table>
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
    subject: `${company} | Featured brokered CD rates`,
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
  });
}
