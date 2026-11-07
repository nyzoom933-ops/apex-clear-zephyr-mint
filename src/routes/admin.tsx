// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Check, ChevronDown, Menu, X } from "lucide-react";
import { headerActionClass, SiteHeader, useBrand } from "@/components/site-header";
import { advisorNoteLetter } from "@/lib/email-templates";
import {
  adminLogin,
  adminLogout,
  deleteAdvisor,
  createDeskLogin,
  getAdminSession,
  getMailSetup,
  approvePayment,
  rejectPayment,
  getPaymentFile,
  listAdvisors,
  listApplications,
  listCrmLeads,
  listIntroOpens,
  listInboxMessages,
  syncInboxNow,
  markInboxMessageRead,
  previewAdvisorInboxMail,
  sendAdvisorInboxMail,
  listFundings,
  listNotifications,
  syncMailStatuses,
  saveAdvisor,
  saveCdTerms,
  saveCrmLead,
  saveInvestmentType,
  savePromo,
  setApplicationStatus,
  deleteApplication,
  deleteCrmLead,
  deleteFunding,
  clearDatabase,
  signInAsClient,
  setSiteBrand,
  runDatabaseBackup,
  saveMailSetup,
  saveSmtpSetup,
  saveTelegramSetup,
  lookupTelegramChats,
  setDeskSwitch,
  sendTelegramTest,
  saveDeskLogin,
  sendLeadIntro,
  sendLeadExtension,
  sendLeadHtr,
  sendLeadApplication,
  updateFunding,
  downloadInvoicePdf,
  saveInvoiceBilling,
  approveInvoice,
  getCdTerms,
  getInvestmentTypes,
  getPromo,
  DEFAULT_THEME,
} from "@/lib/admin.functions";
import { formatBonus, matchTier, parseApy, promoMonths } from "@/lib/promo";
import { applicationLetter, defaultApplicationCopy, defaultExtensionCopy, defaultHtrCopy, defaultLeadCopy, extensionLetter, htrLetter, leadLetter, renderStep, templateCatalog } from "@/lib/email-templates";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Operations · Account Holding" }] }),
  component: AdminPage,
});

