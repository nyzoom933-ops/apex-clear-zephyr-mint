import { isWorkspacePreview } from "@/lib/env.server";
import type { Sql } from "@/lib/db";
import type { ApplicationPayload } from "@/lib/admin.functions";
import { hashPassword } from "@/lib/passwords.server";
import { nextFundingCodes } from "@/lib/funding-codes.server";

const DEMO_PASSWORD = "Harbor-1842";
const SIGNATURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAAwCAIAAAAZy+Y5AAAA10lEQVR4nO3YQQqDQBAFUW8x9z+p7twoY/eI2FRXrST8RZoHSci2G7rt7zdg3yYwPIHhCQxPYHgCwxMYnsDwBIYnMDyB4QkMT2B4AsMTGJ7A8ASGJzC8KPAY43y4Pt++6ODrQaR14GrXNhxEygFXvrbhIAKX+w6ufG3DQYRsEbjgtQ0HEbIEcPFr2w7mvQWudm3DwbwV4MrXdhs8lvgV/fsxDrKfz/6TxU9geALDExiewPAEhicwPIHhCQxPYHgCwxMYnsDwBIYnMDyB4QkMT2B4AsMTGN4BSL2i/7dhmP8AAAAASUVORK5CYII=";
const WIRE = "data:application/pdf;base64,JVBERi0xLjEKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZz4+ZW5kb2JqCnRyYWlsZXI8PD4+CiUlRU9G";

type Demo = {
  id: string;
  status: "pending" | "approved";
  submittedAt: string;
  payload: ApplicationPayload;
};

const DEMOS: Demo[] = [
  {
    id: "app_seed_maya",
    status: "pending",
    submittedAt: "2026-10-22 14:10",
    payload: person("Maya", "Lin", "Chen", "maya.chen@example.com", "Individual", "USD", "Austin", "TX", "78701", "United States", "Professional"),
  },
  {
    id: "app_seed_luis",
    status: "pending",
    submittedAt: "2026-10-23 09:40",
    payload: person("Luis", "", "Ortega", "luis.ortega@example.com", "Joint", "USD", "London", "England", "SW1A 1AA", "United Kingdom", "Business owner"),
  },
  {
    id: "app_seed_priya",
    status: "pending",
    submittedAt: "2026-10-23 16:05",
    payload: person("Priya", "N.", "Shah", "priya.shah@example.com", "Trust", "USD", "Toronto", "ON", "M5V 2T6", "Canada", "Retired"),
  },
  {
    id: "app_seed_jonah",
    status: "approved",
    submittedAt: "2026-10-21 11:20",
    payload: person("Jonah", "", "Hale", "jonah.hale@example.com", "Individual", "USD", "Denver", "CO", "80202", "United States", "Executive"),
  },
];

function person(
  firstName: string,
  middleName: string,
  surname: string,
  email: string,
  accountType: ApplicationPayload["accountType"],
  currency: ApplicationPayload["currency"],
  city: string,
  region: string,
  postal: string,
  country: string,
  occupation: string,
): ApplicationPayload {
  return {
    accountType,
    currency,
    firstName,
    middleName,
    surname,
    email,
    phoneCountry: "United States / Canada (+1)",
    phone: "2025550148",
    dobYear: "1988",
    dobMonth: "Jun",
    dobDay: "15",
    nationality: country,
    residence: country,
    occupation,
    street: "18 Market Street",
    apt: "",
    city,
    region,
    postal,
    country,
    taxResidence: country,
    taxId: "0000",
    sourceOfWealth: "Employment income",
    sourceOfFunds: "Salary",
    investmentPurpose: "Long-term growth",
    netWorth: "$250,000 – $1,000,000",
    idType: "Passport",
    addressDocType: "Utility bill",
    idFileName: "passport.pdf",
    addressFileName: "utility.pdf",
    bankName: "First National Bank",
    accountHolder: [firstName, surname].filter(Boolean).join(" "),
    bankStreet: "18 Market Street",
    bankLine2: "",
    bankCity: city,
    bankState: country === "United States" ? region : "",
    bankZip: postal,
    routingNumber: "021000021",
    accountNumber: "123456789",
    d1: true,
    d2: true,
    d3: true,
    d4: true,
    signature: SIGNATURE,
  };
}

let seeded: Promise<void> | null = null;

export function ensureDemoApplications(sql: Sql) {
  if (!isWorkspacePreview()) return Promise.resolve();
  seeded ??= seed(sql).catch((error) => {
    seeded = null;
    throw error;
  });
  return seeded;
}

