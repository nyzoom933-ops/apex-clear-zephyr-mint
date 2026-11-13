import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { headerActionClass, SiteHeader } from "@/components/site-header";
import { requestPortalAccess } from "@/lib/admin.functions";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Portal access · Account Holding" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteHeader
        eyebrow="Investor access"
        action={
          <Link to="/login" className={headerActionClass}>
            Sign in
          </Link>
        }
      />
      <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-lg border border-border bg-surface px-6 py-10 shadow-sm">
      <h1 className="text-4xl font-semibold tracking-tight">Portal access</h1>
      <p className="mt-2 text-muted">Ask for a temporary password. Your advisor sends it. This form does not email a password itself.</p>

      {sent ? (
        <p className="mt-8 rounded-md border border-border bg-surface px-4 py-3 text-sm" role="status">
          If {email} is on an approved application, the desk was notified. Your advisor will email a temporary password.
        </p>
      ) : (
        <form
          className="mt-8 grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            setPending(true);
            void requestPortalAccess({ data: { email } })
              .then(() => setSent(true))
              .catch((caught: unknown) => setError(caught instanceof Error && caught.message ? caught.message : "The request could not be sent."))
              .finally(() => setPending(false));
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Email address</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3.5 py-3 text-base outline-none focus:border-primary"
            />
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button type="submit" disabled={pending} className="min-h-12 rounded-md bg-action py-3 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60">
            {pending ? "Sending…" : "Request temporary password"}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm">
        <Link to="/login" className="font-semibold text-primary">
          Return to sign in
        </Link>
      </p>
      </div>
    </main>
    </div>
  );
}