import { createServerFn } from "@tanstack/react-start";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { FormState } from "@/lib/application-data";
import { cleanBackupEmail, cleanCloudflareCode, cleanCompanyName, cleanPublicDomain, DEFAULT_COMPANY_NAME } from "@/lib/company";
import type { Sql } from "@/lib/db";
import { isWorkspacePreview } from "@/lib/env.server";
import type { MailStep } from "@/lib/mail.server";
import type { LeadCopy, ApplicationCopy } from "@/lib/email-templates";
import { formatBonus, matchTier, type PromoOffer, type PromoTier } from "@/lib/promo";
import { resolveInvoiceBilling, type InvoiceBilling } from "@/lib/invoice-billing";

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
    const email = data.email.trim().toLowerCase();
    const inviteToken = data.inviteToken?.trim() || "";
    let invited: { months: number; promoCode: string } | null = null;
    if (inviteToken) {
      const { readLeadInvite } = await import("@/lib/lead-invites.server");
      const invite = await readLeadInvite(sql, inviteToken);
      if (invite.status !== "open") throw new Error("This application link has expired.");
      invited = { months: invite.months, promoCode: invite.promoCode };
    }
    const payload = { ...stripSecrets(data), currency: "USD" as const };
    const { inviteToken: _inviteToken, ...stored } = payload;
    void _inviteToken;
    if (invited) {
      stored.preferredTerm = String(invited.months);
      stored.promoCode = invited.promoCode;
    }
    const name = [stored.firstName, stored.middleName, stored.surname].filter(Boolean).join(" ");
    const passwordHash = await hashPassword(data.password);
    await sql`
      insert into applications (id, applicant_name, email, account_type, currency, payload, password_hash)
      values (${id}, ${name}, ${email}, ${stored.accountType}, ${stored.currency}, ${JSON.stringify(stored)}::jsonb, ${passwordHash})
    `;
    if (inviteToken) await sql`update lead_invites set used_at = now() where token = ${inviteToken} and used_at is null`;
    await sendStep(sql, {
      step: "application_submitted",
      clientEmail: email,
      clientName: name,
      detail: [`${payload.accountType} account`, `Sign-in email ${email}`].join("\n"),
      adminDetail: applicationDeskDetail(payload),
      attachments: applicationFiles(payload),
      relatedId: id,
    });
    return { id };
  });

export const getLeadInvite = createServerFn({ method: "GET" })
  .validator((input: { token: string }) => ({ token: (input.token || "").trim().slice(0, 80) }))
  .handler(async ({ data }) => {
    if (!data.token) return { status: "missing" as const };
    const { getSql } = await import("@/lib/db");
    const { readLeadInvite } = await import("@/lib/lead-invites.server");
    return readLeadInvite(await getSql(), data.token);
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

export const deleteApplication = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ email: string }>`select email from applications where id = ${data.id}`;
    if (!rows[0]) throw new Error("Application not found.");
    const email = String(rows[0].email).trim().toLowerCase();
    await sql`
      delete from notifications
      where lower(recipient) = ${email}
         or related_id = ${data.id}
         or related_id in (select id from fundings where lower(email) = ${email})
    `;
    await sql`delete from fundings where lower(email) = ${email}`;
    await sql`
      delete from investor_users
      where application_id = ${data.id}
         or (lower(email) = ${email} and not exists (
           select 1 from applications where lower(email) = ${email} and id <> ${data.id}
         ))
    `;
    await sql`delete from applications where id = ${data.id}`;
    return { ok: true as const };
  });

export const clearDatabase = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await ensureCrmLeads(sql);
  await sql`delete from notifications`;
  await sql`delete from fundings`;
  await sql`delete from investor_users`;
  await sql`delete from applications`;
  await sql`delete from crm_leads`;
  return { ok: true as const };
});

export const deleteFunding = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string; status: string }>`select id, status from fundings where id = ${data.id}`;
    if (!rows[0]) throw new Error("Investment not found.");
    if (rows[0].status === "payment_approved") throw new Error("An active CD is removed only when the client is deleted.");
    await sql`delete from notifications where related_id = ${data.id}`;
    await sql`delete from fundings where id = ${data.id}`;
    return { ok: true as const };
  });

export const signInAsClient = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ email: string; status: string }>`
      select email, status from applications where id = ${data.id}
    `;
    if (!rows[0] || rows[0].status !== "approved") throw new Error("Only an approved client can be opened.");
    const email = String(rows[0].email).trim().toLowerCase();
    const { setCookie } = await import("@tanstack/react-start/server");
    setCookie("ah_investor", email, cookieOptions(60 * 60 * 12));
    return { ok: true as const };
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

export const DEFAULT_THEME = {
  colorAction: "#006fcf",
  colorHeading: "#12315c",
  colorText: "#3d3d3d",
  colorLabel: "#262626",
  colorBorder: "#e0e0e0",
  colorBackground: "#fbfbfb",
};

function readHex(value: string, fallback: string) {
  const next = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(next) ? next.toLowerCase() : fallback;
}

