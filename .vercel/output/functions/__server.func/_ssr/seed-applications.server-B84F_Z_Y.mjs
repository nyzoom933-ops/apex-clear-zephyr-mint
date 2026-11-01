import { c as isWorkspacePreview } from "./env.server-CXxi_iUv.mjs";
import { hashPassword } from "./passwords.server-CdYSBfy_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seed-applications.server-B84F_Z_Y.js
var DEMO_EMAILS = [
	"maya.chen@example.com",
	"luis.ortega@example.com",
	"priya.shah@example.com",
	"jonah.hale@example.com"
];
var INVESTOR_EMAIL = "elena.ward@example.com";
var INVESTOR_PASSWORD = "Cedar-4821";
var seeded = null;
function ensureDemoApplications(sql) {
	if (!isWorkspacePreview()) return Promise.resolve();
	seeded ??= preparePreview(sql).catch((error) => {
		seeded = null;
		throw error;
	});
	return seeded;
}
async function preparePreview(sql) {
	await clearDemoInvestors(sql);
	await ensureApprovedInvestor(sql);
}
async function clearDemoInvestors(sql) {
	for (const email of DEMO_EMAILS) {
		await sql`delete from fundings where email = ${email}`;
		await sql`delete from notifications where recipient = ${email}`;
		await sql`delete from investor_users where email = ${email}`;
		await sql`delete from applications where email = ${email}`;
	}
	await sql`delete from fundings where id like 'fund_seed_%'`;
	await sql`delete from applications where id like 'app_seed_%'`;
}
async function ensureApprovedInvestor(sql) {
	if ((await sql`select id from applications where email = ${INVESTOR_EMAIL} limit 1`).length > 0) return;
	const passwordHash = await hashPassword(INVESTOR_PASSWORD);
	const id = "app_elena_ward";
	await sql`
    insert into applications (id, status, applicant_name, email, account_type, currency, payload, password_hash)
    values (${id}, ${"approved"}, ${"Elena Ward"}, ${INVESTOR_EMAIL}, ${"Individual"}, ${"USD"}, ${JSON.stringify({
		accountType: "Individual",
		currency: "USD",
		firstName: "Elena",
		middleName: "",
		surname: "Ward",
		email: INVESTOR_EMAIL,
		phoneCountry: "United States / Canada (+1)",
		phone: "2025550194",
		dobYear: "1986",
		dobMonth: "Mar",
		dobDay: "12",
		nationality: "United States",
		residence: "United States",
		occupation: "Advisor",
		street: "410 Pine Street",
		apt: "",
		city: "Denver",
		region: "CO",
		postal: "80202",
		country: "United States",
		taxResidence: "United States",
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
		accountHolder: "Elena Ward",
		bankStreet: "410 Pine Street",
		bankLine2: "",
		bankCity: "Denver",
		bankState: "CO",
		bankZip: "80202",
		routingNumber: "021000021",
		accountNumber: "123456789",
		d1: true,
		d2: true,
		d3: true,
		d4: true,
		signature: ""
	})}::jsonb, ${passwordHash})
  `;
	await sql`
    insert into investor_users (email, password_hash, application_id)
    values (${INVESTOR_EMAIL}, ${passwordHash}, ${id})
    on conflict (email) do update
    set password_hash = excluded.password_hash, application_id = excluded.application_id
  `;
}
//#endregion
export { ensureDemoApplications };
