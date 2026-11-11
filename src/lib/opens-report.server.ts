import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type OpenRow = {
  name: string;
  email: string;
  advisorName: string;
  sentAt: string;
  mailStatus: string;
  applicationSent: boolean;
  applicationMailStatus: string;
  applicationStatus: string;
  inviteStatus: string;
  certificateActive: boolean;
  fundingStatus: string;
  investmentSigned: boolean;
  paymentUploaded: boolean;
  confirmationMailStatus: string;
};

const STAGES = ["Promo", "Application", "Investment", "Invoice", "Payment receipt", "Confirmation package", "CD active"] as const;

export async function buildOpensReportPdf(input: { company: string; from: string; to: string; advisor: string; applicationsOnly?: boolean; rows: OpenRow[] }) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const blue = rgb(0, 0.435, 0.81);
  const ink = rgb(0.15, 0.15, 0.15);
  const muted = rgb(0.35, 0.35, 0.35);
  const line = rgb(0.82, 0.84, 0.86);
  const band = rgb(0.95, 0.97, 0.99);
  const white = rgb(1, 1, 1);
  const pageWidth = 792;
  const pageHeight = 612;
  const left = 28;
  const tableWidth = pageWidth - left * 2;
  const columns = [
    { label: "#", width: 24 },
    { label: "Sent", width: 70 },
    { label: "Lead", width: 108 },
    { label: "Email", width: 150 },
    { label: "Advisor", width: 86 },
    { label: "Stage", width: 96 },
    { label: "Promo", width: 72 },
    { label: "Application", width: tableWidth - 606 },
  ];
  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 32;

  function text(value: string, x: number, yPos: number, size: number, face: typeof font, color = ink, max = 200) {
    const safe = value.replace(/[^\x20-\x7E]/g, "").trim();
    let shown = safe;
    while (shown && face.widthOfTextAtSize(shown, size) > max) shown = shown.slice(0, -1);
    if (shown !== safe && shown.length > 1) shown = `${shown.slice(0, -1)}…`;
    page.drawText(shown || "—", { x, y: yPos, size, font: face, color });
  }

  function header() {
    text(input.company || "Account Holding", left, y, 16, bold, blue, 360);
    text("Opens report", pageWidth - left - 110, y, 12, bold, blue, 110);
    y -= 16;
    text(`${input.from} to ${input.to} UTC`, left, y, 9, font, muted, 240);
    text(input.applicationsOnly ? "Application email sent" : "All opens", left + 250, y, 9, font, muted, 150);
    text(input.advisor ? `Advisor: ${input.advisor}` : "All advisors", left + 400, y, 9, font, muted, 180);
    text(`${input.rows.length} open${input.rows.length === 1 ? "" : "s"}`, pageWidth - left - 80, y, 9, font, muted, 80);
    y -= 14;
    const counts = STAGES.map((stage) => input.rows.filter((row) => openStage(row) === stage).length);
    const labels = ["Promo", "Applied", "Invested", "Invoice", "Receipt", "Package", "Active"];
    counts.forEach((count, index) => {
      const x = left + index * 104;
      text(String(count), x, y, 11, bold, ink, 36);
      text(labels[index], x + 24, y, 8, font, muted, 76);
    });
    y -= 16;
    page.drawLine({ start: { x: left, y }, end: { x: pageWidth - left, y }, thickness: 0.6, color: line });
    y -= 16;
  }

  function tableHead() {
    page.drawRectangle({ x: left, y: y - 4, width: tableWidth, height: 16, color: blue });
    let x = left + 4;
    for (const column of columns) {
      text(column.label, x, y, 8, bold, white, column.width - 8);
      x += column.width;
    }
    y -= 18;
  }

  function newPage() {
    page = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - 32;
    text(`${input.company || "Account Holding"} · Opens · ${input.from} to ${input.to}`, left, y, 9, font, muted, 500);
    y -= 18;
    tableHead();
  }

  header();
  tableHead();
  if (!input.rows.length) {
    text("No opens were sent in this date range.", left, y, 10, font, muted, 400);
  }
  input.rows.forEach((row, index) => {
    if (y < 36) newPage();
    if (index % 2 === 0) page.drawRectangle({ x: left, y: y - 4, width: tableWidth, height: 16, color: band });
    const cells = [
      String(index + 1),
      row.sentAt.replace(" ", " · "),
      row.name,
      row.email,
      row.advisorName || "No advisor",
      openStage(row),
      row.mailStatus ? statusLabel(row.mailStatus) : "Not sent",
      applicationLabel(row),
    ];
    let x = left + 4;
    cells.forEach((value, cell) => {
      text(value, x, y, 8, cell === 2 ? bold : font, ink, columns[cell].width - 8);
      x += columns[cell].width;
    });
    y -= 16;
  });
  const pages = doc.getPages();
  pages.forEach((item, index) => {
    item.drawText(`Page ${index + 1} of ${pages.length}`, { x: pageWidth - 90, y: 16, size: 8, font, color: muted });
  });
  return Buffer.from(await doc.save());
}

function applicationLabel(row: OpenRow) {
  if (row.applicationStatus === "approved") return "Approved";
  if (row.applicationStatus === "hold") return "On hold";
  if (row.applicationStatus) return "Applied";
  if (!row.applicationSent) return "Not sent";
  if (row.inviteStatus !== "open") return "Link expired";
  return `Link open · ${statusLabel(row.applicationMailStatus)}`;
}

function openStage(row: OpenRow) {
  if (row.certificateActive) return "CD active";
  const invoiceApproved = row.fundingStatus === "instructions_sent" || row.fundingStatus === "payment_approved";
  if (row.paymentUploaded) return row.confirmationMailStatus ? "Confirmation package" : "Payment receipt";
  if (invoiceApproved) return "Invoice";
  if (row.fundingStatus || row.investmentSigned) return "Investment";
  if (row.applicationStatus) return "Application";
  if (row.applicationSent) return "Application";
  return "Promo";
}

function statusLabel(status: string) {
  const labels: Record<string, string> = { opened: "Opened", clicked: "Clicked", delivered: "Delivered", sent: "Sent", bounced: "Bounced" };
  return labels[status] || (status ? status : "Sent");
}
