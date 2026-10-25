import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { BadgePercent, Banknote, CalendarClock, CalendarRange, Check, Landmark, LayoutDashboard, Lock, Mail, Menu, Percent, Plus, Receipt, Shield, SlidersHorizontal, TriangleAlert, Wallet, X, type LucideIcon } from "lucide-react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { headerActionClass, SiteHeader } from "@/components/site-header";
import { cancelFunding, downloadInvestmentPdf, getCdTerms, getInvestorPortal, getInvestorSession, getInvestmentTypes, getMyFundings, getPaymentFile, getPromo, investorLogout, listMyNotifications, signFunding, submitFunding, uploadPaymentConfirmation, type ApplicationPayload, type CdTerm, type FundingPosition, type InvestmentType } from "@/lib/admin.functions";
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

  async function signOut() {
    await investorLogout();
    void navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader
        eyebrow="Investor portal"
        action={
          <button type="button" className={headerActionClass} onClick={() => void signOut()}>
            Sign out
          </button>
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {!account ? (
          <p className="text-sm text-fg">Opening your account…</p>
        ) : (
          <PortalBody account={account} />
        )}
      </main>
    </div>
  );
}

type PortalTab = "dashboard" | "active" | "investments" | "fund" | "manage" | "messages";

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
  { id: "messages", label: "Messages", icon: Mail },
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
      <div className="flex items-center justify-between py-2 md:hidden">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <current.icon className="menu-icon size-4 text-action" aria-hidden="true" />
          {current.label}
        </p>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-md text-primary"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <ul className="menu-drop absolute inset-x-0 top-full z-20 border-b border-border bg-surface shadow-lg md:hidden">
          {PORTAL_TABS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={"menu-link flex min-h-11 w-full items-center gap-3 px-1 text-sm " + (tab === item.id ? "font-semibold text-action" : "text-primary")}
                aria-current={tab === item.id ? "page" : undefined}
                onClick={() => choose(item.id)}
              >
                <item.icon className="menu-icon size-4" aria-hidden="true" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
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
      <PortalMenu tab={tab} onChange={setTab} />
      {notice ? <p className="mt-4 rounded-md border border-border bg-surface px-4 py-3 text-sm text-fg">{notice}</p> : null}
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
      {tab === "active" ? <ActiveCds positions={holdings} account={account} /> : null}
      {tab === "investments" ? <InvestmentList positions={pipeline} onSigned={() => void refresh()} /> : null}
      {tab === "fund" ? (
        <FundingPanel
          onSubmitted={() => {
            setNotice("Investment submitted. Accept the terms on the investment to continue.");
            setTab("investments");
            void refresh();
          }}
        />
      ) : null}
      {tab === "manage" ? <ManageInvestments positions={positions} onChanged={() => void refresh()} /> : null}
      {tab === "messages" ? <Messages /> : null}
      </div>
    </PromoContext.Provider>
  );
}

