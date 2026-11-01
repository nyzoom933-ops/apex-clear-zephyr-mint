import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
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
  rejectPayment,
  getPaymentFile,
  listAdvisors,
  listApplications,
  listFundings,
  downloadInvoicePdf,
  saveInvoiceBilling,
  approveInvoice,
  listNotifications,
  syncMailStatuses,
  saveAdvisor,
  saveCdTerms,
  saveInvestmentType,
  savePromo,
  setApplicationStatus,
  deleteApplication,
  deleteFunding,
  clearDatabase,
  signInAsClient,
  setSiteBrand,
  runDatabaseBackup,
  saveMailSetup,
  saveSmtpSetup,
  sendLeadIntro,
  sendLeadApplication,
  updateFunding,
  type AdminFunding,
  type Advisor,
  type ApplicationRow,
  type CdTerm,
  type InvestmentType,
  type NotificationRow,
} from "@/lib/admin.functions";
import type { PromoOffer, PromoTier } from "@/lib/promo";
import { formatBonus, matchTier, parseApy, promoMonths } from "@/lib/promo";
import type { InvoiceBilling } from "@/lib/invoice-billing";
import { applicationLetter, defaultApplicationCopy, defaultLeadCopy, leadLetter, renderStep, templateCatalog, type ApplicationCopy, type LeadCopy } from "@/lib/email-templates";

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
  const [tab, setTab] = useState<"dashboard" | "applications" | "clients" | "investments" | "funding" | "active" | "invoices" | "advisors" | "leads" | "mail-status" | "emails" | "settings-general" | "settings-logos" | "settings-misc">("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
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

  async function removeApplication(id: string) {
    if (!window.confirm("Remove this client? The application, investments, and invoices will be deleted. No email will be sent.")) return;
    setError("");
    setNotice("");
    try {
      await deleteApplication({ data: { id } });
      setNotice("Client removed. The application, investments, and invoices were deleted. No email was sent.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The application could not be removed.");
    }
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
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <div className="hidden lg:block">
          <DeskNav tab={tab} onSelect={setTab} />
        </div>
        <div className="min-w-0">
        <div className="mb-4 lg:hidden">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(true)}
          >
            <span className="text-sm font-semibold text-primary">{DESK_MENU.flatMap((group) => group.items as readonly { id: string; label: string }[]).find((item) => item.id === tab)?.label}</span>
            <Menu className="size-5 text-primary" aria-hidden="true" />
          </button>
        </div>
        {menuOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" className="absolute inset-0 bg-primary/30" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[min(100%,280px)] overflow-y-auto bg-surface p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-primary">Desk</p>
                <button type="button" className="flex size-11 items-center justify-center rounded-lg border border-border" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                  <X className="size-5" />
                </button>
              </div>
              <DeskNav
                tab={tab}
                onSelect={(id) => {
                  setTab(id);
                  setMenuOpen(false);
                }}
              />
            </div>
          </div>
        ) : null}
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
            {selected ? <ApplicationDetail row={selected} onStatus={(status) => void updateStatus(selected.id, status)} onRemove={() => void removeApplication(selected.id)} /> : null}
          </section>
        ) : tab === "clients" ? (
          <ClientsPanel rows={clients} onStatus={(id, status) => void updateStatus(id, status)} onRemove={(id) => void removeApplication(id)} />
        ) : tab === "investments" ? (
          <div className="grid gap-12">
            <InvestmentTypesPanel />
            <PromoPanel />
          </div>
        ) : tab === "funding" ? (
          <FundingDesk />
        ) : tab === "active" ? (
          <ActiveCdsDesk />
        ) : tab === "invoices" ? (
          <InvoicesDesk />
        ) : tab === "advisors" ? (
          <AdvisorsPanel />
        ) : tab === "leads" ? (
          <LeadsPanel />
        ) : tab === "mail-status" ? (
          <MailStatusPanel />
        ) : tab === "emails" ? (
          <EmailsPanel />
        ) : tab === "settings-logos" ? (
          <SettingsPanel section="logos" />
        ) : tab === "settings-misc" ? (
          <SettingsPanel section="misc" />
        ) : (
          <SettingsPanel section="general" />
        )}
        </div>
      </div>
    </div>
  );
}

function EmailsPanel() {
  const [rows, setRows] = useState<NotificationRow[] | null>(null);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [signatureId, setSignatureId] = useState("");
  const [error, setError] = useState("");
  const [audience, setAudience] = useState<"all" | "client" | "admin">("all");
  const [origin, setOrigin] = useState("");
  const brand = useBrand();
  const signature = advisors.find((item) => item.id === signatureId) ?? advisors[0];
  const templates = templateCatalog(brand.companyName, brand.emailLogo, brand.publicDomain || origin, signature).filter((item) => audience === "all" || item.audience === audience);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    void listNotifications()
      .then(setRows)
      .catch(() => setError("Emails could not be loaded."));
    void listAdvisors()
      .then((people) => {
        setAdvisors(people);
        setSignatureId((current) => current || people[people.length - 1]?.id || "");
      })
      .catch(() => undefined);
  }, []);

  const visible = (rows ?? []).filter((row) => audience === "all" || row.audience === audience);

  return (
    <section>
      <h1 className="text-3xl font-semibold">Email templates</h1>
      <p className="mt-2 max-w-2xl text-fg">
        Each step has a client template and a desk template. Lead letters sign off with the advisor you select.
      </p>
      <label className="mt-4 block max-w-md text-sm">
        <span className="font-semibold text-primary">Signature</span>
        <select className={`${controlClass} mt-1`} value={signature?.id ?? ""} onChange={(event) => setSignatureId(event.target.value)}>
          {advisors.length === 0 ? <option value="">No advisors yet</option> : null}
          {advisors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {item.email ? ` · ${item.email}` : ""}
            </option>
          ))}
        </select>
      </label>
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
            <iframe title={item.subject} srcDoc={item.html} className="mt-3 h-[640px] w-full rounded-md border border-border bg-white" />
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

