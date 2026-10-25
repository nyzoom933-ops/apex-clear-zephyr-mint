import { createServerFn } from "@tanstack/react-start";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { FormState } from "@/lib/application-data";
import { cleanBackupEmail, cleanCloudflareCode, cleanCompanyName, DEFAULT_COMPANY_NAME } from "@/lib/company";
import type { Sql } from "@/lib/db";
import { isWorkspacePreview } from "@/lib/env.server";
import type { MailStep } from "@/lib/mail.server";
import { formatBonus, matchTier, type PromoOffer, type PromoTier } from "@/lib/promo";

export type ApplicationPayload = Omit<FormState, "password" | "confirmPassword">;

export type ApplicationRow = {
  id: string;
  status: "pending" | "approved" | "hold";
  submittedAt: string;
  applicantName: string;
  email: string;
  accountType: string;
  currency: string;
  payload: ApplicationPayload;
};

const COOKIE = "ah_admin";
const PREVIEW_EMAIL = "admin@accountholding.com";
const PREVIEW_PASSWORD = "holding-admin";

function cookieOptions(maxAge: number) {
  return { path: "/", httpOnly: true, sameSite: "lax" as const, secure: !isWorkspacePreview(), maxAge };
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sameToken(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function saveSetting(sql: Sql, key: string, value: string) {
  await sql`
    insert into site_settings (key, value) values (${key}, ${value})
    on conflict (key) do update set value = excluded.value
  `;
}

async function readDesk(sql: Sql) {
  const rows = await sql<{ key: string; value: string }>`
    select key, value from site_settings where key in ('desk_email', 'desk_password_hash', 'desk_session')
  `;
  const desk = { email: "", passwordHash: "", session: "" };
  for (const row of rows) {
    if (row.key === "desk_email") desk.email = row.value.trim().toLowerCase();
    if (row.key === "desk_password_hash") desk.passwordHash = row.value;
    if (row.key === "desk_session") desk.session = row.value;
  }
  if (!desk.passwordHash && isWorkspacePreview()) {
    const { hashPassword } = await import("@/lib/passwords.server");
    desk.email = PREVIEW_EMAIL;
    desk.passwordHash = await hashPassword(PREVIEW_PASSWORD);
    await saveSetting(sql, "desk_email", desk.email);
    await saveSetting(sql, "desk_password_hash", desk.passwordHash);
  }
  return desk;
}

async function startDeskSession(sql: Sql) {
  const token = randomBytes(32).toString("hex");
  await saveSetting(sql, "desk_session", tokenHash(token));
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, token, cookieOptions(60 * 60 * 12));
}

async function readSignedIn() {
  const { getCookie } = await import("@tanstack/react-start/server");
  const token = getCookie(COOKIE);
  if (!token) return false;
  const { getSql } = await import("@/lib/db");
  const desk = await readDesk(await getSql());
  return Boolean(desk.session) && sameToken(tokenHash(token), desk.session);
}

function stripSecrets(input: FormState | ApplicationPayload): ApplicationPayload {
  const { password: _password, confirmPassword: _confirm, ...rest } = input as FormState;
  void _password;
  void _confirm;
  return rest;
}

async function requireAdmin() {
  if (!(await readSignedIn())) throw new Error("Sign in required.");
}

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const desk = await readDesk(await getSql());
  return { signedIn: await readSignedIn(), needsSetup: !desk.passwordHash };
});

export const adminLogin = createServerFn({ method: "POST" })
  .validator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { verifyPassword } = await import("@/lib/passwords.server");
    const sql = await getSql();
    const desk = await readDesk(sql);
    const email = data.email.trim().toLowerCase();
    if (!desk.passwordHash || email !== desk.email || !(await verifyPassword(data.password, desk.passwordHash))) {
      throw new Error("Those credentials are not recognized.");
    }
    await startDeskSession(sql);
    return { ok: true };
  });

export const createDeskLogin = createServerFn({ method: "POST" })
  .validator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a desk email.");
    if (data.password.length < 8) throw new Error("Use a password of at least 8 characters.");
    const { getSql } = await import("@/lib/db");
    const { hashPassword } = await import("@/lib/passwords.server");
    const sql = await getSql();
    const desk = await readDesk(sql);
    if (desk.passwordHash) throw new Error("The desk login already exists.");
    await saveSetting(sql, "desk_email", email);
    await saveSetting(sql, "desk_password_hash", await hashPassword(data.password));
    await startDeskSession(sql);
    return { ok: true };
  });

export const saveDeskLogin = createServerFn({ method: "POST" })
  .validator((input: { email: string; currentPassword: string; newPassword: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a desk email.");
    if (data.newPassword && data.newPassword.length < 8) throw new Error("Use a password of at least 8 characters.");
    const { getSql } = await import("@/lib/db");
    const { hashPassword, verifyPassword } = await import("@/lib/passwords.server");
    const sql = await getSql();
    const desk = await readDesk(sql);
    if (!desk.passwordHash || !(await verifyPassword(data.currentPassword, desk.passwordHash))) {
      throw new Error("The current password is not recognized.");
    }
    await saveSetting(sql, "desk_email", email);
    if (data.newPassword) await saveSetting(sql, "desk_password_hash", await hashPassword(data.newPassword));
    return { ok: true };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const { setCookie } = await import("@tanstack/react-start/server");
  const sql = await getSql();
  await sql`delete from site_settings where key = 'desk_session'`;
  setCookie(COOKIE, "", cookieOptions(0));
  return { ok: true };
});

export const submitApplication = createServerFn({ method: "POST" })
  .validator((input: FormState) => {
    if (!input.password || input.password.length < 8) throw new Error("A password is required.");
    return input;
  })
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { hashPassword } = await import("@/lib/passwords.server");
    const sql = await getSql();
    const id = crypto.randomUUID();
    const payload = { ...stripSecrets(data), currency: "USD" as const };
    const email = data.email.trim().toLowerCase();
    const name = [payload.firstName, payload.middleName, payload.surname].filter(Boolean).join(" ");
    const passwordHash = await hashPassword(data.password);
    await sql`
      insert into applications (id, applicant_name, email, account_type, currency, payload, password_hash)
      values (${id}, ${name}, ${email}, ${payload.accountType}, ${payload.currency}, ${JSON.stringify(payload)}::jsonb, ${passwordHash})
    `;
    await sendStep(sql, {
      step: "application_submitted",
      clientEmail: email,
      clientName: name,
      detail: [`${payload.accountType} account`, `Sign-in email ${email}`].join("\n"),
      relatedId: id,
    });
    return { id };
  });

