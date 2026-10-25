export const DEFAULT_COMPANY_NAME = "Account Holding";

export function cleanCompanyName(value: string) {
  const name = value.trim().replace(/\s+/g, " ");
  if (!name || name.length > 80) throw new Error("Enter a company name up to 80 characters.");
  return name;
}

export function cloudflareToken(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const beacon = trimmed.match(/"token"\s*:\s*"([A-Za-z0-9_-]+)"/);
  if (beacon) return beacon[1];
  if (/^[A-Za-z0-9_-]{8,}$/.test(trimmed)) return trimmed;
  return "";
}

export function cleanBackupEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!email) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) throw new Error("Enter a backup email address.");
  return email;
}

export function cleanCloudflareCode(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length > 2000) throw new Error("Cloudflare code is too long.");
  if (!cloudflareToken(trimmed)) throw new Error("Paste the Cloudflare analytics snippet or its token.");
  return trimmed;
}
