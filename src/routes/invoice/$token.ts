import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/invoice/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = params.token?.trim() || "";
        const { getSql } = await import("@/lib/db");
        const { invoicePdfForToken } = await import("@/lib/admin.functions");
        const pdf = await invoicePdfForToken(await getSql(), token);
        if (!pdf) return new Response("Invoice not found.", { status: 404 });
        const bytes = Uint8Array.from(Buffer.from(pdf, "base64"));
        return new Response(bytes, {
          headers: {
            "content-type": "application/pdf",
            "content-disposition": "inline; filename=\"cd-payment-invoice.pdf\"",
            "cache-control": "private, no-store",
          },
        });
      },
    },
  },
});
