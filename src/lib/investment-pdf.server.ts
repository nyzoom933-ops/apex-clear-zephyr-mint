import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type InvestmentPdfInput = {
  investor: string;
  email: string;
  issuer: string;
  structure: string;
  currency: string;
  jurisdiction: string;
  couponType: string;
  minimum: string;
  creditRating: string;
  capitalProtection: string;
  termLabel: string;
  amount: string;
  frequency: string;
  promoApy: string;
  finalApy: string;
  signerName: string;
  signedOn: string;
  signaturePng?: Uint8Array;
  companyName?: string;
};

export type ConfirmationPdfInput = InvestmentPdfInput & {
  clientName: string;
  address: string[];
  issueDate: string;
  maturityDate: string;
  confirmationDate: string;
  termMonths: number;
  depositCode: string;
  depositNumber: string;
  accountNumber: string;
  referenceNumber: string;
  advisorName: string;
  advisorPhone: string;
};

export async function buildConfirmationPdf(input: ConfirmationPdfInput) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const blue = rgb(0.18, 0.47, 0.73);
  const ink = rgb(0.15, 0.15, 0.15);
  const muted = rgb(0.35, 0.35, 0.35);
  const line = rgb(0.18, 0.47, 0.73);
  const band = rgb(0.94, 0.95, 0.96);
  const pages: ReturnType<PDFDocument["addPage"]>[] = [];
  let page = doc.addPage([612, 792]);
  pages.push(page);
  let y = 760;
  const left = 40;
  const width = 532;

  function newPage(withBanner: boolean) {
    page = doc.addPage([612, 792]);
    pages.push(page);
    y = 760;
    if (withBanner) banner();
  }

  function need(height: number) {
    if (y < 42 + height) newPage(true);
  }

  function banner() {
    page.drawRectangle({ x: left, y: y - 34, width, height: 34, color: blue });
    const title = "CERTIFICATE OF DEPOSIT (CD) CLIENT CONFIRMATION PACKAGE";
    const issuer = input.issuer.toUpperCase();
    page.drawText(issuer, {
      x: left + (width - bold.widthOfTextAtSize(issuer, 9)) / 2,
      y: y - 14,
      size: 9,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText(title, {
      x: left + (width - bold.widthOfTextAtSize(title, 8)) / 2,
      y: y - 26,
      size: 8,
      font: bold,
      color: rgb(1, 1, 1),
    });
    y -= 48;
  }

  function heading(value: string) {
    need(28);
    page.drawText(value, { x: left, y, size: 11, font: bold, color: ink });
    y -= 4;
    page.drawLine({ start: { x: left, y }, end: { x: left + width, y }, thickness: 1, color: line });
    y -= 14;
  }

  function paragraph(value: string, size = 9) {
    for (const row of linesOf(value, font, size, width)) {
      need(14);
      page.drawText(row, { x: left, y, size, font, color: ink });
      y -= size + 2;
    }
  }

  function bullet(value: string) {
    const rows = linesOf(value, font, 9, width - 16);
    rows.forEach((row, index) => {
      need(14);
      page.drawText(index === 0 ? "-" : " ", { x: left + 8, y, size: 9, font, color: ink });
      page.drawText(row, { x: left + 18, y, size: 9, font, color: ink });
      y -= 11;
    });
  }

  function gap(amount = 8) {
    y -= amount;
  }

  const brandName = pdfSafe(input.companyName || "Account Holding");
  const brand = brandName.toUpperCase();
  const brandSub = "CERTIFICATE OF DEPOSIT";
  page.drawText(brand, { x: left + (width - bold.widthOfTextAtSize(brand, 16)) / 2, y, size: 16, font: bold, color: blue });
  y -= 16;
  page.drawText(brandSub, { x: left + (width - font.widthOfTextAtSize(brandSub, 10)) / 2, y, size: 10, font, color: blue });
  y -= 16;
  banner();

  const boxTop = y;
  const boxHeight = 78;
  page.drawRectangle({ x: left, y: boxTop - boxHeight, width: 250, height: boxHeight, color: band });
  page.drawRectangle({ x: left + 258, y: boxTop - boxHeight, width: 274, height: boxHeight, color: band });
  const client = input.clientName.toUpperCase();
  page.drawText("Client name", { x: left + 8, y: boxTop - 14, size: 8, font: bold, color: muted });
  page.drawText(client, { x: left + 8, y: boxTop - 26, size: 9, font: bold, color: ink });
  input.address.slice(0, 3).forEach((row, index) => {
    page.drawText(row.toUpperCase(), { x: left + 8, y: boxTop - 40 - index * 11, size: 8, font, color: ink });
  });
  const codes: [string, string][] = [
    ["Deposit code", input.depositCode],
    ["Deposit number", input.depositNumber],
    ["Account number", input.accountNumber],
    ["Confirmation date", input.confirmationDate],
    ["Reference number", input.referenceNumber],
  ];
  codes.forEach(([label, value], index) => {
    const rowY = boxTop - 14 - index * 13;
    page.drawText(label, { x: left + 266, y: rowY, size: 8, font, color: muted });
    page.drawText(value, { x: left + 390, y: rowY, size: 8, font: bold, color: ink });
  });
  y = boxTop - boxHeight - 16;

  heading("OFFICIAL CD CONFIRMATION ADVICE");
  paragraph(`This document confirms the establishment of your Certificate of Deposit with ${input.issuer}.`);
  gap(6);

  const facts: [string, string][] = [
    ["Deposit amount", input.amount],
    ["Annual percentage yield (APY)", input.finalApy],
    ["Interest rate", "FIXED"],
    ["Term", input.termMonths ? `${input.termMonths} MONTHS` : input.termLabel],
    ["Compounding frequency", "DAILY"],
    ["Callable feature", "NON-CALLABLE"],
    ["Issue date", input.issueDate],
    ["Maturity date", input.maturityDate],
  ];
  facts.forEach(([label, value], index) => {
    need(16);
    if (index % 2 === 0) page.drawRectangle({ x: left, y: y - 4, width, height: 16, color: band });
    page.drawText(label, { x: left + 8, y, size: 9, font, color: ink });
    page.drawText(value || "—", { x: left + 280, y, size: 9, font: bold, color: ink });
    y -= 16;
  });
  gap(12);

  heading("INTEREST CALCULATION METHODOLOGY");
  paragraph("Interest is calculated on the daily balance. A daily periodic rate is applied to principal each day.");
  bullet("Interest accrues daily based on a 365-day year.");
  bullet("Interest compounds daily.");
  bullet("Interest compounds daily and is included in the stated APY.");
  bullet("The APY is the annualized yield, including the effect of compounding, if funds stay on deposit for the full term.");
  paragraph("No interest is paid if the certificate is closed before funding settlement.");
  gap(8);

  heading("BINDING TERMS AND CONDITIONS");
  paragraph(`This Certificate of Deposit is issued by ${input.issuer} and recorded by ${brandName}. By funding this certificate, you agree to the following provisions.`);
  gap(4);
  paragraph("1. Fixed-term obligation", 10);
  paragraph(`Your funds are committed for the full ${input.termMonths || ""}-month term. A withdrawal before maturity is allowed only under the early-withdrawal terms below.`.replace("  ", " "));

  paragraph("2. Early withdrawal penalty", 10);
  paragraph("If funds are withdrawn before the maturity date:");
  bullet("A penalty of up to 180 days of simple interest may be assessed.");
  bullet("The penalty may reduce earned interest and, if needed, principal.");
  bullet("Partial withdrawals may not be permitted.");
  paragraph("The issuer may waive a penalty in the event of death or legal incapacity.");
  gap(6);
  paragraph("3. Non-callable feature", 10);
  bullet("The issuer may not redeem or end this certificate before maturity.");
  bullet("The contracted yield is fixed for the full term.");
  gap(6);
  paragraph("4. Maturity instructions", 10);
  bullet("Before maturity you can give instructions to renew or to have proceeds returned.");
  bullet("A grace period of 10 calendar days follows maturity.");
  bullet("If no instructions are received, the certificate may renew for a similar term at the rate then offered.");
  gap(6);
  paragraph("5. Interest payment terms", 10);
  bullet("Interest is included in the stated APY.");
  bullet("An early withdrawal can reduce accrued interest.");
  gap(6);
  paragraph("6. Ownership and transfer", 10);
  bullet("This certificate is not transferable without prior written consent.");
  bullet("An ownership change must meet the issuer's legal requirements.");
  gap(6);
  paragraph("7. Limitation of liability", 10);
  paragraph(`${brandName} and the issuer are not liable for losses from market conditions, delays in external payment systems, or unauthorized access caused by a failure to protect your sign-in.`);
  gap(6);
  paragraph("8. Governing law", 10);
  paragraph("This confirmation is governed by applicable federal law.");
  gap(8);

  heading("TRUTH IN SAVINGS DISCLOSURE");
  paragraph("In keeping with federal deposit disclosures:");
  bullet(`The APY of ${input.finalApy} assumes funds remain on deposit for the full term.`);
  bullet("Daily compounding is reflected in the APY.");
  bullet("No maintenance or service fee is charged on this certificate.");
  bullet("An early withdrawal penalty may reduce earnings.");
  paragraph("This disclosure is provided for the certificate described above.");
  gap(6);
  paragraph(`Deposit insurance: ${input.capitalProtection || "Deposits are insured up to the applicable federal limit per depositor, per ownership category."}`);
  gap(14);

  heading("ACCOUNT STATEMENTS");
  paragraph("You will receive periodic account statements, which include:");
  bullet("Opening and current balance.");
  bullet("Interest accrued.");
  bullet("Account activity.");
  gap(8);
  heading("SECURITY");
  paragraph("Protecting your account is a priority. We will never:");
  bullet("Request your password or full sign-in credentials.");
  bullet("Ask you to transfer funds so we can verify your identity.");
  bullet("Ask for sensitive information in an unsolicited message.");
  paragraph("If something looks wrong, contact your advisor through the investor portal.");
  gap(8);
  heading("CLIENT SERVICE");
  paragraph("Client service is available Monday to Friday, 9:00am to 5:00pm.");
  bullet(input.advisorName ? `Advisor: ${input.advisorName}${input.advisorPhone ? `, ${input.advisorPhone}` : ""}.` : "Your advisor's name and phone appear on the investment once assigned.");
  bullet("Messages can also be sent from the investor portal.");
  gap(8);
  heading("MATURITY PROCESS");
  paragraph("Before maturity you will receive a notice with:");
  bullet("Your projected maturity value.");
  bullet("Renewal rate options.");
  bullet("Instructions and deadlines.");
  paragraph("If no instructions arrive during the grace period, the certificate may renew.");
  gap(8);
  heading("FINAL ACKNOWLEDGMENT");
  paragraph(`Thank you for opening this certificate with ${input.issuer}.`);
  paragraph("Your confirmation is stored with your active CD. The figures above are the terms in effect after payment was confirmed.");
  if (input.signerName) {
    gap(8);
    paragraph(`Signed by ${input.signerName}${input.signedOn ? ` on ${input.signedOn}` : ""}.`);
    if (input.signaturePng) {
      const image = await doc.embedPng(input.signaturePng);
      const imageWidth = 160;
      const natural = (image.height / image.width) * imageWidth;
      const room = y - 36;
      if (room < 36) newPage(true);
      const imageHeight = Math.min(44, natural, Math.max(y - 36, 36));
      page.drawImage(image, { x: left, y: y - imageHeight, width: imageWidth, height: imageHeight });
    }
  }

  pages.forEach((item, index) => {
    item.drawText(brandName, { x: left, y: 28, size: 8, font, color: muted });
    item.drawText(`Page ${index + 1} of ${pages.length}`, { x: left, y: 16, size: 8, font, color: muted });
    const mark = "CONFIRMATION";
    item.drawText(mark, { x: left + width - bold.widthOfTextAtSize(mark, 9), y: 22, size: 9, font: bold, color: blue });
  });

  const bytes = await doc.save();
  return Buffer.from(bytes).toString("base64");
}

function pdfSafe(value: string) {
  return value.replace(/[^\x20-\x7E]/g, "").trim() || "Account Holding";
}

function linesOf(value: string, face: Awaited<ReturnType<PDFDocument["embedFont"]>>, size: number, maxWidth: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (face.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildInvestmentPdf(input: InvestmentPdfInput) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([612, 792]);
  const ink = rgb(0.09, 0.13, 0.11);
  const muted = rgb(0.35, 0.38, 0.36);
  let y = 748;

  function text(value: string, size: number, face: typeof font, color = ink) {
    page.drawText(value, { x: 48, y, size, font: face, color });
    y -= size + 6;
  }

  function row(label: string, value: string) {
    page.drawText(label, { x: 48, y, size: 10, font: bold, color: muted });
    page.drawText(value || "—", { x: 220, y, size: 11, font, color: ink });
    y -= 18;
  }

  text("Certificate of Deposit — Investment terms", 18, bold);
  y -= 6;
  text("This document records the terms the investor confirmed and signed.", 10, font, muted);
  y -= 8;

  text("Certificate overview", 13, bold);
  y -= 4;
  row("Issuer", input.issuer);
  row("Structure", input.structure);
  y -= 6;
  text("Key terms", 13, bold);
  y -= 4;
  row("Investment", input.termLabel);
  row("Amount", input.amount);
  row("Callable feature", "Non-callable");
  row("Promo APY", input.promoApy);
  row("Final APY", input.finalApy);
  row("Minimum investment", input.minimum);
  y -= 6;
  text("Capital protection", 13, bold);
  y -= 2;
  const cover = input.capitalProtection || "100% cover on the first $250,000 per individual or $500,000 per joint account";
  for (const line of wrap(cover, 88)) text(line, 10, font);
  y -= 4;
  text("Fees", 13, bold);
  y -= 2;
  for (const line of wrap(
    "A fixed $4.99 dealing fee applies to each purchase. Where early liquidation is available, a $4.99 fee applies to each request. If the certificate is held to maturity, no early-liquidation fee applies. Early withdrawal penalties may apply.",
    88,
  )) {
    text(line, 10, font);
  }

  y -= 10;
  text("Investor signature", 13, bold);
  y -= 4;
  row("Name", input.signerName || "—");
  row("Email", input.email);
  row("Signed", input.signedOn || "Not signed yet");
  y -= 4;
  if (input.signaturePng) {
    const image = await doc.embedPng(input.signaturePng);
    const width = 180;
    const height = Math.min(70, (image.height / image.width) * width);
    page.drawRectangle({ x: 48, y: y - height - 8, width: width + 16, height: height + 16, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1 });
    page.drawImage(image, { x: 56, y: y - height, width, height });
  } else {
    text("Signature will appear here after the investor signs.", 10, font, muted);
  }

  const bytes = await doc.save();
  return Buffer.from(bytes).toString("base64");
}

function wrap(value: string, width: number) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}
