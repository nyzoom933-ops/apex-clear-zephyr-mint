import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AppCover, headerActionClass, SiteHeader } from "@/components/site-header";
import { investorLogin } from "@/lib/admin.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in · Account Holding" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }
    if (!verified) {
      setError(
        "Security verification could not complete. Retry below. If it continues, reload the page or try another connection.",
      );
      return;
    }
    let destination: "portal" | "application" = "application";
    try {
      const result = await investorLogin({ data: { email, password } });
      destination = result.destination;
    } catch {
      setError("Those credentials are not recognized.");
      return;
    }
    const redirectTo = new URLSearchParams(window.location.search).get("redirectTo") ?? "";
    if (redirectTo === "/reset-password") {
      void navigate({ to: "/reset-password" });
      return;
    }
    void navigate({ to: destination === "portal" ? "/portal" : "/application" });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader
        eyebrow="Investor access"
        action={
          <Link to="/application" className={headerActionClass}>
            Begin an application
          </Link>
        }
      />
      <AppCover />
      <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-lg border border-border bg-surface px-6 py-10 shadow-sm">
      <h1 className="text-4xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-muted">Enter your credentials to access your account.</p>

      <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
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

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              required
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3.5 py-3 pr-16 text-base outline-none focus:border-primary"
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-semibold text-primary"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="mt-2 text-right">
            <Link to="/reset-password" className="text-sm font-semibold text-primary">
              Reset password
            </Link>
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <label className="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              className="size-5 accent-primary"
              checked={verified}
              onChange={(event) => {
                setVerified(event.target.checked);
                setError("");
              }}
            />
            <span className="text-sm">Verify you are human</span>
          </label>
          {error ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {error} {error.startsWith("Security") ? "(Reference: 600010)" : null}
            </p>
          ) : null}
          {error.startsWith("Security") ? (
            <button type="button" className="mt-2 text-sm font-semibold text-primary" onClick={() => setVerified(false)}>
              Retry verification
            </button>
          ) : null}
        </div>

        <button type="submit" className="min-h-12 rounded-md bg-action py-3 font-semibold text-on-primary hover:bg-action-deep">
          Sign in
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New investor?{" "}
        <Link to="/application" className="font-semibold text-primary">
          Begin an application
        </Link>
      </p>
      <p className="mt-3 text-center text-sm">
        <Link to="/admin" className="font-semibold text-primary">
          Operations desk
        </Link>
      </p>
      </div>
    </main>
    </div>
  );
}