function cleanHex(value: string | undefined, fallback: string) {
  const next = (value || "").trim();
  if (!next) return fallback;
  if (!/^#[0-9a-fA-F]{6}$/.test(next)) throw new Error("Use a color like #006fcf.");
  return next.toLowerCase();
}

export type SiteBrand = {
  logo: string | null;
  favicon: string | null;
  companyName: string;
  companyPhone: string;
  cloudflareCode: string;
  cover: string | null;
  socialBanner: string | null;
  emailLogo: string | null;
  footerLogo: string | null;
  pdfLogo: string | null;
  footerText: string;
  companyAddress: string;
  backupEmail: string;
  lastBackupAt: string;
  publicDomain: string;
  colorAction: string;
  colorHeading: string;
  colorText: string;
  colorLabel: string;
  colorBorder: string;
  colorBackground: string;
  pageBackground: string | null;
};

function assertPageBackground(value: string | null) {
  if (!value || value === "none") return value === "none" ? "none" : null;
  return assertShareImage(value);
}

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
    select key, value from site_settings where key in ('logo', 'favicon', 'company_name', 'company_phone', 'company_address', 'cloudflare_code', 'cover', 'social_banner', 'email_logo', 'footer_logo', 'pdf_logo', 'footer_text', 'backup_email', 'backup_at', 'public_domain', 'color_action', 'color_heading', 'color_text', 'color_label', 'color_border', 'color_background', 'page_background')
  `;
  const brand: SiteBrand = {
    logo: null,
    favicon: null,
    companyName: DEFAULT_COMPANY_NAME,
    companyPhone: "",
    cloudflareCode: "",
    cover: null,
    socialBanner: null,
    emailLogo: null,
    footerLogo: null,
    pdfLogo: null,
    footerText: "",
    companyAddress: "",
    backupEmail: "",
    lastBackupAt: "",
    publicDomain: "",
    ...DEFAULT_THEME,
    pageBackground: null,
  };
  for (const row of rows) {
    if (row.key === "logo" || row.key === "favicon" || row.key === "cover") brand[row.key] = row.value;
    if (row.key === "social_banner") brand.socialBanner = row.value;
    if (row.key === "email_logo") brand.emailLogo = row.value;
    if (row.key === "footer_logo") brand.footerLogo = row.value;
    if (row.key === "pdf_logo" && /^data:image\/(png|jpeg);base64,/i.test(row.value)) brand.pdfLogo = row.value;
    if (row.key === "footer_text") brand.footerText = row.value;
    if (row.key === "company_address") brand.companyAddress = row.value;
    if (row.key === "backup_email") brand.backupEmail = row.value;
    if (row.key === "backup_at") brand.lastBackupAt = row.value;
    if (row.key === "company_name" && row.value.trim()) brand.companyName = row.value.trim();
    if (row.key === "company_phone") brand.companyPhone = row.value.trim();
    if (row.key === "cloudflare_code") brand.cloudflareCode = row.value;
    if (row.key === "public_domain") brand.publicDomain = row.value;
    if (row.key === "color_action") brand.colorAction = readHex(row.value, DEFAULT_THEME.colorAction);
    if (row.key === "color_heading") brand.colorHeading = readHex(row.value, DEFAULT_THEME.colorHeading);
    if (row.key === "color_text") brand.colorText = readHex(row.value, DEFAULT_THEME.colorText);
    if (row.key === "color_label") brand.colorLabel = readHex(row.value, DEFAULT_THEME.colorLabel);
    if (row.key === "color_border") brand.colorBorder = readHex(row.value, DEFAULT_THEME.colorBorder);
    if (row.key === "color_background") brand.colorBackground = readHex(row.value, DEFAULT_THEME.colorBackground);
    if (row.key === "page_background") brand.pageBackground = row.value === "none" || row.value.startsWith("data:image/") ? row.value : null;
  }
  return brand;
});

export const setSiteBrand = createServerFn({ method: "POST" })
  .validator((input: SiteBrand) => ({
    logo: assertImage(input.logo),
    favicon: assertImage(input.favicon),
    companyName: cleanCompanyName(input.companyName || DEFAULT_COMPANY_NAME),
    companyPhone: (input.companyPhone || "").trim().slice(0, 40),
    cloudflareCode: input.cloudflareCode || "",
    cover: assertShareImage(input.cover),
    socialBanner: assertShareImage(input.socialBanner),
    emailLogo: assertImage(input.emailLogo),
    footerLogo: assertImage(input.footerLogo),
    pdfLogo: input.pdfLogo ? assertShareImage(input.pdfLogo) : null,
    footerText: (input.footerText || "").slice(0, 800),
    companyAddress: (input.companyAddress || "").trim().slice(0, 400),
    backupEmail: cleanBackupEmail(input.backupEmail || ""),
    lastBackupAt: input.lastBackupAt || "",
    publicDomain: cleanPublicDomain(input.publicDomain || ""),
    colorAction: cleanHex(input.colorAction, DEFAULT_THEME.colorAction),
    colorHeading: cleanHex(input.colorHeading, DEFAULT_THEME.colorHeading),
    colorText: cleanHex(input.colorText, DEFAULT_THEME.colorText),
    colorLabel: cleanHex(input.colorLabel, DEFAULT_THEME.colorLabel),
    colorBorder: cleanHex(input.colorBorder, DEFAULT_THEME.colorBorder),
    colorBackground: cleanHex(input.colorBackground, DEFAULT_THEME.colorBackground),
    pageBackground: assertPageBackground(input.pageBackground),
  }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    for (const key of ["logo", "favicon", "cover", "socialBanner", "emailLogo", "footerLogo", "pdfLogo"] as const) {
      const column = key === "socialBanner" ? "social_banner" : key === "emailLogo" ? "email_logo" : key === "footerLogo" ? "footer_logo" : key === "pdfLogo" ? "pdf_logo" : key;
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
    if (!data.companyPhone) {
      await sql`delete from site_settings where key = 'company_phone'`;
    } else {
      await sql`
        insert into site_settings (key, value) values ('company_phone', ${data.companyPhone})
        on conflict (key) do update set value = excluded.value
      `;
    }
    if (!data.companyAddress) {
      await sql`delete from site_settings where key = 'company_address'`;
    } else {
      await sql`
        insert into site_settings (key, value) values ('company_address', ${data.companyAddress})
        on conflict (key) do update set value = excluded.value
      `;
    }
    const cloudflare = cleanCloudflareCode(data.cloudflareCode);
    if (cloudflare === "") {
      await sql`delete from site_settings where key = 'cloudflare_code'`;
    } else if (cloudflare) {
      await sql`
        insert into site_settings (key, value) values ('cloudflare_code', ${cloudflare})
        on conflict (key) do update set value = excluded.value
      `;
    }
    if (!data.footerText.trim()) {
      await sql`delete from site_settings where key = 'footer_text'`;
    } else {
      await sql`
        insert into site_settings (key, value) values ('footer_text', ${data.footerText.trim()})
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
    if (!data.publicDomain) {
      await sql`delete from site_settings where key = 'public_domain'`;
    } else {
      await sql`
        insert into site_settings (key, value) values ('public_domain', ${data.publicDomain})
        on conflict (key) do update set value = excluded.value
      `;
    }
    const colors = [
      ["color_action", data.colorAction],
      ["color_heading", data.colorHeading],
      ["color_text", data.colorText],
      ["color_label", data.colorLabel],
      ["color_border", data.colorBorder],
      ["color_background", data.colorBackground],
    ] as const;
    for (const [key, value] of colors) {
      await sql`
        insert into site_settings (key, value) values (${key}, ${value})
        on conflict (key) do update set value = excluded.value
      `;
    }
    if (!data.pageBackground) {
      await sql`delete from site_settings where key = 'page_background'`;
    } else {
      await sql`
        insert into site_settings (key, value) values ('page_background', ${data.pageBackground})
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

export const restoreDatabaseBackup = createServerFn({ method: "POST" })
  .validator((input: { file: string }) => ({ file: input.file || "" }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { restoreBackup } = await import("@/lib/backup.server");
    const result = await restoreBackup(data.file);
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
    const { cleanResendKey } = await import("@/lib/mail.server");
    const apiKey = cleanResendKey(data.apiKey);
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
    const { mailSetupView } = await import("@/lib/mail.server");
    return mailSetupView(sql);
  });

export const saveSmtpSetup = createServerFn({ method: "POST" })
  .validator((input: { apiKey: string; mailFrom: string; clearKey: boolean }) => ({
    apiKey: input.apiKey || "",
    mailFrom: input.mailFrom || "",
    clearKey: Boolean(input.clearKey),
  }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { cleanMailFrom, cleanSmtpKey } = await import("@/lib/mail.server");
    const apiKey = cleanSmtpKey(data.apiKey);
    const mailFrom = cleanMailFrom(data.mailFrom);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    if (data.clearKey) {
      await sql`delete from site_settings where key = 'smtp2go_api_key'`;
    } else if (apiKey) {
      await sql`
        insert into site_settings (key, value) values ('smtp2go_api_key', ${apiKey})
        on conflict (key) do update set value = excluded.value
      `;
    }
    if (!data.clearKey) {
      if (!mailFrom) {
        await sql`delete from site_settings where key = 'mail_from'`;
      } else {
        await sql`
          insert into site_settings (key, value) values ('mail_from', ${mailFrom})
          on conflict (key) do update set value = excluded.value
        `;
      }
    }
    const { mailSetupView } = await import("@/lib/mail.server");
    return mailSetupView(sql);
  });

export const saveTelegramSetup = createServerFn({ method: "POST" })
  .validator((input: { token: string; chatId: string; clear: boolean }) => ({
    token: input.token || "",
    chatId: input.chatId || "",
    clear: Boolean(input.clear),
  }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { cleanTelegramChat, cleanTelegramToken } = await import("@/lib/mail.server");
    const token = cleanTelegramToken(data.token);
    const chatId = cleanTelegramChat(data.chatId);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    if (data.clear) {
      await sql`delete from site_settings where key = 'telegram_bot_token'`;
    } else if (token) {
      await sql`
        insert into site_settings (key, value) values ('telegram_bot_token', ${token})
        on conflict (key) do update set value = excluded.value
      `;
    }
    if (!data.clear) {
      if (!chatId) await sql`delete from site_settings where key = 'telegram_chat_id'`;
      else {
        await sql`
          insert into site_settings (key, value) values ('telegram_chat_id', ${chatId})
          on conflict (key) do update set value = excluded.value
        `;
      }
    }
    const { mailSetupView } = await import("@/lib/mail.server");
    return mailSetupView(sql);
  });

export const setDeskSwitch = createServerFn({ method: "POST" })
  .validator((input: { key: "telegram" | "backup"; enabled: boolean }) => ({
    key: input.key === "backup" ? "backup" as const : "telegram" as const,
    enabled: Boolean(input.enabled),
  }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const setting = data.key === "backup" ? "backup_schedule" : "telegram_enabled";
    await sql`
      insert into site_settings (key, value) values (${setting}, ${data.enabled ? "1" : "0"})
      on conflict (key) do update set value = excluded.value
    `;
    return { enabled: data.enabled };
  });

export const lookupTelegramChats = createServerFn({ method: "POST" })
  .validator((input: { token?: string }) => ({ token: (input.token || "").trim() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const { lookupTelegramChats: lookup } = await import("@/lib/mail.server");
    return lookup(await getSql(), data.token);
  });

export const sendTelegramTest = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const { sendTelegramTest: send } = await import("@/lib/mail.server");
  return send(await getSql());
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
    const allowed = new Set(ordered.map((term) => Number(term.months)).filter((month) => month > 0));
    const stored = await sql<{ id: string; months: string }>`select id, months from promo_tiers`;
    for (const tier of stored) {
      const months = tier.months
        .split("|")
        .map(Number)
        .filter((month) => allowed.has(month));
      const next = months.join("|");
      if (next !== tier.months) await sql`update promo_tiers set months = ${next} where id = ${tier.id}`;
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
  const termRows = await sql<{ months: number | string }>`select months from cd_terms`;
  const allowed = new Set(termRows.map((row) => Number(row.months)));
  const offer = settings[0] ? mapPromo(settings[0], tiers) : { intro: "", protection: "", finePrint: "", startsOn: "", endsOn: "", tiers: [] };
  return {
    ...offer,
    tiers: offer.tiers.map((tier) => ({ ...tier, months: tier.months.filter((month) => allowed.has(month)) })),
  } satisfies PromoOffer;
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
    const termRows = await sql<{ months: number | string }>`select months from cd_terms`;
    const allowed = new Set(termRows.map((row) => Number(row.months)));
    for (let index = 0; index < data.tiers.length; index += 1) {
      const tier = data.tiers[index];
      const min = Number(tier.minAmount);
      const max = tier.maxAmount == null || String(tier.maxAmount) === "" ? null : Number(tier.maxAmount);
      const bonus = Number(tier.bonusPercent);
      const months = [...new Set(tier.months.map(Number).filter((month) => allowed.has(month)))];
      if (!Number.isFinite(min) || min < 0 || !Number.isFinite(bonus) || bonus < 0) {
        throw new Error("Each amount band needs a minimum and a bonus percent.");
      }
      if (months.length === 0) throw new Error("Choose one of the current certificate terms for each amount band, or remove the band.");
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
  promoApy: string;
  finalApy: string;
  createdAt: string;
};

export const getMyFundings = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const email = getCookie("ah_investor");
  if (!email) throw new Error("Sign in required.");
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await ensureFundingExtras(sql);
  const { restyleLegacyFundingCodes } = await import("@/lib/funding-codes.server");
  await restyleLegacyFundingCodes(sql);
  const { ensureDemoApplications } = await import("@/lib/seed-applications.server");
  await ensureDemoApplications(sql);
  const rows = await sql<{ id: string; type_id: string; name: string; issuer: string; structure: string; currency: string; jurisdiction: string; coupon_type: string; minimum_investment: string; credit_rating: string; capital_protection: string; amount: string; frequency: string; term_label: string; status: FundingPosition["status"]; advisor_name: string | null; advisor_phone: string | null; signed: boolean; signer_name: string; signed_on: string | null; confirmed_on: string | null; deposit_code: string; deposit_number: string; account_number: string; reference_number: string; payment_file_name: string; promo_apy: string; final_apy: string; created_at: string }>`
    select f.id, f.type_id, t.name, t.issuer, t.structure, t.currency, t.jurisdiction, t.coupon_type,
           t.minimum_investment, t.credit_rating, t.capital_protection,
           f.amount, f.frequency, f.term_label, f.status,
           a.name as advisor_name, a.phone as advisor_phone,
           (f.signed_at is not null) as signed,
           f.signer_name,
           to_char(f.signed_at at time zone 'UTC', 'YYYY-MM-DD') as signed_on,
           to_char(f.payment_approved_at at time zone 'UTC', 'YYYY-MM-DD') as confirmed_on,
           f.deposit_code, f.deposit_number, f.account_number, f.reference_number,
           f.payment_file_name, f.promo_apy, f.final_apy,
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
    confirmedOn: row.confirmed_on ?? "",
    depositCode: row.deposit_code ?? "",
    depositNumber: row.deposit_number ?? "",
    accountNumber: row.account_number ?? "",
    referenceNumber: row.reference_number ?? "",
    paymentFileName: row.payment_file_name ?? "",
    promoApy: row.promo_apy ?? "",
    finalApy: row.final_apy ?? "",
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
    await ensureFundingExtras(sql);
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
    const offer = await loadPromo(sql);
    const rates = ratesFor(label, formatted, offer.tiers);
    await sql`
      insert into fundings (id, email, type_id, amount, frequency, term_label, status, deposit_code, deposit_number, account_number, reference_number, promo_apy, final_apy)
      values (${id}, ${email}, ${"cd"}, ${formatted}, ${""}, ${label}, ${"pending"}, ${codes.depositCode}, ${codes.depositNumber}, ${codes.accountNumber}, ${codes.referenceNumber}, ${rates.promo}, ${rates.final})
    `;
    await sendStep(sql, {
      step: "investment_submitted",
      clientEmail: email,
      clientName: await investorName(sql, email),
      detail: [`${label}`, formatted, `Promo APY ${rates.promo}`, `Final APY ${rates.final}`, `Reference ${codes.referenceNumber}`, `Deposit code ${codes.depositCode}`, `Account ${codes.accountNumber}`].join("\n"),
      relatedId: id,
      skipAdmin: true,
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

export type Advisor = { id: string; name: string; phone: string; email: string; mailbox: string; role: string; personalPhone: string; imapHost?: string; imapPort?: number; imapUser?: string; imapPassword?: string; imapSecure?: boolean };

export type AdminFunding = FundingPosition & { email: string; advisorId: string; billing: InvoiceBilling; contactPhone: string; contactBy: string };

export const sendLeadIntro = createServerFn({ method: "POST" })
  .validator((input: { advisorId: string; name: string; email: string; copy?: LeadCopy | null }) => {
    const name = input.name.trim().replace(/\s+/g, " ");
    const email = input.email.trim().toLowerCase();
    if (name.length < 2 || name.length > 80) throw new Error("Enter the lead's name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter the lead's email.");
    if (!input.advisorId) throw new Error("Select an advisor.");
    const clip = (value: string | undefined, max: number) => (value || "").trim().slice(0, max);
    const copy = input.copy
      ? {
          subject: clip(input.copy.subject, 140),
          headline: clip(input.copy.headline, 180),
          welcome: clip(input.copy.welcome, 800),
          certificate: clip(input.copy.certificate, 500),
          offer: clip(input.copy.offer, 800),
          protection: clip(input.copy.protection, 500),
          ready: clip(input.copy.ready, 500),
          thanks: clip(input.copy.thanks, 400),
        }
      : null;
    return { advisorId: input.advisorId, name, email, copy };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const { leadLetter } = await import("@/lib/email-templates");
    const sql = await getSql();
    await sql`alter table advisors add column if not exists role text not null default ''`;
    await sql`alter table advisors add column if not exists personal_phone text not null default ''`;
    const advisors = await sql<{ name: string; phone: string; email: string; mailbox: string; role: string; personal_phone: string }>`select name, phone, email, coalesce(mailbox, '') as mailbox, coalesce(role, '') as role, coalesce(personal_phone, '') as personal_phone from advisors where id = ${data.advisorId}`;
    const found = advisors[0];
    if (!found) throw new Error("Select an advisor.");
    const advisor = { ...found, personalPhone: found.personal_phone };
    if (!advisor.mailbox.trim()) throw new Error("Add this advisor's verified mailbox on the Advisors tab.");
    const terms = await sql<{ apy: string; months: number }>`select apy, months from cd_terms order by months asc`;
    const types = await sql<{ minimum_investment: string; capital_protection: string }>`select minimum_investment, capital_protection from investment_types where id = 'cd'`;
    const offer = await loadPromo(sql);
    const settings = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('email_logo', 'public_domain', 'company_phone')`;
    const logo = settings.find((row) => row.key === "email_logo")?.value || null;
    const portalUrl = settings.find((row) => row.key === "public_domain")?.value || "";
    const letter = leadLetter({
      leadName: data.name,
      company: await readCompanyName(sql),
      terms: terms.map((term) => ({ months: Number(term.months), apy: term.apy })),
      offer,
      advisor,
      minimum: types[0]?.minimum_investment,
      protection: types[0]?.capital_protection,
      logo,
      portalUrl,
      companyPhone: settings.find((row) => row.key === "company_phone")?.value || "",
      copy: data.copy,
    });
    await sendStep(sql, {
      step: "lead_intro",
      clientEmail: data.email,
      clientName: data.name,
      detail: letter.text,
      extraHtml: letter.html,
      subject: data.copy?.subject,
      replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(advisor.email) ? advisor.email : advisor.mailbox,
      replyName: advisor.name,
      fromAddress: advisor.mailbox,
      relatedId: data.advisorId,
      advisorId: data.advisorId,
    });
    return { ok: true as const };
  });

export const sendLeadExtension = createServerFn({ method: "POST" })
  .validator((input: { advisorId: string; name: string; email: string; copy?: import("@/lib/email-templates").ExtensionCopy | null }) => {
    const name = input.name.trim().replace(/\s+/g, " ");
    const email = input.email.trim().toLowerCase();
    if (name.length < 2 || name.length > 80) throw new Error("Enter the lead's name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter the lead's email.");
    if (!input.advisorId) throw new Error("Select an advisor.");
    const clip = (value: string | undefined, max: number) => (value || "").trim().slice(0, max);
    const copy = input.copy
      ? {
          subject: clip(input.copy.subject, 160),
          announce: clip(input.copy.announce, 800),
          base: clip(input.copy.base, 500),
          flexibility: clip(input.copy.flexibility, 500),
          opportunity: clip(input.copy.opportunity, 500),
          contact: clip(input.copy.contact, 600),
          urgency: clip(input.copy.urgency, 500),
          closing: clip(input.copy.closing, 240),
        }
      : null;
    return { advisorId: input.advisorId, name, email, copy };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const { extensionLetter } = await import("@/lib/email-templates");
    const sql = await getSql();
    await sql`alter table advisors add column if not exists role text not null default ''`;
    await sql`alter table advisors add column if not exists personal_phone text not null default ''`;
    const advisors = await sql<{ name: string; phone: string; email: string; mailbox: string; role: string; personal_phone: string }>`select name, phone, email, coalesce(mailbox, '') as mailbox, coalesce(role, '') as role, coalesce(personal_phone, '') as personal_phone from advisors where id = ${data.advisorId}`;
    const found = advisors[0];
    if (!found) throw new Error("Select an advisor.");
    const advisor = { ...found, personalPhone: found.personal_phone };
    if (!advisor.mailbox.trim()) throw new Error("Add this advisor's verified mailbox on the Advisors tab.");
    const settings = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('email_logo', 'public_domain', 'company_phone')`;
    const letter = extensionLetter({
      leadName: data.name,
      company: await readCompanyName(sql),
      advisor,
      logo: settings.find((row) => row.key === "email_logo")?.value || null,
      portalUrl: settings.find((row) => row.key === "public_domain")?.value || "",
      companyPhone: settings.find((row) => row.key === "company_phone")?.value || "",
      copy: data.copy,
    });
    await sendStep(sql, {
      step: "lead_extension",
      clientEmail: data.email,
      clientName: data.name,
      detail: letter.text,
      extraHtml: letter.html,
      subject: letter.subject,
      replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(advisor.email) ? advisor.email : advisor.mailbox,
      replyName: advisor.name,
      fromAddress: advisor.mailbox,
      relatedId: data.advisorId,
      advisorId: data.advisorId,
    });
    return { ok: true as const };
  });

export const sendLeadHtr = createServerFn({ method: "POST" })
  .validator((input: { advisorId: string; name: string; email: string; copy?: import("@/lib/email-templates").HtrCopy | null }) => {
    const name = input.name.trim().replace(/\s+/g, " ");
    const email = input.email.trim().toLowerCase();
    if (name.length < 2 || name.length > 80) throw new Error("Enter the lead's name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter the lead's email.");
    if (!input.advisorId) throw new Error("Select an advisor.");
    const clip = (value: string | undefined, max: number) => (value || "").trim().slice(0, max);
    const copy = input.copy
      ? {
          subject: clip(input.copy.subject, 160),
          opening: clip(input.copy.opening, 900),
          offer: clip(input.copy.offer, 900),
          decline: clip(input.copy.decline, 900),
          closing: clip(input.copy.closing, 400),
        }
      : null;
    return { advisorId: input.advisorId, name, email, copy };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const { htrLetter } = await import("@/lib/email-templates");
    const sql = await getSql();
    await sql`alter table advisors add column if not exists role text not null default ''`;
    await sql`alter table advisors add column if not exists personal_phone text not null default ''`;
    const advisors = await sql<{ name: string; phone: string; email: string; mailbox: string; role: string; personal_phone: string }>`select name, phone, email, coalesce(mailbox, '') as mailbox, coalesce(role, '') as role, coalesce(personal_phone, '') as personal_phone from advisors where id = ${data.advisorId}`;
    const found = advisors[0];
    if (!found) throw new Error("Select an advisor.");
    const advisor = { ...found, personalPhone: found.personal_phone };
    if (!advisor.mailbox.trim()) throw new Error("Add this advisor's verified mailbox on the Advisors tab.");
    const settings = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('email_logo', 'public_domain', 'company_phone')`;
    const letter = htrLetter({
      leadName: data.name,
      company: await readCompanyName(sql),
      advisor,
      logo: settings.find((row) => row.key === "email_logo")?.value || null,
      portalUrl: settings.find((row) => row.key === "public_domain")?.value || "",
      companyPhone: settings.find((row) => row.key === "company_phone")?.value || "",
      copy: data.copy,
    });
    await sendStep(sql, {
      step: "lead_htr",
      clientEmail: data.email,
      clientName: data.name,
      detail: letter.text,
      extraHtml: letter.html,
      subject: letter.subject,
      replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(advisor.email) ? advisor.email : advisor.mailbox,
      replyName: advisor.name,
      fromAddress: advisor.mailbox,
      relatedId: data.advisorId,
      advisorId: data.advisorId,
    });
    return { ok: true as const };
  });

export const sendLeadApplication = createServerFn({ method: "POST" })
  .validator((input: { advisorId: string; name: string; email: string; months: number; kind?: "custom" | "promo"; copy?: ApplicationCopy | null }) => {
    const name = input.name.trim().replace(/\s+/g, " ");
    const email = input.email.trim().toLowerCase();
    const months = Number(input.months);
    const kind = input.kind === "promo" ? "promo" : "custom";
    if (name.length < 2 || name.length > 80) throw new Error("Enter the lead's name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter the lead's email.");
    if (!input.advisorId) throw new Error("Select an advisor.");
    if (!Number.isFinite(months) || months <= 0) throw new Error("Choose a certificate term.");
    const clip = (value: string | undefined, max: number) => (value || "").trim().slice(0, max);
    const copy = input.copy
      ? {
          subject: clip(input.copy.subject, 140),
          headline: clip(input.copy.headline, 180),
          hope: clip(input.copy.hope, 240),
          ready: clip(input.copy.ready, 800),
          instruction: clip(input.copy.instruction, 400),
          codeNote: clip(input.copy.codeNote, 400),
          followUp: clip(input.copy.followUp, 800),
          thanks: clip(input.copy.thanks, 400),
          promoCode: clip(input.copy.promoCode, 40),
        }
      : null;
    return { advisorId: input.advisorId, name, email, months, kind, copy };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const { applicationLetter } = await import("@/lib/email-templates");
    const sql = await getSql();
    await sql`alter table advisors add column if not exists role text not null default ''`;
    await sql`alter table advisors add column if not exists personal_phone text not null default ''`;
    const advisors = await sql<{ name: string; phone: string; email: string; mailbox: string; role: string; personal_phone: string }>`select name, phone, email, coalesce(mailbox, '') as mailbox, coalesce(role, '') as role, coalesce(personal_phone, '') as personal_phone from advisors where id = ${data.advisorId}`;
    const found = advisors[0];
    if (!found) throw new Error("Select an advisor.");
    const advisor = { ...found, personalPhone: found.personal_phone };
    if (!advisor.mailbox.trim()) throw new Error("Add this advisor's verified mailbox on the Advisors tab.");
    const terms = await sql<{ apy: string; months: number }>`select apy, months from cd_terms where months = ${data.months} limit 1`;
    if (!terms[0]) throw new Error("Choose a certificate term.");
    const types = await sql<{ minimum_investment: string }>`select minimum_investment from investment_types where id = 'cd'`;
    const offer = await loadPromo(sql);
    const promoMonths = new Set(offer.tiers.flatMap((tier) => tier.months));
    if (data.kind === "promo" && !promoMonths.has(data.months)) throw new Error("Choose a promotional term.");
    if (data.kind === "custom" && promoMonths.has(data.months)) throw new Error("Choose a term that is not on promotion.");
    const settings = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('email_logo', 'public_domain', 'company_phone')`;
    const origin = settings.find((row) => row.key === "public_domain")?.value || "";
    if (!/^https?:\/\//i.test(origin.trim())) throw new Error("Set the public domain in Settings before sending this email.");
    const { createLeadInvite, inviteApplicationUrl } = await import("@/lib/lead-invites.server");
    const kind = data.kind === "promo" ? "promo" : "custom";
    const promoCode = kind === "promo" ? data.copy?.promoCode || `CD${randomBytes(3).toString("hex").toUpperCase()}` : data.copy?.promoCode || "";
    const token = await createLeadInvite(sql, { email: data.email, name: data.name, months: data.months, promoCode, kind, advisor });
    const letter = applicationLetter({
      leadName: data.name,
      company: await readCompanyName(sql),
      months: data.months,
      apy: terms[0].apy,
      offer,
      advisor,
      minimum: types[0]?.minimum_investment,
      logo: settings.find((row) => row.key === "email_logo")?.value || null,
      portalUrl: origin,
      companyPhone: settings.find((row) => row.key === "company_phone")?.value || "",
      link: inviteApplicationUrl(origin, token),
      variant: kind,
      copy: data.copy ? { ...data.copy, promoCode } : { subject: "", headline: "", hope: "", ready: "", instruction: "", codeNote: "", followUp: "", thanks: "", promoCode },
    });
    await sendStep(sql, {
      step: kind === "promo" ? "lead_promo" : "lead_application",
      clientEmail: data.email,
      clientName: data.name,
      detail: letter.text,
      extraHtml: letter.html,
      subject: letter.subject,
      replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(advisor.email) ? advisor.email : advisor.mailbox,
      replyName: advisor.name,
      fromAddress: advisor.mailbox,
      relatedId: token,
      advisorId: data.advisorId,
    });
    return { ok: true as const };
  });

async function ensureCrmLeads(sql: Sql) {
  await sql`
    create table if not exists crm_leads (
      id text primary key,
      name text not null,
      email text not null default '',
      phone text not null default '',
      amount text not null default '',
      term text not null default '',
      objective text not null default '',
      liquidity text not null default '',
      source text not null default '',
      received_at timestamptz not null default now(),
      created_at timestamptz not null default now()
    )
  `;
  await sql`alter table crm_leads add column if not exists perfex_id text not null default ''`;
  await sql`alter table crm_leads add column if not exists status text not null default ''`;
  await sql`alter table crm_leads add column if not exists notes text not null default ''`;
  await sql`alter table crm_leads add column if not exists notes_at timestamptz`;
  await sql`alter table crm_leads add column if not exists advisor_id text not null default ''`;
}

export type CrmLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  amount: string;
  term: string;
  objective: string;
  liquidity: string;
  source: string;
  status: string;
  notes: string;
  advisorId: string;
  receivedAt: string;
};

export type LeadPage = {
  rows: CrmLead[];
  total: number;
  page: number;
  pageSize: number;
  sources: string[];
  statuses: string[];
  focus: CrmLead | null;
};

const LEAD_PAGE_SIZE = 50;

export const listCrmLeads = createServerFn({ method: "GET" })
  .validator((input: { page?: number; query?: string; source?: string; status?: string; advisorId?: string; from?: string; to?: string; withEmail?: boolean; focusId?: string } | undefined) => {
    const page = Math.min(10000, Math.max(1, Math.floor(Number(input?.page) || 1)));
    const query = (input?.query || "").trim().replace(/[%_]/g, "").slice(0, 80);
    const source = (input?.source || "").trim().slice(0, 80);
    const status = (input?.status || "").trim().slice(0, 80);
    const advisorId = (input?.advisorId || "").trim().slice(0, 80);
    const from = /^\d{4}-\d{2}-\d{2}$/.test(input?.from || "") ? input?.from || "" : "";
    const to = /^\d{4}-\d{2}-\d{2}$/.test(input?.to || "") ? input?.to || "" : "";
    return { page, query, source, status, advisorId, from, to, withEmail: Boolean(input?.withEmail), focusId: (input?.focusId || "").slice(0, 80) };
  })
  .handler(async ({ data }): Promise<LeadPage> => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureCrmLeads(sql);
    const where: string[] = [];
    const params: unknown[] = [];
    if (data.query) {
      params.push(`%${data.query}%`);
      where.push(`(name ilike $${params.length} or email ilike $${params.length} or phone ilike $${params.length})`);
    }
    if (data.source) {
      params.push(data.source);
      where.push(`source = $${params.length}`);
    }
    if (data.status) {
      params.push(data.status);
      where.push(`status = $${params.length}`);
    }
    if (data.advisorId) {
      params.push(data.advisorId);
      where.push(`advisor_id = $${params.length}`);
    }
    if (data.from) {
      params.push(`${data.from}T00:00:00.000Z`);
      where.push(`received_at >= $${params.length}`);
    }
    if (data.to) {
      const end = new Date(`${data.to}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      params.push(end.toISOString());
      where.push(`received_at < $${params.length}`);
    }
    if (data.withEmail) where.push(`email <> ''`);
    const clause = where.length ? `where ${where.join(" and ")}` : "";
    const counted = await sql.query<{ count: number }>(`select count(*)::int as count from crm_leads ${clause}`, params);
    const total = Number(counted[0]?.count || 0);
    const pageCount = Math.max(1, Math.ceil(total / LEAD_PAGE_SIZE));
    const page = Math.min(data.page, pageCount);
    const offset = (page - 1) * LEAD_PAGE_SIZE;
    const rows = await sql.query<{
      id: string;
      name: string;
      email: string;
      phone: string;
      amount: string;
      term: string;
      objective: string;
      liquidity: string;
      source: string;
      status: string;
      notes: string;
      notes_at: string | Date | null;
      perfex_id: string;
      advisor_id: string;
      received_at: string | Date;
    }>(
      `select id, name, email, phone, amount, term, objective, liquidity, source, coalesce(status, '') as status, coalesce(notes, '') as notes, notes_at, coalesce(perfex_id, '') as perfex_id, coalesce(advisor_id, '') as advisor_id, received_at
       from crm_leads ${clause}
       order by received_at desc, created_at desc
       limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, LEAD_PAGE_SIZE, offset],
    );
    await attachPerfexNotes(sql, rows);
    const sources = await sql.query<{ source: string }>(`select distinct source from crm_leads where source <> '' order by source limit 200`);
    const statuses = await sql.query<{ status: string }>(`select distinct status from crm_leads where status <> '' order by status limit 100`);
    const focused = data.focusId
      ? await sql.query<{ id: string; name: string; email: string; phone: string; amount: string; term: string; objective: string; liquidity: string; source: string; status: string; notes: string; notes_at: string | Date | null; perfex_id: string; advisor_id: string; received_at: string | Date }>(
          `select id, name, email, phone, amount, term, objective, liquidity, source, coalesce(status, '') as status, coalesce(notes, '') as notes, notes_at, coalesce(perfex_id, '') as perfex_id, coalesce(advisor_id, '') as advisor_id, received_at from crm_leads where id = $1 limit 1`,
          [data.focusId],
        )
      : [];
    if (focused[0]) await attachPerfexNotes(sql, focused);
    return {
      rows: rows.map(mapCrmLead),
      total,
      page,
      pageSize: LEAD_PAGE_SIZE,
      sources: sources.map((row) => row.source),
      statuses: statuses.map((row) => row.status),
      focus: focused[0] ? mapCrmLead(focused[0]) : null,
    };
  });

function mapCrmLead(row: { id: string; name: string; email: string; phone: string; amount: string; term: string; objective: string; liquidity: string; source: string; status?: string; notes?: string; advisor_id?: string; received_at: string | Date }): CrmLead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    amount: row.amount,
    term: row.term,
    objective: row.objective,
    liquidity: row.liquidity,
    source: row.source,
    status: row.status || "",
    notes: row.notes || "",
    advisorId: row.advisor_id || "",
    receivedAt: new Date(row.received_at).toISOString(),
  };
}

export type LeadMailRow = {
  id: string;
  sentAt: string;
  name: string;
  email: string;
  phone: string;
  amount: string;
  term: string;
  step: string;
  subject: string;
  status: string;
  delivery: string;
  advisorId: string;
  advisorName: string;
};

export const listLeadMailReport = createServerFn({ method: "GET" })
  .validator((input: { from?: string; to?: string; step?: string; advisorId?: string }) => {
    const from = (input.from || "").slice(0, 10);
    const to = (input.to || "").slice(0, 10);
    const allowed = ["lead_intro", "lead_application", "lead_promo", "lead_invite_reminder", "lead_extension", "lead_htr"];
    const step = allowed.includes(input.step || "") ? input.step || "" : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) throw new Error("Choose a date range.");
    return { from, to, step, advisorId: (input.advisorId || "").slice(0, 80) };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const { ensureMailColumn } = await import("@/lib/mail.server");
    const sql = await getSql();
    await ensureCrmLeads(sql);
    await ensureMailColumn(sql);
    const start = `${data.from}T00:00:00.000Z`;
    const endDate = new Date(`${data.to}T00:00:00.000Z`);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const advisors = await sql<{ id: string; name: string; email: string }>`select id, name, email from advisors`;
    const byId = new Map(advisors.map((advisor) => [advisor.id, advisor]));
    const byEmail = new Map(advisors.filter((advisor) => advisor.email).map((advisor) => [advisor.email.trim().toLowerCase(), advisor]));
    const byName = new Map(advisors.map((advisor) => [advisor.name.trim().toLowerCase(), advisor]));
    const rows = await sql<{
      id: string;
      sent_at: string;
      recipient: string;
      step: string;
      subject: string;
      mail_status: string;
      delivery: string;
      related_id: string;
      advisor_id: string;
      name: string;
      phone: string;
      amount: string;
      term: string;
      invite_advisor: string;
      invite_email: string;
    }>`
      select n.id, to_char(n.created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as sent_at,
             n.recipient, n.step, n.subject, coalesce(n.mail_status, '') as mail_status, n.delivery,
             n.related_id, coalesce(n.advisor_id, '') as advisor_id,
             coalesce(l.name, '') as name, coalesce(l.phone, '') as phone, coalesce(l.amount, '') as amount, coalesce(l.term, '') as term,
             coalesce(i.advisor_name, '') as invite_advisor, coalesce(i.advisor_email, '') as invite_email
      from notifications n
      left join crm_leads l on lower(l.email) = lower(n.recipient)
      left join lead_invites i on i.token = n.related_id
      where n.audience = 'client'
        and n.step in ('lead_intro', 'lead_application', 'lead_promo', 'lead_invite_reminder', 'lead_extension', 'lead_htr')
        and n.created_at >= ${start}
        and n.created_at < ${endDate.toISOString()}
      order by n.created_at desc
    `;
    return rows
      .map((row) => {
        const advisor = byId.get(row.advisor_id) || (row.step === "lead_intro" ? byId.get(row.related_id) : undefined) || byEmail.get(row.invite_email.trim().toLowerCase()) || byName.get(row.invite_advisor.trim().toLowerCase());
        return {
          id: row.id,
          sentAt: row.sent_at,
          name: row.name || row.recipient,
          email: row.recipient,
          phone: row.phone,
          amount: row.amount,
          term: row.term,
          step: row.step,
          subject: row.subject,
          status: row.mail_status,
          delivery: row.delivery,
          advisorId: advisor?.id || "",
          advisorName: advisor?.name || row.invite_advisor || "Unassigned",
        };
      })
      .filter((row) => !data.step || row.step === data.step)
      .filter((row) => !data.advisorId || row.advisorId === data.advisorId);
  });

