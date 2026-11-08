import { deflateRawSync, inflateRawSync } from "node:zlib";
import { DEFAULT_COMPANY_NAME } from "@/lib/company";
import { sendTelegramBackup } from "@/lib/mail.server";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const KEPT_SETTINGS = ["resend_api_key", "smtp2go_api_key", "telegram_bot_token", "telegram_chat_id", "telegram_enabled", "desk_password_hash", "desk_session", "desk_email"];

const globalRef = globalThis as typeof globalThis & {
  __backupTimer?: ReturnType<typeof setInterval>;
  __backupRunning?: boolean;
};

export function ensureBackupSchedule() {
  if (globalRef.__backupTimer) return;
  void runIfDue();
  globalRef.__backupTimer = setInterval(() => void runIfDue(), HOUR_MS);
}

export async function runBackup(options?: { scheduled?: boolean }) {
  if (globalRef.__backupRunning) return { ok: false as const, error: "A backup is already running." };
  globalRef.__backupRunning = true;
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const { readMailConfig } = await import("@/lib/mail.server");
    const mail = await readMailConfig(sql);
    if (options?.scheduled && !mail.backupSchedule) return { ok: true as const, skipped: true as const, to: "Telegram", at: "", delivery: "stored", bytes: 0, parts: 0, telegram: "skipped" as const };
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    const dump = await dumpDatabase(sql);
    const zip = packBackup(dump, stamp);
    const company = (await readSetting(sql, "company_name")) || DEFAULT_COMPANY_NAME;
    const filename = `database-backup-${stamp}.zip`;
    const telegram = await sendTelegramBackup(sql, `${company} database backup`, "The database backup is attached as one file.", [
      { filename, content: zip.toString("base64") },
    ]);
    const delivery = telegram === "sent" ? "sent" : telegram === "failed" ? "failed" : "stored";
    const at = new Date().toISOString();
    await sql`
      insert into site_settings (key, value) values ('backup_at', ${at})
      on conflict (key) do update set value = excluded.value
    `;
    await sql`
      insert into site_settings (key, value) values ('backup_status', ${delivery})
      on conflict (key) do update set value = excluded.value
    `;
    return { ok: true as const, skipped: false as const, to: "Telegram", at, delivery, bytes: zip.length, parts: 1, telegram };
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
    await runBackup({ scheduled: true });
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
  const parts = ["-- Database backup", `-- ${new Date().toISOString()}`, ""];
  for (const table of tables) {
    const name = table.table_name;
    const columns = await sql<{ column_name: string }>`
      select column_name from information_schema.columns
      where table_schema = 'public' and table_name = ${name}
      order by ordinal_position
    `;
    const cols = columns.map((column) => column.column_name);
    const raw = await sql.query<Record<string, unknown>>(`select * from ${quoteIdent(name)}`);
    const hidden = new Set(["resend_api_key", "smtp2go_api_key", "telegram_bot_token", "desk_password_hash", "desk_session"]);
    const rows = name === "site_settings" ? raw.filter((row) => !hidden.has(String(row.key))) : raw;
    parts.push(`-- ${name} (${rows.length})`);
    if (rows.length === 0) {
      parts.push("");
      continue;
    }
    const header = `insert into ${quoteIdent(name)} (${cols.map(quoteIdent).join(", ")}) values`;
    for (const row of rows) {
      const values = cols.map((column) => name === "advisors" && column === "imap_password" ? "''" : sqlLiteral(row[column]));
      parts.push(`${header} (${values.join(", ")});`);
    }
    parts.push("");
  }
  parts.push("");
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

function packBackup(sqlText: string, stamp: string) {
  return zipDeflate(`database-${stamp}.sql`, Buffer.from(script(sqlText)));
}

export async function restoreBackup(file: string) {
  const encoded = file.trim();
  if (!encoded) return { ok: false as const, error: "Choose the backup zip." };
  let buffer: Buffer;
  try {
    buffer = Buffer.from(encoded, "base64");
  } catch {
    return { ok: false as const, error: "The backup file could not be read." };
  }
  if (buffer.length < 32 || buffer.length > 48 * 1024 * 1024) return { ok: false as const, error: "The backup file is empty or larger than 48 MB." };
  let text = "";
  try {
    text = readBackup(buffer);
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "The backup file could not be opened." };
  }
  const commands = statements(text).filter((statement) => /^insert\s+into\s+/i.test(statement));
  if (!commands.length) return { ok: false as const, error: "That file has no database rows to restore." };
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const savedSettings = await sql.query<{ key: string; value: string }>(
    `select key, value from site_settings where key in (${KEPT_SETTINGS.map((_, index) => `$${index + 1}`).join(", ")})`,
    [...KEPT_SETTINGS],
  );
  const savedPasswords = await sql<{ id: string; imap_password: string }>`select id, coalesce(imap_password, '') as imap_password from advisors`;
  const tables = await sql<{ table_name: string }>`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE' and table_name <> '_migrations'
    order by table_name
  `;
  if (!tables.length) return { ok: false as const, error: "The database has no tables to restore." };
  const commandsToRun = [
    `truncate table ${tables.map((table) => quoteIdent(table.table_name)).join(", ")} restart identity cascade`,
    ...commands,
    ...savedSettings.map((row) => `insert into site_settings (key, value) values (${quoteText(row.key)}, ${quoteText(row.value)}) on conflict (key) do nothing`),
    ...savedPasswords.filter((row) => row.imap_password).map((row) => `update advisors set imap_password = ${quoteText(row.imap_password)} where id = ${quoteText(row.id)} and coalesce(imap_password, '') = ''`),
  ];
  try {
    await runRestore(commandsToRun);
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "The backup could not be restored." };
  }
  return { ok: true as const, statements: commands.length };
}

