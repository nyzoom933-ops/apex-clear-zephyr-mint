import type { Sql } from "@/lib/db";

const GAP_MS = 50_000;

export async function syncDeskMail(sql: Sql, options?: { force?: boolean }) {
  const rows = await sql<{ value: string }>`select value from site_settings where key = 'desk_sync_at'`;
  const last = Date.parse(rows[0]?.value || "");
  if (!options?.force && Number.isFinite(last) && Date.now() - last < GAP_MS) return { skipped: true as const };
  const now = new Date().toISOString();
  await sql`
    insert into site_settings (key, value) values ('desk_sync_at', ${now})
    on conflict (key) do update set value = excluded.value
  `;
  const { syncInboxes } = await import("@/lib/inbox.server");
  const { watchMailStatuses } = await import("@/lib/mail.server");
  const [inbox, mail] = await Promise.all([
    syncInboxes(sql).catch((error: unknown) => ({ error: error instanceof Error ? error.message : "Inbox sync failed." })),
    watchMailStatuses().catch((error: unknown) => ({ error: error instanceof Error ? error.message : "Mail status sync failed." })),
  ]);
  return { skipped: false as const, inbox, mail };
}