export type IntroOpen = {
  leadId: string;
  name: string;
  email: string;
  phone: string;
  amount: string;
  term: string;
  advisorId: string;
  advisorName: string;
  sentAt: string;
  mailStatus: string;
  applicationSent: boolean;
  applicationMailStatus: string;
  applicationStatus: string;
  certificateActive: boolean;
  inviteStatus: string;
  inviteExpiresAt: string;
  fundingStatus: string;
  investmentSigned: boolean;
  paymentUploaded: boolean;
  invoiceMailStatus: string;
  paymentMailStatus: string;
  confirmationMailStatus: string;
};

export const listIntroOpens = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await ensureCrmLeads(sql);
  const rows = await sql<{
    lead_id: string;
    name: string;
    email: string;
    phone: string;
    amount: string;
    term: string;
    advisor_id: string;
    advisor_name: string;
    sent_at: string;
    mail_status: string;
    application_sent: boolean;
    application_mail_status: string | null;
    application_status: string | null;
    certificate_active: boolean;
    invite_status: string | null;
    invite_expires_at: string | null;
    funding_status: string | null;
    investment_signed: boolean;
    payment_uploaded: boolean;
    invoice_mail_status: string | null;
    payment_mail_status: string | null;
    confirmation_mail_status: string | null;
  }>`
    select * from (
      select distinct on (lower(n.recipient))
        coalesce(l.id, '') as lead_id,
        coalesce(nullif(l.name, ''), n.recipient) as name,
        n.recipient as email,
        coalesce(l.phone, '') as phone,
        coalesce(l.amount, '') as amount,
        coalesce(l.term, '') as term,
        coalesce(n.advisor_id, '') as advisor_id,
        coalesce(a.name, '') as advisor_name,
        to_char(n.created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as sent_at,
        coalesce(n.mail_status, '') as mail_status,
        exists (
          select 1 from notifications later
          where later.audience = 'client'
            and lower(later.recipient) = lower(n.recipient)
            and later.step in ('lead_application', 'lead_promo')
            and later.delivery = 'sent'
        ) as application_sent,
        (
          select coalesce(later.mail_status, '')
          from notifications later
          where later.audience = 'client'
            and lower(later.recipient) = lower(n.recipient)
            and later.step in ('lead_application', 'lead_promo')
            and later.delivery = 'sent'
          order by later.created_at desc
          limit 1
        ) as application_mail_status,
        (
          select app.status from applications app
          where lower(app.email) = lower(n.recipient)
          order by app.submitted_at desc
          limit 1
        ) as application_status,
        exists (
          select 1 from fundings f
          where lower(f.email) = lower(n.recipient) and f.status = 'payment_approved'
        ) as certificate_active,
        (
          select case
            when i.used_at is not null then 'used'
            when i.expires_at <= now() then 'expired'
            else 'open'
          end
          from lead_invites i
          where lower(i.email) = lower(n.recipient)
            and i.kind in ('promo', 'custom')
          order by i.created_at desc
          limit 1
        ) as invite_status,
        (
          select to_char(i.expires_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
          from lead_invites i
          where lower(i.email) = lower(n.recipient)
            and i.kind in ('promo', 'custom')
          order by i.created_at desc
          limit 1
        ) as invite_expires_at,
        (
          select f.status
          from fundings f
          where lower(f.email) = lower(n.recipient) and f.status <> 'cancelled'
          order by case f.status
            when 'payment_approved' then 4
            when 'instructions_sent' then 3
            when 'approved_phone' then 2
            when 'pending' then 1
            else 0
          end desc
          limit 1
        ) as funding_status,
        exists (
          select 1 from fundings f
          where lower(f.email) = lower(n.recipient)
            and f.status <> 'cancelled'
            and f.signed_at is not null
        ) as investment_signed,
        exists (
          select 1 from fundings f
          where lower(f.email) = lower(n.recipient)
            and f.status <> 'cancelled'
            and coalesce(f.payment_file_name, '') <> ''
        ) as payment_uploaded,
        (
          select coalesce(later.mail_status, '')
          from notifications later
          where later.audience = 'client'
            and lower(later.recipient) = lower(n.recipient)
            and later.step = 'instructions_sent'
            and later.delivery = 'sent'
          order by later.created_at desc
          limit 1
        ) as invoice_mail_status,
        (
          select coalesce(later.mail_status, '')
          from notifications later
          where later.audience = 'client'
            and lower(later.recipient) = lower(n.recipient)
            and later.step = 'payment_uploaded'
            and later.delivery = 'sent'
          order by later.created_at desc
          limit 1
        ) as payment_mail_status,
        (
          select coalesce(later.mail_status, '')
          from notifications later
          where later.audience = 'client'
            and lower(later.recipient) = lower(n.recipient)
            and later.step = 'payment_approved'
            and later.delivery = 'sent'
          order by later.created_at desc
          limit 1
        ) as confirmation_mail_status
      from notifications n
      left join crm_leads l on lower(l.email) = lower(n.recipient)
      left join advisors a on a.id = n.advisor_id
      where n.audience = 'client' and n.step = 'lead_intro' and n.delivery = 'sent'
      order by lower(n.recipient), n.created_at desc
    ) opens
    order by sent_at desc
    limit 300
  `;
  return rows.map((row) => ({
    leadId: row.lead_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    amount: row.amount,
    term: row.term,
    advisorId: row.advisor_id,
    advisorName: row.advisor_name,
    sentAt: row.sent_at,
    mailStatus: row.mail_status,
    applicationSent: Boolean(row.application_sent),
    applicationMailStatus: row.application_mail_status || "",
    applicationStatus: row.application_status || "",
    certificateActive: Boolean(row.certificate_active),
    inviteStatus: row.invite_status || "",
    inviteExpiresAt: row.invite_expires_at || "",
    fundingStatus: row.funding_status || "",
    investmentSigned: Boolean(row.investment_signed),
    paymentUploaded: Boolean(row.payment_uploaded),
    invoiceMailStatus: row.invoice_mail_status || "",
    paymentMailStatus: row.payment_mail_status || "",
    confirmationMailStatus: row.confirmation_mail_status || "",
  }));
});