const MAIL_STATUS_LABEL: Record<string, string> = {
  opened: "Opened",
  clicked: "Clicked",
  delivered: "Delivered",
  sent: "Sent",
  bounced: "Bounced",
  complained: "Complained",
  delivery_delayed: "Delayed",
};

function MailStatusPanel() {
  const [rows, setRows] = useState<NotificationRow[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  function load() {
    return listNotifications().then(setRows);
  }

  useEffect(() => {
    void load().catch(() => setError("Email status could not be loaded."));
  }, []);

  async function sync() {
    setPending(true);
    setError("");
    setNotice("");
    try {
      const result = await syncMailStatuses();
      await load();
      setNotice(`Synced ${result.updated} of ${result.checked}. ${result.opened} opened or clicked.`);
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "Mail status could not be synced.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Email status</h1>
          <p className="mt-2 max-w-2xl text-fg">Advisor letters are sent through SMTP2GO, which records when they are opened. Other desk mail still uses Resend. Sync after the recipient has had time to open the letter.</p>
        </div>
        <button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending} onClick={() => void sync()}>
          {pending ? "Syncing…" : "Sync status"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border text-xs tracking-wide text-primary uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">To</th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 font-semibold">Sent</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Opened</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => {
              const opened = row.mailStatus === "opened" || row.mailStatus === "clicked";
              return (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">{row.createdAt} UTC</td>
                  <td className="px-4 py-3">
                    <span className="block">{row.recipient}</span>
                    <span className="text-xs text-[#8c8c8c]">{row.audience === "admin" ? "Desk" : "Client"}</span>
                  </td>
                  <td className="px-4 py-3">{row.subject}</td>
                  <td className="px-4 py-3">{row.delivery === "sent" ? "Sent" : row.delivery === "failed" ? "Failed" : "Logged"}</td>
                  <td className="px-4 py-3">{MAIL_STATUS_LABEL[row.mailStatus] || (row.resendId ? "Waiting" : "Not tracked")}</td>
                  <td className="px-4 py-3">{opened ? <span className="font-semibold text-[#0d6e4f]">Opened</span> : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows && rows.length === 0 ? <p className="px-4 py-6 text-sm text-fg">No emails yet.</p> : null}
      </div>
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
      <h2 className="text-2xl font-semibold text-primary">Promotional offers</h2>
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

function SettingsPanel({ section }: { section: "general" | "logos" | "misc" }) {
  const brand = useBrand();
  const [logo, setLogo] = useState<string | null>(brand.logo);
  const [favicon, setFavicon] = useState<string | null>(brand.favicon);
  const [companyName, setCompanyName] = useState(brand.companyName);
  const [cloudflareCode, setCloudflareCode] = useState(brand.cloudflareCode);
  const [cover, setCover] = useState<string | null>(brand.cover);
  const [socialBanner, setSocialBanner] = useState<string | null>(brand.socialBanner);
  const [emailLogo, setEmailLogo] = useState<string | null>(brand.emailLogo);
  const [footerLogo, setFooterLogo] = useState<string | null>(brand.footerLogo);
  const [footerText, setFooterText] = useState(brand.footerText);
  const [backupEmail, setBackupEmail] = useState(brand.backupEmail);
  const [publicDomain, setPublicDomain] = useState(brand.publicDomain);
  const [lastBackupAt, setLastBackupAt] = useState(brand.lastBackupAt);
  const [backupPending, setBackupPending] = useState(false);
  const [resendKey, setResendKey] = useState("");
  const [mailFrom, setMailFrom] = useState("");
  const [keyHint, setKeyHint] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [smtpKey, setSmtpKey] = useState("");
  const [smtpHint, setSmtpHint] = useState("");
  const [hasSmtpKey, setHasSmtpKey] = useState(false);
  const [smtpPending, setSmtpPending] = useState(false);
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
    setFooterLogo(brand.footerLogo);
    setFooterText(brand.footerText);
    setBackupEmail(brand.backupEmail);
    setPublicDomain(brand.publicDomain);
    setLastBackupAt(brand.lastBackupAt);
  }, [brand.logo, brand.favicon, brand.companyName, brand.cloudflareCode, brand.cover, brand.socialBanner, brand.emailLogo, brand.footerLogo, brand.footerText, brand.backupEmail, brand.publicDomain, brand.lastBackupAt]);

  useEffect(() => {
    void getMailSetup()
      .then((setup) => {
        setMailFrom(setup.mailFrom);
        setKeyHint(setup.keyHint);
        setHasKey(setup.hasKey);
        setSmtpHint(setup.smtpKeyHint);
        setHasSmtpKey(setup.hasSmtpKey);
      })
      .catch(() => undefined);
  }, []);

  async function onFile(file: File | undefined, kind: "logo" | "favicon" | "cover" | "socialBanner" | "emailLogo" | "footerLogo") {
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
    else if (kind === "footerLogo") setFooterLogo(dataUrl);
    else setSocialBanner(dataUrl);
  }

  async function save() {
    setError("");
    setNotice("");
    setPending(true);
    try {
      await setSiteBrand({ data: { logo, favicon, companyName, cloudflareCode, cover, socialBanner, emailLogo, footerLogo, footerText, backupEmail, lastBackupAt, publicDomain } });
      await brand.refresh();
      setNotice("Settings updated.");
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "Could not save settings.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">{section === "logos" ? "Logos" : section === "misc" ? "Misc" : "General"}</h1>
      {section === "general" ? (
        <>
          <p className="mt-2 text-fg">The company name is used in the header, page titles, emails, and certificates.</p>
          <label className="mt-6 block max-w-md">
            <span className="mb-1.5 block text-sm font-medium">Company name</span>
            <input className={controlClass} value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
          </label>
          <label className="mt-6 block max-w-md">
            <span className="mb-1.5 block text-sm font-medium">Public domain</span>
            <input className={controlClass} value={publicDomain} placeholder="https://www.example.com" onChange={(event) => setPublicDomain(event.target.value)} />
            <span className="mt-1 block text-sm text-fg">Client emails use this for the Open the investor portal button. Use the public site, not the Vercel address.</span>
          </label>
          <DeskLoginSettings />
          <div className="mt-6 max-w-xl rounded-lg border border-danger/40 bg-surface p-4">
            <h2 className="text-lg font-semibold text-primary">Clear database</h2>
            <p className="mt-1 text-sm text-fg">Deletes applications, clients, investments, invoices, active CDs, and notifications. Settings, rates, advisors, and the desk login stay.</p>
            <button
              type="button"
              className="mt-3 min-h-11 rounded-md border border-danger px-4 py-2 text-sm font-semibold text-danger"
              onClick={() => {
                if (!window.confirm("Clear the database? Applications, clients, investments, invoices, active CDs, and notifications will be deleted. This cannot be undone.")) return;
                setError("");
                setNotice("");
                setPending(true);
                void clearDatabase()
                  .then(() => setNotice("Database cleared. Settings and the desk login were kept."))
                  .catch((caught) => setError(caught instanceof Error && caught.message ? caught.message : "The database could not be cleared."))
                  .finally(() => setPending(false));
              }}
            >
              {pending ? "Clearing…" : "Clear database"}
            </button>
          </div>
        </>
      ) : null}
      {section === "misc" ? (
        <>
          <p className="mt-2 text-fg">Mail delivery, the daily database backup, and site analytics.</p>
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
            <p className="mt-1 text-sm text-fg">Used for desk notices and the daily backup. Advisor letters use SMTP2GO below. The key is stored on the server and is not shown again.</p>
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
          <div className="mt-6 max-w-xl rounded-lg border border-border bg-surface p-4">
            <h2 className="text-lg font-semibold text-primary">SMTP2GO</h2>
            <p className="mt-1 text-sm text-fg">API key for advisor letters. Each advisor’s verified mailbox is set on the Advisors tab. Turn on open tracking for this key in SMTP2GO.</p>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium">API key</span>
              <input
                type="password"
                autoComplete="off"
                className={controlClass}
                value={smtpKey}
                placeholder={hasSmtpKey ? `Saved ${smtpHint}` : "api-..."}
                onChange={(event) => setSmtpKey(event.target.value)}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={smtpPending}
                className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60"
                onClick={() => {
                  setError("");
                  setNotice("");
                  setSmtpPending(true);
                  void saveSmtpSetup({ data: { apiKey: smtpKey, clearKey: false } })
                    .then((setup) => {
                      setSmtpKey("");
                      setSmtpHint(setup.smtpKeyHint);
                      setHasSmtpKey(setup.hasSmtpKey);
                      setNotice(setup.hasSmtpKey ? "SMTP2GO API key saved." : "No API key was saved.");
                    })
                    .catch(() => setError("Could not save the SMTP2GO API key."))
                    .finally(() => setSmtpPending(false));
                }}
              >
                {smtpPending ? "Saving…" : "Save SMTP2GO"}
              </button>
              {hasSmtpKey ? (
                <button
                  type="button"
                  disabled={smtpPending}
                  className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
                  onClick={() => {
                    setError("");
                    setNotice("");
                    setSmtpPending(true);
                    void saveSmtpSetup({ data: { apiKey: "", clearKey: true } })
                      .then((setup) => {
                        setSmtpKey("");
                        setSmtpHint(setup.smtpKeyHint);
                        setHasSmtpKey(setup.hasSmtpKey);
                        setNotice("SMTP2GO API key removed.");
                      })
                      .catch(() => setError("Could not remove the SMTP2GO key."))
                      .finally(() => setSmtpPending(false));
                  }}
                >
                  Remove key
                </button>
              ) : null}
            </div>
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
        </>
      ) : null}
      {section === "logos" ? (
        <>
          <p className="mt-2 text-fg">These images replace the wordmark, browser icon, email header, footer, application cover, and shared-link image.</p>
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
              label="Footer logo"
              hint="Shown in the portal footer. The company name is used if this is empty."
              value={footerLogo}
              onFile={(file) => void onFile(file, "footerLogo")}
              onClear={() => setFooterLogo(null)}
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
            <span className="mb-1.5 block text-sm font-medium">Footer text</span>
            <textarea
              className={controlClass + " min-h-28"}
              value={footerText}
              placeholder="FDIC insurance covers the first $250,000 per individual or $500,000 per joint account. Rates and calculator results are illustrations. Early withdrawal penalties may apply."
              onChange={(event) => setFooterText(event.target.value)}
            />
            <span className="mt-1 block text-sm text-fg">Shown under the footer logo. Leave blank to use the standard note.</span>
          </label>
        </>
      ) : null}
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

  async function removeInvoice(id: string) {
    if (!window.confirm("Remove this invoice and its investment? No email will be sent.")) return;
    setError("");
    try {
      await deleteFunding({ data: { id } });
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The invoice could not be removed.");
    }
  }

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
            <InvoiceCard key={row.id} row={row} onApproved={() => void load()} onRemove={() => void removeInvoice(row.id)} />
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

function InvoiceCard({ row, onApproved, onRemove }: { row: AdminFunding; onApproved: () => void; onRemove: () => void }) {
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
        <button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-danger disabled:opacity-60" disabled={pending !== ""} onClick={onRemove}>
          Remove
        </button>
      </div>
      {row.paymentFileName ? <PaymentReview id={row.id} name={row.paymentFileName} canReview={generated} onChanged={onApproved} /> : null}
    </li>
  );
}

function ActiveCdsDesk() {
  const [rows, setRows] = useState<AdminFunding[] | null>(null);
  const [offer, setOffer] = useState<PromoOffer | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([listFundings(), getPromo()])
      .then(([next, promo]) => {
        setRows(next.filter((row) => row.status === "payment_approved"));
        setOffer(promo);
      })
      .catch(() => setError("Active CDs could not be loaded."));
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-semibold">Active CDs{rows ? ` (${rows.length})` : ""}</h1>
      <p className="mt-2 text-fg">Certificates whose payment the advisor confirmed. An active CD is removed only when the client is deleted.</p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {!rows ? (
        <p className="mt-4 text-sm text-fg">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-fg">No active certificates yet.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {rows.map((row) => (
            <ActiveCdDeskRow key={row.id} row={row} offer={offer} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ActiveCdDeskRow({ row, offer }: { row: AdminFunding; offer: PromoOffer | null }) {
  const [open, setOpen] = useState(false);
  const months = Number(row.termLabel.match(/(\d+)-month/)?.[1] ?? 0);
  const base = parseApy(row.termLabel);
  const amount = Number(row.amount.replace(/[^0-9.]/g, ""));
  const bonus = !row.finalApy && offer ? matchTier(offer, months, amount) : null;
  const finalRate = row.finalApy ? parseApy(row.finalApy) : base + (bonus ? bonus.bonusPercent / 100 : 0);
  const finalPercent = finalRate * 100;
  const finalApy = row.finalApy || (base ? `${finalPercent.toFixed(Math.round(finalPercent * 1000) % 10 === 0 ? 2 : 3)}%` : "—");
  const promo = row.promoApy || (bonus ? formatBonus(bonus.bonusPercent) : "—");
  const payout = Number.isFinite(amount) && months ? amount * Math.pow(1 + finalRate, months / 12) : 0;
  const matures = addMonths(row.createdAt, months);
  const facts: Array<[string, string]> = [
    ["Client", row.signerName || row.email],
    ["Email", row.email],
    ["Issuer", row.issuer],
    ["Structure", row.structure],
    ["Amount", row.amount],
    ["Term", months ? `${months} months` : row.termLabel],
    ["Base APY", row.termLabel.match(/([\d.]+%)/)?.[1] ?? "—"],
    ["Promo APY", promo],
    ["Final APY", finalApy],
    ["Expected payout", payout ? payout.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "—"],
    ["Issue date", row.createdAt],
    ["Matures", matures],
    ["Confirmation date", row.confirmedOn],
    ["Deposit code", row.depositCode],
    ["Deposit number", row.depositNumber],
    ["Account number", row.accountNumber],
    ["Reference number", row.referenceNumber],
    ["Interest rate", "Fixed"],
    ["Compounding", "Daily"],
    ["Callable feature", "Non-callable"],
    ["Minimum", row.minimumInvestment],
    ["Capital protection", row.capitalProtection],
    ["Advisor", row.advisorName ? `${row.advisorName}${row.advisorPhone ? ` · ${row.advisorPhone}` : ""}` : "—"],
    ["Signed", row.signerName ? `${row.signerName}${row.signedOn ? ` · ${row.signedOn}` : ""}` : "Not signed"],
    ["Contact", row.contactBy === "email" ? "Email only" : row.contactPhone || "—"],
    ["Wire confirmation", row.paymentFileName || "—"],
  ];

  return (
    <li className="rounded-lg border border-border bg-surface">
      <button type="button" className="flex w-full items-center gap-3 px-4 py-3 text-left" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-primary">{row.signerName || row.email}</span>
          <span className="mt-0.5 block text-sm text-fg">{row.termLabel || row.name} · {row.amount} · opened {row.createdAt}</span>
        </span>
        <span className="hidden text-sm text-fg sm:block">{row.advisorName || "No advisor"}</span>
        <ChevronDown className={"size-4 shrink-0 text-primary transition-transform " + (open ? "rotate-180" : "")} aria-hidden="true" />
      </button>
      {open ? (
        <dl className="grid border-t border-border sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(([label, value]) => (
            <div key={label} className="border-b border-border px-4 py-3">
              <dt className="text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">{label}</dt>
              <dd className="mt-1 text-sm text-fg">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </li>
  );
}

function addMonths(iso: string, months: number) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day || !months) return "—";
  const date = new Date(Date.UTC(year, month - 1 + months, day));
  return date.toISOString().slice(0, 10);
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

  async function remove(id: string) {
    if (!window.confirm("Remove this investment and its invoice? No email will be sent.")) return;
    setError("");
    setNotice("");
    try {
      await deleteFunding({ data: { id } });
      await load();
      setNotice("Investment removed. No email was sent.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The investment could not be removed.");
    }
  }

  async function reload() {
    setError("");
    try {
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Investments could not be loaded.");
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Client investments</h1>
      <p className="mt-2 text-fg">A certificate appears here after the client accepts the terms. Pending call/email means the advisor still needs to reach them.</p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}
      {!rows ? (
        <p className="mt-4 text-sm text-fg">Loading…</p>
      ) : rows.filter((row) => row.signed && row.status !== "payment_approved").length === 0 ? (
        <p className="mt-4 text-sm text-fg">No investments in progress. A certificate appears here after the client accepts the terms.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {rows.filter((row) => row.signed && row.status !== "payment_approved").map((row) => (
            <FundingRow key={row.id} row={row} advisors={advisors} onSave={save} onReload={() => void reload()} onRemove={() => void remove(row.id)} />
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
  onReload,
  onRemove,
}: {
  row: AdminFunding;
  advisors: Advisor[];
  onSave: (row: AdminFunding, status: AdminFunding["status"], advisorId: string, codes: { depositCode: string; depositNumber: string; accountNumber: string; referenceNumber: string; amount: string; openedOn: string }) => void;
  onReload: () => void;
  onRemove: () => void;
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
        {row.status === "pending" ? " · Pending call/email" : " · Terms signed"}
        {row.contactBy === "email" ? " · Do not call. Use email." : ""}
      </p>
      {row.contactBy === "email" ? (
        <p className="mt-1 text-sm font-semibold text-primary">Do not call. Use email.</p>
      ) : (
        <p className="mt-1 text-sm text-fg">Call {row.contactPhone || "the number on the application"}</p>
      )}
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
            {row.status === "instructions_sent" ? <option value="instructions_sent">Invoice created</option> : null}
            {row.status === "pending" || row.status === "approved_phone" ? <option value="pending">Pending call/email</option> : null}
            {row.status === "pending" || row.status === "approved_phone" ? <option value="approved_phone">Approved by phone</option> : null}
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
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary"
          onClick={() => onSave(row, status, advisorId, { depositCode, depositNumber, accountNumber, referenceNumber, amount, openedOn })}
        >
          Save
        </button>
        <button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-danger" onClick={onRemove}>
          Remove
        </button>
      </div>
      {row.paymentFileName ? <PaymentReview id={row.id} name={row.paymentFileName} canReview={row.status === "instructions_sent"} onChanged={onReload} /> : null}
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

function PaymentReview({ id, name, canReview, onChanged }: { id: string; name: string; canReview: boolean; onChanged: () => void }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");

  async function open() {
    setError("");
    try {
      const file = await getPaymentFile({ data: { id } });
      openDataFile(file.file, file.fileName);
    } catch {
      setError("The confirmation could not be opened.");
    }
  }

  async function approve() {
    setPending("approve");
    setError("");
    try {
      await approvePayment({ data: { id } });
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The payment could not be approved.");
      setPending("");
    }
  }

  async function reject() {
    if (!window.confirm("Reject this wire confirmation? The client is asked to upload another file.")) return;
    setPending("reject");
    setError("");
    try {
      await rejectPayment({ data: { id } });
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The confirmation could not be rejected.");
      setPending("");
    }
  }

  return (
    <div className="mt-3 border-t border-border pt-3 text-sm">
      <p className="text-fg">Wire confirmation: {name}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 font-semibold text-primary" onClick={() => void open()}>
          View confirmation
        </button>
        {canReview ? (
          <>
            <button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 font-semibold text-on-primary disabled:opacity-60" disabled={pending !== ""} onClick={() => void approve()}>
              {pending === "approve" ? "Approving…" : "Approve payment"}
            </button>
            <button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 font-semibold text-danger disabled:opacity-60" disabled={pending !== ""} onClick={() => void reject()}>
              {pending === "reject" ? "Rejecting…" : "Reject file"}
            </button>
          </>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-danger">{error}</p> : null}
    </div>
  );
}

function LeadsPanel() {
  const brand = useBrand();
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [terms, setTerms] = useState<CdTerm[]>([]);
  const [offer, setOffer] = useState<PromoOffer | null>(null);
  const [advisorId, setAdvisorId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copy, setCopy] = useState<LeadCopy | null>(null);
  const [kind, setKind] = useState<"rates" | "custom" | "promo">("rates");
  const [termMonths, setTermMonths] = useState("");
  const [appCopy, setAppCopy] = useState<ApplicationCopy | null>(null);
  const [promoCode] = useState(() => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    return `CD${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
  });
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    void Promise.all([listAdvisors(), getCdTerms(), getPromo()])
      .then(([people, nextTerms, promo]) => {
        setAdvisors(people);
        setTerms(nextTerms);
        setOffer(promo);
      })
      .catch(() => setError("Lead email could not be prepared."));
  }, []);

  const advisor = advisors.find((item) => item.id === advisorId);
  const protection = offer?.protection.trim() || "";
  const standard = defaultLeadCopy({
    leadName: name.trim() || "Client",
    company: brand.companyName,
    advisorName: advisor?.name,
    offerIntro: offer?.intro,
    protection,
  });
  const letterCopy = copy ?? standard;
  const promoSet = new Set(promoMonths(offer ?? { intro: "", protection: "", finePrint: "", startsOn: "", endsOn: "", tiers: [] }));
  const termChoices = terms.filter((term) => (kind === "promo" ? promoSet.has(term.months) : kind === "custom" ? !promoSet.has(term.months) : false));
  const selectedTerm = termChoices.find((term) => String(term.months) === termMonths) ?? termChoices[0];
  const variant = kind === "promo" ? "promo" : "custom";
  const appStandard = {
    ...defaultApplicationCopy({
      leadName: name.trim() || "Client",
      company: brand.companyName,
      months: selectedTerm?.months ?? 0,
      advisorName: advisor?.name,
      variant,
    }),
    promoCode: kind === "promo" ? promoCode : "",
  };
  const applicationCopy = appCopy ?? appStandard;
  const previewOrigin = /^https?:\/\//i.test(brand.publicDomain.trim()) ? brand.publicDomain.trim().replace(/\/$/, "") : origin;
  const previewLink = previewOrigin ? `${previewOrigin}/application?invite=preview` : "";
  const ratesLetter = offer
    ? leadLetter({
        leadName: name.trim() || "there",
        company: brand.companyName,
        terms,
        offer,
        advisor,
        logo: brand.emailLogo,
        portalUrl: brand.publicDomain,
        copy: letterCopy,
      })
    : null;
  const formLetter = offer && selectedTerm
    ? applicationLetter({
        leadName: name.trim() || "there",
        company: brand.companyName,
        months: selectedTerm.months,
        apy: selectedTerm.apy,
        offer,
        advisor,
        logo: brand.emailLogo,
        portalUrl: brand.publicDomain,
        link: previewLink,
        variant,
        copy: applicationCopy,
      })
    : null;
  const letter = kind === "rates" ? ratesLetter : formLetter;
  const preview = letter
    ? renderStep(kind === "promo" ? "lead_promo" : kind === "custom" ? "lead_application" : "lead_intro", "client", {
        name: name.trim() || "there",
        email: email.trim() || "lead@example.com",
        detail: letter.text,
        companyName: brand.companyName,
        emailLogo: brand.emailLogo,
        portalUrl: brand.publicDomain,
        extraHtml: letter.html,
      })
    : null;
  const subject = kind === "rates" ? letterCopy.subject : applicationCopy.subject;

  async function send(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);
    try {
      if (kind !== "rates") {
        if (!selectedTerm) throw new Error(kind === "promo" ? "Choose a promotional term." : "Choose a term that is not on promotion.");
        await sendLeadApplication({ data: { advisorId, name, email, months: selectedTerm.months, kind, copy: applicationCopy } });
        setNotice(`${kind === "promo" ? "Promotional" : "Custom term"} email sent to ${email.trim()}. The link expires in 24 hours.`);
        setAppCopy(null);
      } else {
        await sendLeadIntro({ data: { advisorId, name, email, copy: letterCopy } });
        setNotice(`Intro sent to ${email.trim()}.`);
        setCopy(null);
      }
      setName("");
      setEmail("");
      setEditing(false);
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "The email could not be sent.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Lead emails</h1>
      <p className="mt-2 max-w-2xl text-fg">Send the rates introduction, a custom-term application, or a promotional application. Application links expire after 24 hours. A reminder goes out about two hours before then.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {([["rates", "Rates introduction"], ["custom", "Custom term"], ["promo", "Promo term"]] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={"min-h-11 rounded-md border px-3 py-2 text-sm font-semibold " + (kind === id ? "border-action bg-action text-on-primary" : "border-border text-primary")}
            onClick={() => {
              setKind(id);
              setEditing(false);
              setAppCopy(null);
              setTermMonths("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}
      <form className="mt-6 grid max-w-3xl gap-3" onSubmit={(event) => void send(event)}>
        <label className="block text-sm">
          <span className="font-semibold text-primary">Advisor</span>
          <select className={`${controlClass} mt-1`} value={advisorId} onChange={(event) => { setAdvisorId(event.target.value); setCopy(null); }}>
            <option value="">Select an advisor</option>
            {advisors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.email ? ` · ${item.email}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-primary">Lead name</span>
          <input className={`${controlClass} mt-1`} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        {kind !== "rates" ? (
          <label className="block text-sm">
            <span className="font-semibold text-primary">{kind === "promo" ? "Promotional term" : "Custom term"}</span>
            <select className={`${controlClass} mt-1`} value={selectedTerm ? String(selectedTerm.months) : ""} onChange={(event) => { setTermMonths(event.target.value); setAppCopy(null); }}>
              {termChoices.length === 0 ? <option value="">No terms in this group</option> : null}
              {termChoices.map((term) => (
                <option key={term.id} value={term.months}>
                  {term.months}-month · {term.apy}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-sm">
          <span className="font-semibold text-primary">Lead email</span>
          <input type="email" className={`${controlClass} mt-1`} value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        {preview ? (
          <div className="mt-2 overflow-hidden rounded-xl border border-border bg-[#e8e8e8] shadow-sm">
            <div className="border-b border-border bg-white px-5 py-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-widest text-[#8c8c8c] uppercase">Letter preview</p>
                <button
                  type="button"
                  className="min-h-9 rounded-md border border-border px-3 text-sm font-semibold text-primary"
                  onClick={() => {
                    if (kind !== "rates") setAppCopy((current) => current ?? appStandard);
                    else setCopy((current) => current ?? standard);
                    setEditing((open) => !open);
                  }}
                >
                  {editing ? "Hide editor" : "Edit text"}
                </button>
              </div>
              <p className="mt-3"><span className="inline-block w-14 text-[#8c8c8c]">From</span>{advisor?.name || brand.companyName}{advisor?.email ? ` <${advisor.email}>` : ""}</p>
              <p className="mt-1"><span className="inline-block w-14 text-[#8c8c8c]">To</span>{name.trim() || "Lead"}{email.trim() ? ` <${email.trim()}>` : ""}</p>
              <p className="mt-1 font-semibold text-primary"><span className="inline-block w-14 font-normal text-[#8c8c8c]">Subject</span>{subject}</p>
            </div>
            {editing && kind === "rates" ? (
              <div className="grid gap-3 border-b border-border bg-white px-5 py-4">
                <LetterField label="Subject" value={letterCopy.subject} onChange={(next) => setCopy({ ...letterCopy, subject: next })} />
                <LetterField label="Headline" value={letterCopy.headline} onChange={(headline) => setCopy({ ...letterCopy, headline })} />
                <LetterField label="Welcome" value={letterCopy.welcome} onChange={(welcome) => setCopy({ ...letterCopy, welcome })} rows={4} />
                <LetterField label="Certificate" value={letterCopy.certificate} onChange={(certificate) => setCopy({ ...letterCopy, certificate })} rows={3} />
                <LetterField label="Promotional offer" value={letterCopy.offer} onChange={(next) => setCopy({ ...letterCopy, offer: next })} rows={3} />
                <LetterField label="FDIC coverage" value={letterCopy.protection} onChange={(next) => setCopy({ ...letterCopy, protection: next })} rows={3} />
                <LetterField label="Ready to get started" value={letterCopy.ready} onChange={(ready) => setCopy({ ...letterCopy, ready })} rows={3} />
                <LetterField label="Thank you" value={letterCopy.thanks} onChange={(thanks) => setCopy({ ...letterCopy, thanks })} rows={3} />
                <button type="button" className="w-fit text-sm font-semibold text-action" onClick={() => setCopy(null)}>
                  Restore the standard text
                </button>
              </div>
            ) : null}
            {editing && kind !== "rates" ? (
              <div className="grid gap-3 border-b border-border bg-white px-5 py-4">
                <LetterField label="Subject" value={applicationCopy.subject} onChange={(next) => setAppCopy({ ...applicationCopy, subject: next })} />
                <LetterField label="Headline" value={applicationCopy.headline} onChange={(headline) => setAppCopy({ ...applicationCopy, headline })} />
                <LetterField label="Opening" value={applicationCopy.hope} onChange={(hope) => setAppCopy({ ...applicationCopy, hope })} />
                <LetterField label="Application is ready" value={applicationCopy.ready} onChange={(ready) => setAppCopy({ ...applicationCopy, ready })} rows={3} />
                <LetterField label="Button instruction" value={applicationCopy.instruction} onChange={(instruction) => setAppCopy({ ...applicationCopy, instruction })} rows={2} />
                {kind === "promo" ? <LetterField label="Promotional code" value={applicationCopy.promoCode} onChange={(next) => setAppCopy({ ...applicationCopy, promoCode: next })} /> : null}
                <LetterField label="Code note" value={applicationCopy.codeNote} onChange={(codeNote) => setAppCopy({ ...applicationCopy, codeNote })} rows={2} />
                <LetterField label="Follow up" value={applicationCopy.followUp} onChange={(followUp) => setAppCopy({ ...applicationCopy, followUp })} rows={3} />
                <LetterField label="Thank you" value={applicationCopy.thanks} onChange={(thanks) => setAppCopy({ ...applicationCopy, thanks })} rows={2} />
                <button type="button" className="w-fit text-sm font-semibold text-action" onClick={() => setAppCopy(null)}>
                  Restore the standard text
                </button>
              </div>
            ) : null}
            <iframe title="Letter preview" sandbox="" className="h-[1100px] w-full bg-[#f2f5f8]" srcDoc={preview.html} />
          </div>
        ) : null}
        <button type="submit" className="min-h-11 w-fit rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending}>
          {pending ? "Sending…" : kind === "promo" ? "Send promo email" : kind === "custom" ? "Send custom term email" : "Send intro"}
        </button>
      </form>
    </section>
  );
}

function LetterField({ label, value, onChange, rows = 1 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-primary">{label}</span>
      {rows > 1 ? (
        <textarea className={`${controlClass} mt-1 min-h-20`} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={`${controlClass} mt-1`} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function AdvisorsPanel() {
  const [rows, setRows] = useState<Advisor[] | null>(null);
  const [draft, setDraft] = useState<Advisor>({ id: "", name: "", phone: "", email: "", mailbox: "" });
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
      setDraft({ id: "", name: "", phone: "", email: "", mailbox: "" });
      await load();
      setNotice("Advisor saved.");
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "Could not save this advisor.");
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
      <p className="mt-2 text-fg">Assign one of these advisors when a client investment needs a call. The verified mailbox is the SMTP2GO address that advisor’s letters are sent from.</p>
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
                {advisor.mailbox ? ` · ${advisor.mailbox}` : " · No verified mailbox"}
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
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Verified mailbox</span>
          <input className={controlClass} value={draft.mailbox} placeholder="advisor@yourdomain.com" onChange={(event) => setDraft({ ...draft, mailbox: event.target.value })} />
          <span className="mt-1 block text-sm text-fg">SMTP2GO address this advisor’s letters are sent from. It must already be verified there.</span>
        </label>
        <div className="flex items-end">
          <button type="submit" className="min-h-11 rounded-md bg-action px-4 py-2 font-semibold text-on-primary">
            Save advisor
          </button>
        </div>
      </form>
    </section>
  );
}

function ClientsPanel({ rows, onStatus, onRemove }: { rows: ApplicationRow[]; onStatus: (id: string, status: ApplicationRow["status"]) => void; onRemove: (id: string) => void }) {
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
      {selected ? <ApplicationDetail row={selected} onStatus={(status) => onStatus(selected.id, status)} onRemove={() => onRemove(selected.id)} /> : null}
    </section>
  );
}

const DESK_MENU = [
  {
    label: "Pipeline",
    items: [
      { id: "dashboard", label: "Dashboard" },
      { id: "applications", label: "Applications" },
    ],
  },
  {
    label: "Certificates",
    items: [
      { id: "funding", label: "Investments" },
      { id: "active", label: "Active CDs" },
      { id: "invoices", label: "Invoices" },
    ],
  },
  {
    label: "Desk",
    items: [
      { id: "clients", label: "Clients" },
      { id: "advisors", label: "Advisors" },
      { id: "leads", label: "Lead emails" },
      { id: "mail-status", label: "Email status" },
    ],
  },
  {
    label: "Settings",
    items: [
      { id: "settings-general", label: "General" },
      { id: "settings-logos", label: "Logos" },
      { id: "settings-misc", label: "Misc" },
      { id: "emails", label: "Email templates" },
    ],
  },
  {
    label: "Pricing",
    items: [{ id: "investments", label: "Rates and promo" }],
  },
] as const;

function DeskNav({
  tab,
  onSelect,
}: {
  tab: (typeof DESK_MENU)[number]["items"][number]["id"];
  onSelect: (id: (typeof DESK_MENU)[number]["items"][number]["id"]) => void;
}) {
  return (
    <nav className="grid content-start gap-6" aria-label="Desk">
      {DESK_MENU.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[11px] font-semibold tracking-widest text-[#8c8c8c] uppercase">{group.label}</p>
          <ul className="mt-1 grid gap-0.5">
            {group.items.map((item) => (
              <li key={item.id}>
                <TabButton active={tab === item.id} onClick={() => onSelect(item.id)}>
                  {item.label}
                </TabButton>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      className={
        "min-h-10 w-full rounded-lg px-3 py-2 text-left text-sm " +
        (active ? "bg-[#e8f4ff] font-semibold text-action" : "font-medium text-primary hover:bg-white")
      }
      aria-current={active ? "page" : undefined}
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

function ApplicationDetail({ row, onStatus, onRemove }: { row: ApplicationRow; onStatus: (status: ApplicationRow["status"]) => void; onRemove: () => void }) {
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
    ["Preferred amount", form.preferredAmount],
    ["Preferred term", form.preferredTerm ? `${form.preferredTerm}-month` : ""],
    ["Promotional code", form.promoCode],
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
          <button type="button" className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-danger" onClick={onRemove}>
            Remove
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
