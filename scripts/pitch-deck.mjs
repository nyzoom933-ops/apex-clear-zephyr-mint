import { writeFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const W = 960;
const H = 540;
const navy = rgb(0.071, 0.192, 0.361);
const action = rgb(0, 0.435, 0.812);
const aqua = rgb(0.114, 0.557, 0.808);
const ice = rgb(0.906, 0.953, 0.984);
const paper = rgb(0.984, 0.984, 0.984);
const ink = rgb(0.149, 0.149, 0.149);
const muted = rgb(0.353, 0.416, 0.478);
const white = rgb(1, 1, 1);
const line = rgb(0.878, 0.878, 0.878);

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

function top(y) {
  return H - y;
}

function wrap(text, size, face, width) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (face.widthOfTextAtSize(next, size) <= width) current = next;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function text(page, value, x, y, options) {
  page.drawText(value, { x, y: top(y), font: options.font ?? font, size: options.size ?? 12, color: options.color ?? ink });
}

function paragraph(page, value, x, y, width, options) {
  const size = options.size ?? 13;
  const leading = options.leading ?? size + 5;
  const lines = wrap(value, size, options.font ?? font, width);
  lines.forEach((lineText, index) => text(page, lineText, x, y + index * leading, options));
  return lines.length * leading;
}

function slide() {
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: white });
  return page;
}

function footer(page, index, total, dark = false) {
  text(page, "ACCOUNT HOLDING", 48, 516, { font: bold, size: 9, color: dark ? rgb(0.75, 0.84, 0.92) : muted });
  text(page, String(index).padStart(2, "0") + "  /  " + String(total).padStart(2, "0"), 860, 516, { font: bold, size: 9, color: dark ? rgb(0.75, 0.84, 0.92) : muted });
}

function kicker(page, label, y) {
  page.drawRectangle({ x: 48, y: top(y + 8), width: 28, height: 3, color: action });
  text(page, label.toUpperCase(), 84, y + 6, { font: bold, size: 11, color: action });
}

function title(page, value, y) {
  text(page, value, 48, y, { font: bold, size: 32, color: navy });
}

const total = 10;

function cover() {
  const page = slide();
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: navy });
  page.drawRectangle({ x: 0, y: 0, width: 14, height: H, color: action });
  text(page, "INVESTOR ACCOUNTS", 56, 86, { font: bold, size: 12, color: rgb(0.61, 0.77, 0.96) });
  text(page, "Account Holding", 56, 150, { font: bold, size: 54, color: white });
  paragraph(page, "The operating system for a certificate relationship. One application, one advisor, and one record from the first letter to an active CD.", 56, 214, 620, { size: 18, leading: 26, color: rgb(0.86, 0.92, 0.97) });
  const chips = ["Investor portal", "Operations desk", "Advisor letters"];
  chips.forEach((chip, index) => {
    const x = 56 + index * 190;
    page.drawRectangle({ x, y: top(430), width: 170, height: 36, color: rgb(0.1, 0.25, 0.45), borderColor: rgb(0.25, 0.45, 0.68), borderWidth: 1 });
    text(page, chip, x + 16, 414, { font: bold, size: 12, color: white });
  });
  footer(page, 1, total, true);
}

function problem() {
  const page = slide();
  kicker(page, "The gap", 48);
  title(page, "High-balance CDs still run on inboxes.", 84);
  paragraph(page, "A serious certificate is a sequence of conversations, documents, and money. Most of that sequence is still scattered.", 48, 136, 520, { size: 16, leading: 24, color: muted });
  const items = [
    ["01", "The rate and the application live in different places."],
    ["02", "The advisor cannot see whether the client signed, is waiting, or has wired."],
    ["03", "Funding instructions sit in a file the client has to hunt for."],
    ["04", "Once the CD is open, the client still has no single view of term, rate, and maturity."],
  ];
  items.forEach((item, index) => {
    const y = 230 + index * 62;
    page.drawRectangle({ x: 48, y: top(y + 46), width: 864, height: 54, color: index % 2 ? ice : paper });
    text(page, item[0], 68, y + 20, { font: bold, size: 14, color: action });
    text(page, item[1], 120, y + 20, { size: 15, color: ink });
  });
  footer(page, 2, total);
}