async function seed(sql: Sql) {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  for (const demo of DEMOS) {
    const existing = await sql<{ id: string }>`select id from applications where email = ${demo.payload.email}`;
    if (existing.length > 0) {
      await sql`
        update applications
        set currency = 'USD', payload = jsonb_set(payload, '{currency}', '"USD"')
        where email = ${demo.payload.email} and currency <> 'USD'
      `;
      await sql`
        update applications
        set payload = jsonb_set(payload, '{signature}', ${JSON.stringify(SIGNATURE)}::jsonb)
        where email = ${demo.payload.email} and coalesce(payload->>'signature', '') = ''
      `;
      await sql`
        update applications
        set payload = payload || ${JSON.stringify({
          bankName: demo.payload.bankName,
          accountHolder: demo.payload.accountHolder,
          bankStreet: demo.payload.bankStreet,
          bankLine2: demo.payload.bankLine2,
          bankCity: demo.payload.bankCity,
          bankState: demo.payload.bankState,
          bankZip: demo.payload.bankZip,
          routingNumber: demo.payload.routingNumber,
          accountNumber: demo.payload.accountNumber,
        })}::jsonb
        where email = ${demo.payload.email} and coalesce(payload->>'bankName', '') = ''
      `;
      continue;
    }
    const name = [demo.payload.firstName, demo.payload.middleName, demo.payload.surname].filter(Boolean).join(" ");
    await sql`
      insert into applications (id, status, submitted_at, applicant_name, email, account_type, currency, payload, password_hash)
      values (
        ${demo.id},
        ${demo.status},
        ${demo.submittedAt}::timestamp,
        ${name},
        ${demo.payload.email},
        ${demo.payload.accountType},
        ${demo.payload.currency},
        ${JSON.stringify(demo.payload)}::jsonb,
        ${passwordHash}
      )
    `;
    if (demo.status === "approved") {
      await sql`
        insert into investor_users (email, password_hash, application_id)
        values (${demo.payload.email}, ${passwordHash}, ${demo.id})
        on conflict (email) do nothing
      `;
    }
  }

  const fundings = [
    ["fund_seed_jonah_10", "jonah.hale@example.com", "$150,000.00", "Quarterly", "10-month · 4.40% APY", "adv_ellen", "2026-07-24 15:00"],
    ["fund_seed_jonah_22", "jonah.hale@example.com", "$250,000.00", "Bi-annually", "22-month · 4.40% APY", "", "2026-10-23 11:30"],
    ["fund_seed_jonah_24", "jonah.hale@example.com", "$120,000.00", "Annually", "24-month · 3.65% APY", "adv_ellen", "2026-08-24 15:00"],
    ["fund_seed_jonah_12", "jonah.hale@example.com", "$100,000.00", "Quarterly", "12-month · 3.65% APY", "adv_ellen", "2026-04-24 15:00"],
    ["fund_seed_jonah_18", "jonah.hale@example.com", "$200,000.00", "Bi-annually", "18-month · 3.65% APY", "adv_ellen", "2025-07-24 15:00"],
    ["fund_seed_maya_12", "maya.chen@example.com", "$100,000.00", "Annually", "12-month · 3.65% APY", "adv_marcus", "2026-10-23 16:40"],
    ["fund_seed_luis_24", "luis.ortega@example.com", "$175,000.00", "Quarterly", "24-month · 3.65% APY", "", "2026-10-24 09:15"],
  ] as const;
  for (const [id, email, amount, frequency, label, advisorId, createdAt] of fundings) {
    const existing = await sql<{ id: string }>`select id from fundings where id = ${id}`;
    if (existing.length > 0) continue;
    const codes = await nextFundingCodes(sql, createdAt);
    await sql`
      insert into fundings (id, email, type_id, amount, frequency, term_label, status, advisor_id, created_at, deposit_code, deposit_number, account_number, reference_number)
      values (
        ${id},
        ${email},
        ${"cd"},
        ${amount},
        ${frequency},
        ${label},
        ${"pending"},
        ${advisorId || null},
        ${createdAt}::timestamp,
        ${codes.depositCode},
        ${codes.depositNumber},
        ${codes.accountNumber},
        ${codes.referenceNumber}
      )
      on conflict (id) do nothing
    `;
  }

  await sql`
    update fundings set
      status = 'payment_approved',
      advisor_id = 'adv_ellen',
      signer_name = 'Jonah Hale',
      signature = ${SIGNATURE},
      signed_at = (current_date - interval '3 months')::timestamp + time '16:00',
      payment_file_name = 'wire-confirmation.pdf',
      payment_file = ${WIRE},
      payment_uploaded_at = (current_date - interval '3 months' + interval '1 day')::timestamp + time '10:00',
      created_at = (current_date - interval '3 months')::timestamp + time '15:00'
    where id = 'fund_seed_jonah_10'
  `;

  const aged = [
    ["fund_seed_jonah_24", "2 months"],
    ["fund_seed_jonah_12", "6 months"],
    ["fund_seed_jonah_18", "15 months"],
  ] as const;
  for (const [id, age] of aged) {
    await sql`
      update fundings set
        status = 'payment_approved',
        advisor_id = 'adv_ellen',
        signer_name = 'Jonah Hale',
        signature = ${SIGNATURE},
        signed_at = (current_date - ${age}::interval)::timestamp + time '16:00',
        payment_file_name = 'wire-confirmation.pdf',
        payment_file = ${WIRE},
        payment_uploaded_at = (current_date - ${age}::interval + interval '1 day')::timestamp + time '10:00',
        created_at = (current_date - ${age}::interval)::timestamp + time '15:00'
      where id = ${id}
    `;
  }
}