export const listApplications = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const { ensureDemoApplications } = await import("@/lib/seed-applications.server");
  const sql = await getSql();
  await ensureDemoApplications(sql);
  const rows = await sql<{
    id: string;
    status: ApplicationRow["status"];
    submitted_at: string;
    applicant_name: string;
    email: string;
    account_type: string;
    currency: string;
    payload: ApplicationPayload | string;
  }>`
    select id, status, to_char(submitted_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as submitted_at,
           applicant_name, email, account_type, currency, payload
    from applications
    order by submitted_at desc
  `;
  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    submittedAt: row.submitted_at,
    applicantName: row.applicant_name,
    email: row.email,
    accountType: row.account_type,
    currency: row.currency,
    payload: typeof row.payload === "string" ? (JSON.parse(row.payload) as ApplicationPayload) : row.payload,
  }));
});

export const setApplicationStatus = createServerFn({ method: "POST" })
  .validator((input: { id: string; status: ApplicationRow["status"] }) => {
    if (!["pending", "approved", "hold"].includes(input.status)) throw new Error("Unknown status.");
    return input;
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ email: string; applicant_name: string; account_type: string; password_hash: string | null; status: string }>`
      select email, applicant_name, account_type, password_hash, status from applications where id = ${data.id}
    `;
    if (!rows[0]) throw new Error("Application not found.");
    if (rows[0].status === data.status) return { ok: true as const, loginEmail: data.status === "approved" ? String(rows[0].email).trim().toLowerCase() : null };
    if (data.status === "approved" && !rows[0].password_hash) throw new Error("This application has no password, so a login cannot be created.");
    await sql`update applications set status = ${data.status} where id = ${data.id}`;
    const email = String(rows[0].email).trim().toLowerCase();
    const step: MailStep = data.status === "approved" ? "application_approved" : data.status === "hold" ? "application_hold" : "application_pending";
    await sendStep(sql, {
      step,
      clientEmail: email,
      clientName: rows[0].applicant_name,
      detail: [`${rows[0].account_type} account`, `Sign-in email ${email}`].join("\n"),
      relatedId: data.id,
    });
    if (data.status === "approved") {
      await sql`
        insert into investor_users (email, password_hash, application_id)
        values (${email}, ${rows[0].password_hash}, ${data.id})
        on conflict (email) do update
        set password_hash = excluded.password_hash, application_id = excluded.application_id
      `;
      return { ok: true as const, loginEmail: email };
    }
    await sql`delete from investor_users where application_id = ${data.id}`;
    return { ok: true as const, loginEmail: null };
  });

export const investorLogin = createServerFn({ method: "POST" })
  .validator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { verifyPassword } = await import("@/lib/passwords.server");
    const { ensureDemoApplications } = await import("@/lib/seed-applications.server");
    const sql = await getSql();
    await ensureDemoApplications(sql);
    const email = data.email.trim().toLowerCase();
    const rows = await sql<{ status: ApplicationRow["status"]; password_hash: string | null }>`
      select status, password_hash from applications
      where email = ${email}
      order by submitted_at desc
      limit 1
    `;
    const hash = rows[0]?.password_hash;
    if (!hash || !(await verifyPassword(data.password, hash))) {
      throw new Error("Those credentials are not recognized.");
    }
    const { setCookie } = await import("@tanstack/react-start/server");
    setCookie("ah_investor", email, cookieOptions(60 * 60 * 12));
    return { destination: rows[0].status === "approved" ? ("portal" as const) : ("application" as const) };
  });

export type SiteBrand = {
  logo: string | null;
  favicon: string | null;
  companyName: string;
  cloudflareCode: string;
  cover: string | null;
  socialBanner: string | null;
  emailLogo: string | null;
  backupEmail: string;
  lastBackupAt: string;
};

function assertShareImage(value: string | null) {
  if (!value) return null;
  if (!/^data:image\/(png|jpeg);base64,/.test(value) || value.length > 1_400_000) {
    throw new Error("Use a JPEG or PNG under 1 MB.");
  }
  return value;
}

function assertImage(value: string | null) {
  if (!value) return null;
  if (!value.startsWith("data:image/") || value.length > 500_000) {
    throw new Error("Use an image under 400 KB.");
  }
  return value;
}

async function publishSocialCard(dataUrl: string | null) {
  const { access, copyFile, unlink, writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const dir = join(process.cwd(), "public");
  const jpg = join(dir, "og.jpg");
  const png = join(dir, "og.png");
  const backup = join(dir, "og-default.jpg");
  const exists = async (path: string) => access(path).then(() => true, () => false);
  if (!(await exists(backup)) && (await exists(jpg))) await copyFile(jpg, backup);
  if (!dataUrl) {
    await unlink(png).catch(() => undefined);
    if (await exists(backup)) await copyFile(backup, jpg);
    return;
  }
  const match = dataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/i);
  if (!match) return;
  const encoded = match[2];
  if (match[1].toLowerCase() === "png") {
    await writeFile(png, Buffer.from(encoded, "base64"));
    await unlink(jpg).catch(() => undefined);
  } else {
    await writeFile(jpg, Buffer.from(encoded, "base64"));
    await unlink(png).catch(() => undefined);
  }
}

export const getSiteBrand = createServerFn({ method: "GET" }).handler(async (): Promise<SiteBrand> => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ key: string; value: string }>`
    select key, value from site_settings where key in ('logo', 'favicon', 'company_name', 'cloudflare_code', 'cover', 'social_banner', 'email_logo', 'backup_email', 'backup_at')
  `;
  const brand: SiteBrand = {
    logo: null,
    favicon: null,
    companyName: DEFAULT_COMPANY_NAME,
    cloudflareCode: "",
    cover: null,
    socialBanner: null,
    emailLogo: null,
    backupEmail: "",
    lastBackupAt: "",
  };
  for (const row of rows) {
    if (row.key === "logo" || row.key === "favicon" || row.key === "cover") brand[row.key] = row.value;
    if (row.key === "social_banner") brand.socialBanner = row.value;
    if (row.key === "email_logo") brand.emailLogo = row.value;
    if (row.key === "backup_email") brand.backupEmail = row.value;
    if (row.key === "backup_at") brand.lastBackupAt = row.value;
    if (row.key === "company_name" && row.value.trim()) brand.companyName = row.value.trim();
    if (row.key === "cloudflare_code") brand.cloudflareCode = row.value;
  }
  return brand;
});

