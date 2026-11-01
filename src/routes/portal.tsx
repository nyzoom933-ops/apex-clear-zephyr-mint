import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { BadgePercent, Banknote, Bell, CalendarClock, CalendarRange, Check, FileUp, Landmark, LayoutDashboard, Lock, Menu, Percent, Plus, Receipt, Shield, SlidersHorizontal, TriangleAlert, Wallet, X, type LucideIcon } from "lucide-react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { headerActionClass, SiteHeader, useBrand } from "@/components/site-header";
import { SignaturePad } from "@/components/signature-pad";
import { cancelFunding, downloadInvestmentPdf, downloadInvoicePdf, getAdminSession, getCdTerms, getInvestorPortal, getInvestorSession, getInvestmentTypes, getMyFundings, getPaymentFile, getPromo, investorLogout, listMyNotifications, markMyNotificationsRead, signFunding, submitFunding, uploadPaymentConfirmation, type ApplicationPayload, type CdTerm, type FundingPosition, type InvestmentType } from "@/lib/admin.functions";
import { DEFAULT_COMPANY_NAME } from "@/lib/company";
import { amountRange, EMPTY_PROMO, formatBonus, formatOfferDate, matchTier, parseApy, promoMonths, type PromoOffer } from "@/lib/promo";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "Portal · Account Holding" }] }),
  component: PortalPage,
});

type PortalAccount = {
  name: string;
  email: string;
  accountType: string;
  currency: string;
  openedOn: string;
  payload: ApplicationPayload;
};

function PortalPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<PortalAccount | null>(null);
  const [desk, setDesk] = useState(false);

  useEffect(() => {
    void getInvestorPortal()
      .then(setAccount)
      .catch(() => {
        void getInvestorSession()
          .then((session) => {
            void navigate({ to: session?.destination === "application" ? "/application" : "/login" });
          })
          .catch(() => {
            void navigate({ to: "/login" });
          });
      });
  }, [navigate]);

  useEffect(() => {
    void getAdminSession()
      .then((session) => setDesk(session.signedIn))
      .catch(() => setDesk(false));
  }, []);

  async function signOut() {
    await investorLogout();
    void navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        eyebrow="Investor portal"
        action={
          <div className="flex items-center gap-2">
            {desk ? (
              <button type="button" className={headerActionClass} onClick={() => void navigate({ to: "/admin" })}>
                Back to desk
              </button>
            ) : null}
            <NotificationBell />
            <button type="button" className={headerActionClass} onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        }
      />
      {!account ? (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <p className="text-sm text-fg">Opening your account…</p>
        </main>
      ) : (
        <PortalBody account={account} />
      )}
    </div>
  );
}

type PortalTab = "dashboard" | "active" | "investments" | "fund" | "manage";

const PromoContext = createContext<PromoOffer>(EMPTY_PROMO);

function usePromo() {
  return useContext(PromoContext);
}

const PORTAL_TABS: { id: PortalTab; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "active", label: "Active CDs", icon: Landmark },
  { id: "investments", label: "Investments", icon: Wallet },
  { id: "fund", label: "Add investment", icon: Plus },
  { id: "manage", label: "Manage", icon: SlidersHorizontal },
];