export const saveCrmLead = createServerFn({ method: "POST" })
  .validator((input: CrmLead) => {
    const name = input.name.trim().replace(/\s+/g, " ");
    const email = input.email.trim().toLowerCase();
    if (name.length < 2) throw new Error("Enter the lead's name.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email or leave it blank.");
    const received = new Date(input.receivedAt || Date.now());
    if (Number.isNaN(received.getTime())) throw new Error("Enter when the lead was received.");
    const clip = (value: string) => (value || "").trim().slice(0, 240);
    return {
      id: input.id || "",
      name: name.slice(0, 120),
      email,
      phone: clip(input.phone),
      amount: clip(input.amount),
      term: clip(input.term),
      objective: clip(input.objective),
      liquidity: clip(input.liquidity),
      source: clip(input.source),
      advisorId: input.advisorId == null ? null : (input.advisorId || "").trim().slice(0, 80),
      receivedAt: received.toISOString(),
    };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureCrmLeads(sql);
    const id = data.id || crypto.randomUUID();
    await sql`
      insert into crm_leads (id, name, email, phone, amount, term, objective, liquidity, source, advisor_id, received_at)
      values (
        ${id},
        ${data.name},
        ${data.email},
        ${data.phone},
        ${data.amount},
        ${data.term},
        ${data.objective},
        ${data.liquidity},
        ${data.source},
        ${data.advisorId || ""},
        ${data.receivedAt}
      )
      on conflict (id) do update set
        name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        amount = excluded.amount,
        term = excluded.term,
        objective = excluded.objective,
        liquidity = excluded.liquidity,
        source = excluded.source,
        advisor_id = coalesce(${data.advisorId}, crm_leads.advisor_id),
        received_at = excluded.received_at
    `;
    return { id };
  });

