import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { headerActionClass, SiteHeader, useBrand } from "@/components/site-header";
import {
  adminLogin,
  adminLogout,
  deleteAdvisor,
  createDeskLogin,
  getAdminSession,
  getMailSetup,
  saveDeskLogin,
  getCdTerms,
  getInvestmentTypes,
  getPromo,
  approvePayment,
  getPaymentFile,
  listAdvisors,
  listApplications,
  listFundings,
  downloadInvoicePdf,
  saveInvoiceBilling,
  approveInvoice,
  listNotifications,
  saveAdvisor,
  saveCdTerms,
  saveInvestmentType,
  savePromo,
  setApplicationStatus,
  signInAsClient,
  setSiteBrand,
  runDatabaseBackup,
  saveMailSetup,
  updateFunding,
  type AdminFunding,
  type Advisor,
  type ApplicationRow,
  type CdTerm,
  type InvestmentType,
  type NotificationRow,
} from "@/lib/admin.functions";
import type { PromoOffer, PromoTier } from "@/lib/promo";
import type { InvoiceBilling } from "@/lib/invoice-billing";
import { templateCatalog } from "@/lib/email-templates";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Operations · Account Holding" }] }),
  component: AdminPage,
});

const controlClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-3 text-base text-fg outline-none focus:border-primary";

function AdminPage() {
  const [session, setSession] = useState<{ signedIn: boolean; needsSetup: boolean } | null>(null);

  useEffect(() => {
    void getAdminSession()
      .then((next) => setSession(next))
      .catch(() => setSession({ signedIn: false, needsSetup: false }));
  }, []);

  if (session === null) {
    return <main className="mx-auto max-w-md px-6 py-24 text-center text-sm text-fg">Checking the desk…</main>;
  }
  if (!session.signedIn) return <AdminLogin needsSetup={session.needsSetup} onSuccess={() => setSession({ signedIn: true, needsSetup: false })} />;
  return <Cabinet onSignOut={() => setSession({ signedIn: false, needsSetup: false })} />;
}