function product() {
  const page = slide();
  kicker(page, "The product", 48);
  title(page, "A portal for the client. A desk for the firm.", 84);
  const cards = [
    ["Investor portal", "Apply, sign, fund, and watch the certificate. The client sees only the next step that is actually theirs."],
    ["Operations desk", "Review the application, assign the advisor, issue the invoice, and confirm the wire. Status is a record, not a memory."],
    ["Advisor letters", "Send the rate chart, a 24-hour application, and a reminder from the advisor's own mailbox."],
  ];
  cards.forEach((card, index) => {
    const x = 48 + index * 296;
    page.drawRectangle({ x, y: top(470), width: 280, height: 300, color: white, borderColor: line, borderWidth: 1 });
    page.drawRectangle({ x, y: top(176), width: 280, height: 6, color: index === 1 ? action : aqua });
    text(page, "0" + (index + 1), x + 24, 214, { font: bold, size: 13, color: action });
    paragraph(page, card[0], x + 24, 248, 232, { font: bold, size: 20, leading: 26, color: navy });
    paragraph(page, card[1], x + 24, 320, 232, { size: 14, leading: 21, color: ink });
  });
  footer(page, 3, total);
}

function path() {
  const page = slide();
  kicker(page, "The path", 48);
  title(page, "Six moves. No skipped gates.", 84);
  const steps = [
    ["Apply", "Name, documents if they have them, amount, and term."],
    ["Approve", "The desk opens the portal. Nothing is invested yet."],
    ["Accept", "The client signs the terms. The investment is created here."],
    ["Invoice", "The desk approves funding and the wire instructions appear."],
    ["Confirm", "The client uploads the wire. The advisor approves it."],
    ["Active", "The certificate shows term, rate, dates, and its package."],
  ];
  steps.forEach((step, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = 48 + column * 296;
    const y = 180 + row * 160;
    page.drawRectangle({ x, y: top(y + 130), width: 280, height: 130, color: ice });
    page.drawCircle({ x: x + 28, y: top(y + 28), size: 14, color: action });
    text(page, String(index + 1), x + 23, y + 24, { font: bold, size: 12, color: white });
    text(page, step[0], x + 52, y + 24, { font: bold, size: 18, color: navy });
    paragraph(page, step[1], x + 20, y + 64, 240, { size: 13, leading: 19, color: ink });
  });
  footer(page, 4, total);
}

function portal() {
  const page = slide();
  kicker(page, "For the investor", 48);
  title(page, "A portal that only shows the live work.", 84);
  const rows = [
    ["Rates", "Featured terms first, then the rest. A promotional term opens its bonus tiers."],
    ["Calculator", "The amount chips match the tiers. The rate matches the term they picked."],
    ["Signature", "Drawn once on the application, then applied to later certificates."],
    ["Progress", "Each investment has its own steps: terms, invoice, wire, active."],
    ["Certificate", "An active CD keeps amount, APY, start, maturity, and the confirmation package."],
  ];
  rows.forEach((row, index) => {
    const y = 168 + index * 64;
    text(page, row[0], 48, y, { font: bold, size: 16, color: navy });
    paragraph(page, row[1], 230, y, 660, { size: 15, leading: 21, color: ink });
    page.drawLine({ start: { x: 48, y: top(y + 40) }, end: { x: 912, y: top(y + 40) }, thickness: 1, color: line });
  });
  footer(page, 5, total);
}

function desk() {
  const page = slide();
  kicker(page, "For the firm", 48);
  title(page, "The desk is grouped the way the work is.", 84);
  const groups = [
    ["Pipeline", ["Applications, with the full file and documents", "Leads, ready for a CRM later"]],
    ["Certificates", ["Investments, from pending call to active", "Invoices and active CDs, with the package"]],
    ["People", ["Clients, including sign-in as that client", "Advisors, roles, mailbox, and personal number"]],
    ["House", ["Name, phone, domain, colors, and logo", "Email templates, Resend, and SMTP2GO"]],
  ];
  groups.forEach((group, index) => {
    const x = 48 + (index % 4) * 226;
    page.drawRectangle({ x, y: top(470), width: 214, height: 280, color: white, borderColor: line, borderWidth: 1 });
    page.drawRectangle({ x, y: top(230), width: 214, height: 40, color: navy });
    text(page, group[0], x + 16, 214, { font: bold, size: 14, color: white });
    group[1].forEach((item, itemIndex) => paragraph(page, item, x + 16, 260 + itemIndex * 78, 182, { size: 13, leading: 19, color: ink }));
  });
  footer(page, 7, total);
}