export const setSiteBrand = createServerFn({ method: "POST" })
  .validator((input: SiteBrand) => ({
    logo: assertImage(input.logo),
    favicon: assertImage(input.favicon),
    companyName: cleanCompanyName(input.companyName || DEFAULT_COMPANY_NAME),
    cloudflareCode: cleanCloudflareCode(input.cloudflareCode || ""),
    cover: assertShareImage(input.cover),
    socialBanner: assertShareImage(input.socialBanner),
    emailLogo: assertImage(input.emailLogo),
    backupEmail: cleanBackupEmail(input.backupEmail || ""),
    lastBackupAt: input.lastBackupAt || "",
  }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    for (const key of ["logo", "favicon", "cover", "socialBanner", "emailLogo"] as const) {
      const column = key === "socialBanner" ? "social_banner" : key === "emailLogo" ? "email_logo" : key;
      const value = data[key];
      if (!value) {
        await sql`delete from site_settings where key = ${column}`;
      } else {
        await sql`
          insert into site_settings (key, value) values (${column}, ${value})
          on conflict (key) do update set value = excluded.value
        `;
      }
    }
    await publishSocialCard(data.socialBanner || data.cover);
    await sql`
      insert into site_settings (key, value) values ('company_name', ${data.companyName})
      on conflict (key) do update set value = excluded.value
    `;
    if (!data.cloudflareCode) {
      await sql`delete from site_settings where key = 'cloudflare_code'`;
    } else {
      await sql`
        insert into site_settings (key, value) values ('cloudflare_code', ${data.cloudflareCode})
        on conflict (key) do update set value = excluded.value
      `;
    }
    if (!data.backupEmail) {
      await sql`delete from site_settings where key = 'backup_email'`;
    } else {
      await sql`
        insert into site_settings (key, value) values ('backup_email', ${data.backupEmail})
        on conflict (key) do update set value = excluded.value
      `;
    }
    return data;
  });

export const runDatabaseBackup = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  const { runBackup } = await import("@/lib/backup.server");
  const result = await runBackup();
  if (!result.ok) throw new Error(result.error);
  return result;
});

export const getMailSetup = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const { mailSetupView } = await import("@/lib/mail.server");
  return mailSetupView(await getSql());
});

export const saveMailSetup = createServerFn({ method: "POST" })
  .validator((input: { apiKey: string; mailFrom: string; clearKey: boolean }) => ({
    apiKey: input.apiKey || "",
    mailFrom: input.mailFrom || "",
    clearKey: Boolean(input.clearKey),
  }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { cleanMailFrom, cleanResendKey } = await import("@/lib/mail.server");
    const apiKey = cleanResendKey(data.apiKey);
    const mailFrom = cleanMailFrom(data.mailFrom);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    if (data.clearKey) {
      await sql`delete from site_settings where key = 'resend_api_key'`;
    } else if (apiKey) {
      await sql`
        insert into site_settings (key, value) values ('resend_api_key', ${apiKey})
        on conflict (key) do update set value = excluded.value
      `;
    }
    if (!mailFrom) {
      await sql`delete from site_settings where key = 'mail_from'`;
    } else {
      await sql`
        insert into site_settings (key, value) values ('mail_from', ${mailFrom})
        on conflict (key) do update set value = excluded.value
      `;
    }
    const { mailSetupView } = await import("@/lib/mail.server");
    return mailSetupView(sql);
  });

export type InvestorSession = {
  email: string;
  name: string;
  status: ApplicationRow["status"];
  accountType: string;
  currency: string;
  destination: "portal" | "application";
};

export const getInvestorSession = createServerFn({ method: "GET" }).handler(async (): Promise<InvestorSession | null> => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { getSql } = await import("@/lib/db");
  const { ensureDemoApplications } = await import("@/lib/seed-applications.server");
  const email = getCookie("ah_investor");
  if (!email) return null;
  const sql = await getSql();
  await ensureDemoApplications(sql);
  const rows = await sql<{
    status: ApplicationRow["status"];
    applicant_name: string;
    email: string;
    account_type: string;
    currency: string;
  }>`
    select status, applicant_name, email, account_type, currency
    from applications
    where email = ${email}
    order by submitted_at desc
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    email: row.email,
    name: row.applicant_name,
    status: row.status,
    accountType: row.account_type,
    currency: row.currency,
    destination: row.status === "approved" ? "portal" : "application",
  };
});

export const getInvestorPortal = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { getSql } = await import("@/lib/db");
  const { ensureDemoApplications } = await import("@/lib/seed-applications.server");
  const email = getCookie("ah_investor");
  if (!email) throw new Error("Sign in required.");
  const sql = await getSql();
  await ensureDemoApplications(sql);
  const rows = await sql<{
    status: ApplicationRow["status"];
    submitted_at: string;
    applicant_name: string;
    email: string;
    account_type: string;
    currency: string;
    payload: ApplicationPayload | string;
  }>`
    select status, to_char(submitted_at at time zone 'UTC', 'YYYY-MM-DD') as submitted_at,
           applicant_name, email, account_type, currency, payload
    from applications
    where email = ${email}
    order by submitted_at desc
    limit 1
  `;
  const row = rows[0];
  if (!row || row.status !== "approved") throw new Error("Sign in required.");
  const payload = typeof row.payload === "string" ? (JSON.parse(row.payload) as ApplicationPayload) : row.payload;
  return {
    name: row.applicant_name,
    email: row.email,
    accountType: row.account_type,
    currency: row.currency,
    openedOn: row.submitted_at,
    payload,
  };
});

export const investorLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie("ah_investor", "", cookieOptions(0));
  return { ok: true };
});

export type InvestmentType = {
  id: string;
  name: string;
  issuer: string;
  structure: string;
  currency: string;
  jurisdiction: string;
  interestRate: string;
  couponType: string;
  minimumInvestment: string;
  term: string;
  paymentFrequencies: string[];
  creditRating: string;
  capitalProtection: string;
};

type InvestmentRow = {
  id: string;
  name: string;
  issuer: string;
  structure: string;
  currency: string;
  jurisdiction: string;
  interest_rate: string;
  coupon_type: string;
  minimum_investment: string;
  term: string;
  payment_frequencies: string;
  credit_rating: string;
  capital_protection: string;
};

function mapInvestment(row: InvestmentRow): InvestmentType {
  return {
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    structure: row.structure,
    currency: row.currency,
    jurisdiction: row.jurisdiction,
    interestRate: row.interest_rate,
    couponType: row.coupon_type,
    minimumInvestment: row.minimum_investment,
    term: row.term,
    paymentFrequencies: row.payment_frequencies.split("|").map((item) => item.trim()).filter(Boolean),
    creditRating: row.credit_rating,
    capitalProtection: row.capital_protection,
  };
}

export type CdTerm = {
  id: string;
  apy: string;
  months: number;
  featured: boolean;
};

export const getCdTerms = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ id: string; apy: string; months: number; featured: boolean }>`
    select id, apy, months, featured from cd_terms order by featured desc, sort_order asc, months asc
  `;
  return rows.map((row) => ({
    id: row.id,
    apy: row.apy,
    months: Number(row.months),
    featured: Boolean(row.featured),
  }));
});

export const saveCdTerms = createServerFn({ method: "POST" })
  .validator((input: CdTerm[]) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from cd_terms`;
    const ordered = [...data].sort((a, b) => Number(b.featured) - Number(a.featured));
    for (let index = 0; index < ordered.length; index += 1) {
      const term = ordered[index];
      const months = Number(term.months);
      if (!term.apy.trim() || !Number.isFinite(months) || months <= 0) throw new Error("Each term needs an APY and a length.");
      await sql`
        insert into cd_terms (id, apy, months, featured, sort_order)
        values (${term.id || crypto.randomUUID()}, ${term.apy.trim()}, ${months}, ${Boolean(term.featured)}, ${index})
      `;
    }
    return { ok: true };
  });

