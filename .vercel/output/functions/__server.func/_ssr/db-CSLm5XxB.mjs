//#region node_modules/.nitro/vite/services/ssr/assets/db-CSLm5XxB.js
var _0001_applications_default = "create table if not exists applications (\n  id text primary key,\n  status text not null default 'pending' check (status in ('pending', 'approved', 'hold')),\n  submitted_at timestamptz not null default now(),\n  applicant_name text not null,\n  email text not null,\n  account_type text not null,\n  currency text not null,\n  payload jsonb not null\n);\n\ncreate index if not exists applications_submitted_at_idx on applications (submitted_at desc);\n";
var _0002_investor_users_default = "alter table applications add column if not exists password_hash text;\n\ncreate table if not exists investor_users (\n  email text primary key,\n  password_hash text not null,\n  application_id text,\n  created_at timestamptz not null default now()\n);\n";
var _0003_site_settings_default = "create table if not exists site_settings (\n  key text primary key,\n  value text not null\n);\n";
var _0004_investment_types_default = "create table if not exists investment_types (\n  id text primary key,\n  name text not null,\n  issuer text not null default '',\n  structure text not null default '',\n  currency text not null default '',\n  jurisdiction text not null default '',\n  interest_rate text not null default '',\n  coupon_type text not null default '',\n  minimum_investment text not null default '',\n  term text not null default '',\n  payment_frequencies text not null default '',\n  credit_rating text not null default ''\n);\n\ninsert into investment_types (\n  id, name, issuer, structure, currency, jurisdiction,\n  interest_rate, coupon_type, minimum_investment, term, payment_frequencies, credit_rating\n) values (\n  'cd',\n  'CDs',\n  'American Eagle Financial Credit Union',\n  'Fixed Income Instrument',\n  'USD',\n  'United States',\n  '6.00%',\n  'Fixed Coupon',\n  '$100,000.00',\n  '6-12 mth',\n  'Quarterly|Bi-annually|Annually',\n  'A+'\n) on conflict (id) do nothing;\n\ninsert into investment_types (id, name, structure, currency, jurisdiction)\nvalues ('bond', 'Bonds', 'Fixed Income Instrument', 'USD', 'United States')\non conflict (id) do nothing;\n\ncreate table if not exists fundings (\n  id text primary key,\n  email text not null,\n  type_id text not null,\n  amount text not null,\n  frequency text not null,\n  created_at timestamptz not null default now()\n);\n";
var _0005_capital_protection_default = "alter table investment_types add column if not exists capital_protection text not null default '';\n\nupdate investment_types\nset capital_protection = 'FDIC insured — 100% cover on the first $250,000 per individual or $500,000 per joint account'\nwhere id = 'cd' and capital_protection = '';\n";
var _0006_cd_terms_default = "create table if not exists cd_terms (\n  id text primary key,\n  apy text not null,\n  months integer not null,\n  featured boolean not null default false,\n  sort_order integer not null default 0\n);\n\ninsert into cd_terms (id, apy, months, featured, sort_order) values\n  ('cd_10', '4.40%', 10, true, 0),\n  ('cd_11', '3.65%', 11, false, 1),\n  ('cd_12', '3.65%', 12, false, 2),\n  ('cd_14', '3.65%', 14, false, 3),\n  ('cd_18', '3.65%', 18, false, 4),\n  ('cd_22', '4.40%', 22, false, 5),\n  ('cd_24', '3.65%', 24, false, 6),\n  ('cd_36', '2.25%', 36, false, 7),\n  ('cd_48', '2.25%', 48, false, 8),\n  ('cd_60', '3.00%', 60, false, 9)\non conflict (id) do nothing;\n\nalter table fundings add column if not exists term_label text not null default '';\n";
var _0007_cd_term_list_default = "delete from cd_terms;\n\ninsert into cd_terms (id, apy, months, featured, sort_order) values\n  ('cd_10', '4.40%', 10, true, 0),\n  ('cd_11', '3.65%', 11, false, 1),\n  ('cd_12', '3.65%', 12, false, 2),\n  ('cd_14', '3.65%', 14, false, 3),\n  ('cd_18', '3.65%', 18, false, 4),\n  ('cd_22', '4.40%', 22, false, 5),\n  ('cd_24', '3.65%', 24, false, 6),\n  ('cd_36', '2.25%', 36, false, 7),\n  ('cd_48', '2.25%', 48, false, 8),\n  ('cd_60', '3.00%', 60, false, 9);\n";
var _0008_funding_status_default = "alter table fundings add column if not exists status text not null default 'submitted';\n";
var _0009_advisors_default = "create table if not exists advisors (\n  id text primary key,\n  name text not null,\n  phone text not null default '',\n  email text not null default ''\n);\n\ninsert into advisors (id, name, phone, email) values\n  ('adv_ellen', 'Ellen Ward', '(212) 555-0148', 'ellen.ward@accountholding.com'),\n  ('adv_marcus', 'Marcus Hale', '(212) 555-0194', 'marcus.hale@accountholding.com')\non conflict (id) do nothing;\n\nalter table fundings add column if not exists advisor_id text;\n\nupdate fundings set status = 'pending' where status = 'submitted';\n";
var _0010_investment_signature_default = "alter table fundings add column if not exists signed_at timestamptz;\nalter table fundings add column if not exists signer_name text not null default '';\nalter table fundings add column if not exists signature text not null default '';\n";
var _0011_payment_confirmation_default = "alter table fundings add column if not exists payment_file_name text not null default '';\nalter table fundings add column if not exists payment_file text not null default '';\nalter table fundings add column if not exists payment_uploaded_at timestamptz;\n";
var _0012_fdic_only_default = "update investment_types\nset capital_protection = 'FDIC insured — 100% cover on the first $250,000 per individual or $500,000 per joint account'\nwhere capital_protection like '%NCUA%';\n";
var _0013_promo_default = "create table if not exists promo_settings (\n  id text primary key,\n  intro text not null,\n  protection text not null,\n  fine_print text not null,\n  starts_on date not null,\n  ends_on date not null\n);\n\ncreate table if not exists promo_tiers (\n  id text primary key,\n  min_amount numeric not null,\n  max_amount numeric,\n  bonus_percent numeric not null,\n  months text not null,\n  sort_order integer not null default 0\n);\n\ninsert into promo_settings (id, intro, protection, fine_print, starts_on, ends_on)\nvalues (\n  'current',\n  'Our Promotional New Client Advisory Offer: bonuses apply for the whole duration of the CD and increase as the investment grows.',\n  '100% capital protection',\n  'Early withdrawal penalties may apply. Minimum balance to open: $100,000 new money required.',\n  '2026-10-01',\n  '2026-10-31'\n)\non conflict (id) do nothing;\n\ninsert into promo_tiers (id, min_amount, max_amount, bonus_percent, months, sort_order) values\n  ('promo_100', 100000, 174999, 0.75, '10|22', 0),\n  ('promo_175', 175000, 249999, 0.99, '10|22', 1),\n  ('promo_250', 250000, 499999, 1.125, '10|22', 2),\n  ('promo_500', 500000, null, 1.25, '10|22', 3)\non conflict (id) do nothing;\n";
var _0014_funding_codes_default = "create sequence if not exists funding_code_seq;\n\nalter table fundings add column if not exists deposit_code text;\nalter table fundings add column if not exists deposit_number text;\nalter table fundings add column if not exists account_number text;\nalter table fundings add column if not exists reference_number text;\n\nupdate fundings f\nset\n  deposit_code = 'AH-CD-' || lpad(s.n::text, 8, '0'),\n  deposit_number = 'AH-' || lpad(s.n::text, 8, '0'),\n  account_number = lpad(s.n::text, 12, '0'),\n  reference_number = lpad(s.n::text, 8, '0')\nfrom (\n  select id, nextval('funding_code_seq') as n\n  from fundings\n  where deposit_code is null\n) s\nwhere f.id = s.id;\n\ncreate unique index if not exists fundings_deposit_code_key on fundings (deposit_code);\ncreate unique index if not exists fundings_deposit_number_key on fundings (deposit_number);\ncreate unique index if not exists fundings_account_number_key on fundings (account_number);\ncreate unique index if not exists fundings_reference_number_key on fundings (reference_number);\n";
var _0015_funding_code_start_default = "select setval('funding_code_seq', 36536564, true);\n\nupdate fundings\nset deposit_code = null, deposit_number = null, account_number = null, reference_number = null;\n\nupdate fundings f\nset\n  deposit_code = 'AH-CD-' || s.n::text,\n  deposit_number = 'AH-' || s.n::text,\n  account_number = s.n::text,\n  reference_number = s.n::text\nfrom (\n  select id, nextval('funding_code_seq') as n\n  from fundings\n  order by created_at, id\n) s\nwhere f.id = s.id;\n";
var _0016_funding_code_date_default = "select setval('funding_code_seq', 3399, true);\n\nupdate fundings\nset deposit_code = null, deposit_number = null, account_number = null, reference_number = null;\n\nupdate fundings f\nset\n  deposit_code = 'AH-CD-' || to_char(f.created_at, 'YYMMDD') || s.n::text,\n  deposit_number = 'AH-' || to_char(f.created_at, 'YYMMDD') || s.n::text,\n  account_number = to_char(f.created_at, 'YYMMDD') || s.n::text,\n  reference_number = to_char(f.created_at, 'YYMMDD') || s.n::text\nfrom (\n  select id, nextval('funding_code_seq') as n\n  from fundings\n  order by created_at, id\n) s\nwhere f.id = s.id;\n";
var _0017_notifications_default = "create table if not exists notifications (\n  id text primary key,\n  created_at timestamptz not null default now(),\n  audience text not null,\n  recipient text not null,\n  step text not null,\n  subject text not null,\n  body text not null,\n  related_id text not null default '',\n  delivery text not null default 'stored'\n);\n";
var _0018_notification_html_default = "alter table notifications add column if not exists html text not null default '';\n";
var _0019_notification_read_default = "alter table notifications add column if not exists read_at timestamptz;\n";
var _0020_invoice_billing_default = "alter table fundings add column if not exists invoice_billing jsonb not null default '{}'::jsonb;\n";
var _0021_funding_contact_default = "alter table fundings add column if not exists contact_phone text not null default '';\nalter table fundings add column if not exists contact_by text not null default 'call';\n";
var _0022_funding_snapshot_default = "alter table fundings add column if not exists promo_apy text not null default '';\nalter table fundings add column if not exists final_apy text not null default '';\nalter table fundings add column if not exists payment_approved_at timestamptz;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0001_applications.sql": _0001_applications_default,
			"/migrations/0002_investor_users.sql": _0002_investor_users_default,
			"/migrations/0003_site_settings.sql": _0003_site_settings_default,
			"/migrations/0004_investment_types.sql": _0004_investment_types_default,
			"/migrations/0005_capital_protection.sql": _0005_capital_protection_default,
			"/migrations/0006_cd_terms.sql": _0006_cd_terms_default,
			"/migrations/0007_cd_term_list.sql": _0007_cd_term_list_default,
			"/migrations/0008_funding_status.sql": _0008_funding_status_default,
			"/migrations/0009_advisors.sql": _0009_advisors_default,
			"/migrations/0010_investment_signature.sql": _0010_investment_signature_default,
			"/migrations/0011_payment_confirmation.sql": _0011_payment_confirmation_default,
			"/migrations/0012_fdic_only.sql": _0012_fdic_only_default,
			"/migrations/0013_promo.sql": _0013_promo_default,
			"/migrations/0014_funding_codes.sql": _0014_funding_codes_default,
			"/migrations/0015_funding_code_start.sql": _0015_funding_code_start_default,
			"/migrations/0016_funding_code_date.sql": _0016_funding_code_date_default,
			"/migrations/0017_notifications.sql": _0017_notifications_default,
			"/migrations/0018_notification_html.sql": _0018_notification_html_default,
			"/migrations/0019_notification_read.sql": _0019_notification_read_default,
			"/migrations/0020_invoice_billing.sql": _0020_invoice_billing_default,
			"/migrations/0021_funding_contact.sql": _0021_funding_contact_default,
			"/migrations/0022_funding_snapshot.sql": _0022_funding_snapshot_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().then(() => startBackupSchedule()).catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
else if (typeof window === "undefined") startBackupSchedule();
function startBackupSchedule() {
	const boot = globalThis;
	if (boot.__backupBoot) return;
	boot.__backupBoot = true;
	import("./backup.server-TfubgEnY.mjs").then((mod) => mod.ensureBackupSchedule()).catch((err) => {
		boot.__backupBoot = false;
		console.error("[db] Backup schedule failed:", err);
	});
}
//#endregion
export { getSql };