function FundingPanel({ onSubmitted }: { onSubmitted: () => void }) {
  const offer = usePromo();
  const scroller = useRef<HTMLDivElement>(null);
  const [cd, setCd] = useState<InvestmentType | null>(null);
  const [terms, setTerms] = useState<CdTerm[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
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
        <div ref={scroller} className="mt-6 flex gap-3 overflow-x-auto scroll-smooth px-1 pt-4 pb-2">
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
                  "relative mt-3 flex min-w-[220px] shrink-0 cursor-pointer flex-col rounded-xl border bg-white px-5 text-left shadow-sm " +
                  (term.featured || promo ? "pt-16 pb-5 " : "py-6 ") +
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
                    className="mt-4 self-start text-left text-sm font-semibold text-[#006fcf]"
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
      {cd && selected ? (
        <InvestmentDetail type={cd} term={selected} amount={amount} onAmount={setAmount} />
      ) : (
        <p className="mt-4 text-sm text-fg">Select a term to review the certificate.</p>
      )}
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      {selected ? (
        <button type="button" disabled={pending} className="mt-5 min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60" onClick={openSummary}>
          {pending ? "Submitting…" : "Confirm funding"}
        </button>
      ) : null}
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="investment-summary-title"
        className="grid max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl sm:grid-cols-[240px_1fr]"
        onClick={(event) => event.stopPropagation()}
      >
        <img src="/funding-advisor.jpg" alt="" className="h-48 w-full object-cover sm:h-full" />
        <div className="relative overflow-y-auto bg-[#0c2348] px-6 py-6 text-white sm:px-8">
          <button type="button" className="absolute top-3 right-4 text-xl leading-none text-white/80" aria-label="Close" onClick={onClose}>
            ×
          </button>
          <h2 id="investment-summary-title" className="pr-6 text-2xl font-semibold">Investment summary</h2>
          <p className="mt-3 text-sm text-white/90">
            {type.issuer}
            <br />
            {term.months}-month certificate · {apy} APY
            <br />
            {shown}
          </p>
          <ol className="mt-5 grid gap-3">
            {SUMMARY_STEPS.map((step, index) => (
              <li key={step}>
                <p className="font-semibold">{index + 1}. {step}</p>
              </li>
            ))}
          </ol>
          {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
          <button
            type="button"
            disabled={pending}
            className="mt-6 min-h-11 rounded-md bg-white px-5 py-2 font-semibold text-[#006fcf] disabled:opacity-60"
            onClick={onConfirm}
          >
            {pending ? "Submitting…" : "Confirm investment"}
          </button>
        </div>
      </div>
    </div>
  );
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

function InvestmentDetail({
  type,
  term,
  amount,
  onAmount,
}: {
  type: InvestmentType;
  term: CdTerm;
  amount: string;
  onAmount: (value: string) => void;
}) {
  const overview: Array<[string, string]> = [
    ["Issuer", type.issuer],
    ["Structure", type.structure],
  ];
  const terms: Array<[string, string]> = [
    ["APY", term.apy.includes("APY") ? term.apy : `${term.apy} APY`],
    ["Term", `${term.months}-month`],
    ["Minimum investment", type.minimumInvestment],
    ["Callable feature", "Non-callable"],
  ];
  return (
    <div className="mt-4 overflow-hidden rounded-md border border-border">
      <div className="grid lg:grid-cols-2">
        <div className="p-3 lg:border-r lg:border-border">
          <h4 className="text-xs font-semibold tracking-widest text-primary uppercase">Certificate overview</h4>
          <dl className="mt-2">
            {overview.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3 border-b border-border py-1.5">
                <dt className="text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">{label}</dt>
                <dd className="text-right text-sm text-fg">{value || "—"}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 py-1.5">
              <dt className="text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">Capital protection</dt>
              <dd className="flex items-center gap-1.5 text-sm text-fg">
                FDIC
                <span className="group relative">
                  <button
                    type="button"
                    aria-label="100% cover on the first $250,000 per individual or $500,000 per joint account"
                    className="inline-flex size-4 items-center justify-center rounded-full border border-border text-[10px] leading-none font-semibold text-primary"
                  >
                    i
                  </button>
                  <span className="pointer-events-none absolute right-0 bottom-full z-10 mb-1 hidden w-56 rounded-md border border-border bg-white p-2 text-left text-xs leading-4 font-normal text-fg shadow-sm group-hover:block group-focus-within:block">
                    100% cover on the first $250,000 per individual or $500,000 per joint account
                  </span>
                </span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="border-t border-border p-3 lg:border-t-0">
          <h4 className="text-xs font-semibold tracking-widest text-primary uppercase">Key terms</h4>
          <dl className="mt-2">
            {terms.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3 border-b border-border py-1.5">
                <dt className="text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">{label}</dt>
                <dd className="text-right text-sm text-fg">{value || "—"}</dd>
              </div>
            ))}
          </dl>
          <label className="mt-2 flex items-center gap-3">
            <span className="text-[11px] font-semibold tracking-wide text-[#12315c] uppercase">Amount</span>
            <input className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-fg outline-none focus:border-primary" value={amount} onChange={(event) => onAmount(event.target.value)} placeholder={type.minimumInvestment || "0.00"} />
          </label>
        </div>
      </div>
    </div>
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
  const basePercent = Number(position.termLabel.match(/([\d.]+)%/)?.[1] ?? 0);
  const bonus = matchTier(offer, months, moneyValue(position.amount));
  const finalRate = basePercent / 100 + (bonus ? bonus.bonusPercent / 100 : 0);
  return {
    promo: bonus ? formatBonus(bonus.bonusPercent) : "—",
    final: basePercent ? formatApy(finalRate) : "—",
    rate: finalRate,
    months,
    principal: moneyValue(position.amount),
  };
}

const FUND_STEPS = ["Terms", "Advisor call", "Fund"];

function fundStep(position: FundingPosition) {
  if (position.status === "payment_approved") return 3;
  if (position.status === "instructions_sent" || position.status === "approved_phone") return 2;
  if (position.status === "pending" && position.signed) return 1;
  if (position.status === "pending") return 0;
  return 0;
}

function statusLabel(status: FundingPosition["status"]) {
  if (status === "cancelled") return "Cancelled";
  if (status === "approved_phone") return "Approved by phone";
  if (status === "instructions_sent") return "Funding instructions sent";
  if (status === "payment_approved") return "Active";
  return "Pending";
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
  if (position.status === "instructions_sent" && position.paymentFileName) return "Wire confirmation is with your advisor.";
  if (position.status === "instructions_sent") return "Upload your wire confirmation.";
  if (position.status === "approved_phone") return "Waiting for funding instructions.";
  if (position.signed) return "Terms are signed. Waiting for the advisor call.";
  return "Accept the terms to continue.";
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
  const toSign = waiting.filter((line) => line.position.status === "pending" && !line.position.signed);
  const awaitingCall = waiting.filter((line) => line.position.status === "pending" && line.position.signed);
  const uploadPayment = waiting.filter((line) => line.position.status === "instructions_sent" && !line.position.paymentFileName);
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
  const next = toSign.length ? "Accept terms" : awaitingCall.length ? "Advisor call" : uploadPayment.length ? "Upload payment" : holdings.length ? "Active" : "Add a CD";

  return (
    <section className="mt-6">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">Dashboard</p>
      <h1 className="mt-2 text-3xl font-semibold">Welcome, {account.payload.firstName}</h1>
      <p className="mt-2 max-w-2xl text-fg">A certificate becomes active only after your advisor confirms the payment. Figures below use active CDs.</p>
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
        <div>
          <h2 className="text-lg font-semibold text-primary">Status</h2>
          {waiting.length === 0 ? (
            <p className="mt-2 text-sm text-fg">No certificates are waiting on payment.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {waiting.map((line) => (
                <li key={line.position.id} className="rounded-md border border-border bg-surface px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-primary">{certificateTitle(line.position, line.months, line.final)}</span>
                    <StatusBadge status={line.position.status} />
                  </div>
                  <p className="mt-1 text-sm text-fg">{statusDetail(line.position)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-primary">Needs attention</h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface">
            <div className="grid sm:grid-cols-3">
              {(
                [
                  ["Accept terms", toSign.length],
                  ["Advisor call", awaitingCall.length],
                  ["Upload payment", uploadPayment.length],
                ] as const
              ).map(([label, count], index) => (
                <button
                  key={label}
                  type="button"
                  className={"px-4 py-4 text-left " + (index < 2 ? "border-b border-border sm:border-r sm:border-b-0" : "")}
                  onClick={onView}
                >
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">{label}</p>
                  <p className="mt-2 text-xl font-semibold">{count}</p>
                </button>
              ))}
            </div>
            {toSign.length + awaitingCall.length + uploadPayment.length === 0 ? (
              <p className="border-t border-border px-4 py-3 text-sm text-fg">Nothing is waiting on you.</p>
            ) : (
              <ul>
                {[...toSign, ...awaitingCall, ...uploadPayment].map((line) => (
                  <li key={line.position.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm">
                    <span>
                      <span className="font-semibold text-primary">{certificateTitle(line.position, line.months, line.final)}</span>
                      <span className="mt-0.5 block text-fg">{money(line.principal)} · {line.final} final APY</span>
                    </span>
                    <button type="button" className="min-h-11 font-semibold text-action" onClick={onView}>
                      {!line.position.signed ? "Accept terms" : line.position.status === "instructions_sent" ? "Upload payment" : "Advisor call"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-primary">Maturity schedule</h2>
        <p className="mt-1 text-sm text-fg">
          {nextMaturity?.date
            ? `Next maturity ${formatDate(nextMaturity.date)} · ${money(nextMaturity.payout)} expected.`
            : "Active certificates appear here after payment is confirmed."}
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
    </section>
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

function ActiveCds({ positions, account }: { positions: FundingPosition[]; account: PortalAccount }) {
  return (
    <section className="mt-6">
      <h1 className="text-3xl font-semibold">Active CDs ({positions.length})</h1>
      <p className="mt-2 text-fg">These certificates are active because your advisor confirmed the payment.</p>
      {positions.length === 0 ? (
        <p className="mt-4 text-sm text-fg">No active CDs yet.</p>
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

function InvestmentList({ positions, onSigned }: { positions: FundingPosition[]; onSigned: () => void }) {
  return (
    <section className="mt-6">
      <h1 className="text-3xl font-semibold">Investments</h1>
      <p className="mt-2 text-fg">Certificates still being opened. They move to Active CDs after your advisor confirms payment.</p>
      {positions.length === 0 ? (
        <p className="mt-4 text-sm text-fg">Nothing to show yet.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {positions.map((position) => (
            <InvestmentCard key={position.id} position={position} onSigned={onSigned} />
          ))}
        </ul>
      )}
    </section>
  );
}

function InvestmentCard({ position, onSigned }: { position: FundingPosition; onSigned: () => void }) {
  const rates = investmentRates(position, usePromo());
  const step = fundStep(position);
  const percent = Math.min(100, (step / (FUND_STEPS.length - 1)) * 100);
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
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-step-track" aria-hidden="true">
            <div className="h-full rounded-full bg-step-fill" style={{ width: `${percent}%` }} />
          </div>
          <ol className="mt-3 grid grid-cols-3 gap-2">
            {FUND_STEPS.map((name, index) => {
              const done = index < step;
              const active = index === step;
              return (
                <li key={name} className="min-w-0 text-center">
                  <span
                    className={
                      "mx-auto mb-1 flex size-7 items-center justify-center rounded-full text-sm font-semibold " +
                      (active ? "bg-step text-on-primary" : done ? "bg-step-done text-on-primary" : "bg-step-idle text-step")
                    }
                  >
                    {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className={"block text-xs leading-tight " + (active ? "font-semibold text-step" : done ? "text-step-done" : "text-step")}>{name}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
      {position.status === "cancelled" ? null : <TermsPdf id={position.id} />}
      {position.status === "pending" && !position.signed ? <SignTerms position={position} rates={rates} onSigned={onSigned} /> : null}
      {position.status === "instructions_sent" && !position.paymentFileName ? <PaymentUpload id={position.id} onUploaded={onSigned} /> : null}
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

function PaymentUpload({ id, onUploaded }: { id: string; onUploaded: () => void }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function onFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 5_000_000) {
      setError("Use a PDF or image under 5 MB.");
      return;
    }
    setPending(true);
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      void uploadPaymentConfirmation({ data: { id, fileName: file.name, file: String(reader.result) } })
        .then(() => onUploaded())
        .catch(() => {
          setError("The confirmation could not be uploaded.");
          setPending(false);
        });
    };
    reader.readAsDataURL(file);
  }

  return (
    <form className="mt-4 border-t border-border pt-4">
      <h3 className="text-sm font-semibold text-primary">Upload payment confirmation</h3>
      <p className="mt-1 text-sm text-fg">Attach the wire confirmation after you send funds using the payment instructions.</p>
      <label className="mt-3 block text-sm">
        <span className="font-semibold text-primary">Wire confirmation</span>
        <input className="mt-1 block w-full text-sm" type="file" accept="application/pdf,image/png,image/jpeg" disabled={pending} onChange={(event) => onFile(event.target.files?.[0])} />
      </label>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </form>
  );
}

function SignTerms({
  position,
  rates,
  onSigned,
}: {
  position: FundingPosition;
  rates: { promo: string; final: string };
  onSigned: () => void;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function sign() {
    setPending(true);
    setError("");
    try {
      await signFunding({ data: { id: position.id } });
      onSigned();
    } catch {
      setError("The terms could not be accepted.");
      setPending(false);
    }
  }

  return (
    <form className="mt-4 border-t border-border pt-4" onSubmit={(event) => { event.preventDefault(); void sign(); }}>
      <h3 className="text-sm font-semibold text-primary">Accept the investment terms</h3>
      <p className="mt-1 text-sm text-fg">Your application signature is applied to this certificate. No further signature is required.</p>
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
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      <button type="submit" disabled={pending} className="mt-3 min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60">
        {pending ? "Saving…" : "Accept terms"}
      </button>
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

function TermsPdf({ id, compact = false }: { id: string; compact?: boolean }) {
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
  }, [id]);

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
          <p className="mt-1">{sheet.signerName ? `${sheet.signerName} · signed ${sheet.signedOn}` : "Not signed yet."}</p>
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

function Messages() {
  const [rows, setRows] = useState<Array<{ id: string; createdAt: string; subject: string; body: string; html: string }>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void listMyNotifications()
      .then(setRows)
      .catch(() => setError("Messages could not be loaded."));
  }, []);

  return (
    <section className="mt-6">
      <h1 className="text-3xl font-semibold">Messages</h1>
      <p className="mt-2 text-fg">Notes sent to you as an application or certificate moves forward.</p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {rows.length === 0 && !error ? <p className="mt-4 text-sm text-fg">No messages yet.</p> : null}
      <ul className="mt-4 grid gap-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-md border border-border bg-surface px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-primary">{row.subject}</p>
              <p className="text-xs text-fg">{row.createdAt} UTC</p>
            </div>
            {row.html ? <iframe title={row.subject} srcDoc={row.html} className="mt-3 h-72 w-full rounded-md border border-border bg-white" /> : <p className="mt-2 whitespace-pre-wrap text-sm text-fg">{row.body}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ManageInvestments({ positions, onChanged }: { positions: FundingPosition[]; onChanged: () => void }) {
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
      <p className="mt-2 text-fg">Review each certificate and cancel one that is still awaiting an advisor.</p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {positions.length === 0 ? (
        <p className="mt-4 text-sm text-fg">No investments to manage.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {positions.map((position) => (
            <li key={position.id}>
              <InvestmentCard position={position} onSigned={onChanged} />
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