function mapPromo(settings: { intro: string; protection: string; fine_print: string; starts_on: string | Date; ends_on: string | Date }, tiers: { id: string; min_amount: string | number; max_amount: string | number | null; bonus_percent: string | number; months: string }[]): PromoOffer {
  return {
    intro: settings.intro,
    protection: settings.protection,
    finePrint: settings.fine_print,
    startsOn: String(settings.starts_on).slice(0, 10),
    endsOn: String(settings.ends_on).slice(0, 10),
    tiers: tiers.map((tier) => ({
      id: tier.id,
      minAmount: Number(tier.min_amount),
      maxAmount: tier.max_amount == null || tier.max_amount === "" ? null : Number(tier.max_amount),
      bonusPercent: Number(tier.bonus_percent),
      months: tier.months.split("|").map(Number).filter((month) => month > 0),
    })),
  };
}

async function loadPromo(sql: { <T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> }) {
  const settings = await sql<{ intro: string; protection: string; fine_print: string; starts_on: string; ends_on: string }>`
    select intro, protection, fine_print, starts_on::text, ends_on::text from promo_settings where id = 'current'
  `;
  const tiers = await sql<{ id: string; min_amount: string; max_amount: string | null; bonus_percent: string; months: string }>`
    select id, min_amount, max_amount, bonus_percent, months from promo_tiers order by sort_order asc, min_amount asc
  `;
  if (!settings[0]) return { intro: "", protection: "", finePrint: "", startsOn: "", endsOn: "", tiers: [] } satisfies PromoOffer;
  return mapPromo(settings[0], tiers);
}

export const getPromo = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  return loadPromo(sql);
});

