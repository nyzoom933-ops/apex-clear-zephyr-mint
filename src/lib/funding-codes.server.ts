import type { Sql } from "@/lib/db";

export type FundingCodes = {
  depositCode: string;
  depositNumber: string;
  accountNumber: string;
  referenceNumber: string;
};

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

function letters(seed: number, length: number) {
  const span = LETTERS.length ** length;
  let value = "";
  let n = ((Math.abs(seed) % span) + span) % span;
  for (let index = 0; index < length; index += 1) {
    value = LETTERS[n % LETTERS.length] + value;
    n = Math.floor(n / LETTERS.length);
  }
  return value;
}

/** Deposit code CD- + 4 letters + 4 digits (11). Deposit number DN + YYMMDD + - + 4 letters (15). Account number 12 digits. Reference W + 4 letters + 3 digits (8). */
export function formatFundingCodes(sequence: number, stamp: string): FundingCodes {
  const n = Math.max(1, Math.floor(sequence));
  const day = /^\d{6}$/.test(stamp) ? stamp : "000000";
  return {
    depositCode: `CD-${letters(n, 4)}${String(n % 10000).padStart(4, "0")}`,
    depositNumber: `DN${day}-${letters(n * 17 + 5, 4)}`,
    accountNumber: `6${String(10000000000 + (n % 10000000000)).slice(-11)}`,
    referenceNumber: `W${letters(n * 29 + 7, 4)}${String(n % 1000).padStart(3, "0")}`,
  };
}

export async function nextFundingCodes(sql: Sql, at?: string): Promise<FundingCodes> {
  const rows = await sql<{ n: string; stamp: string }>`
    select nextval('funding_code_seq')::text as n,
           to_char(coalesce(${at ?? null}::timestamp, now() at time zone 'UTC'), 'YYMMDD') as stamp
  `;
  const n = Number(rows[0]?.n ?? "3400");
  const stamp = rows[0]?.stamp ?? "000000";
  return formatFundingCodes(n, stamp);
}

let restyled = false;

export async function restyleLegacyFundingCodes(sql: Sql) {
  if (restyled) return;
  await sql`alter table fundings add column if not exists invoice_billing jsonb not null default '{}'::jsonb`;
  const rows = await sql<{ id: string; deposit_code: string; reference_number: string; stamp: string }>`
    select id, coalesce(deposit_code, '') as deposit_code, coalesce(reference_number, '') as reference_number,
           to_char(created_at at time zone 'UTC', 'YYMMDD') as stamp
    from fundings
    where deposit_code like 'AH-CD-%'
       or (coalesce(reference_number, '') <> '' and reference_number = account_number)
  `;
  for (const row of rows) {
    let seed = 0;
    for (const char of row.id) seed = (seed * 33 + char.charCodeAt(0)) >>> 0;
    const codes = formatFundingCodes(3400 + (seed % 200000), row.stamp);
    await sql`
      update fundings
      set deposit_code = ${codes.depositCode},
          deposit_number = ${codes.depositNumber},
          account_number = ${codes.accountNumber},
          reference_number = ${codes.referenceNumber}
      where id = ${row.id}
    `;
    if (row.reference_number) {
      await sql`
        update fundings
        set invoice_billing = jsonb_set(coalesce(invoice_billing, '{}'::jsonb), '{crn}', to_jsonb(${codes.referenceNumber}::text), true)
        where id = ${row.id} and coalesce(invoice_billing->>'crn', '') = ${row.reference_number}
      `;
    }
  }
  restyled = true;
}