export const getPerfexSetup = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('perfex_url', 'perfex_token')`;
  const url = rows.find((row) => row.key === "perfex_url")?.value.trim() || "";
  const token = rows.find((row) => row.key === "perfex_token")?.value.trim() || "";
  return { url, hasToken: Boolean(token), tokenHint: token ? `••••${token.slice(-4)}` : "" };
});

export const savePerfexSetup = createServerFn({ method: "POST" })
  .validator((input: { url: string; token: string; clearToken: boolean }) => {
    const url = (input.url || "").trim().replace(/\/+$/, "").slice(0, 200);
    if (url && !/^https?:\/\/[^\s]+$/i.test(url)) throw new Error("Enter the Perfex site address, starting with https://.");
    const token = (input.token || "").trim().slice(0, 200);
    if (token && /\s/.test(token)) throw new Error("The API token cannot contain spaces.");
    return { url, token, clearToken: Boolean(input.clearToken) };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into site_settings (key, value) values ('perfex_url', ${data.url})
      on conflict (key) do update set value = excluded.value
    `;
    if (data.clearToken) await sql`delete from site_settings where key = 'perfex_token'`;
    else if (data.token) {
      await sql`
        insert into site_settings (key, value) values ('perfex_token', ${data.token})
        on conflict (key) do update set value = excluded.value
      `;
    }
    const rows = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('perfex_url', 'perfex_token')`;
    const token = rows.find((row) => row.key === "perfex_token")?.value.trim() || "";
    return { url: rows.find((row) => row.key === "perfex_url")?.value.trim() || "", hasToken: Boolean(token), tokenHint: token ? `••••${token.slice(-4)}` : "" };
  });

export const importPerfexLeads = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await ensureCrmLeads(sql);
  const settings = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('perfex_url', 'perfex_token')`;
  const base = (settings.find((row) => row.key === "perfex_url")?.value || "").trim().replace(/\/+$/, "");
  const token = (settings.find((row) => row.key === "perfex_token")?.value || "").trim();
  if (!/^https?:\/\//i.test(base) || !token) throw new Error("Save the Perfex address and API token in Settings → Misc first.");
  const incoming = await readPerfexLeads(base, token);
  const existing = await sql<{ id: string; email: string; perfex_id: string }>`select id, lower(email) as email, coalesce(perfex_id, '') as perfex_id from crm_leads`;
  const byPerfex = new Map(existing.filter((row) => row.perfex_id).map((row) => [row.perfex_id, row.id]));
  const byEmail = new Map(existing.filter((row) => row.email).map((row) => [row.email, row.id]));
  let created = 0;
  let skipped = 0;
  const updates: { perfexId: string; status: string; amount: string; term: string; objective: string }[] = [];
  for (const lead of incoming) {
    if (byPerfex.has(lead.perfexId)) {
      updates.push({ perfexId: lead.perfexId, status: lead.status, amount: lead.amount, term: lead.term, objective: lead.objective });
      continue;
    }
    if (lead.email && byEmail.has(lead.email)) {
      skipped += 1;
      continue;
    }
    const id = crypto.randomUUID();
    await sql`
      insert into crm_leads (id, name, email, phone, amount, term, objective, liquidity, source, status, received_at, perfex_id)
      values (${id}, ${lead.name}, ${lead.email}, ${lead.phone}, ${lead.amount}, ${lead.term}, ${lead.objective}, '', ${lead.source}, ${lead.status}, ${lead.receivedAt}, ${lead.perfexId})
    `;
    byPerfex.set(lead.perfexId, id);
    if (lead.email) byEmail.set(lead.email, id);
    created += 1;
  }
  await updatePerfexDetails(sql, updates);
  return { created, skipped, updated: updates.length };
});

async function readPerfexLeads(base: string, token: string) {
  const headers = { Authtoken: token, Authorization: `Bearer ${token}`, accept: "application/json" };
  const first = await fetch(`${base}/api/leads`, { headers, signal: AbortSignal.timeout(20000) });
  const payload = await first.json().catch(() => null);
  if (!first.ok || payload == null) {
    const message = payload && typeof payload === "object" && "message" in payload ? String((payload as { message?: unknown }).message || "") : "";
    throw new Error(message || `Perfex could not be reached (${first.status}). Check the address and that the token can read leads.`);
  }
  const leads = perfexRecords(payload);
  return leads.map(perfexLead).filter((lead): lead is NonNullable<typeof lead> => Boolean(lead));
}

function perfexRecords(payload: unknown) {
  if (Array.isArray(payload)) return payload.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  if (record.status === false || record.success === false) {
    throw new Error(typeof record.message === "string" && record.message ? record.message : "Perfex refused the request.");
  }
  const lists = [record.data, record.leads, record.records];
  for (const list of lists) {
    if (Array.isArray(list)) return list.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
    if (list && typeof list === "object") {
      const nested = list as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
      if (Array.isArray(nested.leads)) return nested.leads.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
    }
  }
  return [];
}

function perfexText(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function perfexLead(row: Record<string, unknown>) {
  if (perfexText(row, "junk") === "1") return null;
  const perfexId = perfexText(row, "id");
  const name = (perfexText(row, "name") || `${perfexText(row, "first_name")} ${perfexText(row, "last_name")}`.trim()).replace(/\s+/g, " ").slice(0, 120);
  if (!perfexId || name.length < 2) return null;
  const email = perfexText(row, "email").toLowerCase();
  const received = new Date(perfexText(row, "dateadded", "created_at", "date_added") || Date.now());
  const statusId = perfexText(row, "status");
  const statusName = PERFEX_STATUS_NAMES[statusId] || perfexText(row, "status_name", "statusname");
  const fields = perfexFieldList(row);
  const amount = pickPerfexField(fields, ["invest amount"]);
  const term = pickPerfexField(fields, ["invest term"]);
  const objective = pickPerfexField(fields, ["invest in"]);
  return {
    perfexId: perfexId.slice(0, 40),
    name,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "",
    phone: perfexText(row, "phonenumber", "phone").slice(0, 80),
    amount: amount.slice(0, 80),
    term: term.slice(0, 80),
    objective: objective.slice(0, 240),
    source: (perfexText(row, "source_name") || "Perfex").slice(0, 80),
    status: (statusName || (statusId ? `Status ${statusId}` : "")).slice(0, 80),
    receivedAt: Number.isNaN(received.getTime()) ? new Date().toISOString() : received.toISOString(),
  };
}

const PERFEX_STATUS_NAMES: Record<string, string> = {
  "1": "Customer",
  "2": "Popeye 100k and up",
  "3": "Back to Broker",
  "4": "Call in future",
  "5": "DNC",
  "6": "Sent email",
  "7": "Sent application",
  "8": "Application received",
  "9": "Not interested",
  "10": "Called",
  "16": "Wrong number",
  "17": "App sent JP",
  "18": "New PPC",
  "20": "Call from JP",
  "27": "Sent email JP",
  "29": "popeye new under 100k",
  "31": "20k popeye ppc",
  "33": "App in JP",
  "34": "NEW",
  "35": "Project",
};

function perfexFieldList(row: Record<string, unknown>) {
  const raw = row.customfields ?? row.custom_fields ?? row.customFields;
  if (!Array.isArray(raw)) return [];
  const fields: { label: string; value: string }[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const field = item as Record<string, unknown>;
    const label = perfexText(field, "label", "name").replace(/\s+/g, " ");
    let value = perfexText(field, "value").replace(/\s+/g, " ");
    if (value.startsWith("[")) {
      try {
        const parsed = JSON.parse(value) as unknown;
        if (Array.isArray(parsed)) value = parsed.map((part) => String(part)).join(", ");
      } catch {
        // Keep the original text when the value is not a JSON list.
      }
    }
    if (!label || !value) continue;
    fields.push({ label, value });
  }
  return fields;
}

function pickPerfexField(fields: { label: string; value: string }[], names: string[]) {
  const wanted = new Set(names);
  const match = fields.find((field) => wanted.has(field.label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()));
  return match?.value || "";
}

async function updatePerfexDetails(sql: Sql, rows: { perfexId: string; status: string; amount: string; term: string; objective: string }[]) {
  const size = 80;
  for (let index = 0; index < rows.length; index += size) {
    const chunk = rows.slice(index, index + size);
    const values: string[] = [];
    const tuples = chunk.map((row) => {
      const start = values.length + 1;
      values.push(row.perfexId, row.status, row.amount, row.term, row.objective);
      return `($${start}, $${start + 1}, $${start + 2}, $${start + 3}, $${start + 4})`;
    });
    await sql.query(
      `update crm_leads as lead
       set status = incoming.status,
           amount = case when incoming.amount <> '' then incoming.amount else lead.amount end,
           term = case when incoming.term <> '' then incoming.term else lead.term end,
           objective = case when incoming.objective <> '' then incoming.objective else lead.objective end,
           notes_at = null
       from (values ${tuples.join(", ")}) as incoming(perfex_id, status, amount, term, objective)
       where lead.perfex_id = incoming.perfex_id`,
      values,
    );
  }
}

async function attachPerfexNotes(sql: Sql, rows: { perfex_id: string; notes: string; notes_at: string | Date | null }[]) {
  const pending = rows.filter((row) => row.perfex_id && !row.notes_at);
  if (!pending.length) return;
  const settings = await sql<{ key: string; value: string }>`select key, value from site_settings where key in ('perfex_url', 'perfex_token')`;
  const base = (settings.find((row) => row.key === "perfex_url")?.value || "").trim().replace(/\/+$/, "");
  const token = (settings.find((row) => row.key === "perfex_token")?.value || "").trim();
  if (!/^https?:\/\//i.test(base) || !token) return;
  const headers = { Authtoken: token, Authorization: `Bearer ${token}`, accept: "application/json" };
  let blocked = false;
  const queue = [...pending];
  async function pull() {
    while (!blocked && queue.length) {
      const row = queue.shift();
      if (!row) return;
      try {
        const response = await fetch(`${base}/api/notes/lead/${encodeURIComponent(row.perfex_id)}`, { headers, signal: AbortSignal.timeout(8000) });
        if (response.status === 401 || response.status === 403) {
          blocked = true;
          return;
        }
        const payload = response.ok ? await response.json().catch(() => null) : null;
        const notes = response.status === 404 ? "" : perfexNotesText(payload);
        row.notes = notes;
        row.notes_at = new Date().toISOString();
        await sql.query(`update crm_leads set notes = $1, notes_at = now() where perfex_id = $2`, [notes, row.perfex_id]);
      } catch {
        // Leave this lead unmarked so the next page load can try again.
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, pending.length) }, () => pull()));
}

function perfexNotesText(payload: unknown) {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)
      ? ((payload as { data: unknown[] }).data)
      : [];
  const lines = list
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const note = item as Record<string, unknown>;
      const text = perfexText(note, "description", "note", "content").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const added = perfexText(note, "dateadded", "date_added").slice(0, 16);
      return text ? (added ? `${added} — ${text}` : text) : "";
    })
    .filter(Boolean);
  return lines.join("\n").slice(0, 4000);
}