async function runRestore(commands: string[]) {
  const { dbSource, getPglite } = await import("@/lib/db");
  if (dbSource === "pglite") {
    const pg = await getPglite();
    await pg.transaction(async (tx) => {
      for (const statement of commands) await tx.exec(statement);
    });
    return;
  }
  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("begin");
    for (const statement of commands) await client.query(statement);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

function script(body: string) {
  return `-- Database backup ${new Date().toISOString()}\nbegin;\n${body.trim()}\ncommit;\n`;
}

function readBackup(buffer: Buffer) {
  const head = buffer.subarray(0, 80).toString("utf8");
  if (head.startsWith("--") || head.includes("insert into")) return buffer.toString("utf8");
  if (buffer.readUInt32LE(0) !== 0x04034b50) throw new Error("Upload the backup zip, or the .sql file inside it.");
  const method = buffer.readUInt16LE(8);
  const nameLength = buffer.readUInt16LE(26);
  const extraLength = buffer.readUInt16LE(28);
  const compressedSize = buffer.readUInt32LE(18);
  const start = 30 + nameLength + extraLength;
  const compressed = buffer.subarray(start, start + compressedSize);
  const data = method === 0 ? compressed : inflateRawSync(compressed);
  return data.toString("utf8");
}

function statements(sqlText: string) {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < sqlText.length; index += 1) {
    const char = sqlText[index];
    if (char === "'" && sqlText[index + 1] === "'") {
      current += "''";
      index += 1;
      continue;
    }
    if (char === "'") {
      quoted = !quoted;
      current += char;
      continue;
    }
    if (char === ";" && !quoted) {
      const statement = sqlBody(current);
      if (statement) out.push(statement);
      current = "";
      continue;
    }
    current += char;
  }
  const tail = sqlBody(current);
  if (tail) out.push(tail);
  return out;
}

function sqlBody(value: string) {
  const body = value
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .trim();
  if (!body || /^(begin|commit)$/i.test(body)) return "";
  return body;
}

function zipDeflate(filename: string, data: Buffer) {
  const name = Buffer.from(filename);
  const compressed = deflateRawSync(data);
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(0, 10);
  local.writeUInt16LE(0, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);
  local.writeUInt16LE(0, 28);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt16LE(0, 12);
  central.writeUInt16LE(0, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt16LE(0, 30);
  central.writeUInt16LE(0, 32);
  central.writeUInt16LE(0, 34);
  central.writeUInt16LE(0, 36);
  central.writeUInt32LE(0, 38);
  central.writeUInt32LE(local.length + name.length + compressed.length, 42);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + name.length, 12);
  end.writeUInt32LE(local.length + name.length + compressed.length, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([local, name, compressed, central, name, end]);
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