var controlClass = "w-full rounded-md border border-border bg-surface px-3.5 py-3 text-base text-fg outline-none focus:border-primary";
function AdminPage() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    getAdminSession().then(next => setSession(next)).catch(() => setSession({
      signedIn: false,
      needsSetup: false
    }));
  }, []);
  if (session === null) return <main className="mx-auto max-w-md px-6 py-24 text-center text-sm text-fg">Checking the desk…</main>;
  if (!session.signedIn) return <AdminLogin needsSetup={session.needsSetup} onSuccess={() => setSession({
    signedIn: true,
    needsSetup: false
  })} />;
  return <Cabinet onSignOut={() => setSession({
    signedIn: false,
    needsSetup: false
  })} />;
}
function AdminLogin({
  needsSetup,
  onSuccess
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (needsSetup && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      if (needsSetup) await createDeskLogin({
        data: {
          email,
          password
        }
      });else await adminLogin({
        data: {
          email,
          password
        }
      });
      onSuccess();
    } catch {
      setError(needsSetup ? "The desk login could not be created." : "Those credentials are not recognized.");
    } finally {
      setPending(false);
    }
  }
  return <div className="min-h-screen"><SiteHeader eyebrow="Operations" action={null} /><main className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-md flex-col justify-center px-4 py-10"><div className="rounded-lg border border-border bg-surface px-6 py-10 shadow-sm"><h1 className="text-4xl font-semibold tracking-tight">{needsSetup ? "Create the desk login" : "Admin sign in"}</h1><p className="mt-2 text-fg">{needsSetup ? "This server has no desk password yet. Create one before reviewing applications." : "Enter the desk credentials to review investor applications."}</p><form className="mt-8 grid gap-5" onSubmit={onSubmit}><label className="block"><span className="mb-1.5 block text-sm font-medium">Email address</span><input required={true} type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} className={controlClass} /></label><label className="block"><span className="mb-1.5 block text-sm font-medium">Password</span><div className="relative"><input required={true} type={showPassword ? "text" : "password"} autoComplete={needsSetup ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} className={controlClass + " pr-16"} /><button type="button" className="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-semibold text-primary" onClick={() => setShowPassword(value => !value)}>{showPassword ? "Hide" : "Show"}</button></div></label>{needsSetup ? <label className="block"><span className="mb-1.5 block text-sm font-medium">Confirm password</span><input required={true} type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} className={controlClass} /></label> : null}{error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}<button type="submit" disabled={pending} className="min-h-12 rounded-md bg-action py-3 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60">{pending ? "Saving…" : needsSetup ? "Create login" : "Sign in"}</button></form></div></main></div>;
}
function Cabinet({
  onSignOut
}) {
  const [tab, setTab] = useState("dashboard");
  const [emailFocus, setEmailFocus] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [mailReady, setMailReady] = useState(true);
  async function refresh() {
    const next = await listApplications();
    setRows(next);
    setSelectedId(current => current && next.some(row => row.id === current) ? current : next[0]?.id ?? null);
  }
  useEffect(() => {
    refresh().catch(() => setError("Applications could not be loaded."));
    getMailSetup().then(setup => setMailReady(setup.hasKey)).catch(() => setMailReady(false));
  }, []);
  const stats = useMemo(() => {
    const list = rows ?? [];
    return {
      total: list.length,
      pending: list.filter(row => row.status === "pending").length,
      approved: list.filter(row => row.status === "approved").length,
      hold: list.filter(row => row.status === "hold").length
    };
  }, [rows]);
  const applications = rows ?? [];
  const clients = applications.filter(row => row.status === "approved");
  const visible = applications.filter(row => filter === "all" || row.status === filter);
  const selected = visible.find(row => row.id === selectedId) ?? null;
  async function signOut() {
    await adminLogout();
    onSignOut();
  }
  async function removeApplication(id) {
    if (!window.confirm("Remove this client? The application, investments, and invoices will be deleted. No email will be sent.")) return;
    setError("");
    setNotice("");
    try {
      await deleteApplication({
        data: {
          id
        }
      });
      setNotice("Client removed. The application, investments, and invoices were deleted. No email was sent.");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The application could not be removed.");
    }
  }
  async function updateStatus(id, status) {
    setError("");
    setNotice("");
    try {
      const result = await setApplicationStatus({
        data: {
          id,
          status
        }
      });
      if (result.loginEmail) setNotice(`Sign-in created for ${result.loginEmail}.`);else if (status !== "approved") setNotice("Investor sign-in removed.");
      await refresh();
    } catch {
      setError("Could not update this application. A login needs the password from the form.");
    }
  }
  return <div className="min-h-screen"><SiteHeader eyebrow="Operations desk" action={<button type="button" className={headerActionClass} onClick={() => void signOut()}>Sign out</button>} /><div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]"><div className="hidden lg:block"><DeskNav tab={tab} onSelect={setTab} /></div><div className="min-w-0"><div className="mb-4 lg:hidden"><button type="button" className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3" aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(true)}><span className="text-sm font-semibold text-primary">{DESK_MENU.flatMap(group => group.items).find(item => item.id === tab)?.label}</span><Menu className="size-5 text-primary" aria-hidden="true" /></button></div>{menuOpen ? <div className="fixed inset-0 z-40 lg:hidden"><button type="button" className="absolute inset-0 bg-primary/30" aria-label="Close menu" onClick={() => setMenuOpen(false)} /><div className="absolute inset-y-0 left-0 w-[min(100%,280px)] overflow-y-auto bg-surface p-4 shadow-xl"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold text-primary">Desk</p><button type="button" className="flex size-11 items-center justify-center rounded-lg border border-border" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X className="size-5" /></button></div><DeskNav tab={tab} onSelect={id => {
              setTab(id);
              setMenuOpen(false);
            }} /></div></div> : null}{mailReady ? null : <p className="mb-4 rounded-md border border-border bg-surface px-4 py-3 text-sm text-fg">Mail is not sending yet. Open Settings and save a Resend API key and from address. Logos, the company name, and the backup email from the preview also need to be entered again on this server.</p>}{error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}{notice ? <p className="mb-4 text-sm text-fg">{notice}</p> : null}{tab === "dashboard" ? <section><h1 className="text-3xl font-semibold">Dashboard</h1><p className="mt-2 text-fg">Investor applications waiting on the compliance desk.</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><Stat label="Submitted" value={stats.total} /><Stat label="Pending" value={stats.pending} /><Stat label="Approved" value={stats.approved} /></div><h2 className="mt-8 text-lg font-semibold text-primary">Latest submissions</h2><ApplicationTable rows={(rows ?? []).slice(0, 5)} selectedId={selectedId} onSelect={id => {
            setSelectedId(id);
            const row = (rows ?? []).find(item => item.id === id);
            setTab(row?.status === "approved" ? "clients" : "applications");
          }} /></section> : tab === "applications" ? <section><h1 className="text-3xl font-semibold">Submitted applications</h1><p className="mt-2 text-fg">Select a row to open the full application, including the identity and address documents.</p><div className="mt-4 flex flex-wrap gap-2">{["all", "pending", "approved", "hold"].map(key => <button key={key} type="button" className={"min-h-11 rounded-md border px-3 py-2 text-sm font-semibold " + (filter === key ? "border-action bg-action text-on-primary" : "border-border text-primary")} onClick={() => setFilter(key)}>{key === "all" ? "All" : key === "hold" ? "On hold" : key[0].toUpperCase() + key.slice(1)}</button>)}</div><ApplicationTable rows={visible} selectedId={selectedId} onSelect={setSelectedId} />{selected ? <ApplicationDetail row={selected} onStatus={status => void updateStatus(selected.id, status)} onRemove={() => void removeApplication(selected.id)} /> : null}</section> : tab === "pipeline-leads" ? <PipelineLeadsPanel /> : tab === "pipeline-opens" ? <IntroOpensPanel onApplication={lead => {
            setEmailFocus({
              lead,
              kind: "custom"
            });
            setTab("leads");
          }} /> : tab === "clients" ? <ClientsPanel rows={clients} onStatus={(id, status) => void updateStatus(id, status)} onRemove={id => void removeApplication(id)} /> : tab === "investments" ? <RatesAndPromo /> : tab === "funding" ? <FundingDesk /> : tab === "active" ? <ActiveCdsDesk /> : tab === "invoices" ? <InvoicesDesk /> : tab === "advisors" ? <AdvisorsPanel /> : tab === "inbox" ? <InboxPanel /> : tab === "leads" ? <LeadsPanel focus={emailFocus} onFocusUsed={() => setEmailFocus(null)} /> : tab === "mail-status" ? <MailStatusPanel /> : tab === "emails" ? <EmailsPanel /> : tab === "settings-logos" ? <SettingsPanel section="logos" /> : tab === "settings-appearance" ? <SettingsPanel section="appearance" /> : tab === "settings-misc" ? <SettingsPanel section="misc" /> : <SettingsPanel section="general" />}</div></div></div>;
}
function LetterPreview({
  html,
  title,
  height = "h-[640px]",
  meta
}) {
  const frame = useRef(null);
  const [status, setStatus] = useState("");
  return <div className="mt-2 overflow-hidden rounded-xl border border-border bg-[#e8e8e8] shadow-sm">
    <div className="border-b border-border bg-white px-5 py-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-widest text-[#8c8c8c] uppercase">Letter preview</p>
        <button type="button" className="min-h-9 rounded-md border border-border px-3 text-sm font-semibold text-primary" onClick={() => void copyLetterImage(frame.current, setStatus)}>Copy screenshot</button>
      </div>
      {status ? <p className="mt-2 text-sm text-fg">{status}</p> : null}
      {meta}
    </div>
    <iframe ref={frame} title={title || "Letter preview"} sandbox="allow-same-origin" className={height + " w-full bg-[#f2f5f8]"} srcDoc={html} />
  </div>;
}
async function copyLetterImage(frame, setStatus) {
  setStatus("Copying…");
  try {
    const doc = frame?.contentDocument;
    const root = doc?.body;
    if (!root) throw new Error("The preview is not ready.");
    const width = Math.max(root.scrollWidth, doc.documentElement.scrollWidth, 640);
    const host = document.createElement("div");
    host.style.cssText = `position:fixed;left:0;top:0;width:${width}px;z-index:-1;pointer-events:none;background:#f2f5f8;`;
    const style = doc.querySelector("style");
    if (style) host.appendChild(style.cloneNode(true));
    const inner = document.createElement("div");
    inner.innerHTML = root.innerHTML;
    host.appendChild(inner);
    document.body.appendChild(host);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(host, {
        backgroundColor: "#f2f5f8",
        scale: 2,
        width,
        windowWidth: width,
        useCORS: true
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not make the image.");
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") throw new Error("Copy the image from an HTTPS address. This page is not a secure page.");
      await navigator.clipboard.write([new ClipboardItem({
        "image/png": blob
      })]);
      setStatus("Screenshot copied.");
    } finally {
      host.remove();
    }
  } catch (caught) {
    setStatus(caught instanceof Error && caught.message ? caught.message : "Could not copy the screenshot.");
  }
}
function EmailsPanel() {
  const [rows, setRows] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [signatureId, setSignatureId] = useState("");
  const [error, setError] = useState("");
  const [audience, setAudience] = useState("all");
  const [origin, setOrigin] = useState("");
  const brand = useBrand();
  const signature = advisors.find(item => item.id === signatureId) ?? advisors[0];
  const templates = templateCatalog(brand.companyName, brand.emailLogo, brand.publicDomain || origin, signature, brand.companyPhone).filter(item => audience === "all" || item.audience === audience);
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  useEffect(() => {
    listNotifications().then(setRows).catch(() => setError("Emails could not be loaded."));
    listAdvisors().then(people => {
      setAdvisors(people);
      setSignatureId(current => current || people[people.length - 1]?.id || "");
    }).catch(() => void 0);
  }, []);
  const visible = (rows ?? []).filter(row => audience === "all" || row.audience === audience);
  return <section><h1 className="text-3xl font-semibold">Email templates</h1><p className="mt-2 max-w-2xl text-fg">Client letters are email. Desk copies of those steps are sent to Telegram. Lead letters sign off with the advisor you select.</p><label className="mt-4 block max-w-md text-sm"><span className="font-semibold text-primary">Signature</span><select className={`${controlClass} mt-1`} value={signature?.id ?? ""} onChange={event => setSignatureId(event.target.value)}>{advisors.length === 0 ? <option value="">No advisors yet</option> : null}{advisors.map(item => <option key={item.id} value={item.id}>{item.name}{item.role ? ` · ${item.role}` : ""}{item.email ? ` · ${item.email}` : ""}</option>)}</select></label><div className="mt-4 flex flex-wrap gap-2">{["all", "client", "admin"].map(key => <button key={key} type="button" className={"min-h-11 rounded-md border px-3 py-2 text-sm font-semibold " + (audience === key ? "border-action bg-action text-on-primary" : "border-border text-primary")} onClick={() => setAudience(key)}>{key === "all" ? "All" : key === "client" ? "Client" : "Admin"}</button>)}</div><ul className="mt-4 grid gap-4">{templates.map(item => <li key={`${item.step}-${item.audience}`} className="rounded-md border border-border bg-surface px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-action">{item.audience === "admin" ? "Desk" : "Client"} · {item.label}</p><p className="mt-1 font-semibold text-primary">{item.subject}</p><LetterPreview html={item.html} title={item.subject} height="h-[640px]" /></li>)}</ul><h2 className="mt-8 text-lg font-semibold text-primary">Sent</h2>{error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}{rows && visible.length === 0 ? <p className="mt-4 text-sm text-fg">No emails yet. They appear as applications and certificates move forward.</p> : null}<ul className="mt-4 grid gap-3">{visible.map(row => <li key={row.id} className="rounded-md border border-border bg-surface px-4 py-3"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-semibold text-primary">{row.subject}</p><p className="text-xs text-fg">{row.createdAt} UTC · {row.delivery === "sent" ? "Sent" : row.delivery === "failed" ? "Not delivered" : "Logged"}</p></div><p className="mt-1 text-sm text-fg">{row.audience === "admin" ? "Admin" : "Client"} · {row.recipient}</p>{row.html ? <LetterPreview html={row.html} title={row.subject} height="h-72" /> : <p className="mt-2 whitespace-pre-wrap text-sm text-fg">{row.body}</p>}</li>)}</ul></section>;
}
var MAIL_STATUS_LABEL = {
  opened: "Opened",
  clicked: "Clicked",
  delivered: "Delivered",
  sent: "Sent",
  bounced: "Bounced",
  complained: "Complained",
  delivery_delayed: "Delayed"
};
function inviteExpiry(expiresAt, usedAt) {
  if (!expiresAt) return "—";
  if (usedAt) return "Used";
  const remaining = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(remaining) || remaining <= 0) return "Expired";
  const hours = Math.floor(remaining / 36e5);
  const minutes = Math.floor(remaining % 36e5 / 6e4);
  if (hours >= 1) return `Expires in ${hours}h ${minutes}m`;
  return `Expires in ${Math.max(minutes, 1)}m`;
}
function MailStatusPanel() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  function load() {
    return listNotifications().then(setRows);
  }
  useEffect(() => {
    load().catch(() => setError("Email status could not be loaded."));
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
  return <section><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-semibold">Email status</h1><p className="mt-2 max-w-2xl text-fg">Advisor letters are sent through SMTP2GO, which records when they are opened. Other desk mail still uses Resend. Sync after the recipient has had time to open the letter.</p></div><button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending} onClick={() => void sync()}>{pending ? "Syncing…" : "Sync status"}</button></div>{error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}{notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}<div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface"><table className="w-full min-w-[980px] text-left text-sm"><thead className="border-b border-border text-xs tracking-wide text-primary uppercase"><tr><th className="px-4 py-3 font-semibold">When</th><th className="px-4 py-3 font-semibold">To</th><th className="px-4 py-3 font-semibold">Subject</th><th className="px-4 py-3 font-semibold">Sent</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Opened</th><th className="px-4 py-3 font-semibold">Link</th><th className="px-4 py-3 font-semibold">Expires</th></tr></thead><tbody>{(rows ?? []).map(row => {
            const opened = row.mailStatus === "opened" || row.mailStatus === "clicked";
            const expiry = inviteExpiry(row.expiresAt, row.usedAt);
            return <tr key={row.id} className="border-b border-border last:border-0"><td className="px-4 py-3 whitespace-nowrap">{row.createdAt} UTC</td><td className="px-4 py-3"><span className="block">{row.recipient}</span><span className="text-xs text-[#8c8c8c]">{row.mailProvider === "telegram" ? "Telegram" : row.audience === "admin" ? "Desk" : "Client"}</span></td><td className="px-4 py-3">{row.subject}</td><td className="px-4 py-3">{row.delivery === "sent" ? "Sent" : row.delivery === "failed" ? "Failed" : "Logged"}</td><td className="px-4 py-3">{MAIL_STATUS_LABEL[row.mailStatus] || (row.resendId ? "Waiting" : "Not tracked")}</td><td className="px-4 py-3">{opened ? <span className="font-semibold text-[#0d6e4f]">Opened</span> : "—"}</td><td className="px-4 py-3">{row.link ? <a className="block max-w-[220px] truncate font-semibold text-action" href={row.link} title={row.link} target="_blank" rel="noreferrer">{row.link.replace(/^https?:\/\/[^/]+/, "")}</a> : "—"}</td><td className={"px-4 py-3 whitespace-nowrap " + (expiry === "Expired" ? "font-semibold text-danger" : "")}>{expiry}</td></tr>;
          })}</tbody></table>{rows && rows.length === 0 ? <p className="px-4 py-6 text-sm text-fg">No emails yet.</p> : null}</div></section>;
}
function newRowId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    // A plain http:// address is not a secure context, so randomUUID throws.
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
function alignPromoTerms(offer, terms) {
  const allowed = new Set((terms ?? []).map(term => Number(term.months)).filter(month => month > 0));
  return {
    ...offer,
    tiers: offer.tiers.map(tier => ({
      ...tier,
      months: tier.months.filter(month => allowed.has(Number(month)))
    }))
  };
}
function RatesAndPromo() {
  const [terms, setTerms] = useState(null);
  return <div className="grid gap-12"><InvestmentTypesPanel onTerms={setTerms} /><PromoPanel terms={terms} /></div>;
}
function InvestmentTypesPanel({
  onTerms
}) {
  const [draft, setDraft] = useState(null);
  const [terms, setTerms] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    Promise.all([getInvestmentTypes(), getCdTerms()]).then(([next, nextTerms]) => {
      setDraft(next[0] ?? null);
      setTerms(nextTerms);
      onTerms?.(nextTerms);
    }).catch(() => setError("Certificates could not be loaded."));
  }, []);
  function patch(key, value) {
    setDraft(current => current ? {
      ...current,
      [key]: value
    } : current);
  }
  async function save() {
    if (!draft) return;
    setPending(true);
    setNotice("");
    setError("");
    try {
      await saveInvestmentType({
        data: draft
      });
      await saveCdTerms({
        data: terms
      });
      const [next, nextTerms] = await Promise.all([getInvestmentTypes(), getCdTerms()]);
      setDraft(next[0] ?? draft);
      setTerms(nextTerms);
      onTerms?.(nextTerms);
      setNotice("Certificate saved. Promotional offers now use these terms.");
    } catch {
      setError("Could not save this certificate.");
    } finally {
      setPending(false);
    }
  }
  return <section><h1 className="text-3xl font-semibold">Certificates of deposit</h1><p className="mt-2 text-fg">Investors browse these terms when they fund a certificate.</p><div className="mt-6 rounded-lg border border-border bg-surface p-5"><h2 className="text-sm font-semibold tracking-widest text-primary uppercase">Available terms</h2><div className="mt-4 grid gap-3">{terms.map(term => <div key={term.id} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_120px_auto_auto] sm:items-center"><AdminField label="APY" value={term.apy} onChange={value => setTerms(current => current.map(item => item.id === term.id ? {
            ...item,
            apy: value
          } : item))} /><AdminField label="Months" value={String(term.months)} onChange={value => setTerms(current => current.map(item => item.id === term.id ? {
            ...item,
            months: Number(value) || 0
          } : item))} /><div className="flex min-h-11 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={term.featured} onChange={event => {
              const featured = event.currentTarget.checked;
              setTerms(current => current.map(item => item.id === term.id ? {
                ...item,
                featured
              } : item));
            }} />Featured</div><button type="button" className="min-h-11 text-sm font-semibold text-primary" onClick={() => setTerms(current => current.filter(item => item.id !== term.id))}>Remove</button></div>)}</div><button type="button" className="mt-4 text-sm font-semibold text-primary" onClick={() => setTerms(current => [...current, {
        id: newRowId(),
        apy: "",
        months: 12,
        featured: false
      }])}>Add term</button></div>{draft ? <div className="mt-6 grid gap-4 lg:grid-cols-2"><div className="rounded-lg border border-border bg-surface p-5"><h2 className="text-sm font-semibold tracking-widest text-primary uppercase">Certificate overview</h2><div className="mt-4 grid gap-4"><AdminField label="Issuer" value={draft.issuer} onChange={value => patch("issuer", value)} /><AdminField label="Structure" value={draft.structure} onChange={value => patch("structure", value)} /></div></div><div className="rounded-lg border border-border bg-surface p-5"><h2 className="text-sm font-semibold tracking-widest text-primary uppercase">Key terms</h2><div className="mt-4 grid gap-4"><AdminField label="Minimum investment" value={draft.minimumInvestment} onChange={value => patch("minimumInvestment", value)} /></div></div><label className="block rounded-lg border border-border bg-surface p-5 lg:col-span-2"><span className="mb-1.5 block text-sm font-medium">Capital protection</span><textarea className={controlClass + " min-h-24"} value={draft.capitalProtection} onChange={event => patch("capitalProtection", event.target.value)} /></label></div> : null}{error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}{notice ? <p className="mt-4 text-sm text-fg">{notice}</p> : null}<button type="button" disabled={pending || !draft} className="mt-6 min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60" onClick={() => void save()}>{pending ? "Saving…" : "Save"}</button></section>;
}
function PromoPanel({
  terms
}) {
  const [offer, setOffer] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [bonusDraft, setBonusDraft] = useState({});
  const termsRef = useRef(terms);
  termsRef.current = terms;
  useEffect(() => {
    getPromo().then(next => setOffer(termsRef.current ? alignPromoTerms(next, termsRef.current) : next)).catch(() => setError("The promotional offer could not be loaded."));
  }, []);
  useEffect(() => {
    if (!terms) return;
    setOffer(current => current ? alignPromoTerms(current, terms) : current);
  }, [terms]);
  function patchOffer(key, value) {
    setOffer(current => current ? {
      ...current,
      [key]: value
    } : current);
  }
  function patchTier(id, patch) {
    setOffer(current => current ? {
      ...current,
      tiers: current.tiers.map(tier => tier.id === id ? {
        ...tier,
        ...patch
      } : tier)
    } : current);
  }
  function toggleMonth(tier, month) {
    const months = tier.months.includes(month) ? tier.months.filter(item => item !== month) : [...tier.months, month].sort((a, b) => a - b);
    patchTier(tier.id, {
      months
    });
  }
  function setBonus(id, value) {
    if (!/^\d*\.?\d*$/.test(value)) return;
    setBonusDraft(current => ({
      ...current,
      [id]: value
    }));
    if (value === "" || value === ".") return;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) patchTier(id, {
      bonusPercent: parsed
    });
  }
  async function save() {
    if (!offer) return;
    setPending(true);
    setNotice("");
    setError("");
    try {
      const tiers = offer.tiers.map(tier => {
        const text = bonusDraft[tier.id];
        if (text == null) return tier;
        const parsed = Number(text);
        if (text === "" || text === "." || !Number.isFinite(parsed)) throw new Error("Enter a bonus percent, such as 0.75.");
        return {
          ...tier,
          bonusPercent: parsed
        };
      });
      await savePromo({
        data: {
          ...offer,
          tiers
        }
      });
      setBonusDraft({});
      setOffer(alignPromoTerms(await getPromo(), terms ?? []));
      setNotice("Promotional offer saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the promotional offer.");
    } finally {
      setPending(false);
    }
  }
  function addBand() {
    if (!terms || terms.length === 0) {
      setNotice("");
      setError("Add a certificate term above and save it before creating a promotional offer.");
      return;
    }
    setError("");
    setOffer(current => current ? {
      ...current,
      tiers: [...current.tiers, {
        id: newRowId(),
        minAmount: 100000,
        maxAmount: 174999,
        bonusPercent: 0.75,
        months: []
      }]
    } : current);
  }
  if (!offer) return <p className="text-sm text-fg">{error || "Opening the promotional offer…"}</p>;
  return <section><h2 className="text-2xl font-semibold text-primary">Promotional offers</h2><p className="mt-2 text-fg">Set the offer copy, dates, and which certificate terms earn a bonus at each amount.</p><div className="mt-6 grid gap-4 lg:grid-cols-2"><label className="block lg:col-span-2"><span className="mb-1.5 block text-sm font-medium">Introduction</span><textarea className={controlClass + " min-h-24"} value={offer.intro} onChange={event => patchOffer("intro", event.target.value)} /></label><AdminField label="Protection line" value={offer.protection} onChange={value => patchOffer("protection", value)} /><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-medium">Starts</span><input className={controlClass} type="date" value={offer.startsOn} onChange={event => patchOffer("startsOn", event.target.value)} /></label><label className="block"><span className="mb-1.5 block text-sm font-medium">Ends</span><input className={controlClass} type="date" value={offer.endsOn} onChange={event => patchOffer("endsOn", event.target.value)} /></label></div><label className="block lg:col-span-2"><span className="mb-1.5 block text-sm font-medium">Fine print</span><textarea className={controlClass + " min-h-20"} value={offer.finePrint} onChange={event => patchOffer("finePrint", event.target.value)} /></label></div><div className="mt-6 grid gap-4">{offer.tiers.map((tier, index) => <div key={tier.id} className="rounded-lg border border-border bg-surface p-4"><div className="grid gap-3 sm:grid-cols-[1fr_1fr_140px_auto] sm:items-end"><AdminField label="Minimum" value={String(tier.minAmount)} onChange={value => patchTier(tier.id, {
            minAmount: Number(value) || 0
          })} /><AdminField label="Maximum" value={tier.maxAmount == null ? "" : String(tier.maxAmount)} onChange={value => patchTier(tier.id, {
            maxAmount: value.trim() === "" ? null : Number(value) || 0
          })} /><AdminField label="Bonus %" value={bonusDraft[tier.id] ?? String(tier.bonusPercent)} onChange={value => setBonus(tier.id, value)} /><button type="button" className="min-h-11 text-sm font-semibold text-primary" onClick={() => setOffer({
            ...offer,
            tiers: offer.tiers.filter(item => item.id !== tier.id)
          })}>Remove</button></div><p className="mt-3 text-sm font-medium">Current terms for band {index + 1}</p><div className="mt-2 flex flex-wrap gap-3">{!terms ? <p className="text-sm text-fg">Loading certificate terms…</p> : terms.length === 0 ? <p className="text-sm text-fg">No certificate terms yet. Add one above and save the certificate.</p> : terms.map(term => <label key={term.id} className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={tier.months.map(Number).includes(Number(term.months))} onChange={() => toggleMonth(tier, Number(term.months))} />{term.months}-month</label>)}</div><p className="mt-1 text-xs text-fg">Only the terms listed above can be used. Leave maximum empty for an open-ended band, such as $500,000+.</p></div>)}</div>{offer.tiers.length === 0 ? <p className="mt-6 text-sm text-fg">No amount bands yet. Add one, then tick the current certificate terms.</p> : null}<button type="button" className="mt-4 text-sm font-semibold text-primary" onClick={addBand}>Add amount band</button>{error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}{notice ? <p className="mt-4 text-sm text-fg">{notice}</p> : null}<button type="button" disabled={pending} className="mt-6 min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary disabled:opacity-60" onClick={() => void save()}>{pending ? "Saving…" : "Save offer"}</button></section>;
}
function DeskLoginSettings() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);
    try {
      await saveDeskLogin({
        data: {
          email,
          currentPassword,
          newPassword
        }
      });
      setCurrentPassword("");
      setNewPassword("");
      setNotice("Desk login updated.");
    } catch {
      setError("Could not update the desk login. Check the current password.");
    } finally {
      setPending(false);
    }
  }
  return <form className="mt-6 max-w-xl rounded-lg border border-border bg-surface p-4" onSubmit={event => void onSubmit(event)}><h2 className="text-lg font-semibold text-primary">Desk login</h2><p className="mt-1 text-sm text-fg">Change the email and password for this desk. Leave the new password blank to keep the current one.</p><label className="mt-4 block"><span className="mb-1.5 block text-sm font-medium">Desk email</span><input required={true} type="email" className={controlClass} value={email} onChange={event => setEmail(event.target.value)} /></label><label className="mt-4 block"><span className="mb-1.5 block text-sm font-medium">Current password</span><input required={true} type="password" autoComplete="current-password" className={controlClass} value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></label><label className="mt-4 block"><span className="mb-1.5 block text-sm font-medium">New password</span><input type="password" autoComplete="new-password" className={controlClass} value={newPassword} onChange={event => setNewPassword(event.target.value)} /></label>{error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}{notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}<button type="submit" disabled={pending} className="mt-4 min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60">{pending ? "Saving…" : "Update desk login"}</button></form>;
}
function AdminField({
  label,
  value,
  onChange
}) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span><input className={controlClass} value={value} onChange={event => onChange(event.target.value)} /></label>;
}
function SettingsPanel({
  section
}) {
  const brand = useBrand();
  const [logo, setLogo] = useState(brand.logo);
  const [favicon, setFavicon] = useState(brand.favicon);
  const [companyName, setCompanyName] = useState(brand.companyName);
  const [companyPhone, setCompanyPhone] = useState(brand.companyPhone);
  const [cloudflareCode, setCloudflareCode] = useState(brand.cloudflareCode);
  const [cover, setCover] = useState(brand.cover);
  const [socialBanner, setSocialBanner] = useState(brand.socialBanner);
  const [emailLogo, setEmailLogo] = useState(brand.emailLogo);
  const [footerLogo, setFooterLogo] = useState(brand.footerLogo);
  const [footerText, setFooterText] = useState(brand.footerText);
  const [backupEmail, setBackupEmail] = useState(brand.backupEmail);
  const [publicDomain, setPublicDomain] = useState(brand.publicDomain);
  const [colorAction, setColorAction] = useState(brand.colorAction);
  const [colorHeading, setColorHeading] = useState(brand.colorHeading);
  const [colorText, setColorText] = useState(brand.colorText);
  const [colorLabel, setColorLabel] = useState(brand.colorLabel);
  const [colorBorder, setColorBorder] = useState(brand.colorBorder);
  const [colorBackground, setColorBackground] = useState(brand.colorBackground);
  const [pageBackground, setPageBackground] = useState(brand.pageBackground);
  const [wantImage, setWantImage] = useState(Boolean(brand.pageBackground?.startsWith("data:image/")));
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
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChat, setTelegramChat] = useState("");
  const [telegramHint, setTelegramHint] = useState("");
  const [hasTelegram, setHasTelegram] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [telegramChats, setTelegramChats] = useState([]);
  const [backupSchedule, setBackupSchedule] = useState(true);
  const [telegramPending, setTelegramPending] = useState(false);
  const [mailPending, setMailPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    setLogo(brand.logo);
    setFavicon(brand.favicon);
    setCompanyName(brand.companyName);
    setCompanyPhone(brand.companyPhone);
    setCloudflareCode(brand.cloudflareCode);
    setCover(brand.cover);
    setSocialBanner(brand.socialBanner);
    setEmailLogo(brand.emailLogo);
    setFooterLogo(brand.footerLogo);
    setFooterText(brand.footerText);
    setBackupEmail(brand.backupEmail);
    setPublicDomain(brand.publicDomain);
    setColorAction(brand.colorAction);
    setColorHeading(brand.colorHeading);
    setColorText(brand.colorText);
    setColorLabel(brand.colorLabel);
    setColorBorder(brand.colorBorder);
    setColorBackground(brand.colorBackground);
    setPageBackground(brand.pageBackground);
    setWantImage(Boolean(brand.pageBackground?.startsWith("data:image/")));
    setLastBackupAt(brand.lastBackupAt);
  }, [brand.logo, brand.favicon, brand.companyName, brand.companyPhone, brand.cloudflareCode, brand.cover, brand.socialBanner, brand.emailLogo, brand.footerLogo, brand.footerText, brand.backupEmail, brand.publicDomain, brand.lastBackupAt, brand.colorAction, brand.colorHeading, brand.colorText, brand.colorLabel, brand.colorBorder, brand.colorBackground, brand.pageBackground]);
  useEffect(() => {
    getMailSetup().then(setup => {
      setMailFrom(setup.mailFrom);
      setKeyHint(setup.keyHint);
      setHasKey(setup.hasKey);
      setSmtpHint(setup.smtpKeyHint);
      setHasSmtpKey(setup.hasSmtpKey);
      setTelegramHint(setup.telegramHint);
      setTelegramChat(setup.telegramChat);
      setHasTelegram(setup.hasTelegram);
      setTelegramEnabled(setup.telegramEnabled);
      setBackupSchedule(setup.backupSchedule);
    }).catch(() => void 0);
  }, []);
  async function onFile(file, kind) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    const share = kind === "cover" || kind === "socialBanner" || kind === "pageBackground";
    if (share && file.type !== "image/png" && file.type !== "image/jpeg") {
      setError("Use a JPEG or PNG for the cover, social banner, and background.");
      return;
    }
    if (file.size > (share ? 1e6 : 4e5)) {
      setError(share ? "Use a JPEG or PNG under 1 MB." : "Use an image under 400 KB.");
      return;
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.readAsDataURL(file);
    });
    if (kind === "logo") setLogo(dataUrl);else if (kind === "favicon") setFavicon(dataUrl);else if (kind === "cover") setCover(dataUrl);else if (kind === "emailLogo") setEmailLogo(dataUrl);else if (kind === "footerLogo") setFooterLogo(dataUrl);else if (kind === "pageBackground") setPageBackground(dataUrl);else setSocialBanner(dataUrl);
  }
  async function save() {
    setError("");
    setNotice("");
    setPending(true);
    try {
      await setSiteBrand({
        data: {
          logo,
          favicon,
          companyName,
          companyPhone,
          cloudflareCode,
          cover,
          socialBanner,
          emailLogo,
          footerLogo,
          footerText,
          backupEmail,
          lastBackupAt,
          publicDomain,
          colorAction,
          colorHeading,
          colorText,
          colorLabel,
          colorBorder,
          colorBackground,
          pageBackground
        }
      });
      await brand.refresh();
      setNotice("Settings updated.");
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "Could not save settings.");
    } finally {
      setPending(false);
    }
  }
  return <section><h1 className="text-3xl font-semibold">{section === "logos" ? "Logos" : section === "appearance" ? "Appearance" : section === "misc" ? "Misc" : "General"}</h1>{section === "general" ? <Fragment><p className="mt-2 text-fg">The company name is used in the header, page titles, emails, and certificates.</p><label className="mt-6 block max-w-md"><span className="mb-1.5 block text-sm font-medium">Company name</span><input className={controlClass} value={companyName} onChange={event => setCompanyName(event.target.value)} /></label><label className="mt-6 block max-w-md"><span className="mb-1.5 block text-sm font-medium">Company phone</span><input className={controlClass} value={companyPhone} placeholder="1-800-000-0000" onChange={event => setCompanyPhone(event.target.value)} /><span className="mt-1 block text-sm text-fg">Shown in the “We’re here to help” bar on client and lead emails.</span></label><label className="mt-6 block max-w-md"><span className="mb-1.5 block text-sm font-medium">Public domain</span><input className={controlClass} value={publicDomain} placeholder="https://www.example.com" onChange={event => setPublicDomain(event.target.value)} /><span className="mt-1 block text-sm text-fg">Client emails use this for the Open the investor portal button. Use the public site, not the Vercel address.</span></label><DeskLoginSettings /><div className="mt-6 max-w-xl rounded-lg border border-danger/40 bg-surface p-4"><h2 className="text-lg font-semibold text-primary">Clear database</h2><p className="mt-1 text-sm text-fg">Deletes applications, clients, leads, investments, invoices, active CDs, and notifications. Settings, rates, advisors, and the desk login stay.</p><button type="button" className="mt-3 min-h-11 rounded-md border border-danger px-4 py-2 text-sm font-semibold text-danger" onClick={() => {
          if (!window.confirm("Clear the database? Applications, clients, investments, invoices, active CDs, and notifications will be deleted. This cannot be undone.")) return;
          setError("");
          setNotice("");
          setPending(true);
          clearDatabase().then(() => setNotice("Database cleared. Settings and the desk login were kept.")).catch(caught => setError(caught instanceof Error && caught.message ? caught.message : "The database could not be cleared.")).finally(() => setPending(false));
        }}>{pending ? "Clearing…" : "Clear database"}</button></div></Fragment> : null}{section === "misc" ? <Fragment><p className="mt-2 text-fg">Mail delivery, the daily database backup, and site analytics.</p><div className="mt-6 max-w-xl rounded-lg border border-border bg-surface p-4"><h2 className="text-lg font-semibold text-primary">Database backup</h2><p className="mt-2 text-sm text-fg">The zip is sent only to the Telegram chat{backupSchedule ? " every day at 12:00 UTC on the published server" : ""}. It is not emailed. If it is too large for one message, it is sent in numbered parts. Restore the parts in order.{lastBackupAt ? ` Last backup: ${lastBackupAt.replace("T", " ").slice(0, 16)} UTC.` : " No backup has been sent yet."}</p><label className="mt-3 flex min-h-11 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={backupSchedule} onChange={event => {
            const enabled = event.target.checked;
            setBackupSchedule(enabled);
            setDeskSwitch({
              data: {
                key: "backup",
                enabled
              }
            }).catch(() => {
              setBackupSchedule(!enabled);
              setError("Could not save the backup switch.");
            });
          }} />Send a backup every day</label><button type="button" disabled={backupPending} className="mt-3 min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60" onClick={() => {
          setError("");
          setNotice("");
          setBackupPending(true);
          runDatabaseBackup().then(async result => {
            setLastBackupAt(result.at);
            await brand.refresh();
            setNotice(result.telegram === "sent" ? `Backup sent to Telegram${result.parts > 1 ? ` in ${result.parts} parts` : ""}.` : result.telegram === "failed" ? "Telegram did not accept the backup." : "Save the Telegram bot token and chat id before sending a backup.");
          }).catch(() => setError("The backup could not be sent.")).finally(() => setBackupPending(false));
        }}>{backupPending ? "Preparing backup…" : "Send backup now"}</button></div><div className="mt-6 max-w-xl rounded-lg border border-border bg-surface p-4"><h2 className="text-lg font-semibold text-primary">Resend</h2><p className="mt-1 text-sm text-fg">Backup only. Client mail goes through SMTP2GO first. Resend is used if SMTP2GO is not set or does not accept the message. Desk notices and database backups go to Telegram, not email. The key is stored on the server and is not shown again.</p><label className="mt-4 block"><span className="mb-1.5 block text-sm font-medium">API key</span><input type="password" autoComplete="off" className={controlClass} value={resendKey} placeholder={hasKey ? `Saved ${keyHint}` : "re_..."} onChange={event => setResendKey(event.target.value)} /></label><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={mailPending} className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" onClick={() => {
            setError("");
            setNotice("");
            setMailPending(true);
            saveMailSetup({
              data: {
                apiKey: resendKey,
                mailFrom,
                clearKey: false
              }
            }).then(setup => {
              setResendKey("");
              setMailFrom(setup.mailFrom);
              setKeyHint(setup.keyHint);
              setHasKey(setup.hasKey);
              setNotice(setup.hasKey ? "Resend settings saved." : "Resend key cleared. Add an API key only if you still want a backup sender.");
            }).catch(() => setError("Could not save Resend settings. Check the key and from address.")).finally(() => setMailPending(false));
          }}>{mailPending ? "Saving…" : "Save Resend"}</button>{hasKey ? <button type="button" disabled={mailPending} className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60" onClick={() => {
            setError("");
            setNotice("");
            setMailPending(true);
            saveMailSetup({
              data: {
                apiKey: "",
                mailFrom,
                clearKey: true
              }
            }).then(setup => {
              setResendKey("");
              setKeyHint(setup.keyHint);
              setHasKey(setup.hasKey);
              setNotice("Resend API key removed.");
            }).catch(() => setError("Could not remove the Resend key.")).finally(() => setMailPending(false));
          }}>Remove key</button> : null}</div></div><div className="mt-6 max-w-xl rounded-lg border border-border bg-surface p-4"><h2 className="text-lg font-semibold text-primary">SMTP2GO</h2><p className="mt-1 text-sm text-fg">Sends advisor letters from each advisor’s verified mailbox, and transactional mail from the company address below. That address must be a verified sender in SMTP2GO. Open tracking uses the same API key.</p><label className="mt-4 block"><span className="mb-1.5 block text-sm font-medium">API key</span><input type="password" autoComplete="off" className={controlClass} value={smtpKey} placeholder={hasSmtpKey ? `Saved ${smtpHint}` : "api-..."} onChange={event => setSmtpKey(event.target.value)} /></label><label className="mt-4 block"><span className="mb-1.5 block text-sm font-medium">Transactional from address</span><input className={controlClass} value={mailFrom} placeholder="Account Holding <notifications@yourdomain.com>" onChange={event => setMailFrom(event.target.value)} /></label><p className="mt-2 text-sm text-fg">Used for application updates, invoices, payment receipts, desk copies, and the daily backup.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={smtpPending} className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" onClick={() => {
            setError("");
            setNotice("");
            setSmtpPending(true);
            saveSmtpSetup({
              data: {
                apiKey: smtpKey,
                mailFrom,
                clearKey: false
              }
            }).then(setup => {
              setSmtpKey("");
              setMailFrom(setup.mailFrom);
              setSmtpHint(setup.smtpKeyHint);
              setHasSmtpKey(setup.hasSmtpKey);
              setNotice(setup.hasSmtpKey ? "SMTP2GO settings saved." : "From address saved. Add the API key to send mail.");
            }).catch(() => setError("Could not save the SMTP2GO API key.")).finally(() => setSmtpPending(false));
          }}>{smtpPending ? "Saving…" : "Save SMTP2GO"}</button>{hasSmtpKey ? <button type="button" disabled={smtpPending} className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60" onClick={() => {
            setError("");
            setNotice("");
            setSmtpPending(true);
            saveSmtpSetup({
              data: {
                apiKey: "",
                mailFrom,
                clearKey: true
              }
            }).then(setup => {
              setSmtpKey("");
              setSmtpHint(setup.smtpKeyHint);
              setHasSmtpKey(setup.hasSmtpKey);
              setNotice("SMTP2GO API key removed.");
            }).catch(() => setError("Could not remove the SMTP2GO key.")).finally(() => setSmtpPending(false));
          }}>Remove key</button> : null}</div></div><div className="mt-6 max-w-xl rounded-lg border border-border bg-surface p-4"><h2 className="text-lg font-semibold text-primary">Telegram</h2><p className="mt-1 text-sm text-fg">Desk notices go here instead of email, including a message when an advisor mailbox receives a new email. Database backups are sent here and are not emailed. Create a bot with BotFather, then send the bot a message in the chat that should receive them. The chat id is the number Telegram shows for that chat. Files from an application, a receipt, or a backup are sent with the message.</p><label className="mt-3 flex min-h-11 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={telegramEnabled} onChange={event => {
            const enabled = event.target.checked;
            setTelegramEnabled(enabled);
            setDeskSwitch({
              data: {
                key: "telegram",
                enabled
              }
            }).catch(() => {
              setTelegramEnabled(!enabled);
              setError("Could not save the Telegram switch.");
            });
          }} />Send desk notices</label><label className="mt-4 block"><span className="mb-1.5 block text-sm font-medium">Bot token</span><input type="password" autoComplete="off" className={controlClass} value={telegramToken} placeholder={hasTelegram ? `Saved ${telegramHint}` : "123456:ABC…"} onChange={event => setTelegramToken(event.target.value)} /></label><label className="mt-4 block"><span className="mb-1.5 block text-sm font-medium">Chat id</span><input className={controlClass} value={telegramChat} placeholder="-1001234567890" onChange={event => setTelegramChat(event.target.value)} />{telegramChats.length ? <span className="mt-2 flex flex-wrap gap-2">{telegramChats.map(chat => <button key={chat.id} type="button" className="min-h-9 rounded-full border border-border px-3 text-sm font-semibold text-primary" onClick={() => setTelegramChat(chat.id)}>{chat.label} · {chat.id}</button>)}</span> : null}</label><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={telegramPending} className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" onClick={() => {
            setError("");
            setNotice("");
            setTelegramPending(true);
            saveTelegramSetup({
              data: {
                token: telegramToken,
                chatId: telegramChat,
                clear: false
              }
            }).then(setup => {
              setTelegramToken("");
              setTelegramHint(setup.telegramHint);
              setTelegramChat(setup.telegramChat);
              setHasTelegram(setup.hasTelegram);
              setNotice(setup.hasTelegram ? "Telegram settings saved." : "Chat id saved. Add the bot token to send notices.");
            }).catch(caught => setError(caught instanceof Error && caught.message ? caught.message : "Could not save Telegram.")).finally(() => setTelegramPending(false));
          }}>{telegramPending ? "Saving…" : "Save Telegram"}</button><button type="button" disabled={telegramPending} className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60" onClick={() => {
            setError("");
            setNotice("");
            setTelegramPending(true);
            lookupTelegramChats({
              data: {
                token: telegramToken
              }
            }).then(result => {
              setTelegramChats(result.chats);
              if (result.chats.length === 1) setTelegramChat(result.chats[0].id);
              setNotice(result.chats.length === 1 ? `Chat id ${result.chats[0].id} is filled in. Press Save Telegram.` : "Press the chat you want, then Save Telegram.");
            }).catch(caught => setError(caught instanceof Error && caught.message ? caught.message : "The chat id could not be found.")).finally(() => setTelegramPending(false));
          }}>Find chat id</button><button type="button" disabled={telegramPending} className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60" onClick={() => {
            setError("");
            setNotice("");
            setTelegramPending(true);
            sendTelegramTest().then(() => setNotice("Test message sent to Telegram.")).catch(caught => setError(caught instanceof Error && caught.message ? caught.message : "The test message could not be sent.")).finally(() => setTelegramPending(false));
          }}>Send test</button>{hasTelegram ? <button type="button" disabled={telegramPending} className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60" onClick={() => {
            setError("");
            setNotice("");
            setTelegramPending(true);
            saveTelegramSetup({
              data: {
                token: "",
                chatId: telegramChat,
                clear: true
              }
            }).then(setup => {
              setTelegramToken("");
              setTelegramHint(setup.telegramHint);
              setHasTelegram(setup.hasTelegram);
              setNotice("Telegram bot token removed.");
            }).catch(() => setError("Could not remove the Telegram token.")).finally(() => setTelegramPending(false));
          }}>Remove token</button> : null}</div></div><label className="mt-6 block max-w-xl"><span className="mb-1.5 block text-sm font-medium">Cloudflare code</span><textarea className={controlClass + " min-h-28 font-mono text-sm"} value={cloudflareCode} placeholder="Paste the Cloudflare Web Analytics snippet or token" onChange={event => setCloudflareCode(event.target.value)} /></label></Fragment> : null}{section === "appearance" ? <Fragment><p className="mt-2 max-w-2xl text-fg">These colors are used for buttons, headings, text, labels, borders, and the page behind the background picture.</p><div className="mt-6 grid max-w-3xl gap-4 sm:grid-cols-2"><ColorSetting label="Button" value={colorAction} onChange={setColorAction} /><ColorSetting label="Headings" value={colorHeading} onChange={setColorHeading} /><ColorSetting label="Text" value={colorText} onChange={setColorText} /><ColorSetting label="Labels" value={colorLabel} onChange={setColorLabel} /><ColorSetting label="Borders" value={colorBorder} onChange={setColorBorder} /><ColorSetting label="Page background" value={colorBackground} onChange={setColorBackground} /></div><div className="mt-6 max-w-xl rounded-lg border border-border bg-surface p-4"><p className="text-sm font-semibold text-primary">Background picture</p><div className="mt-3 flex flex-wrap gap-2">{[["pattern", "Built-in pattern"], ["none", "No background"], ["image", "Custom picture"]].map(([id, label]) => {
            const mode = pageBackground === "none" ? "none" : pageBackground?.startsWith("data:image/") || wantImage ? "image" : "pattern";
            return <button key={id} type="button" className={"min-h-11 rounded-md border px-3 py-2 text-sm font-semibold " + (mode === id ? "border-action bg-action text-on-primary" : "border-border text-primary")} onClick={() => {
              if (id === "none") {
                setWantImage(false);
                setPageBackground("none");
              } else if (id === "pattern") {
                setWantImage(false);
                setPageBackground(null);
              } else {
                setWantImage(true);
                if (pageBackground === "none") setPageBackground(null);
              }
            }}>{label}</button>;
          })}</div>{pageBackground === "none" ? <p className="mt-3 text-sm text-fg">Pages use only the page background color. No picture and no light overlay.</p> : pageBackground?.startsWith("data:image/") || wantImage ? <div className="mt-4"><ImageSetting label="Custom picture" hint="Repeats behind every page, with a light overlay so text stays readable." value={pageBackground?.startsWith("data:image/") ? pageBackground : null} wide={true} accept="image/png,image/jpeg" onFile={file => void onFile(file, "pageBackground")} onClear={() => {
            setWantImage(false);
            setPageBackground(null);
          }} /></div> : <p className="mt-3 text-sm text-fg">The built-in grey pattern repeats behind every page.</p>}</div><button type="button" className="mt-4 text-sm font-semibold text-primary" onClick={() => {
        setColorAction(DEFAULT_THEME.colorAction);
        setColorHeading(DEFAULT_THEME.colorHeading);
        setColorText(DEFAULT_THEME.colorText);
        setColorLabel(DEFAULT_THEME.colorLabel);
        setColorBorder(DEFAULT_THEME.colorBorder);
        setColorBackground(DEFAULT_THEME.colorBackground);
        setPageBackground(null);
        setWantImage(false);
      }}>Reset appearance</button></Fragment> : null}{section === "logos" ? <Fragment><p className="mt-2 text-fg">These images replace the wordmark, browser icon, email header, footer, application cover, and shared-link image.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><ImageSetting label="Website logo" value={logo} onFile={file => void onFile(file, "logo")} onClear={() => setLogo(null)} /><ImageSetting label="Email header logo" hint="Shown in the email header from your public domain. Use a PNG or JPEG, and set the public domain in General." value={emailLogo} onFile={file => void onFile(file, "emailLogo")} onClear={() => setEmailLogo(null)} /><ImageSetting label="Footer logo" hint="Shown in the portal footer. The company name is used if this is empty." value={footerLogo} onFile={file => void onFile(file, "footerLogo")} onClear={() => setFooterLogo(null)} /><ImageSetting label="Favicon" value={favicon} onFile={file => void onFile(file, "favicon")} onClear={() => setFavicon(null)} /><ImageSetting label="App cover" hint="Shown on the application. Also used for the shared link if no banner is set." value={cover} wide={true} accept="image/png,image/jpeg" onFile={file => void onFile(file, "cover")} onClear={() => setCover(null)} /><ImageSetting label="Social link banner" hint="Image shown when the site link is shared." value={socialBanner} wide={true} accept="image/png,image/jpeg" onFile={file => void onFile(file, "socialBanner")} onClear={() => setSocialBanner(null)} /></div><label className="mt-6 block max-w-xl"><span className="mb-1.5 block text-sm font-medium">Footer text</span><textarea className={controlClass + " min-h-28"} value={footerText} placeholder="FDIC insurance covers the first $250,000 per individual or $500,000 per joint account. Rates and calculator results are illustrations. Early withdrawal penalties may apply." onChange={event => setFooterText(event.target.value)} /><span className="mt-1 block text-sm text-fg">Shown under the footer logo. Leave blank to use the standard note.</span></label></Fragment> : null}{error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}{notice ? <p className="mt-4 text-sm text-fg">{notice}</p> : null}<button type="button" disabled={pending} className="mt-6 min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60" onClick={() => void save()}>{pending ? "Saving…" : "Save"}</button></section>;
}
function ColorSetting({
  label,
  value,
  onChange
}) {
  return <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"><span className="text-sm font-semibold text-primary">{label}</span><span className="flex items-center gap-2"><input type="color" className="size-9 cursor-pointer rounded border border-border bg-white" value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#006fcf"} onChange={event => onChange(event.target.value)} /><input className={controlClass + " w-28 font-mono"} value={value} onChange={event => onChange(event.target.value)} /></span></label>;
}
function ImageSetting({
  label,
  hint,
  value,
  onFile,
  onClear,
  wide = false,
  accept = "image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon"
}) {
  return <div className="rounded-lg border border-border bg-surface p-4"><p className="text-sm font-semibold text-primary">{label}</p>{hint ? <p className="mt-1 text-sm text-fg">{hint}</p> : null}<div className={"mt-3 flex items-center justify-center overflow-hidden rounded-md border border-border bg-bg " + (wide ? "h-36" : "h-16")}>{value ? <img src={value} alt="" className={"max-w-full " + (wide ? "h-full w-full object-cover" : "max-h-12 object-contain")} /> : <span className="text-sm text-fg">No image</span>}</div><input type="file" accept={accept} className="mt-3 block w-full text-sm" onChange={event => onFile(event.target.files?.[0])} /><button type="button" className="mt-3 text-sm font-semibold text-primary" onClick={onClear}>Remove</button></div>;
}
function InvoicesDesk() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  function load() {
    return listFundings().then(next => setRows(next.filter(row => row.signed && (row.status === "approved_phone" || row.status === "instructions_sent")))).catch(() => setError("Invoices could not be loaded."));
  }
  useEffect(() => {
    load();
  }, []);
  async function removeInvoice(id) {
    if (!window.confirm("Remove this invoice and its investment? No email will be sent.")) return;
    setError("");
    try {
      await deleteFunding({
        data: {
          id
        }
      });
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The invoice could not be removed.");
    }
  }
  return <section><h1 className="text-3xl font-semibold">Invoices</h1><p className="mt-2 text-fg">Signed certificates approved by phone. Approve an invoice here to generate it for the client.</p>{error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}{!rows ? <p className="mt-4 text-sm text-fg">Loading…</p> : rows.length === 0 ? <p className="mt-4 text-sm text-fg">No certificates are waiting for an invoice.</p> : <ul className="mt-4 grid gap-4">{rows.map(row => <InvoiceCard key={row.id} row={row} onApproved={() => void load()} onRemove={() => void removeInvoice(row.id)} />)}</ul>}</section>;
}
var BILLING_FIELDS = [{
  key: "brand",
  label: "Header name"
}, {
  key: "bankName",
  label: "Bank name"
}, {
  key: "accountName",
  label: "Account name"
}, {
  key: "beneficiaryAddress",
  label: "Beneficiary address",
  wide: true
}, {
  key: "accountNumber",
  label: "Account number"
}, {
  key: "routingNumber",
  label: "Routing number"
}, {
  key: "crn",
  label: "CRN"
}, {
  key: "purpose",
  label: "Purpose of wire"
}, {
  key: "contactName",
  label: "Contact name"
}, {
  key: "phone",
  label: "Phone"
}, {
  key: "fdic",
  label: "FDIC certificate"
}, {
  key: "contactAddress",
  label: "Contact address",
  wide: true
}];
function InvoiceCard({
  row,
  onApproved,
  onRemove
}) {
  const [billing, setBilling] = useState(row.billing);
  const [pending, setPending] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  function setField(key, value) {
    setBilling(current => ({
      ...current,
      [key]: value
    }));
  }
  async function save() {
    setError("");
    setNotice("");
    setPending("save");
    try {
      const result = await saveInvoiceBilling({
        data: {
          id: row.id,
          billing
        }
      });
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
      await approveInvoice({
        data: {
          id: row.id,
          billing
        }
      });
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
      await saveInvoiceBilling({
        data: {
          id: row.id,
          billing
        }
      });
      const {
        pdf
      } = await downloadInvoicePdf({
        data: {
          id: row.id
        }
      });
      const bytes = Uint8Array.from(atob(pdf), char => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], {
        type: "application/pdf"
      }));
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
  return <li className="rounded-lg border border-border bg-surface p-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-semibold text-primary">{row.signerName || row.email}</p><p className="text-sm text-fg">{row.termLabel || "Certificate"} · {row.amount}</p></div><p className="text-sm text-fg">{row.email}</p><p className="text-sm text-fg">{generated ? "Invoice generated" : "Waiting for approval"}</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{BILLING_FIELDS.map(field => <label key={field.key} className={field.wide ? "block sm:col-span-2" : "block"}><span className="mb-1.5 block text-sm font-medium">{field.label}</span>{field.key === "contactAddress" ? <textarea className={controlClass} rows={2} value={billing[field.key]} onChange={event => setField(field.key, event.target.value)} /> : <input className={controlClass} value={billing[field.key]} onChange={event => setField(field.key, event.target.value)} />}</label>)}</div>{error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}{notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}<div className="mt-4 flex flex-wrap gap-2"><button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60" disabled={pending !== ""} onClick={() => void save()}>{pending === "save" ? "Saving…" : "Save billing"}</button><button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending !== ""} onClick={() => void approve()}>{pending === "approve" ? "Saving…" : generated ? "Update invoice" : "Approve invoice"}</button><button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60" disabled={pending !== ""} onClick={() => void download()}>{pending === "pdf" ? "Creating…" : "Preview PDF"}</button><button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-danger disabled:opacity-60" disabled={pending !== ""} onClick={onRemove}>Remove</button></div>{row.paymentFileName ? <PaymentReview id={row.id} name={row.paymentFileName} canReview={generated} onChanged={onApproved} /> : null}</li>;
}
function ActiveCdsDesk() {
  const [rows, setRows] = useState(null);
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([listFundings(), getPromo()]).then(([next, promo]) => {
      setRows(next.filter(row => row.status === "payment_approved"));
      setOffer(promo);
    }).catch(() => setError("Active CDs could not be loaded."));
  }, []);
  return <section><h1 className="text-3xl font-semibold">Active CDs{rows ? ` (${rows.length})` : ""}</h1><p className="mt-2 text-fg">Certificates whose payment the advisor confirmed. An active CD is removed only when the client is deleted.</p>{error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}{!rows ? <p className="mt-4 text-sm text-fg">Loading…</p> : rows.length === 0 ? <p className="mt-4 text-sm text-fg">No active certificates yet.</p> : <ul className="mt-4 grid gap-3">{rows.map(row => <ActiveCdDeskRow key={row.id} row={row} offer={offer} />)}</ul>}</section>;
}
function ActiveCdDeskRow({
  row,
  offer
}) {
  const [open, setOpen] = useState(false);
  const months = Number(row.termLabel.match(/(\d+)-month/)?.[1] ?? 0);
  const base = parseApy(row.termLabel);
  const amount = Number(row.amount.replace(/[^0-9.]/g, ""));
  const bonus = !row.finalApy && offer ? matchTier(offer, months, amount) : null;
  const finalRate = row.finalApy ? parseApy(row.finalApy) : base + (bonus ? bonus.bonusPercent / 100 : 0);
  const finalPercent = finalRate * 100;
  const finalApy = row.finalApy || (base ? `${finalPercent.toFixed(Math.round(finalPercent * 1e3) % 10 === 0 ? 2 : 3)}%` : "—");
  const promo = row.promoApy || (bonus ? formatBonus(bonus.bonusPercent) : "—");
  const payout = Number.isFinite(amount) && months ? amount * Math.pow(1 + finalRate, months / 12) : 0;
  const matures = addMonths(row.createdAt, months);
  const facts = [["Client", row.signerName || row.email], ["Email", row.email], ["Issuer", row.issuer], ["Structure", row.structure], ["Amount", row.amount], ["Term", months ? `${months} months` : row.termLabel], ["Base APY", row.termLabel.match(/([\d.]+%)/)?.[1] ?? "—"], ["Promo APY", promo], ["Final APY", finalApy], ["Expected payout", payout ? payout.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }) : "—"], ["Issue date", row.createdAt], ["Matures", matures], ["Confirmation date", row.confirmedOn], ["Deposit code", row.depositCode], ["Deposit number", row.depositNumber], ["Account number", row.accountNumber], ["Reference number", row.referenceNumber], ["Interest rate", "Fixed"], ["Compounding", "Daily"], ["Callable feature", "Non-callable"], ["Minimum", row.minimumInvestment], ["Capital protection", row.capitalProtection], ["Advisor", row.advisorName ? `${row.advisorName}${row.advisorPhone ? ` · ${row.advisorPhone}` : ""}` : "—"], ["Signed", row.signerName ? `${row.signerName}${row.signedOn ? ` · ${row.signedOn}` : ""}` : "Not signed"], ["Contact", row.contactBy === "email" ? "Email only" : row.contactPhone || "—"], ["Wire confirmation", row.paymentFileName || "—"]];
  return <li className="rounded-lg border border-border bg-surface"><button type="button" className="flex w-full items-center gap-3 px-4 py-3 text-left" aria-expanded={open} onClick={() => setOpen(value => !value)}><span className="min-w-0 flex-1"><span className="block font-semibold text-primary">{row.signerName || row.email}</span><span className="mt-0.5 block text-sm text-fg">{row.termLabel || row.name} · {row.amount} · opened {row.createdAt}</span></span><span className="hidden text-sm text-fg sm:block">{row.advisorName || "No advisor"}</span><ChevronDown className={"size-4 shrink-0 text-primary transition-transform " + (open ? "rotate-180" : "")} aria-hidden="true" /></button>{open ? <dl className="grid border-t border-border sm:grid-cols-2 lg:grid-cols-3">{facts.map(([label, value]) => <div key={label} className="border-b border-border px-4 py-3"><dt className="text-[11px] font-semibold tracking-wide text-heading uppercase">{label}</dt><dd className="mt-1 text-sm text-fg">{value || "—"}</dd></div>)}</dl> : null}</li>;
}
function addMonths(iso, months) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day || !months) return "—";
  return new Date(Date.UTC(year, month - 1 + months, day)).toISOString().slice(0, 10);
}
function FundingDesk() {
  const [rows, setRows] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  function load() {
    return Promise.all([listFundings(), listAdvisors()]).then(([nextRows, nextAdvisors]) => {
      setRows(nextRows);
      setAdvisors(nextAdvisors);
    });
  }
  useEffect(() => {
    load().catch(caught => setError(caught instanceof Error ? caught.message : "Investments could not be loaded."));
  }, []);
  async function save(row, status, advisorId, codes) {
    setError("");
    setNotice("");
    try {
      await updateFunding({
        data: {
          id: row.id,
          status,
          advisorId,
          ...codes
        }
      });
      await load();
      setNotice("Investment updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update this investment.");
    }
  }
  async function remove(id) {
    if (!window.confirm("Remove this investment and its invoice? No email will be sent.")) return;
    setError("");
    setNotice("");
    try {
      await deleteFunding({
        data: {
          id
        }
      });
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
  return <section><h1 className="text-3xl font-semibold">Client investments</h1><p className="mt-2 text-fg">A certificate appears here after the client accepts the terms. Pending call/email means the advisor still needs to reach them.</p>{error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}{notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}{!rows ? <p className="mt-4 text-sm text-fg">Loading…</p> : rows.filter(row => row.signed && row.status !== "payment_approved").length === 0 ? <p className="mt-4 text-sm text-fg">No investments in progress. A certificate appears here after the client accepts the terms.</p> : <ul className="mt-4 grid gap-3">{rows.filter(row => row.signed && row.status !== "payment_approved").map(row => <FundingRow key={row.id} row={row} advisors={advisors} onSave={save} onReload={() => void reload()} onRemove={() => void remove(row.id)} />)}</ul>}</section>;
}
function FundingRow({
  row,
  advisors,
  onSave,
  onReload,
  onRemove
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
  return <li className="rounded-md border border-border bg-surface p-4"><p className="font-semibold text-primary">{row.email} · {row.termLabel || row.name}</p><p className="mt-1 text-sm text-fg">{row.amount} · {row.createdAt}{row.status === "pending" ? " · Pending call/email" : " · Terms signed"}{row.contactBy === "email" ? " · Do not call. Use email." : ""}</p>{row.contactBy === "email" ? <p className="mt-1 text-sm font-semibold text-primary">Do not call. Use email.</p> : <p className="mt-1 text-sm text-fg">Call {row.contactPhone || "the number on the application"}</p>}<div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="block text-sm"><span className="font-semibold text-primary">Advisor</span><select className={`${controlClass} mt-1`} value={advisorId} onChange={event => setAdvisorId(event.target.value)}><option value="">Unassigned</option>{advisors.map(advisor => <option key={advisor.id} value={advisor.id}>{advisor.name}{advisor.phone ? ` · ${advisor.phone}` : ""}</option>)}</select></label><label className="block text-sm"><span className="font-semibold text-primary">Status</span><select className={`${controlClass} mt-1`} value={status} onChange={event => setStatus(event.target.value)}>{row.status === "instructions_sent" ? <option value="instructions_sent">Invoice created</option> : null}{row.status === "pending" || row.status === "approved_phone" ? <option value="pending">Pending call/email</option> : null}{row.status === "pending" || row.status === "approved_phone" ? <option value="approved_phone">Approved by phone</option> : null}<option value="cancelled">Cancelled</option></select></label></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><AdminField label="Amount" value={amount} onChange={setAmount} /><label className="block"><span className="mb-1.5 block text-sm font-medium">Date</span><input className={controlClass} type="date" value={openedOn} onChange={event => setOpenedOn(event.target.value)} /></label><AdminField label="Deposit code" value={depositCode} onChange={setDepositCode} /><AdminField label="Deposit number" value={depositNumber} onChange={setDepositNumber} /><AdminField label="Account number" value={accountNumber} onChange={setAccountNumber} /><AdminField label="Reference number" value={referenceNumber} onChange={setReferenceNumber} /></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary" onClick={() => onSave(row, status, advisorId, {
        depositCode,
        depositNumber,
        accountNumber,
        referenceNumber,
        amount,
        openedOn
      })}>Save</button><button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-danger" onClick={onRemove}>Remove</button></div>{row.paymentFileName ? <PaymentReview id={row.id} name={row.paymentFileName} canReview={row.status === "instructions_sent"} onChanged={onReload} /> : null}</li>;
}
function openDataFile(file, name) {
  const [meta, data] = file.split(",");
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? "application/octet-stream";
  const bytes = Uint8Array.from(atob(data), char => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], {
    type: mime
  }));
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function PaymentReview({
  id,
  name,
  canReview,
  onChanged
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  async function open() {
    setError("");
    try {
      const file = await getPaymentFile({
        data: {
          id
        }
      });
      openDataFile(file.file, file.fileName);
    } catch {
      setError("The confirmation could not be opened.");
    }
  }
  async function approve() {
    setPending("approve");
    setError("");
    try {
      await approvePayment({
        data: {
          id
        }
      });
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
      await rejectPayment({
        data: {
          id
        }
      });
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The confirmation could not be rejected.");
      setPending("");
    }
  }
  return <div className="mt-3 border-t border-border pt-3 text-sm"><p className="text-fg">Wire confirmation: {name}</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 font-semibold text-primary" onClick={() => void open()}>View confirmation</button>{canReview ? <Fragment><button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 font-semibold text-on-primary disabled:opacity-60" disabled={pending !== ""} onClick={() => void approve()}>{pending === "approve" ? "Approving…" : "Approve payment"}</button><button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 font-semibold text-danger disabled:opacity-60" disabled={pending !== ""} onClick={() => void reject()}>{pending === "reject" ? "Rejecting…" : "Reject file"}</button></Fragment> : null}</div>{error ? <p className="mt-2 text-danger">{error}</p> : null}</div>;
}
function LeadsPanel({
  focus,
  onFocusUsed
}) {
  const brand = useBrand();
  const [advisors, setAdvisors] = useState([]);
  const [terms, setTerms] = useState([]);
  const [offer, setOffer] = useState(null);
  const [advisorId, setAdvisorId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [leadQuery, setLeadQuery] = useState("");
  const [leadOptions, setLeadOptions] = useState([]);
  const [pickedLeads, setPickedLeads] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewFrame = useRef(null);
  const [shotStatus, setShotStatus] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copy, setCopy] = useState(null);
  const [kind, setKind] = useState("rates");
  const [termMonths, setTermMonths] = useState("");
  const [appCopy, setAppCopy] = useState(null);
  const [extCopy, setExtCopy] = useState(null);
  const [htrCopy, setHtrCopy] = useState(null);
  const [promoCode] = useState(() => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    return `CD${Array.from(bytes, byte => alphabet[byte % 32]).join("")}`;
  });
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    if (!focus) return;
    setKind(focus.kind || "custom");
    setName(focus.lead.name || "");
    setEmail(focus.lead.email || "");
    if (focus.lead.advisorId) setAdvisorId(focus.lead.advisorId);
    setAppCopy(null);
    setEditing(false);
    onFocusUsed?.();
  }, [focus]);
  useEffect(() => {
    setOrigin(window.location.origin);
    Promise.all([listAdvisors(), getCdTerms(), getPromo()]).then(([people, nextTerms, promo]) => {
      setAdvisors(people);
      setTerms(nextTerms);
      setOffer(promo);
    }).catch(() => setError("Lead email could not be prepared."));
  }, []);
  useEffect(() => {
    const query = leadQuery.trim();
    if (query.length < 2) {
      setLeadOptions([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void listCrmLeads({
        data: {
          query,
          page: 1,
          withEmail: true
        }
      }).then(page => setLeadOptions((page.rows || []).filter(item => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((item.email || "").trim())))).catch(() => setLeadOptions([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [leadQuery]);
  const bulk = kind === "rates" || kind === "extension" || kind === "htr";
  const previewAt = pickedLeads.length ? Math.min(previewIndex, pickedLeads.length - 1) : 0;
  const previewLead = pickedLeads[previewAt] || null;
  const activeName = bulk ? previewLead?.name || "" : name;
  const activeEmail = bulk ? previewLead?.email || "" : email;
  const advisor = advisors.find(item => item.id === advisorId);
  const protection = offer?.protection.trim() || "";
  const standard = defaultLeadCopy({
    leadName: activeName.trim() || "Client",
    company: brand.companyName,
    advisorName: advisor?.name,
    offerIntro: offer?.intro,
    protection
  });
  const letterCopy = copy ?? standard;
  const promoSet = new Set(promoMonths(offer ?? {
    intro: "",
    protection: "",
    finePrint: "",
    startsOn: "",
    endsOn: "",
    tiers: []
  }));
  const termChoices = terms.filter(term => kind === "promo" ? promoSet.has(term.months) : kind === "custom" ? !promoSet.has(term.months) : false);
  const selectedTerm = termChoices.find(term => String(term.months) === termMonths) ?? termChoices[0];
  const variant = kind === "promo" ? "promo" : "custom";
  const appStandard = {
    ...defaultApplicationCopy({
      leadName: name.trim() || "Client",
      company: brand.companyName,
      months: selectedTerm?.months ?? 0,
      advisorName: advisor?.name,
      variant
    }),
    promoCode: kind === "promo" ? promoCode : ""
  };
  const applicationCopy = appCopy ?? appStandard;
  const previewOrigin = /^https?:\/\//i.test(brand.publicDomain.trim()) ? brand.publicDomain.trim().replace(/\/$/, "") : origin;
  const previewLink = previewOrigin ? `${previewOrigin}/application?invite=preview` : "";
  const ratesLetter = offer ? leadLetter({
    leadName: activeName.trim() || "there",
    company: brand.companyName,
    terms,
    offer,
    advisor,
    logo: brand.emailLogo,
    portalUrl: brand.publicDomain,
    companyPhone: brand.companyPhone,
    copy: letterCopy
  }) : null;
  const formLetter = offer && selectedTerm ? applicationLetter({
    leadName: name.trim() || "there",
    company: brand.companyName,
    months: selectedTerm.months,
    apy: selectedTerm.apy,
    offer,
    advisor,
    logo: brand.emailLogo,
    portalUrl: brand.publicDomain,
    link: previewLink,
    companyPhone: brand.companyPhone,
    variant,
    copy: applicationCopy
  }) : null;
  const extensionStandard = defaultExtensionCopy();
  const extensionCopy = extCopy ?? extensionStandard;
  const extensionMail = extensionLetter({
    leadName: activeName.trim() || "there",
    company: brand.companyName,
    advisor,
    logo: brand.emailLogo,
    portalUrl: brand.publicDomain,
    companyPhone: brand.companyPhone,
    copy: extensionCopy
  });
  const htrStandard = defaultHtrCopy();
  const htrText = htrCopy ?? htrStandard;
  const htrMail = htrLetter({
    leadName: activeName.trim() || "there",
    company: brand.companyName,
    advisor,
    logo: brand.emailLogo,
    portalUrl: brand.publicDomain,
    companyPhone: brand.companyPhone,
    copy: htrText
  });
  const letter = kind === "htr" ? htrMail : kind === "extension" ? extensionMail : kind === "rates" ? ratesLetter : formLetter;
  const preview = letter ? renderStep(kind === "promo" ? "lead_promo" : kind === "custom" ? "lead_application" : kind === "extension" ? "lead_extension" : kind === "htr" ? "lead_htr" : "lead_intro", "client", {
    name: activeName.trim() || "there",
    email: activeEmail.trim() || "lead@example.com",
    detail: letter.text,
    companyName: brand.companyName,
    emailLogo: brand.emailLogo,
    portalUrl: brand.publicDomain,
    extraHtml: letter.html
  }) : null;
  const subject = kind === "rates" ? letterCopy.subject : kind === "extension" ? extensionCopy.subject : kind === "htr" ? htrText.subject : applicationCopy.subject;
  async function send(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);
    try {
      if (kind === "extension" || kind === "rates" || kind === "htr") {
        if (!pickedLeads.length) throw new Error("Choose at least one lead.");
        let sent = 0;
        const failed = [];
        for (const lead of pickedLeads) {
          try {
            if (kind === "htr") await sendLeadHtr({
              data: {
                advisorId,
                name: lead.name,
                email: lead.email,
                copy: htrCopy
              }
            });else if (kind === "extension") await sendLeadExtension({
              data: {
                advisorId,
                name: lead.name,
                email: lead.email,
                copy: extCopy
              }
            });else await sendLeadIntro({
              data: {
                advisorId,
                name: lead.name,
                email: lead.email,
                copy
              }
            });
            sent += 1;
          } catch (caught) {
            failed.push(`${lead.name}: ${caught instanceof Error && caught.message ? caught.message : "could not be sent"}`);
          }
        }
        if (failed.length) throw new Error(sent ? `Sent ${sent}. ${failed.join(" ")}` : failed.join(" "));
        setNotice(sent === 1 ? `Sent to ${pickedLeads[0]?.email || "the lead"}.` : `Sent to ${sent} leads.`);
        setPickedLeads([]);
        setPreviewIndex(0);
        if (kind === "htr") setHtrCopy(null);else if (kind === "extension") setExtCopy(null);else setCopy(null);
      } else if (kind !== "rates") {
        if (!selectedTerm) throw new Error(kind === "promo" ? "Choose a promotional term." : "Choose a term that is not on promotion.");
        await sendLeadApplication({
          data: {
            advisorId,
            name,
            email,
            months: selectedTerm.months,
            kind,
            copy: applicationCopy
          }
        });
        setNotice(`${kind === "promo" ? "Promotional" : "Custom term"} email sent to ${email.trim()}. The link expires in 24 hours.`);
        setAppCopy(null);
      } else {
        await sendLeadIntro({
          data: {
            advisorId,
            name,
            email,
            copy: letterCopy
          }
        });
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
  return <section><h1 className="text-3xl font-semibold">Lead emails</h1><p className="mt-2 max-w-2xl text-fg">Send the rates introduction, the November 6 rate extension, an HTR follow-up, a custom-term application, or a promotional application. Application links expire after 24 hours. A reminder goes out about two hours before then.</p><div className="mt-4 flex flex-wrap gap-2">{[["rates", "Rates introduction"], ["extension", "Rate extension"], ["htr", "HTR"], ["custom", "Custom term"], ["promo", "Promo term"]].map(([id, label]) => <button key={id} type="button" className={"min-h-11 rounded-md border px-3 py-2 text-sm font-semibold " + (kind === id ? "border-action bg-action text-on-primary" : "border-border text-primary")} onClick={() => {
        setKind(id);
        setEditing(false);
        setAppCopy(null);
        setExtCopy(null);
        setHtrCopy(null);
        setTermMonths("");
      }}>{label}</button>)}</div>{error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}{notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}<form className="mt-6 grid max-w-3xl gap-3" onSubmit={event => void send(event)}><label className="block text-sm"><span className="font-semibold text-primary">Advisor</span><select className={`${controlClass} mt-1`} value={advisorId} onChange={event => {
          setAdvisorId(event.target.value);
          setCopy(null);
        }}><option value="">Select an advisor</option>{advisors.map(item => <option key={item.id} value={item.id}>{item.name}{item.email ? ` · ${item.email}` : ""}</option>)}</select></label>{bulk ? <label className="block text-sm"><span className="font-semibold text-primary">Leads</span><input className={`${controlClass} mt-1`} value={leadQuery} placeholder="Search name or email" onChange={event => setLeadQuery(event.target.value)} /><select className={`${controlClass} mt-2`} value="" onChange={event => {
          const next = leadOptions.find(item => item.id === event.target.value);
          if (!next || pickedLeads.some(item => item.id === next.id)) return;
          setPickedLeads(current => [...current, next]);
          setPreviewIndex(pickedLeads.length);
        }}><option value="">{leadQuery.trim().length < 2 ? "Type at least 2 letters, then add a lead" : leadOptions.length ? "Add a lead" : "No matching leads"}</option>{leadOptions.map(item => <option key={item.id} value={item.id} disabled={pickedLeads.some(picked => picked.id === item.id)}>{pickedLeads.some(picked => picked.id === item.id) ? "Added · " : ""}{item.name} · {item.email}{item.term ? ` · ${item.term}` : ""}</option>)}</select>{pickedLeads.length ? <ul className="mt-2 flex flex-wrap gap-2">{pickedLeads.map((lead, index) => <li key={lead.id}><button type="button" className={"inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm " + (index === previewAt ? "border-action bg-action text-on-primary" : "border-border text-primary")} onClick={() => setPreviewIndex(index)}>{lead.name}<span className="font-semibold" onClick={event => {
                event.stopPropagation();
                setPickedLeads(current => current.filter(item => item.id !== lead.id));
                setPreviewIndex(0);
              }}>×</span></button></li>)}</ul> : <span className="mt-1 block text-fg">Search the pipeline and add every lead who should get this letter.</span>}</label> : <><label className="block text-sm"><span className="font-semibold text-primary">Lead name</span><input className={`${controlClass} mt-1`} value={name} onChange={event => setName(event.target.value)} /></label><label className="block text-sm"><span className="font-semibold text-primary">Lead email</span><input type="email" className={`${controlClass} mt-1`} value={email} onChange={event => setEmail(event.target.value)} /></label></>}{kind === "custom" || kind === "promo" ? <label className="block text-sm"><span className="font-semibold text-primary">{kind === "promo" ? "Promotional term" : "Custom term"}</span><select className={`${controlClass} mt-1`} value={selectedTerm ? String(selectedTerm.months) : ""} onChange={event => {
          setTermMonths(event.target.value);
          setAppCopy(null);
        }}>{termChoices.length === 0 ? <option value="">No terms in this group</option> : null}{termChoices.map(term => <option key={term.id} value={term.months}>{term.months}-month · {term.apy}</option>)}</select></label> : null}{preview ? <div className="mt-2 overflow-hidden rounded-xl border border-border bg-[#e8e8e8] shadow-sm"><div className="border-b border-border bg-white px-5 py-4 text-sm"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold tracking-widest text-[#8c8c8c] uppercase">Letter preview</p><div className="flex items-center gap-2">{bulk && pickedLeads.length > 1 ? <><button type="button" aria-label="Previous letter" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg font-semibold text-primary" onClick={() => setPreviewIndex(index => (index - 1 + pickedLeads.length) % pickedLeads.length)}>‹</button><span className="min-w-16 text-center text-sm text-primary">{previewAt + 1} of {pickedLeads.length}</span><button type="button" aria-label="Next letter" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg font-semibold text-primary" onClick={() => setPreviewIndex(index => (index + 1) % pickedLeads.length)}>›</button></> : null}<button type="button" className="min-h-9 rounded-md border border-border px-3 text-sm font-semibold text-primary" onClick={() => void copyLetterImage(previewFrame.current, setShotStatus)}>Copy screenshot</button>{shotStatus ? <span className="text-sm text-fg">{shotStatus}</span> : null}<button type="button" className="min-h-9 rounded-md border border-border px-3 text-sm font-semibold text-primary" onClick={() => {
              if (kind === "htr") setHtrCopy(current => current ?? htrStandard);else if (kind === "extension") setExtCopy(current => current ?? extensionStandard);else if (kind !== "rates") setAppCopy(current => current ?? appStandard);else setCopy(current => current ?? standard);
              setEditing(open => !open);
            }}>{editing ? "Hide editor" : "Edit text"}</button></div></div><p className="mt-3"><span className="inline-block w-14 text-[#8c8c8c]">From</span>{advisor?.name || brand.companyName}{advisor?.email ? ` <${advisor.email}>` : ""}</p><p className="mt-1"><span className="inline-block w-14 text-[#8c8c8c]">To</span>{activeName.trim() || "Lead"}{activeEmail.trim() ? ` <${activeEmail.trim()}>` : ""}</p><p className="mt-1 font-semibold text-primary"><span className="inline-block w-14 font-normal text-[#8c8c8c]">Subject</span>{subject}</p></div>{editing && kind === "rates" ? <div className="grid gap-3 border-b border-border bg-white px-5 py-4"><LetterField label="Subject" value={letterCopy.subject} onChange={next => setCopy({
            ...letterCopy,
            subject: next
          })} /><LetterField label="Headline" value={letterCopy.headline} onChange={headline => setCopy({
            ...letterCopy,
            headline
          })} /><LetterField label="Welcome" value={letterCopy.welcome} onChange={welcome => setCopy({
            ...letterCopy,
            welcome
          })} rows={4} /><LetterField label="Certificate" value={letterCopy.certificate} onChange={certificate => setCopy({
            ...letterCopy,
            certificate
          })} rows={3} /><LetterField label="Promotional offer" value={letterCopy.offer} onChange={next => setCopy({
            ...letterCopy,
            offer: next
          })} rows={3} /><LetterField label="FDIC coverage" value={letterCopy.protection} onChange={next => setCopy({
            ...letterCopy,
            protection: next
          })} rows={3} /><LetterField label="Ready to get started" value={letterCopy.ready} onChange={ready => setCopy({
            ...letterCopy,
            ready
          })} rows={3} /><LetterField label="Thank you" value={letterCopy.thanks} onChange={thanks => setCopy({
            ...letterCopy,
            thanks
          })} rows={3} /><button type="button" className="w-fit text-sm font-semibold text-action" onClick={() => setCopy(null)}>Restore the standard text</button></div> : null}{editing && kind === "extension" ? <div className="grid gap-3 border-b border-border bg-white px-5 py-4"><LetterField label="Subject" value={extensionCopy.subject} onChange={next => setExtCopy({
            ...extensionCopy,
            subject: next
          })} /><LetterField label="Announcement" value={extensionCopy.announce} onChange={announce => setExtCopy({
            ...extensionCopy,
            announce
          })} rows={4} /><LetterField label="Base rate" value={extensionCopy.base} onChange={base => setExtCopy({
            ...extensionCopy,
            base
          })} rows={3} /><LetterField label="Flexibility" value={extensionCopy.flexibility} onChange={flexibility => setExtCopy({
            ...extensionCopy,
            flexibility
          })} rows={3} /><LetterField label="Opportunity" value={extensionCopy.opportunity} onChange={opportunity => setExtCopy({
            ...extensionCopy,
            opportunity
          })} rows={3} /><LetterField label="How to start" value={extensionCopy.contact} onChange={contact => setExtCopy({
            ...extensionCopy,
            contact
          })} rows={3} /><LetterField label="Deadline" value={extensionCopy.urgency} onChange={urgency => setExtCopy({
            ...extensionCopy,
            urgency
          })} rows={3} /><LetterField label="Closing" value={extensionCopy.closing} onChange={closing => setExtCopy({
            ...extensionCopy,
            closing
          })} rows={2} /><p className="text-xs text-fg">Wrap words in **double asterisks** to make them bold.</p><button type="button" className="w-fit text-sm font-semibold text-action" onClick={() => setExtCopy(null)}>Restore the standard text</button></div> : null}{editing && kind === "htr" ? <div className="grid gap-3 border-b border-border bg-white px-5 py-4"><LetterField label="Subject" value={htrText.subject} onChange={next => setHtrCopy({
            ...htrText,
            subject: next
          })} /><LetterField label="Opening" value={htrText.opening} onChange={opening => setHtrCopy({
            ...htrText,
            opening
          })} rows={4} /><LetterField label="Still interested" value={htrText.offer} onChange={offer => setHtrCopy({
            ...htrText,
            offer
          })} rows={4} /><LetterField label="No longer interested" value={htrText.decline} onChange={decline => setHtrCopy({
            ...htrText,
            decline
          })} rows={4} /><LetterField label="Closing" value={htrText.closing} onChange={closing => setHtrCopy({
            ...htrText,
            closing
          })} rows={3} /><button type="button" className="w-fit text-sm font-semibold text-action" onClick={() => setHtrCopy(null)}>Restore the standard text</button></div> : null}{editing && kind !== "rates" && kind !== "extension" && kind !== "htr" ? <div className="grid gap-3 border-b border-border bg-white px-5 py-4"><LetterField label="Subject" value={applicationCopy.subject} onChange={next => setAppCopy({
            ...applicationCopy,
            subject: next
          })} /><LetterField label="Headline" value={applicationCopy.headline} onChange={headline => setAppCopy({
            ...applicationCopy,
            headline
          })} /><LetterField label="Opening" value={applicationCopy.hope} onChange={hope => setAppCopy({
            ...applicationCopy,
            hope
          })} /><LetterField label="Application is ready" value={applicationCopy.ready} onChange={ready => setAppCopy({
            ...applicationCopy,
            ready
          })} rows={3} /><LetterField label="Button instruction" value={applicationCopy.instruction} onChange={instruction => setAppCopy({
            ...applicationCopy,
            instruction
          })} rows={2} />{kind === "promo" ? <LetterField label="Promotional code" value={applicationCopy.promoCode} onChange={next => setAppCopy({
            ...applicationCopy,
            promoCode: next
          })} /> : null}<LetterField label="Code note" value={applicationCopy.codeNote} onChange={codeNote => setAppCopy({
            ...applicationCopy,
            codeNote
          })} rows={2} /><LetterField label="Follow up" value={applicationCopy.followUp} onChange={followUp => setAppCopy({
            ...applicationCopy,
            followUp
          })} rows={3} /><LetterField label="Thank you" value={applicationCopy.thanks} onChange={thanks => setAppCopy({
            ...applicationCopy,
            thanks
          })} rows={2} /><button type="button" className="w-fit text-sm font-semibold text-action" onClick={() => setAppCopy(null)}>Restore the standard text</button></div> : null}<iframe ref={previewFrame} title="Letter preview" sandbox="allow-same-origin" className="h-[1100px] w-full bg-[#f2f5f8]" srcDoc={preview.html} /></div> : null}<button type="submit" className="min-h-11 w-fit rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending}>{pending ? "Sending…" : kind === "promo" ? "Send promo email" : kind === "custom" ? "Send custom term email" : kind === "extension" ? pickedLeads.length > 1 ? `Send ${pickedLeads.length} extensions` : "Send extension" : kind === "htr" ? pickedLeads.length > 1 ? `Send ${pickedLeads.length} HTR emails` : "Send HTR email" : pickedLeads.length > 1 ? `Send ${pickedLeads.length} intros` : "Send intro"}</button></form></section>;
}
function LetterField({
  label,
  value,
  onChange,
  rows = 1
}) {
  return <label className="block text-sm"><span className="font-semibold text-primary">{label}</span>{rows > 1 ? <textarea className={`${controlClass} mt-1 min-h-20`} rows={rows} value={value} onChange={event => onChange(event.target.value)} /> : <input className={`${controlClass} mt-1`} value={value} onChange={event => onChange(event.target.value)} />}</label>;
}
function AdvisorsPanel() {
  const [rows, setRows] = useState(null);
  const [draft, setDraft] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    mailbox: "",
    role: "",
    personalPhone: "",
    imapHost: "",
    imapPort: 993,
    imapUser: "",
    imapPassword: "",
    imapSecure: true
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  function load() {
    return listAdvisors().then(setRows);
  }
  useEffect(() => {
    load().catch(() => setError("Advisors could not be loaded."));
  }, []);
  async function save(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await saveAdvisor({
        data: draft
      });
      setDraft({
        id: "",
        name: "",
        phone: "",
        email: "",
        mailbox: "",
        role: "",
        personalPhone: "",
        imapHost: "",
        imapPort: 993,
        imapUser: "",
        imapPassword: "",
        imapSecure: true
      });
      await load();
      setNotice("Advisor saved.");
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "Could not save this advisor.");
    }
  }
  async function remove(id) {
    setError("");
    try {
      await deleteAdvisor({
        data: {
          id
        }
      });
      await load();
    } catch {
      setError("Could not remove this advisor.");
    }
  }
  return <section><h1 className="text-3xl font-semibold">Advisors</h1><p className="mt-2 text-fg">Assign one of these advisors when a client investment needs a call. The role, such as Senior Advisor, is the last line of that advisor’s email signature. The verified mailbox is the SMTP2GO address the letters are sent from.</p>{error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}{notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}<ul className="mt-4 grid gap-3">{(rows ?? []).map(advisor => <li key={advisor.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3"><div><p className="font-semibold text-primary">{advisor.name}</p><p className="text-sm text-fg">{advisor.role || "No role"} · {advisor.phone || "No phone"}{advisor.email ? ` · ${advisor.email}` : ""}{advisor.mailbox ? ` · ${advisor.mailbox}` : " · No verified mailbox"}</p></div><div className="flex gap-2"><button type="button" className="min-h-11 px-3 text-sm font-semibold text-primary" onClick={() => setDraft(advisor)}>Edit</button><button type="button" className="min-h-11 px-3 text-sm font-semibold text-primary" onClick={() => void remove(advisor.id)}>Remove</button></div></li>)}</ul><form className="mt-6 grid gap-3 rounded-md border border-border bg-surface p-4 sm:grid-cols-2" onSubmit={event => void save(event)}><h2 className="text-lg font-semibold text-primary sm:col-span-2">{draft.id ? "Edit advisor" : "Add advisor"}</h2><AdminField label="Name" value={draft.name} onChange={name => setDraft({
        ...draft,
        name
      })} /><AdminField label="Role" value={draft.role} onChange={role => setDraft({
        ...draft,
        role
      })} /><AdminField label="Phone" value={draft.phone} onChange={phone => setDraft({
        ...draft,
        phone
      })} /><AdminField label="Email" value={draft.email} onChange={email => setDraft({
        ...draft,
        email
      })} /><label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-medium">Verified mailbox</span><input className={controlClass} value={draft.mailbox} placeholder="advisor@yourdomain.com" onChange={event => setDraft({
          ...draft,
          mailbox: event.target.value
        })} /><span className="mt-1 block text-sm text-fg">SMTP2GO address this advisor’s letters are sent from. It must already be verified there.</span></label><label className="block"><span className="mb-1.5 block text-sm font-medium">IMAP host</span><input className={controlClass} value={draft.imapHost || ""} placeholder="mail.yourdomain.com" onChange={event => setDraft({
          ...draft,
          imapHost: event.target.value
        })} /></label><label className="block"><span className="mb-1.5 block text-sm font-medium">IMAP port</span><input className={controlClass} inputMode="numeric" value={draft.imapPort || 993} onChange={event => setDraft({
          ...draft,
          imapPort: Number(event.target.value) || 993
        })} /></label><label className="block"><span className="mb-1.5 block text-sm font-medium">IMAP username</span><input className={controlClass} value={draft.imapUser || ""} placeholder="advisor@yourdomain.com" onChange={event => setDraft({
          ...draft,
          imapUser: event.target.value
        })} /></label><label className="block"><span className="mb-1.5 block text-sm font-medium">IMAP password</span><input type="password" autoComplete="new-password" className={controlClass} value={draft.imapPassword || ""} placeholder={draft.hasImapPassword ? "Saved. Enter a new password to replace it." : "Mailbox password"} onChange={event => setDraft({
          ...draft,
          imapPassword: event.target.value
        })} /></label><label className="flex min-h-11 items-center gap-2 text-sm font-medium sm:col-span-2"><input type="checkbox" checked={draft.imapSecure !== false} onChange={event => setDraft({
          ...draft,
          imapSecure: event.target.checked
        })} />Use a secure IMAP connection (port 993)</label><div className="flex items-end"><button type="submit" className="min-h-11 rounded-md bg-action px-4 py-2 font-semibold text-on-primary">Save advisor</button></div></form></section>;
}
function emptyLead() {
  const now = new Date();
  now.setSeconds(0, 0);
  return {
    id: "",
    name: "",
    email: "",
    phone: "",
    amount: "",
    term: "",
    objective: "",
    liquidity: "",
    source: "",
    status: "",
    notes: "",
    advisorId: "",
    receivedAt: now.toISOString()
  };
}
function leadTimeInput(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = part => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function PipelineLeadsPanel() {
  const [page, setPage] = useState(null);
  const [draft, setDraft] = useState(emptyLead);
  const [advisors, setAdvisors] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [advisorId, setAdvisorId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [withEmail, setWithEmail] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  function load(nextPage = pageNumber) {
    return listCrmLeads({ data: { page: nextPage, query, source, status, advisorId, from, to, withEmail } }).then((result) => {
      setPage(result);
      setPageNumber(result.page);
      return result;
    });
  }

  useEffect(() => {
    void listAdvisors().then(setAdvisors).catch(() => setAdvisors([]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(1).catch(() => setError("Leads could not be loaded."));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, source, status, advisorId, from, to, withEmail]);

  async function save(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await saveCrmLead({ data: draft });
      setDraft(emptyLead());
      await load();
      setNotice("Lead saved.");
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "Could not save this lead.");
    }
  }

  async function remove(id) {
    setError("");
    try {
      await deleteCrmLead({ data: { id } });
      if (draft.id === id) setDraft(emptyLead());
      await load();
    } catch {
      setError("Could not remove this lead.");
    }
  }

  const rows = page?.rows ?? [];
  return <section>
    <h1 className="text-3xl font-semibold">Leads</h1>
    <p className="mt-2 max-w-2xl text-fg">Search the pipeline, then filter by source, status, advisor, or when the lead arrived.</p>
    {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
    {notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}
    <div className="mt-4 grid gap-3 lg:grid-cols-4">
      <label className="block text-sm lg:col-span-2">
        <span className="font-semibold text-primary">Search</span>
        <input className={`${controlClass} mt-1`} value={query} placeholder="Name, email, or phone" onChange={(event) => setQuery(event.target.value)} />
      </label>
      <label className="block text-sm">
        <span className="font-semibold text-primary">Source</span>
        <select className={`${controlClass} mt-1`} value={source} onChange={(event) => setSource(event.target.value)}>
          <option value="">All sources</option>
          {(page?.sources ?? []).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-semibold text-primary">Status</span>
        <select className={`${controlClass} mt-1`} value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {(page?.statuses ?? []).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-semibold text-primary">Advisor</span>
        <select className={`${controlClass} mt-1`} value={advisorId} onChange={(event) => setAdvisorId(event.target.value)}>
          <option value="">All advisors</option>
          {advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.name}</option>)}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-semibold text-primary">Received from</span>
        <input type="date" className={`${controlClass} mt-1`} value={from} onChange={(event) => setFrom(event.target.value)} />
      </label>
      <label className="block text-sm">
        <span className="font-semibold text-primary">Received to</span>
        <input type="date" className={`${controlClass} mt-1`} value={to} onChange={(event) => setTo(event.target.value)} />
      </label>
      <label className="flex min-h-11 items-center gap-2 self-end text-sm font-semibold text-primary">
        <input type="checkbox" checked={withEmail} onChange={(event) => setWithEmail(event.target.checked)} />
        Has an email
      </label>
    </div>
    <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="border-b border-border text-xs tracking-wide text-primary uppercase">
          <tr>
            <th className="px-4 py-3 font-semibold">Lead</th>
            <th className="px-4 py-3 font-semibold">Amount</th>
            <th className="px-4 py-3 font-semibold">Term</th>
            <th className="px-4 py-3 font-semibold">Objective</th>
            <th className="px-4 py-3 font-semibold">Source</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Advisor</th>
            <th className="px-4 py-3 font-semibold">Received</th>
            <th className="px-4 py-3 font-semibold" />
          </tr>
        </thead>
        <tbody>
          {rows.map((lead) => <tr key={lead.id} className="border-b border-border last:border-0">
            <td className="px-4 py-3">
              <span className="block font-semibold text-primary">{lead.name}</span>
              <span className="text-fg">{[lead.email, lead.phone].filter(Boolean).join(" · ") || "No contact"}</span>
              {lead.notes ? <span className="mt-1 block max-w-xs truncate text-xs text-[#8c8c8c]">{lead.notes.split("\n")[0]}</span> : null}
            </td>
            <td className="px-4 py-3">{lead.amount || "—"}</td>
            <td className="px-4 py-3">{lead.term || "—"}</td>
            <td className="px-4 py-3"><span className="block">{lead.objective || "—"}</span>{lead.liquidity ? <span className="text-fg">{lead.liquidity}</span> : null}</td>
            <td className="px-4 py-3">{lead.source || "—"}</td>
            <td className="px-4 py-3">{lead.status || "—"}</td>
            <td className="px-4 py-3">{advisors.find((advisor) => advisor.id === lead.advisorId)?.name || "—"}</td>
            <td className="px-4 py-3 whitespace-nowrap">{new Date(lead.receivedAt).toLocaleString()}</td>
            <td className="px-4 py-3 text-right">
              <button type="button" className="min-h-11 px-3 text-sm font-semibold text-primary" onClick={() => setDraft(lead)}>Edit</button>
              <button type="button" className="min-h-11 px-3 text-sm font-semibold text-primary" onClick={() => void remove(lead.id)}>Remove</button>
            </td>
          </tr>)}
        </tbody>
      </table>
      {page && rows.length === 0 ? <p className="px-4 py-6 text-sm text-fg">No leads match these filters.</p> : null}
    </div>
    {page && page.total > 0 ? <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-fg">{page.total.toLocaleString()} leads · {(page.page - 1) * page.pageSize + 1}–{Math.min(page.page * page.pageSize, page.total).toLocaleString()}</p>
      <div className="flex gap-2">
        <button type="button" className="min-h-10 rounded-md border border-border px-3 font-semibold text-primary disabled:opacity-40" disabled={page.page <= 1} onClick={() => void load(page.page - 1).catch(() => setError("Leads could not be loaded."))}>Previous</button>
        <button type="button" className="min-h-10 rounded-md border border-border px-3 font-semibold text-primary disabled:opacity-40" disabled={page.page * page.pageSize >= page.total} onClick={() => void load(page.page + 1).catch(() => setError("Leads could not be loaded."))}>Next</button>
      </div>
    </div> : null}
    <form id="lead-editor" className="mt-6 grid gap-3 rounded-md border border-border bg-surface p-4 sm:grid-cols-2" onSubmit={(event) => void save(event)}>
      <h2 className="text-lg font-semibold text-primary sm:col-span-2">{draft.id ? "Edit lead" : "Add lead"}</h2>
      <AdminField label="Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
      <AdminField label="Email" value={draft.email} onChange={(email) => setDraft({ ...draft, email })} />
      <AdminField label="Phone" value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone })} />
      <AdminField label="Preferred deposit amount" value={draft.amount} onChange={(amount) => setDraft({ ...draft, amount })} />
      <AdminField label="Term" value={draft.term} onChange={(term) => setDraft({ ...draft, term })} />
      <AdminField label="Objective" value={draft.objective} onChange={(objective) => setDraft({ ...draft, objective })} />
      <AdminField label="Liquidity" value={draft.liquidity} onChange={(liquidity) => setDraft({ ...draft, liquidity })} />
      <AdminField label="Lead source" value={draft.source} onChange={(source) => setDraft({ ...draft, source })} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Advisor</span>
        <select className={controlClass} value={draft.advisorId || ""} onChange={(event) => setDraft({ ...draft, advisorId: event.target.value })}>
          <option value="">Unassigned</option>
          {advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.name}</option>)}
        </select>
      </label>
      {draft.status ? <p className="text-sm text-fg sm:col-span-2">Status: {draft.status}</p> : null}
      {draft.notes ? <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-medium">Notes</span><textarea className={`${controlClass} min-h-28`} readOnly value={draft.notes} /></label> : null}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Lead receive time</span>
        <input type="datetime-local" className={controlClass} value={leadTimeInput(draft.receivedAt)} onChange={(event) => setDraft({ ...draft, receivedAt: event.target.value ? new Date(event.target.value).toISOString() : "" })} />
      </label>
      <div className="flex items-end gap-2">
        <button type="submit" className="min-h-11 rounded-md bg-action px-4 py-2 font-semibold text-on-primary">Save lead</button>
        {draft.id ? <button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary" onClick={() => setDraft(emptyLead())}>Cancel</button> : null}
      </div>
    </form>
  </section>;
}

function ClientsPanel({
  rows,
  onStatus,
  onRemove
}) {
  const [pendingId, setPendingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState("");
  const selected = rows.find(row => row.id === selectedId) ?? null;
  async function openAs(id) {
    setError("");
    setPendingId(id);
    try {
      await signInAsClient({
        data: {
          id
        }
      });
      window.location.assign("/portal");
    } catch {
      setError("Could not sign in as this client.");
      setPendingId(null);
    }
  }
  if (rows.length === 0) return <section><h1 className="text-3xl font-semibold">Clients</h1><p className="mt-4 rounded-lg border border-border bg-surface px-4 py-6 text-sm text-fg">No approved clients yet.</p></section>;
  return <section><h1 className="text-3xl font-semibold">Clients</h1><p className="mt-2 text-fg">Approved investors. Select a row to open the full application. Sign in as a client to open their portal.</p>{error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}<div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-border text-xs tracking-wide text-primary uppercase"><tr><th className="px-4 py-3 font-semibold">Client</th><th className="px-4 py-3 font-semibold">Account</th><th className="px-4 py-3 font-semibold">Approved</th><th className="px-4 py-3 font-semibold" /></tr></thead><tbody>{rows.map(row => <tr key={row.id} className={"cursor-pointer border-b border-border last:border-0 " + (row.id === selectedId ? "bg-step-idle" : "")} onClick={() => setSelectedId(row.id)}><td className="px-4 py-3"><span className="block font-semibold text-primary">{row.applicantName}</span><span className="text-fg">{row.email}</span></td><td className="px-4 py-3">{row.accountType}</td><td className="px-4 py-3">{row.submittedAt} UTC</td><td className="px-4 py-3 text-right"><button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pendingId === row.id} onClick={event => {
                event.stopPropagation();
                openAs(row.id);
              }}>{pendingId === row.id ? "Signing in…" : "Sign in as user"}</button></td></tr>)}</tbody></table></div>{selected ? <ApplicationDetail row={selected} onStatus={status => onStatus(selected.id, status)} onRemove={() => onRemove(selected.id)} /> : null}</section>;
}
const PIPELINE_STEPS = ["Promo", "Application", "Investment", "Invoice", "Payment receipt", "Confirmation package", "CD active"];

