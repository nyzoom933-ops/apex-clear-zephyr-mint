export type InvoiceBilling = {
  brand: string;
  bankName: string;
  accountName: string;
  beneficiaryAddress: string;
  accountNumber: string;
  routingNumber: string;
  crn: string;
  purpose: string;
  contactName: string;
  contactAddress: string;
  phone: string;
  fdic: string;
};

export const DEFAULT_INVOICE_BILLING: InvoiceBilling = {
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
  fdic: "27471",
};

export function invoiceCrn(name: string, reference: string) {
  const clean = reference.replace(/[^A-Za-z0-9]/g, "");
  if (clean) return clean.slice(0, 16).toUpperCase();
  const surname = name.split(" ").filter(Boolean).pop() ?? "CLIENT";
  return `${surname.replace(/[^A-Za-z]/g, "").slice(0, 8).toUpperCase()}17`;
}

export function resolveInvoiceBilling(raw: unknown, clientName: string, reference: string): InvoiceBilling {
  const stored = raw && typeof raw === "object" ? (raw as Partial<InvoiceBilling>) : {};
  const text = (value: unknown, fallback: string) => (typeof value === "string" && value.trim() ? value.trim() : fallback);
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
    fdic: text(stored.fdic, DEFAULT_INVOICE_BILLING.fdic),
  };
}