export const savePromo = createServerFn({ method: "POST" })
  .validator((input: PromoOffer) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    if (!data.startsOn || !data.endsOn) throw new Error("Set the offer dates.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into promo_settings (id, intro, protection, fine_print, starts_on, ends_on)
      values ('current', ${data.intro}, ${data.protection}, ${data.finePrint}, ${data.startsOn}, ${data.endsOn})
      on conflict (id) do update set
        intro = excluded.intro,
        protection = excluded.protection,
        fine_print = excluded.fine_print,
        starts_on = excluded.starts_on,
        ends_on = excluded.ends_on
    `;
    await sql`delete from promo_tiers`;
    for (let index = 0; index < data.tiers.length; index += 1) {
      const tier = data.tiers[index];
      const min = Number(tier.minAmount);
      const max = tier.maxAmount == null || String(tier.maxAmount) === "" ? null : Number(tier.maxAmount);
      const bonus = Number(tier.bonusPercent);
      const months = [...new Set(tier.months.map(Number).filter((month) => month > 0))];
      if (!Number.isFinite(min) || min < 0 || !Number.isFinite(bonus) || bonus < 0 || months.length === 0) {
        throw new Error("Each tier needs an amount, a bonus, and at least one term.");
      }
      if (max != null && (!Number.isFinite(max) || max < min)) throw new Error("The maximum must be at least the minimum.");
      await sql`
        insert into promo_tiers (id, min_amount, max_amount, bonus_percent, months, sort_order)
        values (${tier.id || crypto.randomUUID()}, ${min}, ${max}, ${bonus}, ${months.join("|")}, ${index})
      `;
    }
    return { ok: true };
  });

export const getInvestmentTypes = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<InvestmentRow>`select * from investment_types where id = 'cd'`;
  return rows.map(mapInvestment);
});

export const saveInvestmentType = createServerFn({ method: "POST" })
  .validator((input: InvestmentType) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    if (data.id !== "cd" && data.id !== "bond") throw new Error("Unknown investment type.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const frequencies = data.paymentFrequencies.map((item) => item.trim()).filter(Boolean).join("|");
    await sql`
      update investment_types set
        name = ${data.name},
        issuer = ${data.issuer},
        structure = ${data.structure},
        currency = ${data.currency},
        jurisdiction = ${data.jurisdiction},
        interest_rate = ${data.interestRate},
        coupon_type = ${data.couponType},
        minimum_investment = ${data.minimumInvestment},
        term = ${data.term},
        payment_frequencies = ${frequencies},
        credit_rating = ${data.creditRating},
        capital_protection = ${data.capitalProtection}
      where id = ${data.id}
    `;
    return { ok: true };
  });

export type FundingPosition = {
  id: string;
  typeId: string;
  name: string;
  issuer: string;
  structure: string;
  currency: string;
  jurisdiction: string;
  couponType: string;
  minimumInvestment: string;
  creditRating: string;
  capitalProtection: string;
  amount: string;
  frequency: string;
  termLabel: string;
  status: "pending" | "approved_phone" | "instructions_sent" | "payment_approved" | "cancelled";
  advisorName: string;
  advisorPhone: string;
  signed: boolean;
  signerName: string;
  signedOn: string;
  confirmedOn: string;
  depositCode: string;
  depositNumber: string;
  accountNumber: string;
  referenceNumber: string;
  paymentFileName: string;
  createdAt: string;
};

export const getMyFundings = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const email = getCookie("ah_investor");
  if (!email) throw new Error("Sign in required.");
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const { ensureDemoApplications } = await import("@/lib/seed-applications.server");
  await ensureDemoApplications(sql);
  const rows = await sql<{ id: string; type_id: string; name: string; issuer: string; structure: string; currency: string; jurisdiction: string; coupon_type: string; minimum_investment: string; credit_rating: string; capital_protection: string; amount: string; frequency: string; term_label: string; status: FundingPosition["status"]; advisor_name: string | null; advisor_phone: string | null; signed: boolean; signer_name: string; signed_on: string | null; confirmed_on: string; deposit_code: string; deposit_number: string; account_number: string; reference_number: string; payment_file_name: string; created_at: string }>`
    select f.id, f.type_id, t.name, t.issuer, t.structure, t.currency, t.jurisdiction, t.coupon_type,
           t.minimum_investment, t.credit_rating, t.capital_protection,
           f.amount, f.frequency, f.term_label, f.status,
           a.name as advisor_name, a.phone as advisor_phone,
           (f.signed_at is not null) as signed,
           f.signer_name,
           to_char(f.signed_at at time zone 'UTC', 'YYYY-MM-DD') as signed_on,
           to_char(coalesce(f.payment_uploaded_at, f.created_at) at time zone 'UTC', 'YYYY-MM-DD') as confirmed_on,
           f.deposit_code, f.deposit_number, f.account_number, f.reference_number,
           f.payment_file_name,
           to_char(f.created_at at time zone 'UTC', 'YYYY-MM-DD') as created_at
    from fundings f
    join investment_types t on t.id = f.type_id
    left join advisors a on a.id = f.advisor_id
    where f.email = ${email}
    order by f.created_at desc
  `;
  return rows.map((row) => ({
    id: row.id,
    typeId: row.type_id,
    name: row.name,
    issuer: row.issuer,
    structure: row.structure,
    currency: row.currency,
    jurisdiction: row.jurisdiction,
    couponType: row.coupon_type,
    minimumInvestment: row.minimum_investment,
    creditRating: row.credit_rating,
    capitalProtection: row.capital_protection,
    amount: row.amount,
    frequency: row.frequency,
    termLabel: row.term_label,
    status: row.status,
    advisorName: row.advisor_name ?? "",
    advisorPhone: row.advisor_phone ?? "",
    signed: Boolean(row.signed),
    signerName: row.signer_name ?? "",
    signedOn: row.signed_on ?? "",
    confirmedOn: row.confirmed_on,
    depositCode: row.deposit_code ?? "",
    depositNumber: row.deposit_number ?? "",
    accountNumber: row.account_number ?? "",
    referenceNumber: row.reference_number ?? "",
    paymentFileName: row.payment_file_name ?? "",
    createdAt: row.created_at,
  }));
});

export const submitFunding = createServerFn({ method: "POST" })
  .validator((input: { typeId: string; amount: string; termId: string }) => input)
  .handler(async ({ data }) => {
    const { getCookie } = await import("@tanstack/react-start/server");
    const email = getCookie("ah_investor");
    if (!email) throw new Error("Sign in required.");
    if (data.typeId !== "cd") throw new Error("Choose a certificate term.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const types = await sql<InvestmentRow>`select * from investment_types where id = 'cd'`;
    const type = types[0];
    if (!type) throw new Error("Certificates are not available.");
    const terms = await sql<{ apy: string; months: number }>`select apy, months from cd_terms where id = ${data.termId}`;
    const term = terms[0];
    if (!term) throw new Error("Choose a certificate term.");
    const minimum = Number(type.minimum_investment.replace(/[^0-9.]/g, ""));
    const amount = Number(data.amount.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter an investment amount.");
    if (Number.isFinite(minimum) && minimum > 0 && amount < minimum) {
      throw new Error(`Minimum investment is ${type.minimum_investment}.`);
    }
    const id = crypto.randomUUID();
    const formatted = amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
    const label = `${Number(term.months)}-month · ${term.apy} APY`;
    const { nextFundingCodes } = await import("@/lib/funding-codes.server");
    const codes = await nextFundingCodes(sql);
    await sql`
      insert into fundings (id, email, type_id, amount, frequency, term_label, status, deposit_code, deposit_number, account_number, reference_number)
      values (${id}, ${email}, ${"cd"}, ${formatted}, ${""}, ${label}, ${"pending"}, ${codes.depositCode}, ${codes.depositNumber}, ${codes.accountNumber}, ${codes.referenceNumber})
    `;
    const offer = await loadPromo(sql);
    const rates = ratesFor(label, formatted, offer.tiers);
    await sendStep(sql, {
      step: "investment_submitted",
      clientEmail: email,
      clientName: await investorName(sql, email),
      detail: [`${label}`, formatted, `Promo APY ${rates.promo}`, `Final APY ${rates.final}`, `Reference ${codes.referenceNumber}`, `Deposit code ${codes.depositCode}`, `Account ${codes.accountNumber}`].join("\n"),
      relatedId: id,
    });
    return { id };
  });

export const cancelFunding = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { getCookie } = await import("@tanstack/react-start/server");
    const email = getCookie("ah_investor");
    if (!email) throw new Error("Sign in required.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string }>`
      update fundings set status = 'cancelled'
      where id = ${data.id} and email = ${email} and status = 'pending'
      returning id
    `;
    if (rows[0]) {
      const detail = await fundingDetail(sql, data.id);
      await sendStep(sql, {
        step: "investment_cancelled",
        clientEmail: email,
        clientName: await investorName(sql, email),
        detail: await detailText(sql, detail),
        relatedId: data.id,
      });
    }
    return { ok: true };
  });

export type Advisor = { id: string; name: string; phone: string; email: string };

export type AdminFunding = FundingPosition & { email: string; advisorId: string };

export const listAdvisors = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  return sql<Advisor>`select id, name, phone, email from advisors order by name`;
});

export const saveAdvisor = createServerFn({ method: "POST" })
  .validator((input: Advisor) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    if (!data.name.trim()) throw new Error("Name is required.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const id = data.id || crypto.randomUUID();
    await sql`
      insert into advisors (id, name, phone, email)
      values (${id}, ${data.name.trim()}, ${data.phone.trim()}, ${data.email.trim()})
      on conflict (id) do update set name = excluded.name, phone = excluded.phone, email = excluded.email
    `;
    return { id };
  });

export const deleteAdvisor = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`update fundings set advisor_id = null where advisor_id = ${data.id}`;
    await sql`delete from advisors where id = ${data.id}`;
    return { ok: true };
  });

export const listFundings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const { ensureDemoApplications } = await import("@/lib/seed-applications.server");
  await ensureDemoApplications(sql);
  const rows = await sql<{
    id: string;
    email: string;
    type_id: string;
    name: string;
    issuer: string;
    structure: string;
    currency: string;
    jurisdiction: string;
    coupon_type: string;
    minimum_investment: string;
    credit_rating: string;
    capital_protection: string;
    amount: string;
    frequency: string;
    term_label: string;
    status: FundingPosition["status"];
    advisor_id: string | null;
    advisor_name: string | null;
    advisor_phone: string | null;
    signed: boolean;
    signer_name: string;
    signed_on: string | null;
    confirmed_on: string;
    deposit_code: string;
    deposit_number: string;
    account_number: string;
    reference_number: string;
    payment_file_name: string;
    created_at: string;
  }>`
    select f.id, f.email, f.type_id, t.name, t.issuer, t.structure, t.currency, t.jurisdiction,
           t.coupon_type, t.minimum_investment, t.credit_rating, t.capital_protection,
           f.amount, f.frequency, f.term_label, f.status, f.advisor_id,
           a.name as advisor_name, a.phone as advisor_phone,
           (f.signed_at is not null) as signed,
           f.signer_name,
           to_char(f.signed_at at time zone 'UTC', 'YYYY-MM-DD') as signed_on,
           to_char(coalesce(f.payment_uploaded_at, f.created_at) at time zone 'UTC', 'YYYY-MM-DD') as confirmed_on,
           f.deposit_code, f.deposit_number, f.account_number, f.reference_number,
           f.payment_file_name,
           to_char(f.created_at at time zone 'UTC', 'YYYY-MM-DD') as created_at
    from fundings f
    join investment_types t on t.id = f.type_id
    left join advisors a on a.id = f.advisor_id
    order by f.created_at desc
  `;
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    typeId: row.type_id,
    name: row.name,
    issuer: row.issuer,
    structure: row.structure,
    currency: row.currency,
    jurisdiction: row.jurisdiction,
    couponType: row.coupon_type,
    minimumInvestment: row.minimum_investment,
    creditRating: row.credit_rating,
    capitalProtection: row.capital_protection,
    amount: row.amount,
    frequency: row.frequency,
    termLabel: row.term_label,
    status: row.status,
    advisorId: row.advisor_id ?? "",
    advisorName: row.advisor_name ?? "",
    advisorPhone: row.advisor_phone ?? "",
    signed: Boolean(row.signed),
    signerName: row.signer_name ?? "",
    signedOn: row.signed_on ?? "",
    confirmedOn: row.confirmed_on,
    depositCode: row.deposit_code ?? "",
    depositNumber: row.deposit_number ?? "",
    accountNumber: row.account_number ?? "",
    referenceNumber: row.reference_number ?? "",
    paymentFileName: row.payment_file_name ?? "",
    createdAt: row.created_at,
  }));
});

export const updateFunding = createServerFn({ method: "POST" })
  .validator((input: { id: string; status: FundingPosition["status"]; advisorId: string; depositCode: string; depositNumber: string; accountNumber: string; referenceNumber: string; amount: string; openedOn: string }) => {
    if (!["pending", "approved_phone", "instructions_sent", "payment_approved", "cancelled"].includes(input.status)) throw new Error("Unknown status.");
    const depositCode = input.depositCode.trim();
    const depositNumber = input.depositNumber.trim();
    const accountNumber = input.accountNumber.trim();
    const referenceNumber = input.referenceNumber.trim();
    if (!depositCode || !depositNumber || !accountNumber || !referenceNumber) throw new Error("Fill in every reference field.");
    const openedOn = input.openedOn.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(openedOn)) throw new Error("Enter the certificate date.");
    const numeric = Number(input.amount.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(numeric) || numeric <= 0) throw new Error("Enter an investment amount.");
    const amount = numeric.toLocaleString("en-US", { style: "currency", currency: "USD" });
    return { ...input, depositCode, depositNumber, accountNumber, referenceNumber, amount, openedOn };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const taken = await sql<{ id: string }>`
      select id from fundings
      where id <> ${data.id}
        and (
          deposit_code = ${data.depositCode}
          or deposit_number = ${data.depositNumber}
          or account_number = ${data.accountNumber}
          or reference_number = ${data.referenceNumber}
        )
      limit 1
    `;
    if (taken[0]) throw new Error("That number is already used on another investment.");
    const current = await fundingDetail(sql, data.id);
    await sql`
      update fundings
      set status = ${data.status},
          advisor_id = ${data.advisorId || null},
          deposit_code = ${data.depositCode},
          deposit_number = ${data.depositNumber},
          account_number = ${data.accountNumber},
          reference_number = ${data.referenceNumber},
          amount = ${data.amount},
          created_at = ${data.openedOn}::timestamp
      where id = ${data.id}
    `;
    if (current && current.status !== data.status) {
      const step = fundingStep(data.status);
      if (step) {
        await sendStep(sql, {
          step,
          clientEmail: current.email,
          clientName: await investorName(sql, current.email),
          detail: await detailText(sql, { ...current, amount: data.amount }),
          relatedId: data.id,
        });
      }
    }
    return { ok: true };
  });

const PAYMENT_FILE = /^data:(application\/pdf|image\/png|image\/jpeg);base64,/;

export const uploadPaymentConfirmation = createServerFn({ method: "POST" })
  .validator((input: { id: string; fileName: string; file: string }) => input)
  .handler(async ({ data }) => {
    const { getCookie } = await import("@tanstack/react-start/server");
    const email = getCookie("ah_investor");
    if (!email) throw new Error("Sign in required.");
    if (!data.fileName.trim() || !PAYMENT_FILE.test(data.file) || data.file.length > 7_000_000) {
      throw new Error("Attach a PDF or image under 5 MB.");
    }
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string }>`
      update fundings
      set payment_file_name = ${data.fileName.trim()}, payment_file = ${data.file}, payment_uploaded_at = now()
      where id = ${data.id} and email = ${email} and status = 'instructions_sent'
      returning id
    `;
    if (!rows[0]) throw new Error("Funding instructions have not been sent for this investment.");
    const detail = await fundingDetail(sql, data.id);
    await sendStep(sql, {
      step: "payment_uploaded",
      clientEmail: email,
      clientName: await investorName(sql, email),
      detail: `${await detailText(sql, detail)}\nFile: ${data.fileName.trim()}`,
      relatedId: data.id,
    });
    return { ok: true };
  });

export const getPaymentFile = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { getCookie } = await import("@tanstack/react-start/server");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const investor = getCookie("ah_investor");
    const rows = investor
      ? await sql<{ payment_file_name: string; payment_file: string }>`
          select payment_file_name, payment_file from fundings where id = ${data.id} and email = ${investor}
        `
      : [];
    const own = rows[0];
    if (own?.payment_file) return { fileName: own.payment_file_name, file: own.payment_file };
    await requireAdmin();
    const adminRows = await sql<{ payment_file_name: string; payment_file: string }>`
      select payment_file_name, payment_file from fundings where id = ${data.id}
    `;
    const file = adminRows[0];
    if (!file?.payment_file) throw new Error("No payment confirmation is attached.");
    return { fileName: file.payment_file_name, file: file.payment_file };
  });

export const approvePayment = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string }>`
      update fundings set status = 'payment_approved'
      where id = ${data.id} and payment_file <> '' and status = 'instructions_sent'
      returning id
    `;
    if (!rows[0]) throw new Error("A wire confirmation is required before approval.");
    const detail = await fundingDetail(sql, data.id);
    if (detail) {
      await sendStep(sql, {
        step: "payment_approved",
        clientEmail: detail.email,
        clientName: await investorName(sql, detail.email),
        detail: await detailText(sql, detail),
        relatedId: data.id,
      });
    }
    return { ok: true };
  });

export const signFunding = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { getCookie } = await import("@tanstack/react-start/server");
    const email = getCookie("ah_investor");
    if (!email) throw new Error("Sign in required.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const apps = await sql<{ applicant_name: string; payload: ApplicationPayload | string }>`
      select applicant_name, payload from applications
      where lower(email) = ${email.toLowerCase()}
      order by submitted_at desc nulls last
      limit 1
    `;
    const payload = apps[0]?.payload ? (typeof apps[0].payload === "string" ? (JSON.parse(apps[0].payload) as ApplicationPayload) : apps[0].payload) : null;
    const signature = payload?.signature ?? "";
    if (!signature.startsWith("data:image/png;base64,")) throw new Error("Your application has no signature.");
    const signerName = apps[0]?.applicant_name || [payload?.firstName, payload?.surname].filter(Boolean).join(" ") || email;
    const rows = await sql<{ id: string }>`
      update fundings
      set signer_name = ${signerName}, signature = ${signature}, signed_at = now()
      where id = ${data.id} and email = ${email} and status = 'pending' and signed_at is null
      returning id
    `;
    if (!rows[0]) throw new Error("These terms cannot be accepted.");
    const detail = await fundingDetail(sql, data.id);
    await sendStep(sql, {
      step: "terms_accepted",
      clientEmail: email,
      clientName: signerName,
      detail: await detailText(sql, detail),
      relatedId: data.id,
    });
    return { ok: true };
  });

export const downloadInvestmentPdf = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { getCookie } = await import("@tanstack/react-start/server");
    const email = getCookie("ah_investor");
    if (!email) throw new Error("Sign in required.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      status: string;
      email: string;
      amount: string;
      frequency: string;
      term_label: string;
      signer_name: string;
      signature: string;
      signed_on: string | null;
      opened_on: string;
      confirmed_on: string;
      issuer: string;
      structure: string;
      currency: string;
      jurisdiction: string;
      coupon_type: string;
      minimum_investment: string;
      credit_rating: string;
      capital_protection: string;
      advisor_name: string | null;
      advisor_phone: string | null;
      deposit_code: string;
      deposit_number: string;
      account_number: string;
      reference_number: string;
      applicant_name: string | null;
      payload: ApplicationPayload | string | null;
    }>`
      select f.id, f.status, f.email, f.amount, f.frequency, f.term_label, f.signer_name, f.signature,
             to_char(f.signed_at at time zone 'UTC', 'YYYY-MM-DD') as signed_on,
             to_char(f.created_at at time zone 'UTC', 'YYYY-MM-DD') as opened_on,
             to_char(coalesce(f.payment_uploaded_at, f.created_at) at time zone 'UTC', 'YYYY-MM-DD') as confirmed_on,
             t.issuer, t.structure, t.currency, t.jurisdiction, t.coupon_type,
             t.minimum_investment, t.credit_rating, t.capital_protection,
             a.name as advisor_name, a.phone as advisor_phone,
             f.deposit_code, f.deposit_number, f.account_number, f.reference_number,
             app.applicant_name, app.payload
      from fundings f
      join investment_types t on t.id = f.type_id
      left join advisors a on a.id = f.advisor_id
      left join lateral (
        select applicant_name, payload from applications
        where email = f.email
        order by submitted_at desc nulls last
        limit 1
      ) app on true
      where f.id = ${data.id} and f.email = ${email}
    `;
    const row = rows[0];
    if (!row) throw new Error("Investment not found.");
    const { buildConfirmationPdf, buildInvestmentPdf } = await import("@/lib/investment-pdf.server");
    const promo = await loadPromo(sql);
    const rates = ratesFor(row.term_label, row.amount, promo.tiers);
    const months = Number(row.term_label.match(/(\d+)-month/)?.[1] ?? 0);
    const payload = row.payload ? (typeof row.payload === "string" ? (JSON.parse(row.payload) as ApplicationPayload) : row.payload) : null;
    const clientName = row.applicant_name || [payload?.firstName, payload?.surname].filter(Boolean).join(" ") || row.signer_name || row.email;
    const storedSignature = row.signature.startsWith("data:image/png;base64,") ? row.signature : payload?.signature ?? "";
    const png = storedSignature.startsWith("data:image/png;base64,")
      ? new Uint8Array(Buffer.from(storedSignature.replace(/^data:image\/png;base64,/, ""), "base64"))
      : undefined;
    const address = [
      [payload?.street, payload?.apt].filter(Boolean).join(" "),
      [payload?.city, payload?.region, payload?.postal].filter(Boolean).join(", "),
      payload?.country ?? "",
    ].filter(Boolean);
    const shared = {
      investor: clientName,
      email: row.email,
      issuer: row.issuer,
      structure: row.structure,
      currency: row.currency,
      jurisdiction: row.jurisdiction,
      couponType: row.coupon_type,
      minimum: row.minimum_investment,
      creditRating: row.credit_rating,
      capitalProtection: row.capital_protection,
      termLabel: row.term_label,
      amount: row.amount,
      frequency: row.frequency,
      promoApy: rates.promo,
      finalApy: rates.final,
      signerName: row.signer_name || clientName,
      signedOn: row.signed_on || (png ? "Signed on the account application" : ""),
      signaturePng: png,
      companyName: await readCompanyName(sql),
    };
    const pdf =
      row.status === "payment_approved"
        ? await buildConfirmationPdf({
            ...shared,
            clientName,
            address,
            issueDate: usDate(row.opened_on),
            maturityDate: plusMonths(row.opened_on, months),
            confirmationDate: usDate(row.confirmed_on),
            termMonths: months,
            depositCode: row.deposit_code,
            depositNumber: row.deposit_number,
            accountNumber: row.account_number,
            referenceNumber: row.reference_number,
            advisorName: row.advisor_name ?? "",
            advisorPhone: row.advisor_phone ?? "",
          })
        : await buildInvestmentPdf(shared);
    return {
      pdf,
      sheet: {
        issuer: row.issuer,
        structure: row.structure,
        currency: row.currency,
        jurisdiction: row.jurisdiction,
        couponType: row.coupon_type,
        minimum: row.minimum_investment,
        creditRating: row.credit_rating,
        capitalProtection: row.capital_protection,
        termLabel: row.term_label,
        amount: row.amount,
        frequency: row.frequency,
        promoApy: rates.promo,
        finalApy: rates.final,
        signerName: row.signer_name,
        signedOn: row.signed_on ?? "",
        email: row.email,
      },
    };
  });

function usDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${Number(month)}/${Number(day)}/${year}`;
}

function plusMonths(iso: string, months: number) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day || !months) return iso;
  const date = new Date(Date.UTC(year, month - 1 + months, day));
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
}

