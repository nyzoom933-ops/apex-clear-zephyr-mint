import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/cron/inbox")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = env("CRON_SECRET");
        const authorization = request.headers.get("authorization");
        const fromCron = request.headers.get("user-agent") === "vercel-cron/1.0";
        if (secret) {
          if (authorization !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
        } else if (!fromCron) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { getSql } = await import("@/lib/db");
        const { syncDeskMail } = await import("@/lib/desk-sync.server");
        return Response.json(await syncDeskMail(await getSql()));
      },
    },
  },
});