function AdminLogin({ needsSetup, onSuccess }: { needsSetup: boolean; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (needsSetup && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      if (needsSetup) await createDeskLogin({ data: { email, password } });
      else await adminLogin({ data: { email, password } });
      onSuccess();
    } catch {
      setError(needsSetup ? "The desk login could not be created." : "Those credentials are not recognized.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader eyebrow="Operations" action={null} />
      <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-lg border border-border bg-surface px-6 py-10 shadow-sm">
        <h1 className="text-4xl font-semibold tracking-tight">{needsSetup ? "Create the desk login" : "Admin sign in"}</h1>
        <p className="mt-2 text-fg">{needsSetup ? "This server has no desk password yet. Create one before reviewing applications." : "Enter the desk credentials to review investor applications."}</p>
        <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Email address</span>
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={controlClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Password</span>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                autoComplete={needsSetup ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={controlClass + " pr-16"}
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-semibold text-primary"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          {needsSetup ? (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Confirm password</span>
              <input required type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className={controlClass} />
            </label>
          ) : null}
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 rounded-md bg-action py-3 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60"
          >
            {pending ? "Saving…" : needsSetup ? "Create login" : "Sign in"}
          </button>
        </form>
      </div>
      </main>
    </div>
  );
}

function Cabinet({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<"dashboard" | "applications" | "clients" | "investments" | "promos" | "funding" | "invoices" | "advisors" | "emails" | "settings">("dashboard");
  const [rows, setRows] = useState<ApplicationRow[] | null>(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ApplicationRow["status"]>("all");
  const [notice, setNotice] = useState("");
  const [mailReady, setMailReady] = useState(true);

  async function refresh() {
    const next = await listApplications();
    setRows(next);
    setSelectedId((current) => (current && next.some((row) => row.id === current) ? current : (next[0]?.id ?? null)));
  }

  useEffect(() => {
    void refresh().catch(() => setError("Applications could not be loaded."));
    void getMailSetup()
      .then((setup) => setMailReady(setup.hasKey))
      .catch(() => setMailReady(false));
  }, []);

  const stats = useMemo(() => {
    const list = rows ?? [];
    return {
      total: list.length,
      pending: list.filter((row) => row.status === "pending").length,
      approved: list.filter((row) => row.status === "approved").length,
      hold: list.filter((row) => row.status === "hold").length,
    };
  }, [rows]);

  const applications = rows ?? [];
  const clients = applications.filter((row) => row.status === "approved");
  const visible = applications.filter((row) => filter === "all" || row.status === filter);
  const selected = visible.find((row) => row.id === selectedId) ?? null;

  async function signOut() {
    await adminLogout();
    onSignOut();
  }

  async function updateStatus(id: string, status: ApplicationRow["status"]) {
    setError("");
    setNotice("");
    try {
      const result = await setApplicationStatus({ data: { id, status } });
      if (result.loginEmail) setNotice(`Sign-in created for ${result.loginEmail}.`);
      else if (status !== "approved") setNotice("Investor sign-in removed.");
      await refresh();
    } catch {
      setError("Could not update this application. A login needs the password from the form.");
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader
        eyebrow="Operations desk"
        action={
          <button type="button" className={headerActionClass} onClick={() => void signOut()}>
            Sign out
          </button>
        }
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 lg:flex-col">
          <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")}>
            Dashboard
          </TabButton>
          <TabButton active={tab === "applications"} onClick={() => setTab("applications")}>
            Applications
          </TabButton>
          <TabButton active={tab === "clients"} onClick={() => setTab("clients")}>
            Clients
          </TabButton>
          <TabButton active={tab === "investments"} onClick={() => setTab("investments")}>
            Investments
          </TabButton>
          <TabButton active={tab === "promos"} onClick={() => setTab("promos")}>
            Promotions
          </TabButton>
          <TabButton active={tab === "funding"} onClick={() => setTab("funding")}>
            Funding
          </TabButton>
          <TabButton active={tab === "invoices"} onClick={() => setTab("invoices")}>
            Invoices
          </TabButton>
          <TabButton active={tab === "advisors"} onClick={() => setTab("advisors")}>
            Advisors
          </TabButton>
          <TabButton active={tab === "emails"} onClick={() => setTab("emails")}>
            Emails
          </TabButton>
          <TabButton active={tab === "settings"} onClick={() => setTab("settings")}>
            Settings
          </TabButton>
        </nav>
        <div className="min-w-0">
        {mailReady ? null : (
          <p className="mb-4 rounded-md border border-border bg-surface px-4 py-3 text-sm text-fg">
            Mail is not sending yet. Open Settings and save a Resend API key and from address. Logos, the company name, and the backup email from the preview also need to be entered again on this server.
          </p>
        )}
        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
        {notice ? <p className="mb-4 text-sm text-fg">{notice}</p> : null}
        {tab === "dashboard" ? (
          <section>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-fg">Investor applications waiting on the compliance desk.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat label="Submitted" value={stats.total} />
              <Stat label="Pending" value={stats.pending} />
              <Stat label="Approved" value={stats.approved} />
            </div>
            <h2 className="mt-8 text-lg font-semibold text-primary">Latest submissions</h2>
            <ApplicationTable
              rows={(rows ?? []).slice(0, 5)}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                const row = (rows ?? []).find((item) => item.id === id);
                setTab(row?.status === "approved" ? "clients" : "applications");
              }}
            />
          </section>
        ) : tab === "applications" ? (
          <section>
            <h1 className="text-3xl font-semibold">Submitted applications</h1>
            <p className="mt-2 text-fg">Select a row to open the full application, including the identity and address documents.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["all", "pending", "approved", "hold"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={
                    "min-h-11 rounded-md border px-3 py-2 text-sm font-semibold " +
                    (filter === key ? "border-action bg-action text-on-primary" : "border-border text-primary")
                  }
                  onClick={() => setFilter(key)}
                >
                  {key === "all" ? "All" : key === "hold" ? "On hold" : key[0].toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
            <ApplicationTable rows={visible} selectedId={selectedId} onSelect={setSelectedId} />
            {selected ? <ApplicationDetail row={selected} onStatus={(status) => void updateStatus(selected.id, status)} /> : null}
          </section>
        ) : tab === "clients" ? (
          <ClientsPanel rows={clients} onStatus={(id, status) => void updateStatus(id, status)} />
        ) : tab === "investments" ? (
          <InvestmentTypesPanel />
        ) : tab === "promos" ? (
          <PromoPanel />
        ) : tab === "funding" ? (
          <FundingDesk />
        ) : tab === "invoices" ? (
          <InvoicesDesk />
        ) : tab === "advisors" ? (
          <AdvisorsPanel />
        ) : tab === "emails" ? (
          <EmailsPanel />
        ) : (
          <SettingsPanel />
        )}
        </div>
      </div>
    </div>
  );
}

function EmailsPanel() {
  const [rows, setRows] = useState<NotificationRow[] | null>(null);
  const [error, setError] = useState("");
  const [audience, setAudience] = useState<"all" | "client" | "admin">("all");
  const brand = useBrand();
  const templates = templateCatalog(brand.companyName, brand.emailLogo).filter((item) => audience === "all" || item.audience === audience);

  useEffect(() => {
    void listNotifications()
      .then(setRows)
      .catch(() => setError("Emails could not be loaded."));
  }, []);

  const visible = (rows ?? []).filter((row) => audience === "all" || row.audience === audience);

  return (
    <section>
      <h1 className="text-3xl font-semibold">Email templates</h1>
      <p className="mt-2 max-w-2xl text-fg">
        Each step has a client template and a desk template. Sent mail uses these layouts.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "client", "admin"] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={"min-h-11 rounded-md border px-3 py-2 text-sm font-semibold " + (audience === key ? "border-action bg-action text-on-primary" : "border-border text-primary")}
            onClick={() => setAudience(key)}
          >
            {key === "all" ? "All" : key === "client" ? "Client" : "Admin"}
          </button>
        ))}
      </div>
      <ul className="mt-4 grid gap-4">
        {templates.map((item) => (
          <li key={`${item.step}-${item.audience}`} className="rounded-md border border-border bg-surface px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-action">{item.audience === "admin" ? "Desk" : "Client"} · {item.label}</p>
            <p className="mt-1 font-semibold text-primary">{item.subject}</p>
            <iframe title={item.subject} srcDoc={item.html} className="mt-3 h-80 w-full rounded-md border border-border bg-white" />
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-lg font-semibold text-primary">Sent</h2>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {rows && visible.length === 0 ? <p className="mt-4 text-sm text-fg">No emails yet. They appear as applications and certificates move forward.</p> : null}
      <ul className="mt-4 grid gap-3">
        {visible.map((row) => (
          <li key={row.id} className="rounded-md border border-border bg-surface px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-primary">{row.subject}</p>
              <p className="text-xs text-fg">{row.createdAt} UTC · {row.delivery === "sent" ? "Sent" : row.delivery === "failed" ? "Not delivered" : "Logged"}</p>
            </div>
            <p className="mt-1 text-sm text-fg">
              {row.audience === "admin" ? "Admin" : "Client"} · {row.recipient}
            </p>
            {row.html ? <iframe title={row.subject} srcDoc={row.html} className="mt-3 h-72 w-full rounded-md border border-border bg-white" /> : <p className="mt-2 whitespace-pre-wrap text-sm text-fg">{row.body}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function InvestmentTypesPanel() {
  const [draft, setDraft] = useState<InvestmentType | null>(null);
  const [terms, setTerms] = useState<CdTerm[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void Promise.all([getInvestmentTypes(), getCdTerms()])
      .then(([next, nextTerms]) => {
        setDraft(next[0] ?? null);
        setTerms(nextTerms);
      })
      .catch(() => setError("Certificates could not be loaded."));
  }, []);

  function patch(key: keyof InvestmentType, value: string) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function save() {
    if (!draft) return;
    setPending(true);
    setNotice("");
    setError("");
    try {
      await saveInvestmentType({ data: draft });
      await saveCdTerms({ data: terms });
      const [next, nextTerms] = await Promise.all([getInvestmentTypes(), getCdTerms()]);
      setDraft(next[0] ?? draft);
      setTerms(nextTerms);
      setNotice("Certificate saved.");
    } catch {
      setError("Could not save this certificate.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Certificates of deposit</h1>
      <p className="mt-2 text-fg">Investors browse these terms when they fund a certificate.</p>
      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold tracking-widest text-primary uppercase">Available terms</h2>
        <div className="mt-4 grid gap-3">
          {terms.map((term) => (
            <div key={term.id} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_120px_auto_auto] sm:items-center">
              <AdminField
                label="APY"
                value={term.apy}
                onChange={(value) => setTerms((current) => current.map((item) => (item.id === term.id ? { ...item, apy: value } : item)))}
              />
              <AdminField
                label="Months"
                value={String(term.months)}
                onChange={(value) =>
                  setTerms((current) => current.map((item) => (item.id === term.id ? { ...item, months: Number(value) || 0 } : item)))
                }
              />
              <div className="flex min-h-11 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={term.featured}
                  onChange={(event) => {
                    const featured = event.currentTarget.checked;
                    setTerms((current) => current.map((item) => (item.id === term.id ? { ...item, featured } : item)));
                  }}
                />
                Featured
              </div>
              <button
                type="button"
                className="min-h-11 text-sm font-semibold text-primary"
                onClick={() => setTerms((current) => current.filter((item) => item.id !== term.id))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-primary"
          onClick={() => setTerms((current) => [...current, { id: crypto.randomUUID(), apy: "", months: 12, featured: false }])}
        >
          Add term
        </button>
      </div>
      {draft ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold tracking-widest text-primary uppercase">Certificate overview</h2>
            <div className="mt-4 grid gap-4">
              <AdminField label="Issuer" value={draft.issuer} onChange={(value) => patch("issuer", value)} />
              <AdminField label="Structure" value={draft.structure} onChange={(value) => patch("structure", value)} />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold tracking-widest text-primary uppercase">Key terms</h2>
            <div className="mt-4 grid gap-4">
              <AdminField label="Minimum investment" value={draft.minimumInvestment} onChange={(value) => patch("minimumInvestment", value)} />
            </div>
          </div>
          <label className="block rounded-lg border border-border bg-surface p-5 lg:col-span-2">
            <span className="mb-1.5 block text-sm font-medium">Capital protection</span>
            <textarea
              className={controlClass + " min-h-24"}
              value={draft.capitalProtection}
              onChange={(event) => patch("capitalProtection", event.target.value)}
            />
          </label>
        </div>
      ) : null}
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-4 text-sm text-fg">{notice}</p> : null}
      <button type="button" disabled={pending || !draft} className="mt-6 min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60" onClick={() => void save()}>
        {pending ? "Saving…" : "Save"}
      </button>
    </section>
  );
}

function PromoPanel() {
  const [offer, setOffer] = useState<PromoOffer | null>(null);
  const [terms, setTerms] = useState<CdTerm[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [bonusDraft, setBonusDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    void Promise.all([getPromo(), getCdTerms()])
      .then(([next, nextTerms]) => {
        setOffer(next);
        setTerms(nextTerms);
      })
      .catch(() => setError("The promotional offer could not be loaded."));
  }, []);

  function patchOffer(key: keyof Omit<PromoOffer, "tiers">, value: string) {
    setOffer((current) => (current ? { ...current, [key]: value } : current));
  }

  function patchTier(id: string, patch: Partial<PromoTier>) {
    setOffer((current) =>
      current ? { ...current, tiers: current.tiers.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier)) } : current,
    );
  }

  function toggleMonth(tier: PromoTier, month: number) {
    const months = tier.months.includes(month) ? tier.months.filter((item) => item !== month) : [...tier.months, month].sort((a, b) => a - b);
    patchTier(tier.id, { months });
  }

  function setBonus(id: string, value: string) {
    if (!/^\d*\.?\d*$/.test(value)) return;
    setBonusDraft((current) => ({ ...current, [id]: value }));
    if (value === "" || value === ".") return;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) patchTier(id, { bonusPercent: parsed });
  }

  async function save() {
    if (!offer) return;
    setPending(true);
    setNotice("");
    setError("");
    try {
      const tiers = offer.tiers.map((tier) => {
        const text = bonusDraft[tier.id];
        if (text == null) return tier;
        const parsed = Number(text);
        if (text === "" || text === "." || !Number.isFinite(parsed)) throw new Error("Enter a bonus percent, such as 0.75.");
        return { ...tier, bonusPercent: parsed };
      });
      await savePromo({ data: { ...offer, tiers } });
      setBonusDraft({});
      setOffer(await getPromo());
      setNotice("Promotional offer saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the promotional offer.");
    } finally {
      setPending(false);
    }
  }

  if (!offer) return <p className="text-sm text-fg">{error || "Opening the promotional offer…"}</p>;

  return (
    <section>
      <h1 className="text-3xl font-semibold">Promotional offers</h1>
      <p className="mt-2 text-fg">Set the offer copy, dates, and which certificate terms earn a bonus at each amount.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="block lg:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Introduction</span>
          <textarea className={controlClass + " min-h-24"} value={offer.intro} onChange={(event) => patchOffer("intro", event.target.value)} />
        </label>
        <AdminField label="Protection line" value={offer.protection} onChange={(value) => patchOffer("protection", value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Starts</span>
            <input className={controlClass} type="date" value={offer.startsOn} onChange={(event) => patchOffer("startsOn", event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Ends</span>
            <input className={controlClass} type="date" value={offer.endsOn} onChange={(event) => patchOffer("endsOn", event.target.value)} />
          </label>
        </div>
        <label className="block lg:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Fine print</span>
          <textarea className={controlClass + " min-h-20"} value={offer.finePrint} onChange={(event) => patchOffer("finePrint", event.target.value)} />
        </label>
      </div>
      <div className="mt-6 grid gap-4">
        {offer.tiers.map((tier, index) => (
          <div key={tier.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_140px_auto] sm:items-end">
              <AdminField label="Minimum" value={String(tier.minAmount)} onChange={(value) => patchTier(tier.id, { minAmount: Number(value) || 0 })} />
              <AdminField
                label="Maximum"
                value={tier.maxAmount == null ? "" : String(tier.maxAmount)}
                onChange={(value) => patchTier(tier.id, { maxAmount: value.trim() === "" ? null : Number(value) || 0 })}
              />
              <AdminField label="Bonus %" value={bonusDraft[tier.id] ?? String(tier.bonusPercent)} onChange={(value) => setBonus(tier.id, value)} />
              <button type="button" className="min-h-11 text-sm font-semibold text-primary" onClick={() => setOffer({ ...offer, tiers: offer.tiers.filter((item) => item.id !== tier.id) })}>
                Remove
              </button>
            </div>
            <p className="mt-3 text-sm font-medium">Terms for band {index + 1}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {terms.map((term) => (
                <label key={term.id} className="inline-flex min-h-11 items-center gap-2 text-sm">
                  <input type="checkbox" checked={tier.months.includes(term.months)} onChange={() => toggleMonth(tier, term.months)} />
                  {term.months}-month
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-fg">Leave maximum empty for an open-ended band, such as $500,000+.</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 text-sm font-semibold text-primary"
        onClick={() =>
          setOffer({
            ...offer,
            tiers: [...offer.tiers, { id: crypto.randomUUID(), minAmount: 100000, maxAmount: 174999, bonusPercent: 0.75, months: terms.slice(0, 1).map((term) => term.months) }],
          })
        }
      >
        Add amount band
      </button>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-4 text-sm text-fg">{notice}</p> : null}
      <button type="button" disabled={pending} className="mt-6 min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary disabled:opacity-60" onClick={() => void save()}>
        {pending ? "Saving…" : "Save offer"}
      </button>
    </section>
  );
}

function DeskLoginSettings() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);
    try {
      await saveDeskLogin({ data: { email, currentPassword, newPassword } });
      setCurrentPassword("");
      setNewPassword("");
      setNotice("Desk login updated.");
    } catch {
      setError("Could not update the desk login. Check the current password.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-6 max-w-xl rounded-lg border border-border bg-surface p-4" onSubmit={(event) => void onSubmit(event)}>
      <h2 className="text-lg font-semibold text-primary">Desk login</h2>
      <p className="mt-1 text-sm text-fg">Change the email and password for this desk. Leave the new password blank to keep the current one.</p>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium">Desk email</span>
        <input required type="email" className={controlClass} value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium">Current password</span>
        <input required type="password" autoComplete="current-password" className={controlClass} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium">New password</span>
        <input type="password" autoComplete="new-password" className={controlClass} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
      </label>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}
      <button type="submit" disabled={pending} className="mt-4 min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60">
        {pending ? "Saving…" : "Update desk login"}
      </button>
    </form>
  );
}

function AdminField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input className={controlClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SettingsPanel() {
  const brand = useBrand();
  const [logo, setLogo] = useState<string | null>(brand.logo);
  const [favicon, setFavicon] = useState<string | null>(brand.favicon);
  const [companyName, setCompanyName] = useState(brand.companyName);
  const [cloudflareCode, setCloudflareCode] = useState(brand.cloudflareCode);
  const [cover, setCover] = useState<string | null>(brand.cover);
  const [socialBanner, setSocialBanner] = useState<string | null>(brand.socialBanner);
  const [emailLogo, setEmailLogo] = useState<string | null>(brand.emailLogo);
  const [backupEmail, setBackupEmail] = useState(brand.backupEmail);
  const [lastBackupAt, setLastBackupAt] = useState(brand.lastBackupAt);
  const [backupPending, setBackupPending] = useState(false);
  const [resendKey, setResendKey] = useState("");
  const [mailFrom, setMailFrom] = useState("");
  const [keyHint, setKeyHint] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [mailPending, setMailPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLogo(brand.logo);
    setFavicon(brand.favicon);
    setCompanyName(brand.companyName);
    setCloudflareCode(brand.cloudflareCode);
    setCover(brand.cover);
    setSocialBanner(brand.socialBanner);
    setEmailLogo(brand.emailLogo);
    setBackupEmail(brand.backupEmail);
    setLastBackupAt(brand.lastBackupAt);
  }, [brand.logo, brand.favicon, brand.companyName, brand.cloudflareCode, brand.cover, brand.socialBanner, brand.emailLogo, brand.backupEmail, brand.lastBackupAt]);

  useEffect(() => {
    void getMailSetup()
      .then((setup) => {
        setMailFrom(setup.mailFrom);
        setKeyHint(setup.keyHint);
        setHasKey(setup.hasKey);
      })
      .catch(() => undefined);
  }, []);

  async function onFile(file: File | undefined, kind: "logo" | "favicon" | "cover" | "socialBanner" | "emailLogo") {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    const share = kind === "cover" || kind === "socialBanner";
    if (share && file.type !== "image/png" && file.type !== "image/jpeg") {
      setError("Use a JPEG or PNG for the cover and social banner.");
      return;
    }
    if (file.size > (share ? 1_000_000 : 400_000)) {
      setError(share ? "Use a JPEG or PNG under 1 MB." : "Use an image under 400 KB.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.readAsDataURL(file);
    });
    if (kind === "logo") setLogo(dataUrl);
    else if (kind === "favicon") setFavicon(dataUrl);
    else if (kind === "cover") setCover(dataUrl);
    else if (kind === "emailLogo") setEmailLogo(dataUrl);
    else setSocialBanner(dataUrl);
  }

  async function save() {
    setError("");
    setNotice("");
    setPending(true);
    try {
      await setSiteBrand({ data: { logo, favicon, companyName, cloudflareCode, cover, socialBanner, emailLogo, backupEmail, lastBackupAt } });
      await brand.refresh();
      setNotice("Settings updated.");
    } catch {
      setError("Could not save settings. Check the company name and Cloudflare code.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Settings</h1>
      <p className="mt-2 text-fg">The company name is used in the header, page titles, emails, and certificates. The logo and favicon replace the wordmark and browser icon.</p>
      <label className="mt-6 block max-w-md">
        <span className="mb-1.5 block text-sm font-medium">Company name</span>
        <input className={controlClass} value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
      </label>
      <DeskLoginSettings />
      <div className="mt-6 max-w-xl rounded-lg border border-border bg-surface p-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Database backup email</span>
          <input
            type="email"
            className={controlClass}
            value={backupEmail}
            placeholder="admin@accountholding.com"
            onChange={(event) => setBackupEmail(event.target.value)}
          />
        </label>
        <p className="mt-2 text-sm text-fg">
          A zip of the database is emailed here every day at 12:00 UTC on the published server.
          {lastBackupAt ? ` Last backup: ${lastBackupAt.replace("T", " ").slice(0, 16)} UTC.` : " No backup has been sent yet."}
          {" "}Set CRON_SECRET on the host so only that job can run the backup.
        </p>
        <button
          type="button"
          disabled={backupPending}
          className="mt-3 min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
          onClick={() => {
            setError("");
            setNotice("");
            setBackupPending(true);
            void runDatabaseBackup()
              .then(async (result) => {
                setLastBackupAt(result.at);
                await brand.refresh();
                setNotice(result.delivery === "sent" ? `Backup emailed to ${result.to}.` : `Backup prepared for ${result.to}. Add a mail key to deliver the zip.`);
              })
              .catch(() => setError("The backup could not be sent."))
              .finally(() => setBackupPending(false));
          }}
        >
          {backupPending ? "Preparing backup…" : "Send backup now"}
        </button>
      </div>
      <div className="mt-6 max-w-xl rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-semibold text-primary">Resend</h2>
        <p className="mt-1 text-sm text-fg">Used for investor emails and the daily backup zip. The key is stored on the server and is not shown again.</p>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">API key</span>
          <input
            type="password"
            autoComplete="off"
            className={controlClass}
            value={resendKey}
            placeholder={hasKey ? `Saved ${keyHint}` : "re_..."}
            onChange={(event) => setResendKey(event.target.value)}
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">From address</span>
          <input
            className={controlClass}
            value={mailFrom}
            placeholder="Account Holding <onboarding@resend.dev>"
            onChange={(event) => setMailFrom(event.target.value)}
          />
        </label>
        <p className="mt-2 text-sm text-fg">Until your domain is verified, use onboarding@resend.dev and send only to the inbox on your Resend account.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={mailPending}
            className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60"
            onClick={() => {
              setError("");
              setNotice("");
              setMailPending(true);
              void saveMailSetup({ data: { apiKey: resendKey, mailFrom, clearKey: false } })
                .then((setup) => {
                  setResendKey("");
                  setMailFrom(setup.mailFrom);
                  setKeyHint(setup.keyHint);
                  setHasKey(setup.hasKey);
                  setNotice(setup.hasKey ? "Resend settings saved." : "From address saved. Add an API key to send mail.");
                })
                .catch(() => setError("Could not save Resend settings. Check the key and from address."))
                .finally(() => setMailPending(false));
            }}
          >
            {mailPending ? "Saving…" : "Save Resend"}
          </button>
          {hasKey ? (
            <button
              type="button"
              disabled={mailPending}
              className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
              onClick={() => {
                setError("");
                setNotice("");
                setMailPending(true);
                void saveMailSetup({ data: { apiKey: "", mailFrom, clearKey: true } })
                  .then((setup) => {
                    setResendKey("");
                    setKeyHint(setup.keyHint);
                    setHasKey(setup.hasKey);
                    setNotice("Resend API key removed.");
                  })
                  .catch(() => setError("Could not remove the Resend key."))
                  .finally(() => setMailPending(false));
              }}
            >
              Remove key
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ImageSetting
          label="Website logo"
          value={logo}
          onFile={(file) => void onFile(file, "logo")}
          onClear={() => setLogo(null)}
        />
        <ImageSetting
          label="Email header logo"
          hint="Replaces the company name in the email header."
          value={emailLogo}
          onFile={(file) => void onFile(file, "emailLogo")}
          onClear={() => setEmailLogo(null)}
        />
        <ImageSetting
          label="Favicon"
          value={favicon}
          onFile={(file) => void onFile(file, "favicon")}
          onClear={() => setFavicon(null)}
        />
        <ImageSetting
          label="App cover"
          hint="Shown on the application. Also used for the shared link if no banner is set."
          value={cover}
          wide
          accept="image/png,image/jpeg"
          onFile={(file) => void onFile(file, "cover")}
          onClear={() => setCover(null)}
        />
        <ImageSetting
          label="Social link banner"
          hint="Image shown when the site link is shared."
          value={socialBanner}
          wide
          accept="image/png,image/jpeg"
          onFile={(file) => void onFile(file, "socialBanner")}
          onClear={() => setSocialBanner(null)}
        />
      </div>
      <label className="mt-6 block max-w-xl">
        <span className="mb-1.5 block text-sm font-medium">Cloudflare code</span>
        <textarea
          className={controlClass + " min-h-28 font-mono text-sm"}
          value={cloudflareCode}
          placeholder="Paste the Cloudflare Web Analytics snippet or token"
          onChange={(event) => setCloudflareCode(event.target.value)}
        />
      </label>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-4 text-sm text-fg">{notice}</p> : null}
      <button
        type="button"
        disabled={pending}
        className="mt-6 min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60"
        onClick={() => void save()}
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </section>
  );
}

function ImageSetting({
  label,
  hint,
  value,
  onFile,
  onClear,
  wide = false,
  accept = "image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon",
}: {
  label: string;
  hint?: string;
  value: string | null;
  onFile: (file: File | undefined) => void;
  onClear: () => void;
  wide?: boolean;
  accept?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-sm font-semibold text-primary">{label}</p>
      {hint ? <p className="mt-1 text-sm text-fg">{hint}</p> : null}
      <div className={"mt-3 flex items-center justify-center overflow-hidden rounded-md border border-border bg-bg " + (wide ? "h-36" : "h-16")}>
        {value ? <img src={value} alt="" className={"max-w-full " + (wide ? "h-full w-full object-cover" : "max-h-12 object-contain")} /> : <span className="text-sm text-fg">No image</span>}
      </div>
      <input
        type="file"
        accept={accept}
        className="mt-3 block w-full text-sm"
        onChange={(event) => onFile(event.target.files?.[0])}
      />
      <button type="button" className="mt-3 text-sm font-semibold text-primary" onClick={onClear}>
        Remove
      </button>
    </div>
  );
}

function InvoicesDesk() {
  const [rows, setRows] = useState<AdminFunding[] | null>(null);
  const [error, setError] = useState("");

  function load() {
    return listFundings()
      .then((next) => setRows(next.filter((row) => row.signed && (row.status === "approved_phone" || row.status === "instructions_sent"))))
      .catch(() => setError("Invoices could not be loaded."));
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-semibold">Invoices</h1>
      <p className="mt-2 text-fg">Signed certificates approved by phone. Approve an invoice here to generate it for the client.</p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {!rows ? (
        <p className="mt-4 text-sm text-fg">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-fg">No certificates are waiting for an invoice.</p>
      ) : (
        <ul className="mt-4 grid gap-4">
          {rows.map((row) => (
            <InvoiceCard key={row.id} row={row} onApproved={() => void load()} />
          ))}
        </ul>
      )}
    </section>
  );
}

const BILLING_FIELDS: Array<{ key: keyof InvoiceBilling; label: string; wide?: boolean }> = [
  { key: "brand", label: "Header name" },
  { key: "bankName", label: "Bank name" },
  { key: "accountName", label: "Account name" },
  { key: "beneficiaryAddress", label: "Beneficiary address", wide: true },
  { key: "accountNumber", label: "Account number" },
  { key: "routingNumber", label: "Routing number" },
  { key: "crn", label: "CRN" },
  { key: "purpose", label: "Purpose of wire" },
  { key: "contactName", label: "Contact name" },
  { key: "phone", label: "Phone" },
  { key: "fdic", label: "FDIC certificate" },
  { key: "contactAddress", label: "Contact address", wide: true },
];

function InvoiceCard({ row, onApproved }: { row: AdminFunding; onApproved: () => void }) {
  const [billing, setBilling] = useState<InvoiceBilling>(row.billing);
  const [pending, setPending] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function setField(key: keyof InvoiceBilling, value: string) {
    setBilling((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setError("");
    setNotice("");
    setPending("save");
    try {
      const result = await saveInvoiceBilling({ data: { id: row.id, billing } });
      setBilling(result.billing);
      setNotice("Billing saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Billing could not be saved.");
    } finally {
      setPending("");
    }
  }

  async function approve() {
    setError("");
    setNotice("");
    setPending("approve");
    try {
      await approveInvoice({ data: { id: row.id, billing } });
      setNotice(row.status === "instructions_sent" ? "Billing saved." : "Invoice generated. The client can open it now.");
      onApproved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The invoice could not be approved.");
    } finally {
      setPending("");
    }
  }

  const generated = row.status === "instructions_sent";

  async function download() {
    setError("");
    setNotice("");
    setPending("pdf");
    try {
      await saveInvoiceBilling({ data: { id: row.id, billing } });
      const { pdf } = await downloadInvoicePdf({ data: { id: row.id } });
      const bytes = Uint8Array.from(atob(pdf), (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `payment-invoice-${row.email}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice("Preview uses the billing details above. The client does not see it until you approve the invoice.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The invoice could not be created.");
    } finally {
      setPending("");
    }
  }

  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-primary">{row.signerName || row.email}</p>
        <p className="text-sm text-fg">{row.termLabel || "Certificate"} · {row.amount}</p>
      </div>
      <p className="text-sm text-fg">{row.email}</p>
      <p className="text-sm text-fg">{generated ? "Invoice generated" : "Waiting for approval"}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {BILLING_FIELDS.map((field) => (
          <label key={field.key} className={field.wide ? "block sm:col-span-2" : "block"}>
            <span className="mb-1.5 block text-sm font-medium">{field.label}</span>
            {field.key === "contactAddress" ? (
              <textarea className={controlClass} rows={2} value={billing[field.key]} onChange={(event) => setField(field.key, event.target.value)} />
            ) : (
              <input className={controlClass} value={billing[field.key]} onChange={(event) => setField(field.key, event.target.value)} />
            )}
          </label>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60" disabled={pending !== ""} onClick={() => void save()}>
          {pending === "save" ? "Saving…" : "Save billing"}
        </button>
        <button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending !== ""} onClick={() => void approve()}>
          {pending === "approve" ? "Saving…" : generated ? "Update invoice" : "Approve invoice"}
        </button>
        <button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60" disabled={pending !== ""} onClick={() => void download()}>
          {pending === "pdf" ? "Creating…" : "Preview PDF"}
        </button>
      </div>
    </li>
  );
}

function FundingDesk() {
  const [rows, setRows] = useState<AdminFunding[] | null>(null);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    return Promise.all([listFundings(), listAdvisors()]).then(([nextRows, nextAdvisors]) => {
      setRows(nextRows);
      setAdvisors(nextAdvisors);
    });
  }

  useEffect(() => {
    void load().catch((caught) => setError(caught instanceof Error ? caught.message : "Investments could not be loaded."));
  }, []);

  async function save(
    row: AdminFunding,
    status: AdminFunding["status"],
    advisorId: string,
    codes: { depositCode: string; depositNumber: string; accountNumber: string; referenceNumber: string; amount: string; openedOn: string },
  ) {
    setError("");
    setNotice("");
    try {
      await updateFunding({ data: { id: row.id, status, advisorId, ...codes } });
      await load();
      setNotice("Investment updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update this investment.");
    }
  }

  async function approve(id: string) {
    setError("");
    setNotice("");
    try {
      await approvePayment({ data: { id } });
      await load();
      setNotice("Payment approved.");
    } catch {
      setError("Approve the payment only after a wire confirmation is attached.");
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Client investments</h1>
      <p className="mt-2 text-fg">New certificates start as pending. Assign the advisor for the call, then mark the investment approved by phone.</p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}
      {!rows ? (
        <p className="mt-4 text-sm text-fg">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-fg">No investments yet.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {rows.map((row) => (
            <FundingRow key={row.id} row={row} advisors={advisors} onSave={save} onApprove={approve} />
          ))}
        </ul>
      )}
    </section>
  );
}

function FundingRow({
  row,
  advisors,
  onSave,
  onApprove,
}: {
  row: AdminFunding;
  advisors: Advisor[];
  onSave: (row: AdminFunding, status: AdminFunding["status"], advisorId: string, codes: { depositCode: string; depositNumber: string; accountNumber: string; referenceNumber: string; amount: string; openedOn: string }) => void;
  onApprove: (id: string) => void;
}) {
  const [status, setStatus] = useState(row.status);
  const [advisorId, setAdvisorId] = useState(row.advisorId);
  const [depositCode, setDepositCode] = useState(row.depositCode);
  const [depositNumber, setDepositNumber] = useState(row.depositNumber);
  const [accountNumber, setAccountNumber] = useState(row.accountNumber);
  const [referenceNumber, setReferenceNumber] = useState(row.referenceNumber);
  const [amount, setAmount] = useState(row.amount);
  const [openedOn, setOpenedOn] = useState(row.createdAt);

  useEffect(() => {
    setStatus(row.status);
    setAdvisorId(row.advisorId);
    setDepositCode(row.depositCode);
    setDepositNumber(row.depositNumber);
    setAccountNumber(row.accountNumber);
    setReferenceNumber(row.referenceNumber);
    setAmount(row.amount);
    setOpenedOn(row.createdAt);
  }, [row]);

  return (
    <li className="rounded-md border border-border bg-surface p-4">
      <p className="font-semibold text-primary">
        {row.email} · {row.termLabel || row.name}
      </p>
      <p className="mt-1 text-sm text-fg">
        {row.amount} · {row.createdAt}
        {row.signed ? " · Terms signed" : row.status === "pending" ? " · Awaiting signature" : ""}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold text-primary">Advisor</span>
          <select className={`${controlClass} mt-1`} value={advisorId} onChange={(event) => setAdvisorId(event.target.value)}>
            <option value="">Unassigned</option>
            {advisors.map((advisor) => (
              <option key={advisor.id} value={advisor.id}>
                {advisor.name}
                {advisor.phone ? ` · ${advisor.phone}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-primary">Status</span>
          <select className={`${controlClass} mt-1`} value={status} onChange={(event) => setStatus(event.target.value as AdminFunding["status"])}>
            <option value="pending">Pending</option>
            <option value="approved_phone">Approved by phone</option>
            <option value="instructions_sent">Invoice generated</option>
            <option value="payment_approved">Payment approved</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <AdminField label="Amount" value={amount} onChange={setAmount} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Date</span>
          <input className={controlClass} type="date" value={openedOn} onChange={(event) => setOpenedOn(event.target.value)} />
        </label>
        <AdminField label="Deposit code" value={depositCode} onChange={setDepositCode} />
        <AdminField label="Deposit number" value={depositNumber} onChange={setDepositNumber} />
        <AdminField label="Account number" value={accountNumber} onChange={setAccountNumber} />
        <AdminField label="Reference number" value={referenceNumber} onChange={setReferenceNumber} />
      </div>
      <button
        type="button"
        className="mt-3 min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary"
        onClick={() => onSave(row, status, advisorId, { depositCode, depositNumber, accountNumber, referenceNumber, amount, openedOn })}
      >
        Save
      </button>
      {row.paymentFileName ? <PaymentReview id={row.id} name={row.paymentFileName} canApprove={row.status === "instructions_sent"} onApprove={() => onApprove(row.id)} /> : null}
    </li>
  );
}

function openDataFile(file: string, name: string) {
  const [meta, data] = file.split(",");
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? "application/octet-stream";
  const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function PaymentReview({ id, name, canApprove, onApprove }: { id: string; name: string; canApprove: boolean; onApprove: () => void }) {
  const [error, setError] = useState("");

  async function open() {
    setError("");
    try {
      const file = await getPaymentFile({ data: { id } });
      openDataFile(file.file, file.fileName);
    } catch {
      setError("The confirmation could not be opened.");
    }
  }

  return (
    <div className="mt-3 border-t border-border pt-3 text-sm">
      <p className="text-fg">Wire confirmation: {name}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 font-semibold text-primary" onClick={() => void open()}>
          View confirmation
        </button>
        {canApprove ? (
          <button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 font-semibold text-on-primary" onClick={onApprove}>
            Approve payment
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-danger">{error}</p> : null}
    </div>
  );
}

function AdvisorsPanel() {
  const [rows, setRows] = useState<Advisor[] | null>(null);
  const [draft, setDraft] = useState<Advisor>({ id: "", name: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    return listAdvisors().then(setRows);
  }

  useEffect(() => {
    void load().catch(() => setError("Advisors could not be loaded."));
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await saveAdvisor({ data: draft });
      setDraft({ id: "", name: "", phone: "", email: "" });
      await load();
      setNotice("Advisor saved.");
    } catch {
      setError("Could not save this advisor.");
    }
  }

  async function remove(id: string) {
    setError("");
    try {
      await deleteAdvisor({ data: { id } });
      await load();
    } catch {
      setError("Could not remove this advisor.");
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Advisors</h1>
      <p className="mt-2 text-fg">Assign one of these advisors when a client investment needs a call.</p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}
      <ul className="mt-4 grid gap-3">
        {(rows ?? []).map((advisor) => (
          <li key={advisor.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3">
            <div>
              <p className="font-semibold text-primary">{advisor.name}</p>
              <p className="text-sm text-fg">
                {advisor.phone || "No phone"}
                {advisor.email ? ` · ${advisor.email}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="min-h-11 px-3 text-sm font-semibold text-primary" onClick={() => setDraft(advisor)}>
                Edit
              </button>
              <button type="button" className="min-h-11 px-3 text-sm font-semibold text-primary" onClick={() => void remove(advisor.id)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form className="mt-6 grid gap-3 rounded-md border border-border bg-surface p-4 sm:grid-cols-2" onSubmit={(event) => void save(event)}>
        <h2 className="text-lg font-semibold text-primary sm:col-span-2">{draft.id ? "Edit advisor" : "Add advisor"}</h2>
        <AdminField label="Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
        <AdminField label="Phone" value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone })} />
        <AdminField label="Email" value={draft.email} onChange={(email) => setDraft({ ...draft, email })} />
        <div className="flex items-end">
          <button type="submit" className="min-h-11 rounded-md bg-action px-4 py-2 font-semibold text-on-primary">
            Save advisor
          </button>
        </div>
      </form>
    </section>
  );
}

function ClientsPanel({ rows, onStatus }: { rows: ApplicationRow[]; onStatus: (id: string, status: ApplicationRow["status"]) => void }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const selected = rows.find((row) => row.id === selectedId) ?? null;

  async function openAs(id: string) {
    setError("");
    setPendingId(id);
    try {
      await signInAsClient({ data: { id } });
      window.location.assign("/portal");
    } catch {
      setError("Could not sign in as this client.");
      setPendingId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <section>
        <h1 className="text-3xl font-semibold">Clients</h1>
        <p className="mt-4 rounded-lg border border-border bg-surface px-4 py-6 text-sm text-fg">No approved clients yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Clients</h1>
      <p className="mt-2 text-fg">Approved investors. Select a row to open the full application. Sign in as a client to open their portal.</p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-xs tracking-wide text-primary uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Account</th>
              <th className="px-4 py-3 font-semibold">Approved</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={"cursor-pointer border-b border-border last:border-0 " + (row.id === selectedId ? "bg-step-idle" : "")} onClick={() => setSelectedId(row.id)}>
                <td className="px-4 py-3">
                  <span className="block font-semibold text-primary">{row.applicantName}</span>
                  <span className="text-fg">{row.email}</span>
                </td>
                <td className="px-4 py-3">{row.accountType}</td>
                <td className="px-4 py-3">{row.submittedAt} UTC</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60"
                    disabled={pendingId === row.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      void openAs(row.id);
                    }}
                  >
                    {pendingId === row.id ? "Signing in…" : "Sign in as user"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected ? <ApplicationDetail row={selected} onStatus={(status) => onStatus(selected.id, status)} /> : null}
    </section>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      className={
        "min-h-11 rounded-md px-4 py-2 text-left text-sm font-semibold " +
        (active ? "bg-action text-on-primary" : "border border-border bg-surface text-primary")
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-4">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{rowsafe(value)}</p>
    </div>
  );
}

function rowsafe(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function ApplicationTable({
  rows,
  selectedId,
  onSelect,
}: {
  rows: ApplicationRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (rows.length === 0) {
    return <p className="mt-4 rounded-lg border border-border bg-surface px-4 py-6 text-sm text-fg">No applications in this view.</p>;
  }
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border text-xs tracking-wide text-primary uppercase">
          <tr>
            <th className="px-4 py-3 font-semibold">Applicant</th>
            <th className="px-4 py-3 font-semibold">Account</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={"cursor-pointer border-b border-border last:border-0 " + (row.id === selectedId ? "bg-step-idle" : "")}
              onClick={() => onSelect(row.id)}
            >
              <td className="px-4 py-3">
                <span className="block font-semibold text-primary">{row.applicantName}</span>
                <span className="text-fg">{row.email}</span>
              </td>
              <td className="px-4 py-3">
                {row.accountType}
              </td>
              <td className="px-4 py-3 capitalize">{row.status === "hold" ? "On hold" : row.status}</td>
              <td className="px-4 py-3">{row.submittedAt} UTC</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StoredDocument({ label, name, file }: { label: string; name: string; file?: string }) {
  const ready = Boolean(file?.startsWith("data:"));
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <p className="text-xs font-semibold tracking-wide text-primary uppercase">{label}</p>
      <p className="mt-1 text-sm text-fg">{name || "No file"}</p>
      {ready ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="min-h-11 rounded-md bg-action px-3 py-2 text-sm font-semibold text-on-primary" onClick={() => openStoredFile(file!, name, false)}>
            View
          </button>
          <button type="button" className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary" onClick={() => openStoredFile(file!, name, true)}>
            Download
          </button>
        </div>
      ) : name ? (
        <p className="mt-2 text-sm text-fg">Only the file name was saved. Ask the applicant to submit the document again.</p>
      ) : null}
    </div>
  );
}

function openStoredFile(file: string, name: string, download: boolean) {
  const [meta, data] = file.split(",");
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? "application/octet-stream";
  const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  if (download) link.download = name || "document";
  else link.target = "_blank";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function ApplicationDetail({ row, onStatus }: { row: ApplicationRow; onStatus: (status: ApplicationRow["status"]) => void }) {
  const form = row.payload;
  const fields: Array<[string, string]> = [
    ["Account", form.accountType],
    ["Phone", `${form.phoneCountry} ${form.phone}`],
    ["Date of birth", [form.dobDay, form.dobMonth, form.dobYear].filter(Boolean).join(" ")],
    ["Nationality", form.nationality],
    ["Residence", form.residence],
    ["Occupation", form.occupation],
    ["Address", [form.street, form.apt, form.city, form.region, form.postal, form.country].filter(Boolean).join(", ")],
    ["Tax residence", form.taxResidence],
    ["Tax ID", form.taxId],
    ["Source of wealth", form.sourceOfWealth],
    ["Source of funds", form.sourceOfFunds],
    ["Purpose", form.investmentPurpose],
    ["Net worth", form.netWorth],
    ["Identity document", `${form.idType}${form.idFileName ? ` · ${form.idFileName}` : ""}`],
    ["Address document", `${form.addressDocType}${form.addressFileName ? ` · ${form.addressFileName}` : ""}`],
    ["Bank", form.bankName],
    ["Account holder", form.accountHolder],
    ["Bank address", [form.bankStreet, form.bankLine2, form.bankCity, form.bankState, form.bankZip].filter(Boolean).join(", ")],
    ["Routing number", form.routingNumber],
    ["Account number", form.accountNumber],
  ];
  return (
    <article className="mt-4 rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-primary">{row.applicantName}</h2>
          <p className="text-sm text-fg">{row.email}</p>
          <p className="mt-1 text-sm text-fg">
            {row.status === "approved"
              ? "Sign-in is active. The investor portal opens with this email and the application password."
              : "Approving creates a sign-in and opens the investor portal with this email and the application password."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="min-h-11 rounded-md bg-action px-3 py-2 text-sm font-semibold text-on-primary" onClick={() => onStatus("approved")}>
            Approve
          </button>
          <button type="button" className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary" onClick={() => onStatus("hold")}>
            Hold
          </button>
          <button type="button" className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary" onClick={() => onStatus("pending")}>
            Pending
          </button>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold tracking-wide text-primary uppercase">{label}</dt>
            <dd className="text-sm text-fg">{value || "—"}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StoredDocument label="Identity document" name={form.idFileName} file={form.idFile} />
        <StoredDocument label="Address document" name={form.addressFileName} file={form.addressFile} />
      </div>
      {form.signature?.startsWith("data:image/") ? (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Signature</p>
          <img src={form.signature} alt="Applicant signature" className="mt-2 h-24 rounded-md border border-border bg-white object-contain" />
        </div>
      ) : null}
    </article>
  );
}