function ratesFor(termLabel: string, amount: string, tiers: PromoTier[]) {
  const months = Number(termLabel.match(/(\d+)-month/)?.[1] ?? 0);
  const base = Number(termLabel.match(/([\d.]+)%/)?.[1] ?? 0);
  const value = Number(amount.replace(/[^0-9.]/g, ""));
  const promo = matchTier({ intro: "", protection: "", finePrint: "", startsOn: "", endsOn: "", tiers }, months, value);
  const final = base / 100 + (promo ? promo.bonusPercent / 100 : 0);
  const percent = final * 100;
  const digits = Math.round(percent * 1000) % 10 === 0 ? 2 : 3;
  return { promo: promo ? formatBonus(promo.bonusPercent) : "—", final: base ? `${percent.toFixed(digits)}%` : "—" };
}

type FundingMail = {
  email: string;
  term_label: string;
  amount: string;
  frequency: string;
  status: string;
  deposit_code: string | null;
  account_number: string | null;
  reference_number: string | null;
  advisor_name: string | null;
  advisor_phone: string | null;
};

async function readCompanyName(sql: Sql) {
  const rows = await sql<{ value: string }>`select value from site_settings where key = 'company_name'`;
  return rows[0]?.value?.trim() || DEFAULT_COMPANY_NAME;
}

