//#region node_modules/.nitro/vite/services/ssr/assets/funding-codes.server-CxOcBhrI.js
async function nextFundingCodes(sql, at) {
	const rows = await sql`
    select nextval('funding_code_seq')::text as n,
           to_char(coalesce(${at ?? null}::timestamp, now() at time zone 'UTC'), 'YYMMDD') as stamp
  `;
	const n = rows[0]?.n ?? "3400";
	const body = `${rows[0]?.stamp ?? "000000"}${n}`;
	return {
		depositCode: `AH-CD-${body}`,
		depositNumber: `AH-${body}`,
		accountNumber: body,
		referenceNumber: body
	};
}
//#endregion
export { nextFundingCodes };