export const deleteCrmLead = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureCrmLeads(sql);
    await sql`delete from crm_leads where id = ${data.id}`;
    return { ok: true as const };
  });

export const listAdvisors = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await sql`alter table advisors add column if not exists role text not null default ''`;
  await sql`alter table advisors add column if not exists personal_phone text not null default ''`;
  await sql`alter table advisors add column if not exists imap_host text not null default ''`;
  await sql`alter table advisors add column if not exists imap_port integer not null default 993`;
  await sql`alter table advisors add column if not exists imap_user text not null default ''`;
  await sql`alter table advisors add column if not exists imap_password text not null default ''`;
  await sql`alter table advisors add column if not exists imap_secure boolean not null default true`;
  const rows = await sql<{ id: string; name: string; phone: string; email: string; mailbox: string; role: string; personal_phone: string; imap_host: string; imap_port: number; imap_user: string; imap_password: string; imap_secure: boolean }>`
    select id, name, phone, email, coalesce(mailbox, '') as mailbox, coalesce(role, '') as role, coalesce(personal_phone, '') as personal_phone,
      coalesce(imap_host, '') as imap_host, coalesce(imap_port, 993) as imap_port, coalesce(imap_user, '') as imap_user, coalesce(imap_password, '') as imap_password, coalesce(imap_secure, true) as imap_secure
    from advisors order by name
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    mailbox: row.mailbox,
    role: row.role,
    personalPhone: row.personal_phone,
    imapHost: row.imap_host,
    imapPort: Number(row.imap_port) || 993,
    imapUser: row.imap_user,
    imapSecure: row.imap_secure !== false,
    hasImapPassword: Boolean(row.imap_password),
  }));
});

export const listSmtpUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const { readMailConfig } = await import("@/lib/mail.server");
  const mail = await readMailConfig(await getSql());
  const key = mail.smtpKey.replace(/\s+/g, "");
  if (!key) throw new Error("Save the SMTP2GO API key in Settings first.");
  const urls = [
    "https://api.smtp2go.com/v3/users/smtp/view",
    "https://us-api.smtp2go.com/v3/users/smtp/view",
    "https://eu-api.smtp2go.com/v3/users/smtp/view",
    "https://au-api.smtp2go.com/v3/users/smtp/view",
  ];
  const headers: Record<string, string> = { "Content-Type": "application/json", accept: "application/json" };
  if (/^[\x21-\x7E]+$/.test(key)) headers["X-Smtp2go-Api-Key"] = key;
  const found = new Map<string, { username: string; address: string; comments: string }>();
  const errors: string[] = [];
  await Promise.all(
    urls.map(async (url) => {
      let response: Response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers,
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({ api_key: key }),
        });
      } catch (caught) {
        const detail = caught instanceof Error && caught.message ? caught.message : "no response";
        errors.push(detail);
        return;
      }
      const payload = (await response.json().catch(() => ({}))) as { data?: { error?: string; error_code?: string } };
      const error = payload.data?.error || "";
      if (!response.ok || error) {
        let message = error || `SMTP users could not be loaded (${response.status}).`;
        if (/permission/i.test(message)) message = "This API key cannot list SMTP users. On the key, enable SMTP Users → /users/smtp/view, then paste that key into Settings.";
        errors.push(message);
        return;
      }
      const visit = (node: unknown) => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) {
          node.forEach(visit);
          return;
        }
        const record = node as Record<string, unknown>;
        const username = String(record.username || record.user_name || "").trim();
        if (username && username.length < 160 && !/\s/.test(username)) {
          const email = String(record.email || record.email_address || record.sender || "").trim();
          const address = /@/.test(username) ? username : /@/.test(email) ? email : username;
          const comments = String(record.comments || record.description || "").trim();
          found.set(address, { username, address, comments });
        }
        for (const value of Object.values(record)) {
          if (value && typeof value === "object") visit(value);
        }
      };
      visit(payload);
    }),
  );
  if (!found.size) {
    const detail = errors.find((item) => /permission|could not be loaded|API key/i.test(item)) || errors[0] || "SMTP2GO returned no SMTP users.";
    throw new Error(detail === "The operation was aborted." || /timeout|aborted|fetch failed|network/i.test(detail) ? `SMTP2GO did not respond (${detail}).` : detail);
  }
  return [...found.values()];
});

export const saveAdvisor = createServerFn({ method: "POST" })
  .validator((input: Advisor) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    if (!data.name.trim()) throw new Error("Name is required.");
    const { cleanMailFrom } = await import("@/lib/mail.server");
    const rawMailbox = (data.mailbox || "").trim();
    const mailbox = !rawMailbox ? "" : /@/.test(rawMailbox) ? cleanMailFrom(rawMailbox) : rawMailbox.slice(0, 160);
    const role = (data.role || "").trim().slice(0, 80);
    const personalPhone = (data.personalPhone || "").trim().slice(0, 40);
    const imapHost = (data.imapHost || "").trim().slice(0, 200);
    const imapPort = Math.min(65535, Math.max(1, Math.floor(Number(data.imapPort) || 993)));
    const imapUser = (data.imapUser || "").trim().slice(0, 160);
    const imapPassword = (data.imapPassword || "").slice(0, 200);
    const imapSecure = data.imapSecure !== false;
    if (imapHost && /\s/.test(imapHost)) throw new Error("The IMAP host cannot contain spaces.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`alter table advisors add column if not exists role text not null default ''`;
    await sql`alter table advisors add column if not exists personal_phone text not null default ''`;
    await sql`alter table advisors add column if not exists imap_host text not null default ''`;
    await sql`alter table advisors add column if not exists imap_port integer not null default 993`;
    await sql`alter table advisors add column if not exists imap_user text not null default ''`;
    await sql`alter table advisors add column if not exists imap_password text not null default ''`;
    await sql`alter table advisors add column if not exists imap_secure boolean not null default true`;
    const id = data.id || crypto.randomUUID();
    await sql`
      insert into advisors (id, name, phone, email, mailbox, role, personal_phone, imap_host, imap_port, imap_user, imap_password, imap_secure)
      values (${id}, ${data.name.trim()}, ${data.phone.trim()}, ${data.email.trim()}, ${mailbox}, ${role}, ${personalPhone}, ${imapHost}, ${imapPort}, ${imapUser}, ${imapPassword}, ${imapSecure})
      on conflict (id) do update set
        name = excluded.name,
        phone = excluded.phone,
        email = excluded.email,
        mailbox = excluded.mailbox,
        role = excluded.role,
        personal_phone = excluded.personal_phone,
        imap_host = excluded.imap_host,
        imap_port = excluded.imap_port,
        imap_user = excluded.imap_user,
        imap_password = case when excluded.imap_password = '' then advisors.imap_password else excluded.imap_password end,
        imap_secure = excluded.imap_secure
    `;
    return { id };
  });

export const listInboxMessages = createServerFn({ method: "GET" })
  .validator((input: { advisorId?: string } | undefined) => ({ advisorId: (input?.advisorId || "").slice(0, 80) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const { listInbox, syncInboxes } = await import("@/lib/inbox.server");
    const sql = await getSql();
    const rows = await listInbox(sql, data.advisorId);
    return { rows };
  });

export const syncInboxNow = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const { syncInboxes } = await import("@/lib/inbox.server");
  return syncInboxes(await getSql());
});

export const markInboxMessageRead = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => ({ id: (input.id || "").slice(0, 80) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const { markInboxRead } = await import("@/lib/inbox.server");
    await markInboxRead(await getSql(), data.id);
    return { ok: true as const };
  });

export const previewAdvisorInboxMail = createServerFn({ method: "POST" })
  .validator((input: { advisorId: string; toEmail?: string; toName?: string; subject?: string; message?: string; quote?: string }) => ({
    advisorId: (input.advisorId || "").slice(0, 80),
    toEmail: (input.toEmail || "").trim().slice(0, 160),
    toName: (input.toName || "").trim().slice(0, 160),
    subject: (input.subject || "").trim().slice(0, 300),
    message: (input.message || "").slice(0, 8000),
    quote: (input.quote || "").slice(0, 2000),
  }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const { previewInboxLetter } = await import("@/lib/inbox.server");
    return previewInboxLetter(await getSql(), data);
  });

export const sendAdvisorInboxMail = createServerFn({ method: "POST" })
  .validator((input: { advisorId: string; toEmail: string; toName: string; subject: string; message: string; quote?: string; leadId?: string }) => ({
    advisorId: (input.advisorId || "").slice(0, 80),
    toEmail: (input.toEmail || "").trim().slice(0, 160),
    toName: (input.toName || "").trim().slice(0, 160),
    subject: (input.subject || "").trim().slice(0, 300),
    message: (input.message || "").trim().slice(0, 8000),
    quote: (input.quote || "").slice(0, 2000),
    leadId: (input.leadId || "").slice(0, 80),
  }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const { sendInboxMail } = await import("@/lib/inbox.server");
    await sendInboxMail(await getSql(), data);
    return { ok: true as const };
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

async function ensureFundingExtras(sql: Sql) {
  await sql`alter table fundings add column if not exists promo_apy text not null default ''`;
  await sql`alter table fundings add column if not exists final_apy text not null default ''`;
  await sql`alter table fundings add column if not exists payment_approved_at timestamptz`;
  await sql`
    update fundings
    set payment_approved_at = coalesce(payment_uploaded_at, created_at)
    where status = 'payment_approved' and payment_approved_at is null
  `;
  const open = await sql<{ id: string; term_label: string; amount: string }>`
    select id, term_label, amount from fundings where final_apy = ''
  `;
  if (open.length === 0) return;
  const offer = await loadPromo(sql);
  for (const row of open) {
    const rates = ratesFor(row.term_label, row.amount, offer.tiers);
    await sql`update fundings set promo_apy = ${rates.promo}, final_apy = ${rates.final} where id = ${row.id} and final_apy = ''`;
  }
}

async function ensureContactColumns(sql: Sql) {
  await sql`alter table fundings add column if not exists contact_phone text not null default ''`;
  await sql`alter table fundings add column if not exists contact_by text not null default 'call'`;
}

async function ensureInvoiceBillingColumn(sql: Sql) {
  await sql`alter table fundings add column if not exists invoice_billing jsonb not null default '{}'::jsonb`;
}

export const listFundings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await ensureInvoiceBillingColumn(sql);
  await ensureContactColumns(sql);
  await ensureFundingExtras(sql);
  const { restyleLegacyFundingCodes } = await import("@/lib/funding-codes.server");
  await restyleLegacyFundingCodes(sql);
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
    confirmed_on: string | null;
    deposit_code: string;
    deposit_number: string;
    account_number: string;
    reference_number: string;
    payment_file_name: string;
    promo_apy: string;
    final_apy: string;
    invoice_billing: unknown;
    contact_phone: string;
    contact_by: string;
    created_at: string;
  }>`
    select f.id, f.email, f.type_id, t.name, t.issuer, t.structure, t.currency, t.jurisdiction,
           t.coupon_type, t.minimum_investment, t.credit_rating, t.capital_protection,
           f.amount, f.frequency, f.term_label, f.status, f.advisor_id,
           a.name as advisor_name, a.phone as advisor_phone,
           (f.signed_at is not null) as signed,
           f.signer_name,
           to_char(f.signed_at at time zone 'UTC', 'YYYY-MM-DD') as signed_on,
           to_char(f.payment_approved_at at time zone 'UTC', 'YYYY-MM-DD') as confirmed_on,
           f.deposit_code, f.deposit_number, f.account_number, f.reference_number,
           f.payment_file_name, f.promo_apy, f.final_apy, f.invoice_billing, f.contact_phone, f.contact_by,
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
    confirmedOn: row.confirmed_on ?? "",
    depositCode: row.deposit_code ?? "",
    depositNumber: row.deposit_number ?? "",
    accountNumber: row.account_number ?? "",
    referenceNumber: row.reference_number ?? "",
    paymentFileName: row.payment_file_name ?? "",
    promoApy: row.promo_apy ?? "",
    finalApy: row.final_apy ?? "",
    contactPhone: row.contact_phone ?? "",
    contactBy: row.contact_by ?? "call",
    createdAt: row.created_at,
    billing: resolveInvoiceBilling(row.invoice_billing, row.signer_name || row.email, row.reference_number ?? ""),
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
    await ensureFundingExtras(sql);
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
    if (!current) throw new Error("Investment not found.");
    if (data.status !== current.status) {
      const from = current.status;
      const to = data.status;
      const allowed =
        ((from === "pending" || from === "approved_phone") && (to === "pending" || to === "approved_phone" || to === "cancelled"))
        || (from === "instructions_sent" && to === "cancelled");
      if (!allowed) throw new Error("Create the invoice on the Invoices tab. Confirm the payment there after the wire file is attached.");
    }
    const rates = current.amount === data.amount ? null : ratesFor(current.term_label, data.amount, (await loadPromo(sql)).tiers);
    await sql`
      update fundings
      set status = ${data.status},
          advisor_id = ${data.advisorId || null},
          deposit_code = ${data.depositCode},
          deposit_number = ${data.depositNumber},
          account_number = ${data.accountNumber},
          reference_number = ${data.referenceNumber},
          amount = ${data.amount},
          promo_apy = ${rates ? rates.promo : (current.promo_apy ?? "")},
          final_apy = ${rates ? rates.final : (current.final_apy ?? "")},
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

async function paymentReceiptFile(sql: Sql, id: string) {
  try {
    const content = await paymentReceiptPdf(sql, id);
    return content ? [{ filename: "payment-receipt.pdf", content }] : undefined;
  } catch {
    return undefined;
  }
}

async function paymentReceiptPdf(sql: Sql, id: string) {
  await ensureInvoiceBillingColumn(sql);
  const rows = await sql<{
    email: string;
    amount: string;
    term_label: string;
    reference_number: string | null;
    deposit_code: string | null;
    account_number: string | null;
    promo_apy: string | null;
    final_apy: string | null;
    received_on: string | null;
    applicant_name: string | null;
    payload: ApplicationPayload | string | null;
    invoice_billing: unknown;
  }>`
    select f.email, f.amount, f.term_label, f.reference_number, f.deposit_code, f.account_number,
           f.promo_apy, f.final_apy, f.invoice_billing,
           to_char(coalesce(f.payment_approved_at, f.payment_uploaded_at, now()) at time zone 'UTC', 'YYYY-MM-DD') as received_on,
           app.applicant_name, app.payload
    from fundings f
    left join lateral (
      select applicant_name, payload from applications
      where lower(email) = lower(f.email)
      order by submitted_at desc nulls last
      limit 1
    ) app on true
    where f.id = ${id} and f.status = 'payment_approved' and coalesce(f.payment_file_name, '') <> ''
  `;
  const row = rows[0];
  if (!row) return "";
  const payload = row.payload ? (typeof row.payload === "string" ? (JSON.parse(row.payload) as ApplicationPayload) : row.payload) : null;
  const clientName = row.applicant_name || [payload?.firstName, payload?.surname].filter(Boolean).join(" ") || row.email;
  const address = [
    [payload?.street, payload?.apt].filter(Boolean).join(" "),
    [payload?.city, payload?.region, payload?.postal].filter(Boolean).join(", "),
    payload?.country ?? "",
  ].filter(Boolean);
  const rates = row.final_apy ? { promo: row.promo_apy || "—", final: row.final_apy } : ratesFor(row.term_label, row.amount, (await loadPromo(sql)).tiers);
  const { buildReceiptPdf } = await import("@/lib/investment-pdf.server");
  const brand = await readPdfBrand(sql);
  return buildReceiptPdf({
    clientName,
    address,
    email: row.email,
    amount: row.amount,
    term: row.term_label,
    promoApy: rates.promo,
    finalApy: rates.final,
    depositCode: row.deposit_code ?? "",
    accountNumber: row.account_number ?? "",
    receivedOn: usDate(row.received_on || ""),
    billing: resolveInvoiceBilling(row.invoice_billing, clientName, row.reference_number ?? ""),
    logo: brand.logo,
    companyAddress: brand.companyAddress,
  });
}

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
    if (!rows[0]) throw new Error("The invoice has not been generated for this investment.");
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

export const downloadPaymentReceipt = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { getCookie } = await import("@tanstack/react-start/server");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const investor = getCookie("ah_investor");
    const owned = investor
      ? await sql<{ id: string }>`select id from fundings where id = ${data.id} and email = ${investor} and payment_file_name <> ''`
      : [];
    if (!owned[0]) await requireAdmin();
    const pdf = await paymentReceiptPdf(sql, data.id);
    if (!pdf) throw new Error("Upload the payment confirmation before a receipt can be created.");
    return { pdf };
  });

export const approvePayment = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string }>`
      update fundings set status = 'payment_approved', payment_approved_at = now()
      where id = ${data.id} and payment_file <> '' and status = 'instructions_sent'
      returning id
    `;
    if (!rows[0]) throw new Error("A wire confirmation is required before approval.");
    const detail = await fundingDetail(sql, data.id);
    if (detail) {
      const receipt = await paymentReceiptFile(sql, data.id);
      await sendStep(sql, {
        step: "payment_approved",
        clientEmail: detail.email,
        clientName: await investorName(sql, detail.email),
        detail: await detailText(sql, detail),
        relatedId: data.id,
        attachments: receipt,
        clientAttachments: receipt,
      });
    }
    return { ok: true };
  });

export const rejectPayment = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: string }>`
      update fundings
      set payment_file_name = '', payment_file = '', payment_uploaded_at = null
      where id = ${data.id} and status = 'instructions_sent' and payment_file <> ''
      returning id
    `;
    if (!rows[0]) throw new Error("There is no wire confirmation to reject.");
    const detail = await fundingDetail(sql, data.id);
    if (detail) {
      await sendStep(sql, {
        step: "payment_rejected",
        clientEmail: detail.email,
        clientName: await investorName(sql, detail.email),
        detail: await detailText(sql, detail),
        relatedId: data.id,
      });
    }
    return { ok: true };
  });

export const signFunding = createServerFn({ method: "POST" })
  .validator((input: { id: string; signature?: string; contactPhone?: string; contactBy?: string }) => ({
    id: input.id,
    signature: input.signature,
    contactPhone: (input.contactPhone || "").trim().slice(0, 80),
    contactBy: input.contactBy === "email" ? "email" : "call",
  }))
  .handler(async ({ data }) => {
    const { getCookie } = await import("@tanstack/react-start/server");
    const email = getCookie("ah_investor");
    if (!email) throw new Error("Sign in required.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureContactColumns(sql);
    const apps = await sql<{ id: string; applicant_name: string; payload: ApplicationPayload | string }>`
      select id, applicant_name, payload from applications
      where lower(email) = ${email.toLowerCase()}
      order by submitted_at desc nulls last
      limit 1
    `;
    const payload = apps[0]?.payload ? (typeof apps[0].payload === "string" ? (JSON.parse(apps[0].payload) as ApplicationPayload) : apps[0].payload) : null;
    const drawn = data.signature?.startsWith("data:image/png;base64,") ? data.signature : "";
    const signature = drawn || payload?.signature || "";
    if (!signature.startsWith("data:image/png;base64,")) throw new Error("Draw your signature.");
    if (data.contactBy === "call" && data.contactPhone.replace(/\D/g, "").length < 7) throw new Error("Enter the number to call.");
    if (drawn && apps[0]) {
      const next = { ...(payload ?? {}), signature: drawn };
      await sql`update applications set payload = ${JSON.stringify(next)}::jsonb where id = ${apps[0].id}`;
    }
    const signerName = apps[0]?.applicant_name || [payload?.firstName, payload?.surname].filter(Boolean).join(" ") || email;
    const rows = await sql<{ id: string }>`
      update fundings
      set signer_name = ${signerName}, signature = ${signature}, signed_at = now(),
          contact_phone = ${data.contactPhone}, contact_by = ${data.contactBy}
      where id = ${data.id} and lower(email) = ${email.toLowerCase()} and status in ('pending', 'approved_phone', 'instructions_sent') and signed_at is null
      returning id
    `;
    if (!rows[0]) throw new Error("These terms cannot be accepted.");
    const detail = await fundingDetail(sql, data.id);
    const contact = data.contactBy === "email" ? `Do not call. Use email ${email}` : `Call ${data.contactPhone}`;
    await sendStep(sql, {
      step: "terms_accepted",
      clientEmail: email,
      clientName: signerName,
      detail: [await detailText(sql, detail), contact].filter(Boolean).join("\n"),
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
    await ensureFundingExtras(sql);
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
      confirmed_on: string | null;
      promo_apy: string;
      final_apy: string;
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
             to_char(f.payment_approved_at at time zone 'UTC', 'YYYY-MM-DD') as confirmed_on,
             f.promo_apy, f.final_apy,
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
    const rates = row.final_apy ? { promo: row.promo_apy || "—", final: row.final_apy } : ratesFor(row.term_label, row.amount, promo.tiers);
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
      ...(await readPdfBrand(sql)),
    };
    const pdf =
      row.status === "payment_approved"
        ? await buildConfirmationPdf({
            ...shared,
            clientName,
            address,
            issueDate: usDate(row.opened_on),
            maturityDate: plusMonths(row.opened_on, months),
            confirmationDate: usDate(row.confirmed_on || row.opened_on),
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
        signerName: row.signer_name || (png ? clientName : ""),
        signedOn: row.signed_on || (png ? "Signed on the account application" : ""),
        email: row.email,
      },
    };
  });

export const downloadInvoicePdf = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { getCookie } = await import("@tanstack/react-start/server");
    const email = getCookie("ah_investor");
    const admin = await readSignedIn();
    if (!email && !admin) throw new Error("Sign in required.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureInvoiceBillingColumn(sql);
    const rows = await sql<{
      id: string;
      status: string;
      email: string;
      amount: string;
      term_label: string;
      reference_number: string;
      signature: string;
      signed_on: string | null;
      applicant_name: string | null;
      payload: ApplicationPayload | string | null;
      advisor_phone: string | null;
      invoice_billing: unknown;
    }>`
      select f.id, f.status, f.email, f.amount, f.term_label, f.reference_number, f.signature,
             to_char(f.signed_at at time zone 'UTC', 'YYYY-MM-DD') as signed_on,
             app.applicant_name, app.payload, a.phone as advisor_phone, f.invoice_billing
      from fundings f
      left join advisors a on a.id = f.advisor_id
      left join lateral (
        select applicant_name, payload from applications
        where email = f.email
        order by submitted_at desc nulls last
        limit 1
      ) app on true
      where f.id = ${data.id}
    `;
    const row = rows[0];
    const signed = Boolean(row?.signature) || Boolean(row?.signed_on);
    const generated = row?.status === "instructions_sent";
    const preview = generated || row?.status === "approved_phone";
    if (!row || !signed || !preview || (!admin && !generated) || (!admin && row.email !== email)) throw new Error("Invoice not found.");
    const payload = row.payload ? (typeof row.payload === "string" ? (JSON.parse(row.payload) as ApplicationPayload) : row.payload) : null;
    const clientName = row.applicant_name || [payload?.firstName, payload?.surname].filter(Boolean).join(" ") || row.email;
    const address = [
      [payload?.street, payload?.apt].filter(Boolean).join(" "),
      [payload?.city, payload?.region, payload?.postal].filter(Boolean).join(", "),
      payload?.country ?? "",
    ].filter(Boolean);
    const { buildInvoicePdf } = await import("@/lib/investment-pdf.server");
    const brand = await readPdfBrand(sql);
    const pdf = await buildInvoicePdf({
      clientName,
      address,
      amount: row.amount,
      billing: resolveInvoiceBilling(row.invoice_billing, clientName, row.reference_number),
      logo: brand.logo,
      companyAddress: brand.companyAddress,
    });
    return { pdf };
  });

export const saveInvoiceBilling = createServerFn({ method: "POST" })
  .validator((input: { id: string; billing: InvoiceBilling }) => {
    const billing = { ...input.billing };
    (Object.keys(billing) as Array<keyof InvoiceBilling>).forEach((key) => {
      billing[key] = String(billing[key] ?? "").trim();
    });
    if (!billing.bankName || !billing.accountName || !billing.beneficiaryAddress || !billing.accountNumber || !billing.routingNumber || !billing.crn || !billing.purpose) {
      throw new Error("Fill in every billing field.");
    }
    return { id: input.id, billing };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureInvoiceBillingColumn(sql);
    await sql`update fundings set invoice_billing = ${JSON.stringify(data.billing)}::jsonb where id = ${data.id}`;
    return { billing: data.billing };
  });

export const approveInvoice = createServerFn({ method: "POST" })
  .validator((input: { id: string; billing: InvoiceBilling }) => {
    const billing = { ...input.billing };
    (Object.keys(billing) as Array<keyof InvoiceBilling>).forEach((key) => {
      billing[key] = String(billing[key] ?? "").trim();
    });
    if (!billing.bankName || !billing.accountName || !billing.beneficiaryAddress || !billing.accountNumber || !billing.routingNumber || !billing.crn || !billing.purpose) {
      throw new Error("Fill in every billing field.");
    }
    return { id: input.id, billing };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureInvoiceBillingColumn(sql);
    const current = await fundingDetail(sql, data.id);
    const signed = await sql<{ signed: boolean }>`select signed_at is not null as signed from fundings where id = ${data.id}`;
    if (!current || !signed[0]?.signed) throw new Error("The client has not accepted the terms.");
    if (current.status !== "approved_phone" && current.status !== "instructions_sent") throw new Error("Approve the call before generating the invoice.");
    await sql`update fundings set invoice_billing = ${JSON.stringify(data.billing)}::jsonb where id = ${data.id}`;
    if (current.status === "approved_phone") {
      await sql`update fundings set status = 'instructions_sent' where id = ${data.id}`;
      await sendStep(sql, {
        step: "instructions_sent",
        clientEmail: current.email,
        clientName: await investorName(sql, current.email),
        detail: await detailText(sql, { ...current, status: "instructions_sent" }),
        relatedId: data.id,
      });
    }
    return { ok: true as const };
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
  promo_apy: string | null;
  final_apy: string | null;
};

async function readCompanyName(sql: Sql) {
  const rows = await sql<{ value: string }>`select value from site_settings where key = 'company_name'`;
  return rows[0]?.value?.trim() || DEFAULT_COMPANY_NAME;
}

async function readPdfBrand(sql: Sql) {
  const rows = await sql<{ key: string; value: string }>`
    select key, value from site_settings where key in ('pdf_logo', 'company_address')
  `;
  const logo = rows.find((row) => row.key === "pdf_logo")?.value ?? "";
  return {
    logo: /^data:image\/(png|jpeg);base64,/i.test(logo) ? logo : "",
    companyAddress: rows.find((row) => row.key === "company_address")?.value?.trim() ?? "",
  };
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
           f.promo_apy, f.final_apy,
           a.name as advisor_name, a.phone as advisor_phone
    from fundings f
    left join advisors a on a.id = f.advisor_id
    where f.id = ${id}
  `;
  return rows[0] ?? null;
}