function mailBadge(status) {
  if (!status) return null;
  const tone = status === "opened" || status === "clicked" ? "good" : status === "bounced" || status === "complained" || status === "failed" ? "warn" : "info";
  return {
    text: MAIL_STATUS_LABEL[status] || "Sent",
    tone
  };
}

function linkLeft(expiresAt) {
  const remaining = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(remaining) || remaining <= 0) return "Expired";
  const hours = Math.floor(remaining / 36e5);
  const minutes = Math.floor(remaining % 36e5 / 6e4);
  if (hours >= 1) return `${hours}h ${minutes}m left`;
  return `${Math.max(minutes, 1)}m left`;
}

function pipelineView(row) {
  const applied = Boolean(row.applicationStatus);
  const created = Boolean(row.fundingStatus);
  const signed = Boolean(row.investmentSigned);
  const invoiceApproved = row.fundingStatus === "instructions_sent" || row.fundingStatus === "payment_approved";
  const paymentIn = Boolean(row.paymentUploaded) || row.certificateActive;
  const packageSent = Boolean(row.confirmationMailStatus) || row.certificateActive;
  const investmentDone = applied && (signed || invoiceApproved || row.certificateActive);
  const done = [true, applied, investmentDone, investmentDone && invoiceApproved, investmentDone && invoiceApproved && paymentIn, investmentDone && invoiceApproved && paymentIn && packageSent, row.certificateActive];
  const current = done.findIndex(flag => !flag);
  const promo = [mailBadge(row.mailStatus) || {
    text: "Sent",
    tone: "info"
  }];
  const application = [];
  if (applied) application.push({
    text: "Applied",
    tone: "good"
  });else if (row.applicationSent) {
    application.push(mailBadge(row.applicationMailStatus) || {
      text: "Sent",
      tone: "info"
    });
    if (row.inviteStatus === "open" && row.inviteExpiresAt) application.push({
      text: linkLeft(row.inviteExpiresAt),
      tone: linkLeft(row.inviteExpiresAt) === "Expired" ? "warn" : "info"
    });else application.push({
      text: "Expired",
      tone: "warn"
    });
  }
  const investment = [];
  if (applied && (created || invoiceApproved)) {
    investment.push({
      text: "Created",
      tone: "info"
    });
    if (signed) investment.push({
      text: "Signed",
      tone: "good"
    });
  }
  const invoice = [];
  if (applied) {
    const sent = mailBadge(row.invoiceMailStatus);
    if (sent) invoice.push(sent);else if (invoiceApproved) invoice.push({
      text: "Sent",
      tone: "info"
    });
    if (invoiceApproved) invoice.push({
      text: "Approved",
      tone: "good"
    });
  }
  const payment = [];
  if (invoiceApproved) {
    const sent = mailBadge(row.paymentMailStatus);
    if (sent) payment.push(sent);
    if (row.paymentUploaded || row.certificateActive) payment.push({
      text: "Uploaded",
      tone: "good"
    });else payment.push({
      text: "Waiting",
      tone: "info"
    });
  }
  const confirmation = [];
  if (paymentIn) {
    const sent = mailBadge(row.confirmationMailStatus);
    if (sent) confirmation.push(sent);else if (packageSent) confirmation.push({
      text: "Sent",
      tone: "info"
    });
  }
  const active = row.certificateActive ? [{
    text: "Active",
    tone: "good"
  }] : [];
  return {
    done,
    current,
    badges: [promo, application, investment, invoice, payment, confirmation, active]
  };
}