function PortalMenu({ tab, onChange }: { tab: PortalTab; onChange: (tab: PortalTab) => void }) {
  const [open, setOpen] = useState(false);
  const current = PORTAL_TABS.find((item) => item.id === tab) ?? PORTAL_TABS[0];

  function choose(next: PortalTab) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className="relative border-b border-border">
      <div className="py-2 md:hidden">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-1"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="flex items-center gap-3 text-sm font-semibold text-primary">
            <span className="flex size-9 items-center justify-center rounded-lg bg-step-idle/40 text-action">
              <current.icon className="size-4" aria-hidden="true" />
            </span>
            {current.label}
          </span>
          <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-primary">
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </span>
        </button>
      </div>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-20 bg-primary/20 md:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />
          <ul className="menu-drop absolute inset-x-0 top-full z-30 grid gap-1 rounded-xl border border-border bg-surface p-2 shadow-lg md:hidden">
            {PORTAL_TABS.map((item) => {
              const selected = tab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={
                      "menu-link flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-sm " +
                      (selected ? "bg-step-idle/40 font-semibold text-action" : "text-primary")
                    }
                    aria-current={selected ? "page" : undefined}
                    onClick={() => choose(item.id)}
                  >
                    <span className={"flex size-8 items-center justify-center rounded-md " + (selected ? "bg-surface text-action" : "bg-bg text-primary")}>
                      <item.icon className="menu-icon size-4" aria-hidden="true" />
                    </span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
      <ul className="hidden gap-1 md:flex">
        {PORTAL_TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={"menu-link relative flex min-h-11 items-center gap-2 px-3 text-sm " + (selected ? "font-semibold text-action" : "text-primary")}
                aria-current={selected ? "page" : undefined}
                onClick={() => choose(item.id)}
              >
                <item.icon className="menu-icon size-4" aria-hidden="true" />
                {item.label}
                <span className={"absolute inset-x-3 bottom-0 h-0.5 origin-left bg-action transition-transform duration-200 " + (selected ? "scale-x-100" : "scale-x-0")} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PortalBody({ account }: { account: PortalAccount }) {
  const [tab, setTab] = useState<PortalTab>("dashboard");
  const [positions, setPositions] = useState<FundingPosition[]>([]);
  const [notice, setNotice] = useState("");
  const [offer, setOffer] = useState<PromoOffer>(EMPTY_PROMO);

  function refresh() {
    return getMyFundings().then(setPositions).catch(() => setPositions([]));
  }

  useEffect(() => {
    void refresh();
    void getPromo().then(setOffer).catch(() => setOffer(EMPTY_PROMO));
  }, []);

  const holdings = positions.filter((position) => position.status === "payment_approved");
  const pipeline = positions.filter((position) => position.status !== "cancelled" && position.status !== "payment_approved");

  return (
    <PromoContext.Provider value={offer}>
      <div className="flex flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <PortalMenu tab={tab} onChange={setTab} />
          {notice ? <p className="mt-4 rounded-md border border-border bg-surface px-4 py-3 text-sm text-fg">{notice}</p> : null}
          <CelebrationBanners holdings={holdings} onActive={() => setTab("active")} />
          <div key={tab} className="step-enter">
          {tab === "dashboard" ? (
            <Dashboard
              account={account}
              holdings={holdings}
              pipeline={pipeline}
              onAdd={() => setTab("fund")}
              onActive={() => setTab("active")}
              onView={() => setTab("investments")}
            />
          ) : null}
          {tab === "active" ? <ActiveCds positions={holdings} waiting={pipeline.length} account={account} onAdd={() => setTab("fund")} /> : null}
          {tab === "investments" ? <InvestmentList positions={pipeline} signature={account.payload.signature} phone={[account.payload.phoneCountry, account.payload.phone].filter(Boolean).join(" ")} email={account.email} onAdd={() => setTab("fund")} onSigned={() => void refresh()} /> : null}
          {tab === "fund" ? (
            <FundingPanel
              preferredTerm={account.payload.preferredTerm ?? ""}
              preferredAmount={account.payload.preferredAmount ?? ""}
              onSubmitted={() => {
                setNotice("Investment submitted. Accept the terms on the investment to continue.");
                setTab("investments");
                void refresh();
              }}
            />
          ) : null}
          {tab === "manage" ? <ManageInvestments positions={positions} signature={account.payload.signature} phone={[account.payload.phoneCountry, account.payload.phone].filter(Boolean).join(" ")} email={account.email} onAdd={() => setTab("fund")} onChanged={() => void refresh()} /> : null}
          </div>
        </main>
        <PortalFooter tab={tab} onChange={setTab} />
      </div>
    </PromoContext.Provider>
  );
}

const DEFAULT_FOOTER_TEXT = "FDIC insurance covers the first $250,000 per individual or $500,000 per joint account. Rates and calculator results are illustrations. Early withdrawal penalties may apply.";

function PortalFooter({ tab, onChange }: { tab: PortalTab; onChange: (tab: PortalTab) => void }) {
  const { companyName, footerLogo, footerText } = useBrand();
  const name = companyName || DEFAULT_COMPANY_NAME;
  const note = footerText.trim() || DEFAULT_FOOTER_TEXT;
  return (
    <footer className="mt-8 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-[1.4fr_1fr]">
        <div>
          {footerLogo ? (
            <img src={footerLogo} alt={name} className="h-8 w-auto max-w-[180px] object-contain" />
          ) : (
            <p className="text-sm font-bold tracking-wide text-primary">{name.toUpperCase()}</p>
          )}
          <p className="mt-1 text-sm text-fg">Investor accounts</p>
          <p className="mt-4 max-w-xl text-xs leading-5 text-fg">{note}</p>
        </div>
        <nav aria-label="Portal">
          <p className="text-xs font-semibold tracking-widest text-[#12315c] uppercase">Portal</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {PORTAL_TABS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={"text-left text-sm " + (tab === item.id ? "font-semibold text-action" : "text-primary")}
                  aria-current={tab === item.id ? "page" : undefined}
                  onClick={() => {
                    onChange(item.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-fg">© {new Date().getFullYear()} {name}</p>
      </div>
    </footer>
  );
}

function FundingPanel({ onSubmitted, preferredTerm = "", preferredAmount = "" }: { onSubmitted: () => void; preferredTerm?: string; preferredAmount?: string }) {
  const offer = usePromo();
  const scroller = useRef<HTMLDivElement>(null);
  const [cd, setCd] = useState<InvestmentType | null>(null);
  const [terms, setTerms] = useState<CdTerm[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState(preferredAmount);
  const [appliedPreference, setAppliedPreference] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [page, setPage] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [ratesOpen, setRatesOpen] = useState(false);

  useEffect(() => {
    void Promise.all([getInvestmentTypes(), getCdTerms()])
      .then(([types, nextTerms]) => {
        setCd(types[0] ?? null);
        setTerms(nextTerms);
      })
      .catch(() => setError("Certificates could not be loaded."));
  }, []);

  const orderedTerms = [...terms].sort((a, b) => Number(b.featured) - Number(a.featured) || a.months - b.months);
  const selected = orderedTerms.find((term) => term.id === selectedId) ?? null;

  useEffect(() => {
    if (appliedPreference || !preferredTerm || terms.length === 0) return;
    const sorted = [...terms].sort((a, b) => Number(b.featured) - Number(a.featured) || a.months - b.months);
    const months = Number(preferredTerm);
    const index = sorted.findIndex((term) => term.months === months);
    if (index < 0) {
      setAppliedPreference(true);
      return;
    }
    setSelectedId(sorted[index].id);
    setPage(index);
    setRatesOpen(promoMonths(offer).includes(months));
    setAppliedPreference(true);
    window.setTimeout(() => {
      scroller.current?.querySelectorAll<HTMLElement>("[data-term]")[index]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }, 0);
  }, [appliedPreference, offer, terms, preferredTerm]);

  function move(direction: number) {
    const next = Math.min(Math.max(page + direction, 0), Math.max(orderedTerms.length - 1, 0));
    setPage(next);
    const card = scroller.current?.querySelectorAll<HTMLElement>("[data-term]")[next];
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function openSummary() {
    if (!selected) return;
    const value = Number(amount.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount.");
      return;
    }
    setError("");
    setSummaryOpen(true);
  }

  async function fund() {
    if (!selected || !cd) return;
    setError("");
    setPending(true);
    try {
      await submitFunding({ data: { typeId: "cd", termId: selected.id, amount } });
      setAmount("");
      setError("");
      setPending(false);
      setSummaryOpen(false);
      onSubmitted();
    } catch {
      setError("Check the amount.");
      setPending(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="rounded-xl bg-[#f3f4f6] px-4 py-6 sm:px-6">
        <h3 className="text-center text-2xl font-semibold text-[#3d3d3d]">Browse all available CD terms</h3>
        <div ref={scroller} className="mt-6 overflow-x-auto scroll-smooth pb-2">
          <div className="mx-auto flex w-max min-w-full items-stretch justify-center gap-3 px-1 pt-4">
          {orderedTerms.map((term) => {
            const active = term.id === selectedId;
            const promo = promoMonths(offer).includes(term.months);
            return (
              <div
                key={term.id}
                data-term
                role="button"
                tabIndex={0}
                className={
                  "relative mt-3 flex min-h-48 min-w-[220px] shrink-0 cursor-pointer flex-col rounded-xl border bg-white px-5 pt-16 pb-5 text-left shadow-sm " +
                  (active ? "border-[#006fcf]" : "border-[#e7e7e7]")
                }
                onClick={() => {
                  setSelectedId(term.id);
                  setRatesOpen(promo);
                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  setSelectedId(term.id);
                  setRatesOpen(promo);
                  setError("");
                }}
              >
                {term.featured || promo ? (
                  <span className="absolute -top-3 left-4 flex flex-col items-start gap-1">
                    {term.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#006fcf] px-2.5 py-1 text-xs font-semibold text-white">
                        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
                          <path d="M2 12.5 6 8l2.5 2.5L14 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                          <path d="M10 4h4v4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                        Featured APY
                      </span>
                    ) : null}
                    {promo ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#e24b2a] px-2.5 py-1 text-xs font-semibold text-white">
                        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
                          <path d="M2.5 8.5 8 3h4.5V7.5L7 13a1.5 1.5 0 0 1-2.1 0L2.5 10.6a1.5 1.5 0 0 1 0-2.1Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
                          <circle cx="10.7" cy="5.3" r="0.8" fill="currentColor" />
                        </svg>
                        Promotional Offer
                      </span>
                    ) : null}
                  </span>
                ) : null}
                <span className="block text-2xl font-semibold text-[#262626]">{term.apy.includes("APY") ? term.apy : `${term.apy} APY`}</span>
                <span className="mt-1 block text-sm text-[#5c6370]">{term.months}-month term</span>
                {promo ? (
                  <button
                    type="button"
                    className="mt-auto self-start pt-4 text-left text-sm font-semibold text-[#006fcf]"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedId(term.id);
                      setRatesOpen((open) => (selectedId === term.id ? !open : true));
                      setError("");
                    }}
                  >
                    Explore bonus rates
                  </button>
                ) : null}
              </div>
            );
          })}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" className="flex size-8 items-center justify-center text-[#006fcf]" aria-label="Previous terms" onClick={() => move(-1)}>
            ‹
          </button>
          <div className="flex items-center gap-1.5">
            {orderedTerms.map((term, index) => (
              <button
                key={term.id}
                type="button"
                aria-label={`Show term ${index + 1}`}
                className={index === page ? "h-1.5 w-5 rounded-full bg-[#006fcf]" : "size-1.5 rounded-full bg-[#c5c8ce]"}
                onClick={() => {
                  setPage(index);
                  scroller.current?.querySelectorAll<HTMLElement>("[data-term]")[index]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
                }}
              />
            ))}
          </div>
          <button type="button" className="flex size-8 items-center justify-center text-[#006fcf]" aria-label="Next terms" onClick={() => move(1)}>
            ›
          </button>
        </div>
        {ratesOpen && selected && promoMonths(offer).includes(selected.months) ? (
          <PromoRates offer={offer} term={selected} />
        ) : null}
      </div>
      <PromoCalculator
        offer={offer}
        selected={selected}
        onApply={(months, value) => {
          const match = orderedTerms.find((term) => term.months === months);
          if (match) setSelectedId(match.id);
          setAmount(value);
          setError("");
        }}
      />
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      {cd && selected ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-white px-5 py-4">
          <div>
            <p className="text-sm text-fg">{cd.issuer}</p>
            <p className="text-lg font-semibold text-[#12315c]">
              {selected.months}-month · {moneyLabel(amount)}
            </p>
          </div>
          <button type="button" disabled={pending} className="min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60" onClick={openSummary}>
            {pending ? "Submitting…" : "Review and confirm"}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-fg">Select a term to review the certificate.</p>
      )}
      {summaryOpen && cd && selected ? (
        <InvestmentSummary
          type={cd}
          term={selected}
          amount={amount}
          pending={pending}
          error={error}
          onClose={() => setSummaryOpen(false)}
          onConfirm={() => void fund()}
        />
      ) : null}
    </div>
  );
}

const SUMMARY_STEPS = [
  "Confirm investment terms.",
  "Wait for advisor call for process details.",
  "Fund by received payment instructions.",
];

function InvestmentSummary({
  type,
  term,
  amount,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  type: InvestmentType;
  term: CdTerm;
  amount: string;
  pending: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const offer = usePromo();
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const numeric = Number(amount.replace(/[^0-9.]/g, ""));
  const shown = Number.isFinite(numeric)
    ? numeric.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : amount;
  const promo = matchTier(offer, term.months, numeric);
  const apy = promo ? formatApy(parseApy(term.apy) + promo.bonusPercent / 100) : term.apy.includes("%") ? term.apy : `${term.apy}%`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="investment-summary-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-[#0c2348] px-6 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">Investment summary</p>
              <h2 id="investment-summary-title" className="confirm-title mt-1 text-3xl font-semibold text-white">{shown}</h2>
              <p className="mt-1 text-sm text-white/90">{term.months}-month certificate · {apy} final APY</p>
            </div>
            <button type="button" className="text-2xl leading-none text-white/80" aria-label="Close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 text-sm">
          <SummaryFact label="Issuer" value={type.issuer} />
          <SummaryFact label="Structure" value={type.structure} />
          <SummaryFact label="Term" value={`${term.months}-month`} />
          <SummaryFact label="Final APY" value={apy} />
          <SummaryFact label="Minimum" value={type.minimumInvestment || "—"} />
          <SummaryFact label="Callable" value="Non-callable" />
          <div className="col-span-2">
            <dt className="text-xs font-semibold tracking-wide text-[#12315c] uppercase">Capital protection</dt>
            <dd className="mt-1 text-fg">FDIC. 100% cover on the first $250,000 per individual or $500,000 per joint account.</dd>
          </div>
        </dl>
        <ol className="mx-6 grid gap-3 border-t border-border pt-5">
          {SUMMARY_STEPS.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#006fcf] text-xs font-semibold text-white">{index + 1}</span>
              <span className="text-sm text-fg">{step}</span>
            </li>
          ))}
        </ol>
        {error ? <p className="mx-6 mt-4 text-sm text-danger">{error}</p> : null}
        <div className="flex flex-wrap gap-2 px-6 py-6">
          <button type="button" className="min-h-11 rounded-md border border-border px-5 py-2 font-semibold text-primary" onClick={onClose}>
            Back
          </button>
          <button
            type="button"
            disabled={pending}
            className="min-h-11 flex-1 rounded-md bg-action px-5 py-2 font-semibold text-on-primary disabled:opacity-60"
            onClick={onConfirm}
          >
            {pending ? "Submitting…" : "Confirm investment"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-[#12315c] uppercase">{label}</dt>
      <dd className="mt-1 text-fg">{value || "—"}</dd>
    </div>
  );
}

function moneyLabel(amount: string) {
  const value = Number(amount.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "Enter an amount";
}

function PromoRates({ offer, term }: { offer: PromoOffer; term: CdTerm }) {
  const tiers = offer.tiers.filter((tier) => tier.months.includes(term.months));
  return (
    <div className="mx-auto mt-6 max-w-3xl text-sm leading-6 text-[#262626]">
      {offer.intro ? <p>{offer.intro}</p> : null}
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white">
        <div className="border-b border-[#e6e6e6] px-4 py-3 font-semibold">{term.months}-Month CD</div>
        <div className="border-b border-[#e6e6e6] px-4 py-3">{term.apy.includes("APY") ? term.apy : `${term.apy} APY`}</div>
        <div className="grid grid-cols-2 border-b border-[#e6e6e6] bg-[#f7f7f7] px-4 py-3 text-xs font-semibold tracking-wide uppercase">
          <span>Deposit</span>
          <span>Promo bonus</span>
        </div>
        {tiers.map((tier) => (
          <div key={tier.id} className="grid grid-cols-2 border-b border-[#e6e6e6] px-4 py-3 last:border-b-0">
            <span>{amountRange(tier)}</span>
            <span>{formatBonus(tier.bonusPercent)}</span>
          </div>
        ))}
      </div>
      <ul className="mt-4 grid gap-2">
        {offerNotes(offer).map((note) => (
          <li key={note.text} className="flex items-start gap-2">
            <note.icon className="mt-0.5 size-4 shrink-0 text-[#006fcf]" aria-hidden="true" />
            <span className={note.strong ? "font-semibold text-primary" : undefined}>{note.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function offerNotes(offer: PromoOffer): Array<{ icon: LucideIcon; text: string; strong?: boolean }> {
  const notes: Array<{ icon: LucideIcon; text: string; strong?: boolean }> = [];
  if (offer.protection) notes.push({ icon: Shield, text: offer.protection, strong: true });
  for (const part of offer.finePrint.split(/(?<=\.)\s+/).map((item) => item.trim()).filter(Boolean)) {
    const icon = /minimum balance/i.test(part) ? Wallet : /penalt/i.test(part) ? TriangleAlert : Receipt;
    notes.push({ icon, text: part.endsWith(".") ? part : `${part}.` });
  }
  if (offer.startsOn && offer.endsOn) {
    notes.push({ icon: CalendarRange, text: `Offer available from ${formatOfferDate(offer.startsOn)} – ${formatOfferDate(offer.endsOn)}.` });
  }
  return notes;
}

function PromoCalculator({ offer, selected, onApply }: { offer: PromoOffer; selected: CdTerm | null; onApply: (months: number, amount: string) => void }) {
  const [deposit, setDeposit] = useState("100000");
  const months = selected?.months ?? 0;
  const amount = Number(deposit.replace(/[^0-9.]/g, ""));
  const tiers = offer.tiers.filter((tier) => tier.months.includes(months));
  const bonus = selected && Number.isFinite(amount) ? matchTier(offer, months, amount) : null;
  const base = parseApy(selected?.apy ?? "");
  const apy = base + (bonus ? bonus.bonusPercent / 100 : 0);
  const future = Number.isFinite(amount) && amount > 0 && selected ? amount * Math.pow(1 + apy, months / 12) : 0;
  const interest = Math.max(future - amount, 0);
  const floor = tiers.reduce((lowest, tier) => Math.min(lowest, tier.minAmount), Number.POSITIVE_INFINITY);

  function apply(nextDeposit: string) {
    setDeposit(nextDeposit);
    if (selected) onApply(months, nextDeposit.replace(/[^0-9.]/g, ""));
  }

  return (
    <section className="mt-6">
      <div className="rounded-xl bg-[#006fcf] px-4 py-8 text-white sm:px-8">
        <h3 className="calc-title text-center text-3xl font-semibold tracking-tight text-white">Calculate your money’s future value</h3>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm">
          {selected ? `${selected.months}-month term · ${selected.apy.includes("APY") ? selected.apy : `${selected.apy} APY`} base rate.` : "Select a CD term above."}
        </p>
        <div className="mx-auto mt-6 max-w-3xl rounded-2xl bg-white px-5 py-6 text-[#262626] sm:px-8">
          <h4 className="text-center text-xl font-semibold">Tell us how much you want to deposit</h4>
          <div className={"mt-6 grid gap-6 " + (tiers.length > 0 ? "sm:grid-cols-2" : "")}>
            <div>
              <label className="block">
                <span className="block text-sm font-semibold">Enter Initial Deposit Amount</span>
                <input
                  inputMode="decimal"
                  className="mt-3 w-full rounded-md border border-[#cfcfcf] px-3 py-3 text-base outline-none focus:border-[#006fcf]"
                  value={deposit}
                  onChange={(event) => apply(event.target.value)}
                />
              </label>
              {tiers.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tiers.map((tier) => {
                    const picked = amount === tier.minAmount;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        className={
                          "min-h-9 rounded-full border px-3 py-1 text-sm font-semibold " +
                          (picked ? "border-[#006fcf] bg-[#006fcf] text-white" : "border-[#cfcfcf] text-[#262626]")
                        }
                        onClick={() => apply(String(tier.minAmount))}
                      >
                        ${tier.minAmount.toLocaleString("en-US")}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            {tiers.length > 0 ? (
              <div className="sm:border-l sm:border-[#e6e6e6] sm:pl-6">
                <p className="text-sm font-semibold">Available promo bonus tiers</p>
                <ul className="mt-3 divide-y divide-[#e6e6e6] text-sm">
                  {tiers.map((tier) => (
                    <li key={tier.id} className={"flex items-center justify-between gap-3 py-2 " + (bonus?.id === tier.id ? "font-semibold text-[#006fcf]" : "")}>
                      <span>{amountRange(tier)}</span>
                      <span>{formatBonus(tier.bonusPercent)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="mt-6 grid gap-4 border-b border-[#e6e6e6] pb-4 sm:grid-cols-3">
            <p>
              <span className="block text-sm font-semibold">Base rate</span>
              <span className="text-2xl font-semibold">{selected ? formatApy(base) : "—"}</span>
            </p>
            <p className="sm:border-l sm:border-[#e6e6e6] sm:pl-6">
              <span className="block text-sm font-semibold">Promo bonus APY</span>
              <span className="text-2xl font-semibold">{bonus ? formatBonus(bonus.bonusPercent) : "—"}</span>
              {!bonus && selected && Number.isFinite(floor) ? (
                <span className="mt-1 block text-sm text-[#8a5a00]">Bonuses start at ${floor.toLocaleString("en-US")}</span>
              ) : null}
            </p>
            <p className="sm:border-l sm:border-[#e6e6e6] sm:pl-6">
              <span className="block text-sm font-semibold">Final APY</span>
              <span className="text-2xl font-semibold">{selected ? formatApy(apy) : "—"}</span>
            </p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <p>
              <span className="block text-sm font-semibold">Future Balance</span>
              <span className="text-2xl font-semibold">{wholeDollars(future)}</span>
            </p>
            <p className="sm:border-l sm:border-[#e6e6e6] sm:pl-6">
              <span className="block text-sm font-semibold">Interest Earned</span>
              <span className="text-2xl font-semibold">{wholeDollars(interest)}</span>
            </p>
            <p className="sm:border-l sm:border-[#e6e6e6] sm:pl-6">
              <span className="block text-sm font-semibold">Total return</span>
              <span className="text-2xl font-semibold">{selected && amount > 0 ? `${((interest / amount) * 100).toFixed(2)}%` : "—"}</span>
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs">Interest compounds daily. Savings calculator is for illustration only.</p>
      </div>
    </section>
  );
}

function moneyValue(amount: string) {
  const value = Number(amount.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function formatApy(rate: number) {
  const percent = rate * 100;
  const digits = Math.round(percent * 1000) % 10 === 0 ? 2 : 3;
  return `${percent.toFixed(digits)}%`;
}

function wholeDollars(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function investmentRates(position: FundingPosition, offer: PromoOffer) {
  const months = Number(position.termLabel.match(/(\d+)-month/)?.[1] ?? 0);
  const principal = moneyValue(position.amount);
  if (position.finalApy) {
    return { promo: position.promoApy || "—", final: position.finalApy, rate: parseApy(position.finalApy), months, principal };
  }
  const basePercent = Number(position.termLabel.match(/([\d.]+)%/)?.[1] ?? 0);
  const bonus = matchTier(offer, months, principal);
  const finalRate = basePercent / 100 + (bonus ? bonus.bonusPercent / 100 : 0);
  return {
    promo: bonus ? formatBonus(bonus.bonusPercent) : "—",
    final: basePercent ? formatApy(finalRate) : "—",
    rate: finalRate,
    months,
    principal,
  };
}

const DEAL_STEPS = ["Accept terms", "Advisor call", "Invoice", "Upload payment", "Confirmation"];

function fundStep(position: FundingPosition) {
  if (position.status === "payment_approved") return DEAL_STEPS.length;
  if (!position.signed) return 0;
  if (position.status === "pending") return 1;
  if (position.status === "approved_phone") return 2;
  if (position.status === "instructions_sent" && !position.paymentFileName) return 3;
  if (position.status === "instructions_sent") return 4;
  return 0;
}

function statusLabel(status: FundingPosition["status"]) {
  if (status === "cancelled") return "Cancelled";
  if (status === "approved_phone") return "Approved by phone";
  if (status === "instructions_sent") return "Invoice created";
  if (status === "payment_approved") return "Active";
  return "Pending call/email";
}

function certificateTitle(position: FundingPosition, months = 0, apy = "") {
  const label = position.termLabel || "";
  const fromLabel = label.match(/(\d+)-month/i)?.[1];
  const fromRate = label.match(/([\d.]+%)/)?.[1];
  const term = fromLabel || (months ? String(months) : "");
  const rate = fromRate || (apy && apy !== "—" ? apy : "");
  if (term && rate) return `${term}-month · ${rate.includes("APY") ? rate : `${rate} APY`}`;
  if (position.termLabel && !/^cds?$/i.test(position.termLabel)) return position.termLabel;
  return "Certificate";
}

function statusDetail(position: FundingPosition) {
  if (position.status === "cancelled") return "This investment was cancelled.";
  if (position.status === "payment_approved") return "This certificate is active through maturity.";
  if (!position.signed) return "Accept the terms to continue.";
  if (position.status === "instructions_sent" && position.paymentFileName) return "Wire confirmation is with your advisor.";
  if (position.status === "instructions_sent") return "Your invoice is ready. Send the wire, then upload the confirmation.";
  if (position.status === "approved_phone") return "Your advisor approved the call. The invoice is being prepared.";
  return "Terms are signed. Waiting for the advisor call.";
}

function money(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function maturityOn(opened: string, months: number) {
  const [year, month, day] = opened.split("-").map(Number);
  if (!year || !month || !day || !months) return null;
  return new Date(Date.UTC(year, month - 1 + months, day));
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function elapsed(start: string, end: Date | null) {
  const opened = Date.parse(`${start}T00:00:00Z`);
  const matures = end?.getTime() ?? opened;
  const span = Math.max(matures - opened, 1);
  return Math.min(Math.max(((Date.now() - opened) / span) * 100, 0), 100);
}

function TermChart({ items }: { items: Array<{ id: string; months: number; amount: number; start: string; end: Date | null }> }) {
  return (
    <ul className="mt-4 grid gap-4">
      {items.map((item) => (
        <li key={item.id}>
          <div className="relative h-10 overflow-hidden rounded-md bg-[#e7f6fc]">
            <div className="absolute inset-y-0 left-0 bg-[#6cc4ee]" style={{ width: `${elapsed(item.start, item.end)}%` }} />
            <span className="relative flex h-full items-center px-3 text-xs font-semibold text-[#12315c]">
              {item.months}-month · {money(item.amount)}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-fg">
            <span>
              <span className="block text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">Funding date</span>
              {formatDate(new Date(`${item.start}T00:00:00Z`))}
            </span>
            <span className="text-right">
              <span className="block text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">Mature date</span>
              {item.end ? formatDate(item.end) : "—"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CelebrationBanners({ holdings, onActive }: { holdings: FundingPosition[]; onActive: () => void }) {
  const [hidden, setHidden] = useState<string[] | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ah-cd-celebrated") || "[]");
      setHidden(Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : []);
    } catch {
      setHidden([]);
    }
  }, []);

  if (!hidden) return null;
  const fresh = holdings.filter((position) => !hidden.includes(position.id));
  if (fresh.length === 0) return null;

  function dismiss(id: string) {
    const next = [...hidden!, id];
    setHidden(next);
    localStorage.setItem("ah-cd-celebrated", JSON.stringify(next));
  }

  return (
    <div className="mt-4 grid gap-3">
      {fresh.map((position) => (
        <Celebration
          key={position.id}
          position={position}
          onOpen={() => {
            dismiss(position.id);
            onActive();
          }}
        />
      ))}
    </div>
  );
}

function Celebration({ position, onOpen }: { position: FundingPosition; onOpen: () => void }) {
  const rates = investmentRates(position, usePromo());
  const matures = maturityOn(position.createdAt, rates.months);
  return (
    <div className="overflow-hidden rounded-2xl bg-[#0c2348] px-5 py-5 text-white sm:px-6">
      <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">Payment confirmed</p>
      <h2 className="confirm-title mt-1 text-2xl font-semibold text-white">Congratulations</h2>
      <p className="mt-2 text-sm text-white/90">Your advisor confirmed the payment. This certificate is now active.</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-white/70">Certificate</dt>
          <dd className="font-semibold">{rates.months ? `${rates.months}-month` : position.termLabel}</dd>
        </div>
        <div>
          <dt className="text-white/70">Amount</dt>
          <dd className="font-semibold">{position.amount}</dd>
        </div>
        <div>
          <dt className="text-white/70">Final APY</dt>
          <dd className="font-semibold">{rates.final}</dd>
        </div>
        <div>
          <dt className="text-white/70">Matures</dt>
          <dd className="font-semibold">{matures ? formatDate(matures) : "—"}</dd>
        </div>
      </dl>
      <button type="button" className="mt-5 min-h-11 rounded-md bg-white px-5 py-2 text-sm font-semibold text-[#006fcf]" onClick={onOpen}>
        Active CDs
      </button>
    </div>
  );
}

function Dashboard({
  account,
  holdings,
  pipeline,
  onAdd,
  onActive,
  onView,
}: {
  account: PortalAccount;
  holdings: FundingPosition[];
  pipeline: FundingPosition[];
  onAdd: () => void;
  onActive: () => void;
  onView: () => void;
}) {
  const offer = usePromo();
  const lines = holdings.map((position) => ({ position, ...investmentRates(position, offer) }));
  const waiting = pipeline.map((position) => ({ position, ...investmentRates(position, offer) }));
  const total = lines.reduce((sum, line) => sum + line.principal, 0);
  const interest = lines.reduce((sum, line) => sum + line.principal * (Math.pow(1 + line.rate, line.months / 12) - 1), 0);
  const blended = total > 0 ? lines.reduce((sum, line) => sum + line.principal * line.rate, 0) / total : 0;
  const toSign = waiting.filter((line) => !line.position.signed && line.position.status !== "cancelled");
  const awaitingCall = waiting.filter((line) => line.position.status === "pending" && line.position.signed);
  const uploadPayment = waiting.filter((line) => line.position.signed && line.position.status === "instructions_sent" && !line.position.paymentFileName);
  const preparingInvoice = waiting.filter((line) => line.position.signed && line.position.status === "approved_phone");
  const allocation = lines
    .map((line) => {
      const start = line.position.createdAt;
      const end = maturityOn(start, line.months);
      return { id: line.position.id, months: line.months, amount: line.principal, start, end };
    })
    .sort((a, b) => a.months - b.months || a.start.localeCompare(b.start));
  const schedule = lines
    .map((line) => {
      const date = maturityOn(line.position.createdAt, line.months);
      const payout = line.principal * Math.pow(1 + line.rate, line.months / 12);
      return { ...line, date, payout };
    })
    .filter((line) => line.date)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());
  const nextMaturity = schedule[0];
  const next = toSign.length ? "Accept terms" : awaitingCall.length ? "Advisor call" : preparingInvoice.length ? "Invoice" : uploadPayment.length ? "Upload payment" : holdings.length ? "Active" : "Add a CD";

  return (
    <section className="mt-6">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Dashboard</p>
      <h1 className="mt-2 text-3xl font-semibold">Welcome, {account.payload.firstName}</h1>
      <p className="mt-2 max-w-2xl text-fg">
        {holdings.length === 0 && pipeline.length === 0
          ? "You do not have a certificate yet."
          : pipeline.length > 0 && holdings.length === 0
            ? "A certificate becomes active only after your advisor confirms the payment."
            : pipeline.length > 0
              ? "A certificate becomes active only after your advisor confirms the payment. Figures below use active CDs."
              : "Figures below use active CDs."}
      </p>
      {account.payload.preferredTerm ? (
        <p className="mt-2 text-sm text-fg">
          From your application: {account.payload.preferredTerm}-month
          {account.payload.preferredAmount ? ` · ${account.payload.preferredAmount}` : ""}. Add investment opens with this choice.
        </p>
      ) : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Committed" value={money(total)} icon={Wallet} />
        <Stat label="Interest to maturity" value={money(interest)} icon={Landmark} />
        <Stat label="Value at maturity" value={money(total + interest)} icon={LayoutDashboard} />
        <Stat label={holdings.length === 1 ? "APY" : "Average APY"} value={total ? formatApy(blended) : "—"} icon={Percent} />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg">Next step: {next}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary" onClick={onAdd}>
            Add investment
          </button>
          <button type="button" className="min-h-11 rounded-md border border-border bg-surface px-5 py-2 font-semibold text-primary" onClick={onActive}>
            Active CDs ({holdings.length})
          </button>
        </div>
      </div>
      <div className="mt-8 grid gap-8">
        <div className="rounded-md border border-border bg-surface px-4 py-4">
          <h2 className="text-lg font-semibold text-primary">Allocation by term</h2>
          {allocation.length === 0 ? (
            <p className="mt-2 text-sm text-fg">No active CDs yet.</p>
          ) : (
            <TermChart items={allocation} />
          )}
        </div>
        <PromoBanner onAdd={onAdd} />
        <div className="overflow-hidden rounded-lg border border-border bg-surface p-4">
          <h2 className="text-lg font-semibold text-primary">Needs attention</h2>
          {waiting.length === 0 ? <p className="mt-2 text-sm text-fg">Nothing is waiting on you.</p> : null}
          {waiting.length === 0 ? null : (
            <ul className="mt-4 grid gap-3">
              {waiting.map((line) => {
                const action = !line.position.signed
                  ? "Accept terms"
                  : line.position.status === "instructions_sent" && !line.position.paymentFileName
                    ? "Upload payment"
                    : "";
                return (
                  <li key={line.position.id} className="rounded-md border border-border px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-primary">{certificateTitle(line.position, line.months, line.final)}</p>
                      <StatusBadge status={line.position.status} />
                    </div>
                    <p className="mt-1 text-sm text-fg">
                      {money(line.principal)} · {line.final} final APY
                    </p>
                    <DealProgress step={fundStep(line.position)} />
                    {action ? null : <p className="mt-3 text-sm text-fg">{statusDetail(line.position)}</p>}
                    {action ? (
                      <button type="button" className="mt-3 min-h-11 rounded-md bg-action px-5 py-2 text-sm font-semibold text-on-primary" onClick={onView}>
                        {action}
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-primary">Maturity schedule</h2>
        <p className="mt-1 text-sm text-fg">
          {nextMaturity?.date
            ? `Next maturity ${formatDate(nextMaturity.date)} · ${money(nextMaturity.payout)} expected.`
            : pipeline.length > 0
              ? "Active certificates appear here after payment is confirmed."
              : "You do not have a certificate yet."}
        </p>
        {schedule.length === 0 ? null : (
          <ul className="mt-3 grid gap-2">
            {schedule.map((line) => (
              <li key={line.position.id} className="grid gap-2 rounded-md border border-border bg-surface px-3 py-3 text-sm sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:items-center">
                <span>
                  <span className="block font-semibold text-primary">{certificateTitle(line.position, line.months, line.final)}</span>
                  <span className="text-fg">Opened {line.position.createdAt}</span>
                </span>
                <span>
                  <span className="block text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">Matures</span>
                  {formatDate(line.date!)}
                </span>
                <span>
                  <span className="block text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">Principal</span>
                  {money(line.principal)}
                </span>
                <span>
                  <span className="block text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">Expected payout</span>
                  {money(line.payout)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-8">
        <ProtectionBanner />
      </div>
    </section>
  );
}

function PromoBanner({ onAdd }: { onAdd: () => void }) {
  const offer = usePromo();
  const [terms, setTerms] = useState<CdTerm[]>([]);
  useEffect(() => {
    void getCdTerms().then(setTerms).catch(() => setTerms([]));
  }, []);
  const panes = terms
    .map((term) => ({ term, tiers: offer.tiers.filter((tier) => tier.months.includes(term.months)) }))
    .filter((pane) => pane.tiers.length > 0);
  return (
    <article className="relative overflow-hidden rounded-xl border border-border">
      <img src="/dash-promo.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-white/55" />
      <div className="relative flex h-full min-h-72 flex-col p-6">
        <p className="text-xs font-semibold tracking-widest text-action uppercase">Best current promo</p>
        <h2 className="mt-2 text-2xl font-semibold text-primary">Give the next dollar a stronger rate.</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {panes.length === 0 ? <p className="text-sm text-fg">Selected terms include a new-money bonus for a limited time.</p> : null}
          {panes.map((pane) => (
            <div key={pane.term.id} className="rounded-lg border border-border bg-white/85 px-3 py-3">
              <p className="text-sm font-semibold text-primary">{pane.term.months}-month</p>
              <p className="text-xs text-fg">{pane.term.apy.includes("APY") ? pane.term.apy : `${pane.term.apy} APY`} base</p>
              <ul className="mt-2 divide-y divide-border text-sm">
                {pane.tiers.map((tier) => (
                  <li key={tier.id} className="flex items-center justify-between gap-2 py-1.5">
                    <span>{amountRange(tier)}</span>
                    <span className="font-semibold text-primary">{formatBonus(tier.bonusPercent)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button type="button" className="mt-5 min-h-11 w-fit rounded-md bg-action px-5 py-2 font-semibold text-on-primary" onClick={onAdd}>
          Add investment
        </button>
      </div>
    </article>
  );
}

function ProtectionBanner() {
  return (
    <article className="relative min-h-48 overflow-hidden rounded-xl border border-border">
      <img src="/dash-shield.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-white/50" />
      <div className="relative p-6">
        <p className="text-xs font-semibold tracking-widest text-action uppercase">Your protection</p>
        <h2 className="mt-2 max-w-sm text-2xl font-semibold text-primary">The principal stays covered.</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-fg">
          FDIC insurance covers the first $250,000 per individual or $500,000 per joint account. The certificate is non-callable, so the rate holds for the full term.
        </p>
      </div>
    </article>
  );
}

function EmptyBanners({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-6 grid gap-4">
      <PromoBanner onAdd={onAdd} />
      <ProtectionBanner />
    </div>
  );
}

function DealProgress({ step }: { step: number }) {
  const percent = Math.min(100, (Math.min(step, DEAL_STEPS.length) / DEAL_STEPS.length) * 100);
  return (
    <div className="mt-3">
      <div className="relative h-1.5 overflow-hidden rounded-full bg-step-track" aria-hidden="true">
        <div className="progress-fill relative h-full rounded-full bg-step-fill" style={{ width: `${percent}%` }} />
      </div>
      <ol className="mt-3 flex items-start">
        {DEAL_STEPS.map((label, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li key={label} className={index < DEAL_STEPS.length - 1 ? "flex min-w-0 flex-1 items-center" : "shrink-0"}>
              <div className="flex min-w-0 flex-col items-center gap-1">
                <span
                  className={
                    "flex size-7 items-center justify-center rounded-full text-xs font-semibold " +
                    (active ? "bg-step text-on-primary" : done ? "bg-step-done text-on-primary" : "bg-step-idle text-step")
                  }
                >
                  {done ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
                </span>
                <span className={"max-w-[4.5rem] text-center text-[10px] leading-tight sm:text-[11px] " + (active ? "font-semibold text-step" : "text-fg")}>{label}</span>
              </div>
              {index < DEAL_STEPS.length - 1 ? (
                <span className={"mx-1 mb-4 h-0.5 flex-1 rounded-full " + (done ? "bg-step-done" : "bg-step-idle")} aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StatusBadge({ status }: { status: FundingPosition["status"] }) {
  const active = status === "payment_approved";
  return (
    <span className={"inline-flex min-h-7 items-center rounded-full px-3 text-xs font-semibold " + (active ? "bg-step text-on-primary" : "bg-step-idle text-primary")}>
      {statusLabel(status)}
    </span>
  );
}

function ActiveCds({ positions, waiting, account, onAdd }: { positions: FundingPosition[]; waiting: number; account: PortalAccount; onAdd: () => void }) {
  const empty = positions.length === 0;
  return (
    <section className="mt-6">
      <h1 className="text-3xl font-semibold">Active CDs ({positions.length})</h1>
      <p className="mt-2 text-fg">
        {empty
          ? waiting > 0
            ? "You do not have an active certificate yet. A CD appears here after your advisor confirms the payment."
            : "You do not have an active certificate yet."
          : "These certificates are active because your advisor confirmed the payment."}
      </p>
      {empty ? (
        <EmptyBanners onAdd={onAdd} />
      ) : (
        <ul className="mt-4 grid gap-4">
          {positions.map((position) => (
            <ActiveCd key={position.id} position={position} account={account} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ActiveCd({ position, account }: { position: FundingPosition; account: PortalAccount }) {
  const [open, setOpen] = useState(true);
  const rates = investmentRates(position, usePromo());
  const opened = position.createdAt;
  const matures = maturityOn(opened, rates.months);
  const payout = rates.principal * Math.pow(1 + rates.rate, rates.months / 12);
  const clientName = [account.payload.firstName, account.payload.middleName, account.payload.surname].filter(Boolean).join(" ");
  const address = [account.payload.street, account.payload.apt, account.payload.city, account.payload.region, account.payload.postal, account.payload.country].filter(Boolean).join(", ");
  return (
    <article className="rounded-md border border-border bg-surface px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-primary">{certificateTitle(position, rates.months, rates.final)}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {rates.promo !== "—" ? (
            <span className="inline-flex min-h-7 items-center rounded-full bg-[#e24b2a] px-3 text-xs font-semibold text-white">Promo</span>
          ) : null}
          <StatusBadge status={position.status} />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Highlight icon={Wallet} label="Deposit" value={position.amount} />
        <Highlight icon={Percent} label="Final APY" value={rates.final} />
        <Highlight icon={CalendarRange} label="Term" value={rates.months ? `${rates.months} months` : position.termLabel} />
        <Highlight icon={CalendarClock} label="Matures" value={matures ? formatDate(matures) : "—"} />
        <Highlight icon={Banknote} label="Expected payout" value={money(payout)} />
      </div>
      <button type="button" className="mt-3 min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {open ? "Hide CD details" : "CD details"}
      </button>
      {open ? (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-sm text-fg">{position.issuer}</p>
          <dl className="mt-4 grid border-t border-l border-border sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Client name" value={clientName} />
            <Fact label="Address" value={address} />
            <Fact label="Deposit code" value={position.depositCode} />
            <Fact label="Deposit number" value={position.depositNumber} />
            <Fact label="Account number" value={position.accountNumber} />
            <Fact label="Confirmation date" value={slashDate(position.confirmedOn)} />
            <Fact label="Reference number" value={position.referenceNumber} />
            <Fact label="Interest rate" value="Fixed" />
            <Fact label="Compounding frequency" value="Daily" />
            <Fact label="Callable feature" value="Non-callable" />
            <Fact label="Issue date" value={slashDate(opened)} />
            <Fact label="Base APY" value={position.termLabel.match(/([\d.]+%)/)?.[1] ?? "—"} />
            <Fact label="Promo APY" value={rates.promo} />
            <Fact label="Minimum" value={position.minimumInvestment} />
            <Fact label="Structure" value={position.structure} />
            <Fact label="Advisor" value={position.advisorName ? `${position.advisorName}${position.advisorPhone ? ` · ${position.advisorPhone}` : ""}` : "—"} />
            <Fact label="Deposit insurance" value={position.capitalProtection} />
            <Fact label="Signed" value={position.signerName ? `${position.signerName}${position.signedOn ? ` · ${slashDate(position.signedOn)}` : ""}` : "—"} />
          </dl>
          <TermsPdf id={position.id} compact />
        </div>
      ) : null}
    </article>
  );
}

function Highlight({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-bg px-3 py-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-primary">{value || "—"}</p>
    </div>
  );
}

function slashDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso || "—";
  return `${Number(month)}/${Number(day)}/${year}`;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-b border-border px-3 py-3">
      <dt className="text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">{label}</dt>
      <dd className="mt-1 text-sm text-fg">{value || "—"}</dd>
    </div>
  );
}

function invoiceReady(position: FundingPosition) {
  return position.signed && position.status === "instructions_sent";
}

function InvoiceDownload({ position }: { position: FundingPosition }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [viewing, setViewing] = useState(false);
  const ready = invoiceReady(position);

  async function loadPdf() {
    if (bytes) return bytes;
    const { pdf } = await downloadInvoicePdf({ data: { id: position.id } });
    const file = Uint8Array.from(atob(pdf), (char) => char.charCodeAt(0));
    setBytes(file);
    return file;
  }

  async function view() {
    setError("");
    setPending(true);
    try {
      await loadPdf();
      setViewing(true);
    } catch {
      setError("The invoice could not be opened.");
    } finally {
      setPending(false);
    }
  }

  async function download() {
    setError("");
    setPending(true);
    try {
      const file = await loadPdf();
      const url = URL.createObjectURL(new Blob([file], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "payment-invoice.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("The invoice could not be created.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 rounded-md border border-border bg-white px-4 py-3">
      <p className="text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">Payment invoice</p>
      {ready ? (
        <>
          <p className="mt-1 text-sm text-fg">Use this invoice for the wire. Include the customer reference on the payment.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending} onClick={() => void view()}>
              {pending ? "Opening…" : "View PDF"}
            </button>
            <button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60" disabled={pending} onClick={() => void download()}>
              Download PDF
            </button>
          </div>
        </>
      ) : (
        <p className="mt-1 text-sm text-fg">
          {position.signed
            ? "Your terms are accepted. The invoice appears after it is approved."
            : "Accept the terms first. The invoice appears after it is approved."}
        </p>
      )}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      {viewing && bytes ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={() => setViewing(false)}>
          <div role="dialog" aria-modal="true" aria-label="Payment invoice" className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <h2 className="text-lg font-semibold text-primary">Payment invoice</h2>
              <button type="button" className="min-h-11 px-3 text-sm font-semibold text-primary" onClick={() => setViewing(false)}>
                Close
              </button>
            </div>
            <PdfPages data={bytes} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function savePdf(pdf: string, filename: string) {
  const bytes = Uint8Array.from(atob(pdf), (char) => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function InvestmentList({ positions, signature, phone, email, onAdd, onSigned }: { positions: FundingPosition[]; signature: string; phone: string; email: string; onAdd: () => void; onSigned: () => void }) {
  return (
    <section className="mt-6">
      <h1 className="text-3xl font-semibold">Investments</h1>
      <p className="mt-2 text-fg">
        {positions.length === 0
          ? "You do not have a certificate in progress."
          : "Certificates still being opened. They move to Active CDs after your advisor confirms payment."}
      </p>
      {positions.length === 0 ? (
        <EmptyBanners onAdd={onAdd} />
      ) : (
        <ul className="mt-4 grid gap-3">
          {positions.map((position) => (
            <InvestmentCard key={position.id} position={position} signature={signature} phone={phone} email={email} onSigned={onSigned} />
          ))}
        </ul>
      )}
    </section>
  );
}

function InvestmentCard({ position, signature, phone, email, onSigned }: { position: FundingPosition; signature: string; phone: string; email: string; onSigned: () => void }) {
  const rates = investmentRates(position, usePromo());
  const step = fundStep(position);
  return (
    <div className="rounded-md border border-border bg-surface px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-primary">
          {certificateTitle(position)}
        </p>
        <StatusBadge status={position.status} />
      </div>
      <p className="mt-1 text-sm text-fg">
        {position.amount} · {position.createdAt}
      </p>
      <p className="mt-2 text-sm text-fg">{statusDetail(position)}</p>
      {position.status === "cancelled" ? null : <InvoiceDownload position={position} />}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <p>
          <span className="block text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">Promo APY</span>
          <span className="text-sm font-semibold text-fg">{rates.promo}</span>
        </p>
        <p>
          <span className="block text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">Final APY</span>
          <span className="text-sm font-semibold text-fg">{rates.final}</span>
        </p>
      </div>
      {position.advisorName ? (
        <p className="mt-2 text-sm text-fg">Advisor {position.advisorName}{position.advisorPhone ? ` · ${position.advisorPhone}` : ""}</p>
      ) : position.status === "pending" ? (
        <p className="mt-2 text-sm text-fg">Advisor not assigned yet.</p>
      ) : null}
      {position.status === "cancelled" ? null : (
        <DealProgress step={step} />
      )}
      {position.status === "cancelled" ? null : <TermsPdf id={position.id} signed={position.signed} />}
      {position.status !== "cancelled" && position.status !== "payment_approved" && !position.signed ? <SignTerms position={position} signature={signature} phone={phone} email={email} rates={rates} onSigned={onSigned} /> : null}
      {position.signed && position.status === "instructions_sent" ? <PaymentUpload id={position.id} replacing={Boolean(position.paymentFileName)} onUploaded={onSigned} /> : null}
      {position.paymentFileName ? <PaymentFileNote id={position.id} name={position.paymentFileName} approved={position.status === "payment_approved"} /> : null}
    </div>
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

function PaymentFileNote({ id, name, approved }: { id: string; name: string; approved: boolean }) {
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
    <p className="mt-3 text-sm text-fg">
      Wire confirmation: {name}
      {approved ? " · Payment approved" : " · Waiting for advisor approval"}
      <button type="button" className="ml-2 font-semibold text-action" onClick={() => void open()}>
        View
      </button>
      {error ? <span className="mt-1 block text-danger">{error}</span> : null}
    </p>
  );
}

function PaymentUpload({ id, replacing = false, onUploaded }: { id: string; replacing?: boolean; onUploaded: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [over, setOver] = useState(false);

  function onFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 5_000_000 || !/^(application\/pdf|image\/png|image\/jpeg)$/.test(file.type)) {
      setError("Use a PDF, PNG, or JPEG under 5 MB.");
      return;
    }
    setPending(true);
    setName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      void uploadPaymentConfirmation({ data: { id, fileName: file.name, file: String(reader.result) } })
        .then(() => {
          setPending(false);
          onUploaded();
        })
        .catch(() => {
          setError("The confirmation could not be uploaded.");
          setPending(false);
          setName("");
        });
    };
    reader.onerror = () => {
      setError("The confirmation could not be read.");
      setPending(false);
      setName("");
    };
    reader.readAsDataURL(file);
  }

  return (
    <form className="mt-4 border-t border-border pt-4" onSubmit={(event) => event.preventDefault()}>
      <h3 className="text-sm font-semibold text-primary">{replacing ? "Replace the wire confirmation" : "Upload payment confirmation"}</h3>
      <p className="mt-1 text-sm text-fg">{replacing ? "Upload another file if this confirmation is wrong. It replaces the one already sent." : "After you send the wire, attach the bank confirmation so your advisor can approve the payment."}</p>
      <button
        type="button"
        disabled={pending}
        className={"mt-3 flex w-full flex-col items-center rounded-xl border border-dashed px-4 py-6 text-center " + (over ? "border-action bg-[#e8f4ff]" : "border-[#8c8c8c] bg-white")}
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          onFile(event.dataTransfer.files?.[0]);
        }}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-[#e8f4ff] text-action">
          <FileUp className="size-5" aria-hidden="true" />
        </span>
        <span className="mt-3 text-sm font-semibold text-primary">{pending ? "Uploading…" : "Drop the wire confirmation here"}</span>
        <span className="mt-1 text-sm text-fg">{name || "or choose a PDF, PNG, or JPEG under 5 MB"}</span>
        <span className="mt-3 inline-flex min-h-11 items-center rounded-md bg-action px-4 text-sm font-semibold text-on-primary">{pending ? "Please wait" : "Choose file"}</span>
      </button>
      <input
        ref={input}
        className="sr-only"
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        disabled={pending}
        onChange={(event) => onFile(event.target.files?.[0])}
      />
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </form>
  );
}

function SignTerms({
  position,
  signature,
  phone,
  email,
  rates,
  onSigned,
}: {
  position: FundingPosition;
  signature: string;
  phone: string;
  email: string;
  rates: { promo: string; final: string };
  onSigned: () => void;
}) {
  const saved = signature.startsWith("data:image/png;base64,");
  const [drawn, setDrawn] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [callNumber, setCallNumber] = useState(phone);
  const [editingNumber, setEditingNumber] = useState(false);
  const [emailInstead, setEmailInstead] = useState(false);

  function openConfirm() {
    if (!saved && !drawn) {
      setError("Sign in the box before accepting the terms.");
      return;
    }
    setError("");
    setOpen(true);
  }

  async function sign() {
    setPending(true);
    setError("");
    try {
      await signFunding({ data: { id: position.id, signature: saved ? "" : drawn, contactPhone: callNumber, contactBy: emailInstead ? "email" : "call" } });
      onSigned();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The terms could not be accepted.");
      setPending(false);
    }
  }

  return (
    <form className="mt-4 border-t border-border pt-4" onSubmit={(event) => { event.preventDefault(); openConfirm(); }}>
      <h3 className="text-sm font-semibold text-primary">Accept the investment terms</h3>
      <p className="mt-1 text-sm text-fg">
        {saved ? "Your application signature is applied to this certificate." : "Sign in the box below. This signature is saved on the account and used on this certificate."}
      </p>
      <ul className="mt-3 divide-y divide-border overflow-hidden rounded-md border border-border">
        <TermLine icon={CalendarRange} label="Term" value={position.termLabel} />
        <TermLine icon={Wallet} label="Amount" value={position.amount} />
        <TermLine icon={Percent} label="Promo APY" value={rates.promo} />
        <TermLine icon={BadgePercent} label="Final APY" value={rates.final} />
        <TermLine icon={Receipt} label="Dealing fee" value="A $4.99 fee applies" />
        <TermLine icon={Lock} label="Callable feature" value="Non-callable" />
        <TermLine icon={TriangleAlert} label="Early withdrawal" value="Penalties may apply" />
        <TermLine icon={Shield} label="Capital protection" value="First $250,000 per individual or $500,000 per joint account" />
      </ul>
      {saved ? null : (
        <div className="mt-4">
          <p className="text-sm font-semibold text-primary">Sign here</p>
          <p className="mt-1 text-sm text-fg">Draw your signature inside the box.</p>
          <div className="relative mt-2">
            {drawn ? null : <span className="pointer-events-none absolute top-4 left-4 text-sm text-[#8c8c8c]">Sign here</span>}
            <SignaturePad onChange={(value) => setDrawn(value ?? "")} />
          </div>
        </div>
      )}
      {error && !open ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      <button type="submit" className="mt-3 min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary">
        Accept terms
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="presentation" onClick={() => !pending && setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="terms-confirmed-title" className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="bg-[#0c2348] px-6 py-6 text-white">
              <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">Investment summary</p>
              <h2 id="terms-confirmed-title" className="confirm-title mt-1 text-3xl font-semibold text-white">You confirmed</h2>
              <p className="mt-2 text-sm text-white/90">The investment process starts here.</p>
            </div>
            <div className="px-6 py-5">
              {emailInstead ? (
                <p className="text-sm text-fg">We will email {email} instead of calling.</p>
              ) : (
                <>
                  <p className="text-sm text-fg">Wait for an advisor to call</p>
                  {editingNumber ? (
                    <label className="mt-3 block text-sm">
                      <span className="font-semibold text-primary">Call this number</span>
                      <input className="mt-1 w-full rounded-md border border-border px-3 py-2" value={callNumber} onChange={(event) => setCallNumber(event.target.value)} />
                    </label>
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-[#12315c]">{callNumber || "No number on the application"}</p>
                  )}
                  <button type="button" className="mt-2 text-sm font-semibold text-action" onClick={() => setEditingNumber((value) => !value)}>
                    {editingNumber ? "Use this number" : "Call another number"}
                  </button>
                </>
              )}
              <label className="mt-4 flex items-start gap-2 text-sm text-fg">
                <input type="checkbox" className="mt-1" checked={emailInstead} onChange={(event) => setEmailInstead(event.target.checked)} />
                <span>Do not call, use email instead</span>
              </label>
              {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary" disabled={pending} onClick={() => setOpen(false)}>
                  Back
                </button>
                <button type="button" className="min-h-11 flex-1 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" disabled={pending} onClick={() => void sign()}>
                  {pending ? "Saving…" : "Start the process"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function TermLine({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <li className="flex items-start gap-3 bg-surface px-3 py-3 text-sm">
      <Icon className="menu-icon mt-0.5 size-4 shrink-0 text-action" aria-hidden="true" />
      <span>
        <span className="block text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">{label}</span>
        <span className="text-fg">{value || "—"}</span>
      </span>
    </li>
  );
}

GlobalWorkerOptions.workerSrc = workerUrl;

function TermsPdf({ id, compact = false, signed = false }: { id: string; compact?: boolean; signed?: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [sheet, setSheet] = useState<InvestmentSheet | null>(null);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState(false);

  useEffect(() => {
    let objectUrl = "";
    let live = true;
    void downloadInvestmentPdf({ data: { id } })
      .then(({ pdf, sheet: next }) => {
        if (!live) return;
        const file = Uint8Array.from(atob(pdf), (char) => char.charCodeAt(0));
        objectUrl = URL.createObjectURL(new Blob([file], { type: "application/pdf" }));
        setBytes(file);
        setUrl(objectUrl);
        setSheet(next);
      })
      .catch(() => {
        if (live) setError("The PDF could not be opened.");
      });
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, signed]);

  return (
    <div className={compact ? "mt-4" : "mt-4 rounded-md border border-border bg-white p-4"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {compact ? null : <p className="text-sm font-semibold tracking-wide text-primary uppercase">Investor factsheet</p>}
        {url ? (
          <div className="flex gap-2">
            <button type="button" className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary" onClick={() => setViewing(true)}>
              View PDF
            </button>
            <a href={url} download="investment-terms.pdf" className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-semibold text-primary">
              Download PDF
            </a>
          </div>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      {!compact && !sheet && !error ? <p className="mt-2 text-sm text-fg">Opening the factsheet…</p> : null}
      {!compact && sheet ? (
        <div className="mt-3 text-sm text-fg">
          <h3 className="text-lg font-semibold text-primary">Certificate of Deposit</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <SheetTable
              title="Certificate overview"
              rows={[
                ["Issuer", sheet.issuer],
                ["Structure", sheet.structure],
              ]}
            />
            <SheetTable
              title="Key terms"
              rows={[
                ["Investment", sheet.termLabel],
                ["Amount", sheet.amount],
                ["Promo APY", sheet.promoApy],
                ["Final APY", sheet.finalApy],
                ["Minimum", sheet.minimum],
                ["Callable feature", "Non-callable"],
              ]}
            />
          </div>
          <p className="mt-4 font-semibold text-primary">Capital protection</p>
          <p className="mt-1">{sheet.capitalProtection || "100% cover on the first $250,000 per individual or $500,000 per joint account."}</p>
          <p className="mt-3 font-semibold text-primary">Fees</p>
          <p className="mt-1">A fixed $4.99 dealing fee applies to each purchase. Early liquidation, where available, is $4.99 per request. No early-liquidation fee applies if the certificate is held to maturity.</p>
          <p className="mt-3 font-semibold text-primary">Signature</p>
          <p className="mt-1">{sheet.signerName ? `${sheet.signerName}${sheet.signedOn ? ` · signed ${sheet.signedOn}` : ""}` : "Not signed yet."}</p>
        </div>
      ) : null}
      {viewing && bytes ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={() => setViewing(false)}>
          <div role="dialog" aria-modal="true" aria-label="Investment PDF" className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <h2 className="text-lg font-semibold text-primary">Investment PDF</h2>
              <button type="button" className="min-h-11 px-3 text-sm font-semibold text-primary" onClick={() => setViewing(false)}>
                Close
              </button>
            </div>
            <PdfPages data={bytes} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PdfPages({ data }: { data: Uint8Array }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const root = host.current;
    if (!root) return;
    let cancelled = false;
    setFailed(false);
    const task = getDocument({ data: data.slice() });
    void task.promise
      .then(async (doc) => {
        root.replaceChildren();
        for (let index = 1; index <= doc.numPages; index += 1) {
          if (cancelled) return;
          const page = await doc.getPage(index);
          const viewport = page.getViewport({ scale: 1.25 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "mx-auto mb-3 w-full max-w-3xl bg-white shadow-sm";
          const context = canvas.getContext("2d");
          if (!context) continue;
          root.appendChild(canvas);
          await page.render({ canvas, canvasContext: context, viewport }).promise;
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      void task.destroy();
    };
  }, [data]);

  return (
    <div ref={host} className="min-h-40 overflow-auto bg-[#f3f4f6] p-3">
      {failed ? <p className="p-4 text-sm text-fg">The PDF could not be displayed. Use Download PDF instead.</p> : null}
    </div>
  );
}

type InvestmentSheet = {
  issuer: string;
  structure: string;
  currency: string;
  jurisdiction: string;
  couponType: string;
  minimum: string;
  creditRating: string;
  capitalProtection: string;
  termLabel: string;
  amount: string;
  frequency: string;
  promoApy: string;
  finalApy: string;
  signerName: string;
  signedOn: string;
  email: string;
};

function SheetTable({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <p className="font-semibold text-primary">{title}</p>
      <dl className="mt-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[110px_1fr] gap-2 border-b border-border py-1.5">
            <dt className="text-primary">{label}</dt>
            <dd>{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function NotificationBell() {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Array<{ id: string; createdAt: string; subject: string; unread: boolean }>>([]);
  const [error, setError] = useState("");
  const unread = rows.some((row) => row.unread);

  useEffect(() => {
    void listMyNotifications()
      .then(setRows)
      .catch(() => setError("Notifications could not be loaded."));
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next || !rows.some((row) => row.unread)) return;
    try {
      await markMyNotificationsRead();
      setRows((current) => current.map((row) => ({ ...row, unread: false })));
    } catch {
      setError("Notifications could not be updated.");
    }
  }

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        className="relative inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-primary"
        aria-label={unread ? "Notifications, unread" : "Notifications"}
        aria-expanded={open}
        onClick={() => void toggle()}
      >
        <Bell className="size-5" aria-hidden="true" />
        {unread ? <span className="absolute top-2 right-2 size-2 rounded-full bg-[#e23b3b]" /> : null}
      </button>
      {open ? (
        <div className="fixed inset-x-4 top-24 z-40 max-h-[70vh] overflow-hidden rounded-md border border-border bg-surface shadow-lg sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-80">
          <p className="border-b border-border px-3 py-2 text-sm font-semibold text-primary">Notifications</p>
          {error ? <p className="px-3 py-3 text-sm text-danger">{error}</p> : null}
          {rows.length === 0 && !error ? <p className="px-3 py-3 text-sm text-fg">No notifications yet.</p> : null}
          <ul className="max-h-80 overflow-y-auto">
            {rows.map((row) => (
              <li key={row.id} className="grid gap-0.5 border-b border-border px-3 py-2 text-sm last:border-b-0">
                <span className="text-fg">{row.subject}</span>
                <span className="text-xs text-fg">{row.createdAt.slice(5)} UTC</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ManageInvestments({ positions, signature, phone, email, onAdd, onChanged }: { positions: FundingPosition[]; signature: string; phone: string; email: string; onAdd: () => void; onChanged: () => void }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function cancel(id: string) {
    setError("");
    setPendingId(id);
    try {
      await cancelFunding({ data: { id } });
      onChanged();
    } catch {
      setError("This investment could not be cancelled.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="mt-6">
      <h1 className="text-3xl font-semibold">Manage</h1>
      <p className="mt-2 text-fg">
        {positions.length === 0
          ? "You do not have a certificate to manage."
          : "Review each certificate and cancel one that is still awaiting an advisor."}
      </p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {positions.length === 0 ? (
        <EmptyBanners onAdd={onAdd} />
      ) : (
        <ul className="mt-4 grid gap-3">
          {positions.map((position) => (
            <li key={position.id}>
              <InvestmentCard position={position} signature={signature} phone={phone} email={email} onSigned={onChanged} />
              {position.status === "pending" ? (
                <button
                  type="button"
                  disabled={pendingId === position.id}
                  className="mt-3 min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
                  onClick={() => void cancel(position.id)}
                >
                  {pendingId === position.id ? "Cancelling…" : "Cancel investment"}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-4">
      <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
        <Icon className="menu-icon size-3.5 text-action" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