async function detailText(sql: Sql, row: FundingMail | null) {
  if (!row) return "";
  const rates = row.final_apy ? { promo: row.promo_apy || "—", final: row.final_apy } : ratesFor(row.term_label, row.amount, (await loadPromo(sql)).tiers);
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
  pending: "Pending call/email",
  approved_phone: "Approved by phone",
  instructions_sent: "Invoice generated",
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

function applicationDeskDetail(payload: ApplicationPayload) {
  const line = (label: string, value: string) => `${label}: ${value.trim() || "—"}`;
  return [
    line("Account", payload.accountType),
    line("Name", [payload.firstName, payload.middleName, payload.surname].filter(Boolean).join(" ")),
    line("Email", payload.email),
    line("Phone", `${payload.phoneCountry} ${payload.phone}`),
    line("Date of birth", [payload.dobDay, payload.dobMonth, payload.dobYear].filter(Boolean).join(" ")),
    line("Nationality", payload.nationality),
    line("Residence", payload.residence),
    line("Occupation", payload.occupation),
    line("Address", [payload.street, payload.apt, payload.city, payload.region, payload.postal, payload.country].filter(Boolean).join(", ")),
    line("Tax residence", payload.taxResidence),
    line("Tax ID", payload.taxId),
    line("Source of wealth", payload.sourceOfWealth),
    line("Source of funds", payload.sourceOfFunds),
    line("Purpose", payload.investmentPurpose),
    line("Net worth", payload.netWorth),
    line("Preferred amount", payload.preferredAmount || "—"),
    line("Preferred term", payload.preferredTerm ? `${payload.preferredTerm}-month` : "—"),
    line("Promotional code", payload.promoCode || "—"),
    line("Identity document", `${payload.idType}${payload.idFileName ? ` · ${payload.idFileName}` : " · not attached"}`),
    line("Address document", `${payload.addressDocType}${payload.addressFileName ? ` · ${payload.addressFileName}` : " · not attached"}`),
    line("Bank", payload.bankName),
    line("Account holder", payload.accountHolder),
    line("Bank address", [payload.bankStreet, payload.bankLine2, payload.bankCity, payload.bankState, payload.bankZip].filter(Boolean).join(", ")),
    line("Routing number", payload.routingNumber),
    line("Account number", payload.accountNumber),
    line("Information is accurate", payload.d1 ? "Yes" : "No"),
    line("Beneficial owner", payload.d2 ? "Yes" : "No"),
    line("Portfolio stays unavailable until approval", payload.d3 ? "Yes" : "No"),
    line("Agrees to account terms", payload.d4 ? "Yes" : "No"),
    line("Signature", payload.signature.startsWith("data:image/") ? "Attached" : "Not attached"),
  ].join("\n");
}

function applicationFiles(payload: ApplicationPayload) {
  return [
    dataFile(payload.idFileName ? `identity-${payload.idFileName}` : "identity-document", payload.idFile),
    dataFile(payload.addressFileName ? `address-${payload.addressFileName}` : "address-document", payload.addressFile),
    dataFile("signature.png", payload.signature),
  ].filter((file): file is { filename: string; content: string } => Boolean(file));
}

function dataFile(name: string, value: string) {
  const match = value.match(/^data:[^;]+;base64,([a-zA-Z0-9+/=\s]+)$/);
  if (!match) return null;
  const content = match[1].replace(/\s/g, "");
  if (!content) return null;
  const filename = name.trim() || "document";
  return { filename, content };
}

async function sendStep(sql: Sql, input: { step: MailStep; clientEmail: string; clientName: string; detail: string; adminDetail?: string; attachments?: { filename: string; content: string }[]; clientAttachments?: { filename: string; content: string }[]; relatedId?: string; skipAdmin?: boolean; extraHtml?: string; replyTo?: string; replyName?: string; fromAddress?: string; subject?: string; advisorId?: string }) {
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
  resendId: string;
  mailStatus: string;
  mailProvider: string;
  link: string;
  expiresAt: string;
  usedAt: string;
  leadId: string;
  applicationId: string;
  applicationStatus: string;
};

export const listNotifications = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const { ensureMailColumn } = await import("@/lib/mail.server");
  const sql = await getSql();
  await ensureMailColumn(sql);
  await ensureCrmLeads(sql);
  const leads = await sql<{ id: string; email: string }>`select id, lower(email) as email from crm_leads where email <> '' order by received_at desc`;
  const applications = await sql<{ id: string; email: string; status: string }>`
    select distinct on (lower(email)) id, lower(email) as email, status
    from applications
    order by lower(email), submitted_at desc
  `;
  const leadByEmail = new Map<string, string>();
  for (const lead of leads) if (!leadByEmail.has(lead.email)) leadByEmail.set(lead.email, lead.id);
  const applicationByEmail = new Map(applications.map((row) => [row.email, row]));
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
    resend_id: string;
    mail_status: string;
    mail_provider: string;
    related_id: string;
  }>`
    select id, to_char(created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as created_at,
           audience, recipient, step, subject, body, html, delivery, resend_id, mail_status, coalesce(mail_provider, '') as mail_provider, related_id
    from notifications
    order by created_at desc
    limit 200
  `;
  const settings = await sql<{ value: string }>`select value from site_settings where key = 'public_domain'`;
  const origin = (settings[0]?.value || "").trim().replace(/\/$/, "");
  const invites = await sql<{ token: string; expires_at: string | Date; used_at: string | Date | null }>`
    select token, expires_at, used_at from lead_invites
  `;
  const byToken = new Map(invites.map((invite) => [invite.token, invite]));
  return rows.map((row) => {
    const fromHtml = row.html?.match(/invite=([a-f0-9]{16,})/i)?.[1] || "";
    const invite = byToken.get(row.related_id) || byToken.get(fromHtml);
    const token = invite?.token || "";
    const link = token && /^https?:\/\//i.test(origin) ? `${origin}/application?invite=${token}` : "";
    const email = row.recipient.trim().toLowerCase();
    const application = applicationByEmail.get(email);
    return {
      id: row.id,
      createdAt: row.created_at,
      audience: row.audience,
      recipient: row.recipient,
      step: row.step,
      subject: row.subject,
      body: row.body,
      html: row.html ?? "",
      delivery: row.delivery,
      resendId: row.resend_id || "",
      mailStatus: row.mail_status || "",
      mailProvider: row.mail_provider || "",
      link,
      expiresAt: invite?.expires_at ? new Date(invite.expires_at).toISOString() : "",
      usedAt: invite?.used_at ? new Date(invite.used_at).toISOString() : "",
      leadId: leadByEmail.get(email) || "",
      applicationId: application?.id || "",
      applicationStatus: application?.status || "",
    };
  });
});