function letters() {
  const page = slide();
  kicker(page, "Advisor motion", 48);
  title(page, "The letter does the first meeting.", 84);
  const points = [
    ["Rate chart", "An introduction with the current terms, sent from the advisor's verified mailbox."],
    ["One term", "A temporary application shows only the rate that was offered, plus a promo code."],
    ["24 hours", "The link expires. A reminder goes out before it does, with the same button."],
    ["Two numbers", "The signature is the advisor. The help bar is the company phone."],
  ];
  points.forEach((point, index) => {
    const y = 180 + index * 78;
    page.drawRectangle({ x: 48, y: top(y + 16), width: 8, height: 48, color: action });
    text(page, point[0], 76, y, { font: bold, size: 18, color: navy });
    paragraph(page, point[1], 280, y, 620, { size: 15, leading: 22, color: ink });
  });
  footer(page, 6, total);
}

function trust() {
  const page = slide();
  kicker(page, "Control", 48);
  title(page, "Money does not move on a guess.", 84);
  const rules = [
    ["No investment before terms", "The desk does not hold a certificate until the client accepts and signs."],
    ["No invoice before approval", "Wire instructions appear only after the desk creates the invoice."],
    ["No active CD before payment", "The advisor confirms the wire. Then the certificate moves to Active."],
    ["FDIC, stated once", "Capital protection is part of the offer, not a footnote the client has to find."],
  ];
  rules.forEach((rule, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 48 + column * 448;
    const y = 190 + row * 150;
    page.drawRectangle({ x, y: top(y + 124), width: 428, height: 124, color: paper, borderColor: line, borderWidth: 1 });
    text(page, rule[0], x + 24, y + 28, { font: bold, size: 16, color: navy });
    paragraph(page, rule[1], x + 24, y + 60, 380, { size: 14, leading: 21, color: ink });
  });
  footer(page, 8, total);
}

function built() {
  const page = slide();
  kicker(page, "What is already running", 48);
  title(page, "This is the working surface, not a roadmap.", 84);
  const items = [
    "Six-step application with preferred amount and term",
    "Investor login, reset, and a portal link that uses your domain",
    "Rates, promo tiers, and a calculator that follows the selection",
    "Signed terms, invoice PDF, and wire confirmation",
    "Active CD detail, maturity bar, and confirmation package",
    "Leads list for the CRM that comes next",
    "Advisor role, mailbox, and personal number",
    "Resend for desk mail, SMTP2GO for advisor letters",
    "Colors, logos, background, and footer under the firm's control",
    "Daily database backup, emailed as a zip",
  ];
  items.forEach((item, index) => {
    const column = index < 5 ? 0 : 1;
    const row = index % 5;
    const x = 48 + column * 450;
    const y = 176 + row * 62;
    page.drawCircle({ x: x + 8, y: top(y - 2), size: 4, color: action });
    paragraph(page, item, x + 24, y - 8, 390, { size: 14, leading: 20, color: ink });
  });
  footer(page, 9, total);
}

function close() {
  const page = slide();
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: navy });
  page.drawRectangle({ x: 0, y: 0, width: 14, height: H, color: action });
  text(page, "THE ASK", 56, 120, { font: bold, size: 12, color: rgb(0.61, 0.77, 0.96) });
  text(page, "Put the relationship", 56, 180, { font: bold, size: 42, color: white });
  text(page, "on one record.", 56, 230, { font: bold, size: 42, color: white });
  paragraph(page, "Account Holding is ready to run a certificate desk: the client's portal, the firm's operations, and the advisor's letter, with the gates that keep a CD from becoming active too early.", 56, 300, 700, { size: 16, leading: 24, color: rgb(0.86, 0.92, 0.97) });
  footer(page, 10, total, true);
}

cover();
problem();
product();
path();
portal();
letters();
desk();
trust();
built();
close();

const bytes = await doc.save();
await writeFile(new URL("../artifacts/Account-Holding-Pitch-Deck.pdf", import.meta.url), bytes);
console.log("wrote", bytes.length);