function statusBadgeClass(tone) {
  if (tone === "good") return "bg-[#e7f6ee] text-[#0d6e4f]";
  if (tone === "warn") return "bg-[#fde8e6] text-[#b42318]";
  return "bg-[#e8f4ff] text-action";
}

function PipelineSteps({
  row
}) {
  const view = pipelineView(row);
  const stage = view.current === -1 ? PIPELINE_STEPS.length - 1 : view.current;
  const percent = (Math.max(stage, 0) / (PIPELINE_STEPS.length - 1)) * 100;
  return <div>
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <p className="text-xs font-semibold text-step">Step {Math.min(stage + 1, PIPELINE_STEPS.length)} of {PIPELINE_STEPS.length}</p>
      <p className="text-xs font-semibold text-primary">{PIPELINE_STEPS[stage]}</p>
    </div>
    <div className="relative h-2 overflow-hidden rounded-full bg-step-track" aria-hidden="true">
      <div className="h-full rounded-full bg-step-fill" style={{
        width: view.current === -1 ? "100%" : `${percent}%`
      }} />
    </div>
    <ol className="mt-3 flex items-start">
      {PIPELINE_STEPS.map((name, index) => {
        const done = view.done[index];
        const active = view.current === index;
        const expired = index === 1 && !done && row.applicationSent && row.inviteStatus !== "open";
        const badges = view.current === -1 || index <= view.current ? view.badges[index] : [];
        return <li key={name} className={index < PIPELINE_STEPS.length - 1 ? "flex flex-1 items-start" : "w-24 shrink-0"}>
          <div className="flex w-20 shrink-0 flex-col items-center">
            <span className={"flex size-8 items-center justify-center rounded-full text-xs font-semibold " + (expired ? "bg-[#b42318] text-white" : active ? "bg-step text-on-primary" : done ? "bg-step-done text-on-primary" : "bg-step-idle text-step")} aria-current={active ? "step" : undefined}>
              {done ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
            </span>
            <span className={"mt-1.5 text-center text-xs leading-tight " + (active || expired ? "font-semibold text-primary" : "text-fg")}>{name}</span>
            <span className="mt-1 flex flex-col items-center gap-1">
              {badges.map(badge => <span key={badge.text} className={"rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-tight " + statusBadgeClass(badge.tone)}>{badge.text}</span>)}
            </span>
          </div>
          {index < PIPELINE_STEPS.length - 1 ? <span className={"mt-4 h-0.5 flex-1 rounded-full " + (done ? "bg-step-done" : "bg-step-idle")} aria-hidden="true" /> : null}
        </li>;
      })}
    </ol>
  </div>;
}

function IntroOpensPanel({
  onApplication
}) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  function load() {
    return listIntroOpens().then(setRows);
  }
  useEffect(() => {
    load().catch(() => setError("Opened introductions could not be loaded."));
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
  return <section>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-semibold">Opens</h1>
        <p className="mt-2 max-w-2xl text-fg">Each lead starts with the promo email. Status badges sit under the step. An expired application link can be sent again.</p>
      </div>
      <button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending} onClick={() => void sync()}>{pending ? "Syncing…" : "Sync status"}</button>
    </div>
    {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
    {notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}
    <ul className="mt-4 grid gap-3">
      {(rows ?? []).map(row => {
        const applied = Boolean(row.applicationStatus);
        const linkExpired = !applied && row.applicationSent && row.inviteStatus !== "open";
        return <li key={row.email} className="rounded-lg border border-border bg-surface px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-primary">{row.name}</p>
              <p className="text-sm text-fg">{row.email}</p>
            </div>
            <p className="text-sm text-fg">{row.advisorName || "No advisor"}</p>
            <p className="text-sm whitespace-nowrap text-fg">{row.sentAt} UTC</p>
            {linkExpired ? <button type="button" className="min-h-11 rounded-md bg-action px-3 py-2 text-sm font-semibold text-on-primary" onClick={() => onApplication({
              id: row.leadId,
              name: row.name,
              email: row.email,
              phone: row.phone,
              amount: row.amount,
              term: row.term,
              objective: "",
              liquidity: "",
              source: "",
              status: "",
              notes: "",
              advisorId: row.advisorId,
              receivedAt: new Date().toISOString()
            })}>Resend new link</button> : !row.applicationSent && !applied ? <button type="button" className="min-h-11 rounded-md bg-action px-3 py-2 text-sm font-semibold text-on-primary" onClick={() => onApplication({
              id: row.leadId,
              name: row.name,
              email: row.email,
              phone: row.phone,
              amount: row.amount,
              term: row.term,
              objective: "",
              liquidity: "",
              source: "",
              status: "",
              notes: "",
              advisorId: row.advisorId,
              receivedAt: new Date().toISOString()
            })}>Application email</button> : null}
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <PipelineSteps row={row} />
          </div>
        </li>;
      })}
    </ul>
    {rows && rows.length === 0 ? <p className="mt-4 text-sm text-fg">No rates introductions have been sent yet.</p> : null}
  </section>;
}

function InboxPanel() {
  const brand = useBrand();
  const [rows, setRows] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [advisorId, setAdvisorId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [compose, setCompose] = useState({
    advisorId: "",
    leadId: "",
    subject: "",
    message: ""
  });
  const [leadQuery, setLeadQuery] = useState("");
  const [leads, setLeads] = useState([]);
  const selected = (rows ?? []).find(row => row.id === selectedId) || null;
  const pickedLead = leads.find(lead => lead.id === compose.leadId);
  const [composePreview, setComposePreview] = useState(null);
  const [replyError, setReplyError] = useState("");
  const [sending, setSending] = useState(false);
  const replyAdvisor = selected ? advisors.find(item => item.id === selected.advisorId) || advisors.find(item => item.name === selected.advisorName) : null;
  const replySubject = selected ? /^re:/i.test(selected.subject) ? selected.subject : `Re: ${selected.subject}` : "";
  const replyLetter = selected && selected.direction === "in" ? advisorNoteLetter({
    company: brand.companyName,
    companyPhone: brand.companyPhone,
    logo: brand.emailLogo,
    advisor: {
      name: replyAdvisor?.name || selected.advisorName || brand.companyName,
      phone: replyAdvisor?.phone || "",
      email: replyAdvisor?.email || "",
      mailbox: replyAdvisor?.mailbox || "",
      role: replyAdvisor?.role || "",
      personalPhone: replyAdvisor?.personalPhone || ""
    },
    greeting: selected.fromName ? `Dear ${selected.fromName},` : "Hello,",
    message: replyBody.trim() || " "
  }) : null;
  useEffect(() => {
    if (!compose.advisorId) {
      setComposePreview(null);
      return;
    }
    const timer = setTimeout(() => {
      previewAdvisorInboxMail({
        data: {
          advisorId: compose.advisorId,
          toName: pickedLead?.name || "",
          toEmail: pickedLead?.email || "",
          subject: compose.subject,
          message: compose.message
        }
      }).then(setComposePreview).catch(() => setComposePreview(null));
    }, 300);
    return () => clearTimeout(timer);
  }, [compose.advisorId, compose.subject, compose.message, pickedLead?.name, pickedLead?.email]);
  async function load(nextAdvisor = advisorId) {
    const result = await listInboxMessages({
      data: {
        advisorId: nextAdvisor
      }
    });
    setRows(result.rows);
  }
  async function sync(nextAdvisor = advisorId) {
    setPending(true);
    setError("");
    try {
      const result = await syncInboxNow();
      await load(nextAdvisor);
      const problem = result.errors?.[0];
      if (problem) setError(problem);
      const headline = result.notified ? `Telegram notice sent for ${result.notified} message${result.notified === 1 ? "" : "s"}.` : result.telegram ? result.telegram : result.checked ? "No Telegram notice was sent." : "No advisor has IMAP settings yet.";
      setNotice([headline, result.detail].filter(Boolean).join(" "));
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "Inbox could not be synced.");
    } finally {
      setPending(false);
    }
  }
  useEffect(() => {
    listAdvisors().then(setAdvisors).catch(() => setError("Advisors could not be loaded."));
    load().catch(caught => setError(caught instanceof Error && caught.message ? caught.message : "Inbox could not be loaded."));
    syncInboxNow().then(() => load()).catch(() => undefined);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      syncInboxNow().then(() => load(advisorId)).catch(() => undefined);
    }, 120000);
    return () => clearInterval(timer);
  }, [advisorId]);
  useEffect(() => {
    const timer = setTimeout(() => {
      listCrmLeads({
        data: {
          query: leadQuery,
          withEmail: true,
          page: 1
        }
      }).then(page => setLeads(page.rows)).catch(() => undefined);
    }, 250);
    return () => clearTimeout(timer);
  }, [leadQuery]);
  async function openMessage(row) {
    if (selectedId === row.id) {
      setSelectedId("");
      setReplyOpen(false);
      return;
    }
    setSelectedId(row.id);
    setReplyOpen(row.direction === "in");
    setReplyBody("");
    if (!row.seen && row.direction === "in") {
      await markInboxMessageRead({
        data: {
          id: row.id
        }
      }).catch(() => undefined);
      setRows(current => (current ?? []).map(item => item.id === row.id ? {
        ...item,
        seen: true
      } : item));
    }
  }
  async function sendReply(event) {
    event.preventDefault();
    if (!selected) return;
    const advisorId = selected.advisorId || replyAdvisor?.id || "";
    if (!advisorId) {
      setReplyError("This message is not tied to an advisor.");
      return;
    }
    if (!replyAdvisor?.mailbox) {
      setReplyError("Add a verified SMTP2GO mailbox on this advisor before sending.");
      return;
    }
    if (!selected.fromEmail) {
      setReplyError("This message has no reply address.");
      return;
    }
    setSending(true);
    setError("");
    setReplyError("");
    setNotice("");
    try {
      const subject = replySubject;
      await sendAdvisorInboxMail({
        data: {
          advisorId,
          toEmail: selected.fromEmail,
          toName: selected.fromName,
          subject,
          message: replyBody,
          leadId: selected.leadId
        }
      });
      setReplyOpen(false);
      setReplyBody("");
      await load();
      setNotice("Reply sent.");
    } catch (caught) {
      const message = caught instanceof Error && caught.message ? caught.message : "The reply could not be sent.";
      setError(message);
      setReplyError(message);
    } finally {
      setSending(false);
    }
  }
  async function sendNew(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    try {
      if (!pickedLead?.email) throw new Error("Select a lead with an email address.");
      await sendAdvisorInboxMail({
        data: {
          advisorId: compose.advisorId,
          toEmail: pickedLead.email,
          toName: pickedLead.name,
          subject: compose.subject,
          message: compose.message,
          leadId: pickedLead.id
        }
      });
      setCompose({
        advisorId: compose.advisorId,
        leadId: "",
        subject: "",
        message: ""
      });
      await load();
      setNotice(`Sent to ${pickedLead.name}.`);
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "The message could not be sent.");
    } finally {
      setPending(false);
    }
  }
  return <section>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-semibold">Inbox</h1>
        <p className="mt-2 max-w-2xl text-fg">Mail received by advisor mailboxes. The desk checks IMAP every few minutes. Replies and new letters use the advisor template and are sent from the verified mailbox.</p>
      </div>
      <button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending} onClick={() => void sync()}>{pending ? "Syncing…" : "Sync inbox"}</button>
    </div>
    {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
    {notice ? <p className="mt-3 text-sm text-fg">{notice}</p> : null}
    <form className="mt-4 grid gap-3 rounded-lg border border-border bg-surface p-4" onSubmit={event => void sendNew(event)}>
      <h2 className="text-lg font-semibold text-primary">New email</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm"><span className="font-semibold text-primary">Advisor</span><select className={`${controlClass} mt-1`} value={compose.advisorId} onChange={event => setCompose({
            ...compose,
            advisorId: event.target.value
          })} required={true}><option value="">Select an advisor</option>{advisors.map(advisor => <option key={advisor.id} value={advisor.id}>{advisor.name}{advisor.mailbox ? ` · ${advisor.mailbox}` : ""}</option>)}</select></label>
        <label className="block text-sm"><span className="font-semibold text-primary">Lead</span><input className={`${controlClass} mt-1`} value={leadQuery} placeholder="Search name or email" onChange={event => setLeadQuery(event.target.value)} /><select className={`${controlClass} mt-2`} value={compose.leadId} onChange={event => setCompose({
            ...compose,
            leadId: event.target.value
          })} required={true}><option value="">Select a lead</option>{leads.map(lead => <option key={lead.id} value={lead.id}>{lead.name} · {lead.email}</option>)}</select></label>
      </div>
      <label className="block text-sm"><span className="font-semibold text-primary">Subject</span><input className={`${controlClass} mt-1`} value={compose.subject} onChange={event => setCompose({
          ...compose,
          subject: event.target.value
        })} required={true} /></label>
      <label className="block text-sm"><span className="font-semibold text-primary">Message</span><textarea className={`${controlClass} mt-1 min-h-28`} value={compose.message} onChange={event => setCompose({
          ...compose,
          message: event.target.value
        })} required={true} /></label>
      {composePreview ? <LetterPreview html={composePreview.html} title={composePreview.subject} height="h-[720px]" meta={<div><p className="mt-3"><span className="inline-block w-14 text-[#8c8c8c]">From</span>{composePreview.from}</p><p className="mt-1"><span className="inline-block w-14 text-[#8c8c8c]">To</span>{composePreview.to}</p><p className="mt-1 font-semibold text-primary"><span className="inline-block w-14 font-normal text-[#8c8c8c]">Subject</span>{composePreview.subject}</p></div>} /> : null}
      <button type="submit" className="min-h-11 w-fit rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending}>Send email</button>
    </form>
    <label className="mt-4 block max-w-xs text-sm"><span className="font-semibold text-primary">Mailbox</span><select className={`${controlClass} mt-1`} value={advisorId} onChange={event => {
        setAdvisorId(event.target.value);
        setSelectedId("");
        void load(event.target.value);
      }}><option value="">All advisors</option>{advisors.map(advisor => <option key={advisor.id} value={advisor.id}>{advisor.name}</option>)}</select></label>
    <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
      <ul>
        {(rows ?? []).map(row => {
          const open = row.id === selectedId;
          return <li key={row.id} className="border-b border-border last:border-b-0">
            <button type="button" className={"grid w-full grid-cols-1 items-center gap-1 px-4 py-3 text-left sm:grid-cols-[minmax(180px,240px)_minmax(0,1fr)_148px] sm:gap-4 " + (open ? "bg-[#f4f8fc]" : "hover:bg-[#f7f7f7]")} onClick={() => void openMessage(row)}>
              <span className="flex min-w-0 items-center gap-2"><span className={"size-2 shrink-0 rounded-full " + (row.direction === "in" && !row.seen ? "bg-[#b42318]" : "bg-transparent")} aria-hidden="true" /><span className="truncate text-sm font-semibold text-primary">{row.direction === "out" ? `To ${row.toName || row.toEmail}` : row.fromName || row.fromEmail}</span></span>
              <span className="truncate text-sm text-fg">{row.subject || "(no subject)"}</span>
              <span className="text-xs text-fg sm:text-right">{row.receivedAt} UTC</span>
            </button>
            {open ? <div className="border-t border-border px-4 py-4">
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">{row.direction === "out" ? "Sent" : "Received"} · {row.advisorName}{row.leadName ? ` · ${row.leadName}` : ""}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-fg">{row.body || "This message has no text."}</p>
              {row.direction === "in" ? <form className="mt-4 grid gap-3 border-t border-border pt-4" onSubmit={event => void sendReply(event)}>
                <label className="block text-sm"><span className="font-semibold text-primary">Reply</span><textarea className={`${controlClass} mt-1 min-h-28`} value={replyBody} onChange={event => setReplyBody(event.target.value)} placeholder="Write the reply. The original email is not included." required={true} /></label>
                {replyLetter ? <LetterPreview html={replyLetter.html} title={replySubject} height="h-[640px]" meta={<div><p className="mt-3"><span className="inline-block w-14 text-[#8c8c8c]">From</span>{replyAdvisor?.mailbox ? `${replyAdvisor.name} <${replyAdvisor.mailbox}>` : replyAdvisor?.name || selected.advisorName}</p><p className="mt-1"><span className="inline-block w-14 text-[#8c8c8c]">To</span>{selected.fromName || selected.fromEmail}</p><p className="mt-1 font-semibold text-primary"><span className="inline-block w-14 font-normal text-[#8c8c8c]">Subject</span>{replySubject}</p></div>} /> : null}
                {replyError ? <p className="text-sm text-danger">{replyError}</p> : null}
                <button type="button" className="min-h-11 w-fit rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={sending} onClick={event => void sendReply(event)}>{sending ? "Sending…" : "Send reply"}</button>
              </form> : null}
            </div> : null}
          </li>;
        })}
        {rows && rows.length === 0 ? <li className="px-4 py-6 text-sm text-fg">No messages yet.</li> : null}
      </ul>
    </div>
  </section>;
}