export const syncMailStatuses = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  const { getSql } = await import("@/lib/db");
  const { syncResendStatuses } = await import("@/lib/mail.server");
  return syncResendStatuses(await getSql());
});

export const listMyNotifications = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const email = getCookie("ah_investor");
  if (!email) throw new Error("Sign in required.");
  const { getSql } = await import("@/lib/db");
  const { ensureMailColumn } = await import("@/lib/mail.server");
  const sql = await getSql();
  await ensureMailColumn(sql);
  const rows = await sql<{ id: string; created_at: string; subject: string; read_at: string | null }>`
    select id, to_char(created_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI') as created_at, subject, read_at
    from notifications
    where audience = 'client' and lower(recipient) = ${email.toLowerCase()}
    order by created_at desc
    limit 50
  `;
  return rows.map((row) => ({ id: row.id, createdAt: row.created_at, subject: row.subject, unread: !row.read_at }));
});

export const markMyNotificationsRead = createServerFn({ method: "POST" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const email = getCookie("ah_investor");
  if (!email) throw new Error("Sign in required.");
  const { getSql } = await import("@/lib/db");
  const { ensureMailColumn } = await import("@/lib/mail.server");
  const sql = await getSql();
  await ensureMailColumn(sql);
  await sql`
    update notifications
    set read_at = now()
    where audience = 'client' and lower(recipient) = ${email.toLowerCase()} and read_at is null
  `;
  return { ok: true };
});




