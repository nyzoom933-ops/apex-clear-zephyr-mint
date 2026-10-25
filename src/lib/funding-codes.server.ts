import type { Sql } from "@/lib/db";

export type FundingCodes = {
  depositCode: string;
  depositNumber: string;
  accountNumber: string;
  referenceNumber: string;
};

export async function nextFundingCodes(sql: Sql, at?: string): Promise<FundingCodes> {
  const rows = await sql<{ n: string; stamp: string }>`
    select nextval('funding_code_seq')::text as n,
           to_char(coalesce(${at ?? null}::timestamp, now() at time zone 'UTC'), 'YYMMDD') as stamp
  `;
  const n = rows[0]?.n ?? "3400";
  const stamp = rows[0]?.stamp ?? "000000";
  const body = `${stamp}${n}`;
  return {
    depositCode: `AH-CD-${body}`,
    depositNumber: `AH-${body}`,
    accountNumber: body,
    referenceNumber: body,
  };
}