var DESK_MENU = [{
  label: "Pipeline",
  items: [{
    id: "dashboard",
    label: "Dashboard"
  }, {
    id: "applications",
    label: "Applications"
  }, {
    id: "pipeline-leads",
    label: "Leads"
  }, {
    id: "pipeline-opens",
    label: "Opens"
  }]
}, {
  label: "Certificates",
  items: [{
    id: "funding",
    label: "Investments"
  }, {
    id: "active",
    label: "Active CDs"
  }, {
    id: "invoices",
    label: "Invoices"
  }]
}, {
  label: "Desk",
  items: [{
    id: "clients",
    label: "Clients"
  }, {
    id: "advisors",
    label: "Advisors"
  }, {
    id: "inbox",
    label: "Inbox"
  }, {
    id: "leads",
    label: "Lead emails"
  }, {
    id: "mail-status",
    label: "Email status"
  }]
}, {
  label: "Settings",
  items: [{
    id: "settings-general",
    label: "General"
  }, {
    id: "settings-logos",
    label: "Logos"
  }, {
    id: "settings-appearance",
    label: "Appearance"
  }, {
    id: "settings-misc",
    label: "Misc"
  }, {
    id: "emails",
    label: "Email templates"
  }]
}, {
  label: "Pricing",
  items: [{
    id: "investments",
    label: "Rates and promo"
  }]
}];
function DeskNav({
  tab,
  onSelect
}) {
  return <nav className="grid content-start gap-6" aria-label="Desk">{DESK_MENU.map(group => <div key={group.label}><p className="px-3 text-[11px] font-semibold tracking-widest text-[#8c8c8c] uppercase">{group.label}</p><ul className="mt-1 grid gap-0.5">{group.items.map(item => <li key={item.id}><TabButton active={tab === item.id} onClick={() => onSelect(item.id)}>{item.label}</TabButton></li>)}</ul></div>)}</nav>;
}
function TabButton({
  active,
  onClick,
  children
}) {
  return <button type="button" className={"min-h-10 w-full rounded-lg px-3 py-2 text-left text-sm " + (active ? "bg-[#e8f4ff] font-semibold text-action" : "font-medium text-primary hover:bg-white")} aria-current={active ? "page" : void 0} onClick={onClick}>{children}</button>;
}
function Stat({
  label,
  value
}) {
  return <div className="rounded-lg border border-border bg-surface px-4 py-4"><p className="text-xs font-semibold tracking-widest text-primary uppercase">{label}</p><p className="mt-2 text-3xl font-semibold">{rowsafe(value)}</p></div>;
}
function rowsafe(value) {
  return Number.isFinite(value) ? value : 0;
}
function ApplicationTable({
  rows,
  selectedId,
  onSelect
}) {
  if (rows.length === 0) return <p className="mt-4 rounded-lg border border-border bg-surface px-4 py-6 text-sm text-fg">No applications in this view.</p>;
  return <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-border text-xs tracking-wide text-primary uppercase"><tr><th className="px-4 py-3 font-semibold">Applicant</th><th className="px-4 py-3 font-semibold">Account</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Submitted</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className={"cursor-pointer border-b border-border last:border-0 " + (row.id === selectedId ? "bg-step-idle" : "")} onClick={() => onSelect(row.id)}><td className="px-4 py-3"><span className="block font-semibold text-primary">{row.applicantName}</span><span className="text-fg">{row.email}</span></td><td className="px-4 py-3">{row.accountType}</td><td className="px-4 py-3 capitalize">{row.status === "hold" ? "On hold" : row.status}</td><td className="px-4 py-3">{row.submittedAt} UTC</td></tr>)}</tbody></table></div>;
}
function StoredDocument({
  label,
  name,
  file
}) {
  const ready = Boolean(file?.startsWith("data:"));
  return <div className="rounded-md border border-border px-4 py-3"><p className="text-xs font-semibold tracking-wide text-primary uppercase">{label}</p><p className="mt-1 text-sm text-fg">{name || "No file"}</p>{ready ? <div className="mt-3 flex flex-wrap gap-2"><button type="button" className="min-h-11 rounded-md bg-action px-3 py-2 text-sm font-semibold text-on-primary" onClick={() => openStoredFile(file, name, false)}>View</button><button type="button" className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary" onClick={() => openStoredFile(file, name, true)}>Download</button></div> : name ? <p className="mt-2 text-sm text-fg">Only the file name was saved. Ask the applicant to submit the document again.</p> : null}</div>;
}
function openStoredFile(file, name, download) {
  const [meta, data] = file.split(",");
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? "application/octet-stream";
  const bytes = Uint8Array.from(atob(data), char => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], {
    type: mime
  }));
  const link = document.createElement("a");
  link.href = url;
  if (download) link.download = name || "document";else link.target = "_blank";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 6e4);
}
function ApplicationDetail({
  row,
  onStatus,
  onRemove
}) {
  const form = row.payload;
  const fields = [["Account", form.accountType], ["Phone", `${form.phoneCountry} ${form.phone}`], ["Date of birth", [form.dobDay, form.dobMonth, form.dobYear].filter(Boolean).join(" ")], ["Nationality", form.nationality], ["Residence", form.residence], ["Occupation", form.occupation], ["Address", [form.street, form.apt, form.city, form.region, form.postal, form.country].filter(Boolean).join(", ")], ["Tax residence", form.taxResidence], ["Tax ID", form.taxId], ["Source of wealth", form.sourceOfWealth], ["Source of funds", form.sourceOfFunds], ["Purpose", form.investmentPurpose], ["Net worth", form.netWorth], ["Preferred amount", form.preferredAmount], ["Preferred term", form.preferredTerm ? `${form.preferredTerm}-month` : ""], ["Promotional code", form.promoCode], ["Identity document", `${form.idType}${form.idFileName ? ` · ${form.idFileName}` : ""}`], ["Address document", `${form.addressDocType}${form.addressFileName ? ` · ${form.addressFileName}` : ""}`], ["Bank", form.bankName], ["Account holder", form.accountHolder], ["Bank address", [form.bankStreet, form.bankLine2, form.bankCity, form.bankState, form.bankZip].filter(Boolean).join(", ")], ["Routing number", form.routingNumber], ["Account number", form.accountNumber]];
  return <article className="mt-4 rounded-lg border border-border bg-surface p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold text-primary">{row.applicantName}</h2><p className="text-sm text-fg">{row.email}</p><p className="mt-1 text-sm text-fg">{row.status === "approved" ? "Sign-in is active. The investor portal opens with this email and the application password." : "Approving creates a sign-in and opens the investor portal with this email and the application password."}</p></div><div className="flex flex-wrap gap-2"><button type="button" className="min-h-11 rounded-md bg-action px-3 py-2 text-sm font-semibold text-on-primary" onClick={() => onStatus("approved")}>Approve</button><button type="button" className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary" onClick={() => onStatus("hold")}>Hold</button><button type="button" className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary" onClick={() => onStatus("pending")}>Pending</button><button type="button" className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-danger" onClick={onRemove}>Remove</button></div></div><dl className="mt-4 grid gap-3 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="text-xs font-semibold tracking-wide text-primary uppercase">{label}</dt><dd className="text-sm text-fg">{value || "—"}</dd></div>)}</dl><div className="mt-6 grid gap-4 sm:grid-cols-2"><StoredDocument label="Identity document" name={form.idFileName} file={form.idFile} /><StoredDocument label="Address document" name={form.addressFileName} file={form.addressFile} /></div>{form.signature?.startsWith("data:image/") ? <div className="mt-4"><p className="text-xs font-semibold tracking-wide text-primary uppercase">Signature</p><img src={form.signature} alt="Applicant signature" className="mt-2 h-24 rounded-md border border-border bg-white object-contain" /></div> : null}</article>;
}