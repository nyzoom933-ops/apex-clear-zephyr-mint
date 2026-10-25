import { DEFAULT_COMPANY_NAME } from "@/lib/company";
import { env } from "@/lib/env.server";
import { readMailConfig } from "@/lib/mail.server";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const ADMIN_EMAIL = "admin@accountholding.com";

const globalRef = globalThis as typeof globalThis & {
  __backupTimer?: ReturnType<typeof setInterval>;
  __backupRunning?: boolean;
};

export function ensureBackupSchedule() {
  if (globalRef.__backupTimer) return;
  void runIfDue();
  globalRef.__backupTimer = setInterval(() => void runIfDue(), HOUR_MS);
}

export async function runBackup() {
  if (globalRef.__backupRunning) return { ok: false as const, error: "A backup is already running." };
  globalRef.__backupRunning = true;
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const to = (await readSetting(sql, "backup_email")) || env("BACKUP_EMAIL") || env("ADMIN_EMAIL") || ADMIN_EMAIL;
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    const dump = await dumpDatabase(sql);
    const zip = zipStore(`database-${stamp}.sql`, Buffer.from(dump, "utf8"));
    const company = (await readSetting(sql, "company_name")) || DEFAULT_COMPANY_NAME;
    const mail = await readMailConfig(sql);
    const delivery = await sendZip({
      to,
      company,
      from: mail.from || `${company} <notifications@accountholding.com>`,
      key: mail.key,
      filename: `database-backup-${stamp}.zip`,
      zip,
      bytes: dump.length,
    });
    const at = new Date().toISOString();
    await sql`
      insert into site_settings (key, value) values ('backup_at', ${at})
      on conflict (key) do update set value = excluded.value
    `;
    await sql`
      insert into site_settings (key, value) values ('backup_status', ${delivery})
      on conflict (key) do update set value = excluded.value
    `;
    return { ok: true as const, to, at, delivery, bytes: zip.length };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Backup failed." };
  } finally {
    globalRef.__backupRunning = false;
  }
}

async function runIfDue() {
  if (globalRef.__backupRunning) return;
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const last = await readSetting(sql, "backup_at");
    if (last && Date.now() - Date.parse(last) < DAY_MS) return;
    const anchor = await readSetting(sql, "backup_anchor");
    if (!last && !anchor) {
      await sql`
        insert into site_settings (key, value) values ('backup_anchor', ${new Date().toISOString()})
        on conflict (key) do nothing
      `;
      return;
    }
    if (!last && anchor && Date.now() - Date.parse(anchor) < DAY_MS) return;
    await runBackup();
  } catch {
    // The next hourly check retries a missed backup.
  }
}

async function readSetting(sql: Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>, key: string) {
  const rows = await sql<{ value: string }>`select value from site_settings where key = ${key}`;
  return rows[0]?.value?.trim() || "";
}

async function dumpDatabase(sql: Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>) {
  const tables = await sql<{ table_name: string }>`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `;
  const parts = ["-- Database backup", `-- ${new Date().toISOString()}`, "begin;", ""];
  for (const table of tables) {
    const name = table.table_name;
    const columns = await sql<{ column_name: string }>`
      select column_name from information_schema.columns
      where table_schema = 'public' and table_name = ${name}
      order by ordinal_position
    `;
    const cols = columns.map((column) => column.column_name);
    const raw = await sql.query<Record<string, unknown>>(`select * from ${quoteIdent(name)}`);
    const hidden = new Set(["resend_api_key", "desk_password_hash", "desk_session"]);
    const rows = name === "site_settings" ? raw.filter((row) => !hidden.has(String(row.key))) : raw;
    parts.push(`-- ${name} (${rows.length})`);
    if (rows.length === 0) {
      parts.push("");
      continue;
    }
    const header = `insert into ${quoteIdent(name)} (${cols.map(quoteIdent).join(", ")}) values`;
    for (const row of rows) {
      const values = cols.map((column) => sqlLiteral(row[column]));
      parts.push(`${header} (${values.join(", ")});`);
    }
    parts.push("");
  }
  parts.push("commit;", "");
  return parts.join("\n");
}

function quoteIdent(name: string) {
  return `"${name.replace(/"/g, '""')}"`;
}

function sqlLiteral(value: unknown): string {
  if (value == null) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (value instanceof Date) return `'${value.toISOString()}'`;
  if (Buffer.isBuffer(value)) return `'\\x${value.toString("hex")}'`;
  if (typeof value === "object") return `${quoteText(JSON.stringify(value))}::jsonb`;
  return quoteText(String(value));
}

function quoteText(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function sendZip(input: { to: string; company: string; from: string; key: string; filename: string; zip: Buffer; bytes: number }) {
  const subject = `${input.company} database backup`;
  const text = `The daily database backup is attached.\n\nFile: ${input.filename}\nSQL size: ${input.bytes} bytes\nGenerated: ${new Date().toISOString()}`;
  if (!input.key) return "stored";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${input.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: input.from,
        to: [input.to],
        subject,
        text,
        attachments: [{ filename: input.filename, content: input.zip.toString("base64") }],
      }),
    });
    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

function zipStore(filename: string, data: Buffer) {
  const name = Buffer.from(filename);
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(0, 8);
  local.writeUInt16LE(0, 10);
  local.writeUInt16LE(0, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);
  local.writeUInt16LE(0, 28);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(0, 10);
  central.writeUInt16LE(0, 12);
  central.writeUInt16LE(0, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt16LE(0, 30);
  central.writeUInt16LE(0, 32);
  central.writeUInt16LE(0, 34);
  central.writeUInt16LE(0, 36);
  central.writeUInt32LE(0, 38);
  central.writeUInt32LE(local.length + name.length + data.length, 42);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + name.length, 12);
  end.writeUInt32LE(local.length + name.length + data.length, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([local, name, data, central, name, end]);
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Buffer) {
  let c = 0xffffffff;
  for (const byte of data) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
