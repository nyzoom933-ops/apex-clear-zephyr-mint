import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/email-logo")({
  server: {
    handlers: {
      GET: async () => {
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        const rows = await sql<{ value: string }>`select value from site_settings where key = 'email_logo'`;
        const value = rows[0]?.value?.trim() || "";
        const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=\s]+)$/);
        if (!match?.[2]) return new Response("Not found", { status: 404 });
        const bytes = Uint8Array.from(Buffer.from(match[2].replace(/\s/g, ""), "base64"));
        return new Response(bytes, {
          headers: {
            "Content-Type": match[1] || "image/png",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
