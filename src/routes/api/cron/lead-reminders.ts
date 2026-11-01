import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/cron/lead-reminders")({
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
        const { remindDueInvites } = await import("@/lib/lead-invites.server");
        return Response.json(await remindDueInvites());
      },
    },
  },
});