async function investorName(sql: Sql, email: string) {
  const rows = await sql<{ applicant_name: string }>`
    select applicant_name from applications
    where lower(email) = ${email.toLowerCase()}
    order by submitted_at desc nulls last
    limit 1
  `;
  return rows[0]?.applicant_name || email;
}

async function fundingDetail(sql: Sql, id: string) {
  const rows = await sql<FundingMail>`
    select f.email, f.term_label, f.amount, f.frequency, f.status,
           f.deposit_code, f.account_number, f.reference_number,
           a.name as advisor_name, a.phone as advisor_phone
    from fundings f
    left join advisors a on a.id = f.advisor_id
    where f.id = ${id}
  `;
  return rows[0] ?? null;
}

async function detailText(sql: Sql, row: FundingMail | null) {
  if (!row) return "";
  const offer = await loadPromo(sql);
  const rates = ratesFor(row.term_label, row.amount, offer.tiers);
  const status = STATUS_LABEL[row.status] || row.status;
  return [
    row.term_label,
    row.amount,
    `Promo APY ${rates.promo}`,
    `Final APY ${rates.final}`,
    status ? `Status ${status}` : "",
    row.reference_number ? `Reference ${row.reference_number}` : "",
    row.deposit_code ? `Deposit code ${row.deposit_code}` : "",
    row.account_number ? `Account ${row.account_number}` : "",
    row.advisor_name ? `Advisor ${row.advisor_name}${row.advisor_phone ? ` · ${row.advisor_phone}` : ""}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved_phone: "Approved by phone",
  instructions_sent: "Funding instructions sent",
  payment_approved: "Active",
  cancelled: "Cancelled",
};

function fundingStep(status: string): MailStep | null {
  if (status === "approved_phone") return "approved_phone";
  if (status === "instructions_sent") return "instructions_sent";
  if (status === "payment_approved") return "payment_approved";
  if (status === "cancelled") return "investment_cancelled";
  return null;
}

async function sendStep(sql: Sql, input: { step: MailStep; clientEmail: string; clientName: string; detail: string; relatedId?: string }) {
  try {
    const { notifyStep } = await import("@/lib/mail.server");
    await notifyStep(sql, input);
  } catch {
    // A missed note should not undo the step the client or desk just completed.
  }
}

export type NotificationRow = {
  id: string;
  createdAt: string;
  audience: "client" | "admin";
  recipient: string;
  step: string;
  subject: string;
  body: string;
  html: string;
  delivery: string;
};

export const listNotifications = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const { ensureMailColumn } = await import("@/lib/mail.server");
  const sql = await getSql();
  await ensureMailColumn(sql);
  const rows = await sql<{
    id: string;
    created_at: string;
    audience: "client" | "admin";
    recipient: string;
    step: string;
    subject: string;
    body: string;
    html: string;
    delivery: string;
  }>`
    select id, to_char(created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as created_at,
           audience, recipient, step, subject, body, html, delivery
    from notifications
    order by created_at desc
    limit 200
  `;
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    audience: row.audience,
    recipient: row.recipient,
    step: row.step,
    subject: row.subject,
    body: row.body,
    html: row.html ?? "",
    delivery: row.delivery,
  }));
});

export const listMyNotifications = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const email = getCookie("ah_investor");
  if (!email) throw new Error("Sign in required.");
  const { getSql } = await import("@/lib/db");
  const { ensureMailColumn } = await import("@/lib/mail.server");
  const sql = await getSql();
  await ensureMailColumn(sql);
  const rows = await sql<{ id: string; created_at: string; subject: string; body: string; html: string; step: string }>`
    select id, to_char(created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as created_at, subject, body, html, step
    from notifications
    where audience = 'client' and lower(recipient) = ${email.toLowerCase()}
    order by created_at desc
    limit 50
  `;
  return rows.map((row) => ({ id: row.id, createdAt: row.created_at, subject: row.subject, body: row.body, html: row.html ?? "", step: row.step }));
});




