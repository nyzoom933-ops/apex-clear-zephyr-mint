import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronLeft, FileText, IdCard, MapPin, ShieldCheck } from "lucide-react";
import {
  ACCOUNT_TYPES,
  ADDRESS_DOCS,
  COUNTRIES,
  DAYS,
  EMPTY_FORM,
  FUND_SOURCES,
  ID_TYPES,
  MONTHS,
  NET_WORTH,
  OCCUPATIONS,
  PHONE_COUNTRIES,
  PURPOSES,
  STEP_NAMES,
  US_STATES,
  WEALTH_SOURCES,
  YEARS,
  validateStep,
  type FormState,
} from "@/lib/application-data";
import { getCdTerms, getInvestorSession, getLeadInvite, getPromo, investorLogout, requestLeadInvite, submitApplication, type CdTerm, type InvestorSession } from "@/lib/admin.functions";
import { amountRange, EMPTY_PROMO, formatBonus, formatOfferDate, matchTier, promoMonths, type PromoOffer } from "@/lib/promo";
import { AppCover, headerActionClass, SiteHeader } from "@/components/site-header";
import { SignaturePad } from "@/components/signature-pad";

const STORAGE_KEY = "account-holding-application";

const PREPARE = [
  { icon: IdCard, title: "Government-issued identification", body: "Passport, driver’s license, or national identity card." },
  { icon: MapPin, title: "Proof of address", body: "A recent statement or bill showing your residential address." },
  { icon: FileText, title: "Tax information", body: "Your tax residence and taxpayer identification number." },
  { icon: ShieldCheck, title: "A few minutes", body: "Most applicants finish in a single sitting." },
] as const;

const DECLARATIONS = [
  { key: "d1", label: "I confirm the information in this application is accurate and complete." },
  { key: "d2", label: "I am the beneficial owner of the assets that will be held in this account." },
  { key: "d3", label: "I understand the portfolio stays unavailable until this application is approved." },
  { key: "d4", label: "I agree to the account terms and to electronic delivery of statements." },
] as const;

function loadDraft(): FormState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FORM;
    const parsed = JSON.parse(raw) as Partial<FormState>;
    return { ...EMPTY_FORM, ...parsed, password: "", confirmPassword: "" };
  } catch {
    return EMPTY_FORM;
  }
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-fg">{hint}</span> : null}
    </label>
  );
}

const controlClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-3 text-base text-fg outline-none transition focus:border-primary";

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <select className={controlClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function ApplicationForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<InvestorSession | null | undefined>(undefined);
  const [terms, setTerms] = useState<CdTerm[]>([]);
  const [offer, setOffer] = useState<PromoOffer>(EMPTY_PROMO);
  const [inviteGate, setInviteGate] = useState<"none" | "checking" | "open" | "expired" | "used">("none");
  const [inviteKind, setInviteKind] = useState("");
  const [inviteProcess, setInviteProcess] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [inviteRequested, setInviteRequested] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [requestError, setRequestError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void getInvestorSession()
      .then((value) => {
        if (value?.destination === "portal") {
          void navigate({ to: "/portal" });
          return;
        }
        setSession(value);
      })
      .catch(() => setSession(null));
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite")?.trim() || "";
    const draft = loadDraft();
    if (!invite) {
      const term = params.get("term")?.replace(/\D/g, "") || "";
      setForm({ ...draft, preferredTerm: term || draft.preferredTerm, promoCode: "", inviteToken: "" });
      setInviteKind("");
      setInviteProcess("");
      setInviteGate("none");
      setReady(true);
      return;
    }
    setInviteGate("checking");
    void getLeadInvite({ data: { token: invite } })
      .then((result) => {
        if (result.status === "used") {
          setInviteGate("used");
          setReady(true);
          return;
        }
        if (result.status !== "open") {
          setInviteToken(invite);
          setInviteRequested(result.status === "expired" && result.requested);
          setInviteGate("expired");
          setReady(true);
          return;
        }
        const first = result.name.split(" ")[0] || "";
        setForm({
          ...draft,
          preferredTerm: String(result.months),
          promoCode: result.promoCode,
          inviteToken: invite,
          firstName: draft.firstName || first,
        });
        setInviteKind(result.kind || "");
        setInviteProcess(result.process || "portal");
        setInviteGate("open");
        setReady(true);
      })
      .catch(() => {
        setInviteGate("expired");
        setReady(true);
      });
  }, []);

  useEffect(() => {
    void Promise.all([getCdTerms(), getPromo()])
      .then(([nextTerms, nextOffer]) => {
        setTerms(nextTerms);
        setOffer(nextOffer);
      })
      .catch(() => {
        setTerms([]);
        setOffer(EMPTY_PROMO);
      });
  }, []);

  useEffect(() => {
    if (!ready || submitted || session) return;
    const rest = { ...form, password: "", confirmPassword: "" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }, [form, ready, submitted, session]);

  const percent = useMemo(() => (step / (STEP_NAMES.length - 1)) * 100, [step]);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function go(next: number) {
    setErrors([]);
    setStep(next);
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onContinue() {
    const nextErrors = validateStep(step, form, promoMonths(offer).includes(Number(form.preferredTerm)), inviteProcess === "assisted");
    if (nextErrors.length) {
      setErrors(nextErrors);
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (step === STEP_NAMES.length - 1) {
      try {
        await submitApplication({ data: { ...form, currency: "USD" } });
      } catch {
        setErrors(["The application could not be saved. Try again."]);
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
      return;
    }
    go(step + 1);
  }

  async function signOut() {
    await investorLogout();
    setSession(null);
    void navigate({ to: "/login" });
  }

  if (session === undefined || inviteGate === "checking") {
    return (
      <div className="min-h-screen">
        <SiteHeader eyebrow="Investor application" />
        <AppCover />
        <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-fg">Checking your application…</main>
      </div>
    );
  }

  if (inviteGate === "expired" || inviteGate === "used") {
    return (
      <div className="min-h-screen">
        <SiteHeader eyebrow="Investor application" />
        <AppCover />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <section className="rounded-lg border border-border bg-surface px-6 py-12 text-center shadow-sm sm:px-10">
            <h1 className="text-3xl font-semibold">{inviteGate === "used" ? "Application already sent" : "Promo link expired"}</h1>
            <p className="mx-auto mt-3 max-w-md text-fg">{inviteGate === "used" ? "This link was already used to submit an application." : "This link lasted 48 hours. Request a new one and your advisor will send it."}</p>
            {inviteGate === "expired" ? inviteRequested ? <p className="mt-6 text-sm font-semibold text-primary">Request sent. Your advisor will send a new link.</p> : <button type="button" disabled={requestPending} className="mt-6 min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60" onClick={() => {
              setRequestError("");
              setRequestPending(true);
              void requestLeadInvite({ data: { token: inviteToken } })
                .then(() => setInviteRequested(true))
                .catch((caught) => setRequestError(caught instanceof Error && caught.message ? caught.message : "The request could not be sent."))
                .finally(() => setRequestPending(false));
            }}>{requestPending ? "Sending…" : "Request a new link"}</button> : null}
            {requestError ? <p className="mt-3 text-sm text-danger">{requestError}</p> : null}
          </section>
        </main>
      </div>
    );
  }

  if (session && session.status !== "approved") {
    return (
      <div className="min-h-screen">
        <SiteHeader
          eyebrow="Investor application"
          action={
            <button type="button" className={headerActionClass} onClick={() => void signOut()}>
              Sign out
            </button>
          }
        />
        <AppCover />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <section className="rounded-lg border border-border bg-surface px-6 py-12 text-center shadow-sm sm:px-10">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              {session.status === "hold" ? "On hold" : "In review"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Application sent</h1>
            <p className="mx-auto mt-3 max-w-md text-fg">
              {session.name}, your application is with the desk. Your investor portal opens when it is approved.
            </p>
            <p className="mt-6 text-sm text-fg">
              {session.accountType}
              <br />
              {session.email}
            </p>
          </section>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen">
        <SiteHeader eyebrow="Investor application" />
        <AppCover />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <section className="rounded-lg border border-border bg-surface px-6 py-12 text-center shadow-sm sm:px-10">
            <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-soft text-primary">
              <ShieldCheck className="size-7" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">Submitted</p>
            <h1 className="mt-2 text-3xl font-semibold">Application received</h1>
            <p className="mx-auto mt-3 max-w-md text-fg">
              {inviteProcess === "assisted"
                ? `${form.firstName}, your advisor has the application. You do not need a password. The advisor will write to you about the certificate.`
                : `${form.firstName}, sign in with the email and password from this application. The investor portal opens after the desk approves it.`}
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader
        eyebrow="Investor application"
        action={
          <Link to="/login" className={headerActionClass}>
            Sign in
          </Link>
        }
      />
      <AppCover />
      <main className="mx-auto my-6 w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-surface px-4 py-8 shadow-sm sm:my-10 sm:px-8 sm:py-12">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Open an account relationship</h1>
          <p className="mx-auto mt-3 max-w-xl text-fg">
            Complete each section in one session. Your portfolio remains unavailable until the compliance team
            approves the application.
          </p>
        </header>

        <div className="mb-8">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-step">
              Step {step + 1} of {STEP_NAMES.length}
            </p>
            <p className="text-sm text-fg">{Math.round(percent)}%</p>
          </div>
          <p className="mt-1 text-lg font-semibold text-primary">{STEP_NAMES[step]}</p>
          <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-step-track" aria-hidden="true">
            <div className="progress-fill relative h-full rounded-full bg-step-fill" style={{ width: `${percent}%` }} />
          </div>
          <ol className="mt-4 flex items-center justify-between gap-1">
            {STEP_NAMES.map((name, index) => {
              const done = index < step;
              const active = index === step;
              return (
                <li key={name} className={index < STEP_NAMES.length - 1 ? "flex flex-1 items-center" : "shrink-0"}>
                  <button
                    type="button"
                    className={
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                      (active ? "bg-step text-on-primary" : done ? "bg-step-done text-on-primary" : "bg-step-idle text-step")
                    }
                    aria-current={active ? "step" : undefined}
                    aria-label={name}
                    disabled={index > step}
                    onClick={() => index < step && go(index)}
                  >
                    {done ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
                  </button>
                  {index < STEP_NAMES.length - 1 ? (
                    <span className={"mx-1 h-0.5 flex-1 rounded-full " + (index < step ? "bg-step-done" : "bg-step-idle")} aria-hidden="true" />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        <div ref={cardRef}>
          {errors.length > 0 ? (
            <div className="mb-6 rounded-md bg-danger-bg px-4 py-3 text-sm text-danger" role="alert">
              <p className="font-semibold">Check the following fields:</p>
              <ul className="mt-1 list-disc pl-5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div key={step} className="step-enter">
            {step === 0 ? <Prepare /> : null}
            {step === 1 ? (
              <div className="grid gap-10">
                <Account form={form} patch={patch} assisted={inviteProcess === "assisted"} />
                <Personal form={form} patch={patch} />
              </div>
            ) : null}
            {step === 2 ? <Address form={form} patch={patch} /> : null}
            {step === 3 ? (
              <div className="grid min-w-0 gap-10">
                <Preference form={form} patch={patch} terms={terms} offer={offer} locked={inviteGate === "open"} showPromo={inviteGate === "open" && inviteKind === "promo"} />
                <Financial form={form} patch={patch} />
                <Funding form={form} patch={patch} />
              </div>
            ) : null}
            {step === 4 ? <Documents form={form} patch={patch} /> : null}
            {step === 5 ? <Declarations form={form} patch={patch} /> : null}
          </div>
          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-1 rounded-md border border-border px-5 py-3 font-semibold text-primary"
                onClick={() => go(step - 1)}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="min-h-11 rounded-md bg-action px-6 py-3 font-semibold text-on-primary hover:bg-action-deep"
              onClick={() => void onContinue()}
            >
              {step === STEP_NAMES.length - 1 ? "Submit application" : "Continue"}
            </button>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-fg">
          Keep this page open until your application has been submitted.{" "}
          <Link to="/login" className="font-semibold text-primary underline">
            Return to sign in
          </Link>
        </p>
      </main>
    </div>
  );
}

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-fg">{body}</p>
    </div>
  );
}

function Prepare() {
  return (
    <div>
      <SectionIntro
        eyebrow="Preparation"
        title="Before you begin"
        body="You will need the following to complete the application in one session."
      />
      <ul className="grid gap-4">
        {PREPARE.map((item) => (
          <li key={item.title} className="flex gap-3 rounded-md border border-border px-4 py-3">
            <item.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <span className="block font-semibold text-primary">{item.title}</span>
              <span className="text-sm text-fg">{item.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Account({ form, patch, assisted = false }: { form: FormState; patch: <K extends keyof FormState>(key: K, value: FormState[K]) => void; assisted?: boolean }) {
  return (
    <div className="grid gap-5">
      <SectionIntro
        eyebrow="Section"
        title="Account and contact"
        body={assisted ? "Choose the legal account structure. Your advisor completes the certificate. A portal password is not required." : "Choose the legal account structure and create the primary holder’s access."}
      />
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Account type</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ACCOUNT_TYPES.map((type) => (
            <label key={type} className="flex min-h-11 items-center gap-3 rounded-md border border-border px-4 py-3">
              <input type="radio" name="accountType" checked={form.accountType === type} onChange={() => patch("accountType", type)} />
              {type}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name">
          <input className={controlClass} value={form.firstName} onChange={(event) => patch("firstName", event.target.value)} />
        </Field>
        <Field label="Middle name">
          <input className={controlClass} value={form.middleName} onChange={(event) => patch("middleName", event.target.value)} />
        </Field>
      </div>
      <Field label="Surname">
        <input className={controlClass} value={form.surname} onChange={(event) => patch("surname", event.target.value)} />
      </Field>
      <Field label="Email address">
        <input type="email" className={controlClass} value={form.email} onChange={(event) => patch("email", event.target.value)} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Telephone country" value={form.phoneCountry} options={PHONE_COUNTRIES} onChange={(value) => patch("phoneCountry", value as FormState["phoneCountry"])} />
        <Field label="Telephone number">
          <input className={controlClass} value={form.phone} onChange={(event) => patch("phone", event.target.value)} />
        </Field>
      </div>
      {assisted ? null : (
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Password" hint="At least 8 characters. This becomes your portal sign-in.">
          <input type="password" className={controlClass} value={form.password} onChange={(event) => patch("password", event.target.value)} />
        </Field>
        <Field label="Confirm password">
          <input type="password" className={controlClass} value={form.confirmPassword} onChange={(event) => patch("confirmPassword", event.target.value)} />
        </Field>
      </div>
      )}
    </div>
  );
}

function Personal({ form, patch }: { form: FormState; patch: <K extends keyof FormState>(key: K, value: FormState[K]) => void }) {
  return (
    <div className="grid gap-5">
      <SectionIntro eyebrow="Section" title="Personal information" body="Provide information exactly as it appears on official records." />
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Date of birth</legend>
        <div className="grid grid-cols-3 gap-3">
          <select className={controlClass} value={form.dobMonth} onChange={(event) => patch("dobMonth", event.target.value)}>
            <option value="">Month</option>
            {MONTHS.map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>
          <select className={controlClass} value={form.dobDay} onChange={(event) => patch("dobDay", event.target.value)}>
            <option value="">Day</option>
            {DAYS.map((day) => (
              <option key={day}>{day}</option>
            ))}
          </select>
          <select className={controlClass} value={form.dobYear} onChange={(event) => patch("dobYear", event.target.value)}>
            <option value="">Year</option>
            {YEARS.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Nationality" value={form.nationality} options={COUNTRIES} onChange={(value) => patch("nationality", value)} />
        <SelectField label="Country of residence" value={form.residence} options={COUNTRIES} onChange={(value) => patch("residence", value)} />
      </div>
      <SelectField label="Occupation" value={form.occupation} options={OCCUPATIONS} placeholder="Select occupation" onChange={(value) => patch("occupation", value)} />
    </div>
  );
}

function Address({ form, patch }: { form: FormState; patch: <K extends keyof FormState>(key: K, value: FormState[K]) => void }) {
  const unitedStates = form.country === "United States";
  return (
    <div className="grid gap-5">
      <SectionIntro eyebrow="Section" title="Address and tax" body="Provide your residential address and tax residency information." />
      <Field label="Street address">
        <input className={controlClass} value={form.street} onChange={(event) => patch("street", event.target.value)} />
      </Field>
      <Field label="Apartment or suite">
        <input className={controlClass} value={form.apt} onChange={(event) => patch("apt", event.target.value)} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="City">
          <input className={controlClass} value={form.city} onChange={(event) => patch("city", event.target.value)} />
        </Field>
        {unitedStates ? (
          <SelectField label="State" value={form.region} options={US_STATES} placeholder="Select state" onChange={(value) => patch("region", value)} />
        ) : (
          <Field label="State or region">
            <input className={controlClass} value={form.region} onChange={(event) => patch("region", event.target.value)} />
          </Field>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Postal code">
          <input className={controlClass} value={form.postal} onChange={(event) => patch("postal", event.target.value)} />
        </Field>
        <SelectField label="Country" value={form.country} options={COUNTRIES} onChange={(value) => patch("country", value)} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Tax residence" value={form.taxResidence} options={COUNTRIES} onChange={(value) => patch("taxResidence", value)} />
        <Field label="Taxpayer identification number">
          <input className={controlClass} value={form.taxId} onChange={(event) => patch("taxId", event.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function Preference({
  form,
  patch,
  terms,
  offer,
  locked = false,
  showPromo = false,
}: {
  form: FormState;
  patch: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  terms: CdTerm[];
  offer: PromoOffer;
  locked?: boolean;
  showPromo?: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const promo = new Set(showPromo ? promoMonths(offer) : []);
  const ordered = locked
    ? terms.filter((term) => String(term.months) === form.preferredTerm)
    : [...terms].sort((a, b) => Number(promo.has(b.months)) - Number(promo.has(a.months)) || Number(b.featured) - Number(a.featured) || a.months - b.months);
  const months = Number(form.preferredTerm);
  const shown = ordered.length > 0 || !locked || !months ? ordered : [{ id: "invite", months, apy: "—", featured: false } as CdTerm];
  const amount = Number(form.preferredAmount.replace(/[^0-9.]/g, ""));
  const tiers = offer.tiers.filter((tier) => tier.months.includes(months));
  const matched = matchTier(offer, months, amount);

  function move(direction: number) {
    const next = Math.min(Math.max(page + direction, 0), Math.max(ordered.length - 1, 0));
    setPage(next);
    scroller.current?.querySelectorAll<HTMLElement>("[data-term]")[next]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  return (
    <div className="grid min-w-0 max-w-full gap-5">
      <SectionIntro eyebrow="Section" title="Preferred certificate" body={locked ? "This term and promotional code come from your email link. They stay fixed for this application." : "Choose a term and the amount you expect to invest."} />
      {shown.length === 0 ? (
        <p className="text-sm text-fg">No certificate terms are available right now.</p>
      ) : locked ? (
        <div className="max-w-full">
          {shown.map((term) => {
            const isPromo = promo.has(term.months);
            return (
              <div key={term.id} className="relative mt-3 flex min-h-40 max-w-sm flex-col rounded-xl border border-action bg-white px-5 pt-12 pb-5 text-left">
                {term.featured || isPromo ? (
                  <span className="absolute -top-3 left-4 flex flex-col items-start gap-1">
                    {isPromo ? <span className="inline-flex rounded-md bg-[#e24b2a] px-2 py-1 text-xs font-semibold text-white">Promotional Offer</span> : null}
                    {term.featured ? <span className="inline-flex rounded-md bg-action px-2 py-1 text-xs font-semibold text-white">Featured APY</span> : null}
                  </span>
                ) : null}
                <span className="block text-2xl font-semibold text-primary">{term.apy.includes("APY") ? term.apy : `${term.apy} APY`}</span>
                <span className="mt-1 block text-sm text-fg">{term.months}-month term</span>
              </div>
            );
          })}
          <p className="mt-3 text-sm text-fg">Ask your advisor if you need another term.</p>
        </div>
      ) : (
        <div className="max-w-full overflow-hidden rounded-xl bg-[#f3f4f6] px-4 py-6">
          <div ref={scroller} className="w-full max-w-full overflow-x-auto scroll-smooth pb-2">
            <div className="flex w-max items-stretch gap-3 pt-4">
              {ordered.map((term) => {
                const selected = form.preferredTerm === String(term.months);
                const isPromo = promo.has(term.months);
                return (
                  <button
                    key={term.id}
                    type="button"
                    data-term
                    className={"relative mt-3 flex min-h-40 min-w-[200px] shrink-0 flex-col rounded-xl border bg-white px-5 pt-12 pb-5 text-left " + (selected ? "border-action" : "border-[#e7e7e7]")}
                    onClick={() => {
                      if (!locked) patch("preferredTerm", String(term.months));
                    }}
                  >
                    {term.featured || isPromo ? (
                      <span className="absolute -top-3 left-4 flex flex-col items-start gap-1">
                        {isPromo ? <span className="inline-flex rounded-md bg-[#e24b2a] px-2 py-1 text-xs font-semibold text-white">Promotional Offer</span> : null}
                        {term.featured ? <span className="inline-flex rounded-md bg-action px-2 py-1 text-xs font-semibold text-white">Featured APY</span> : null}
                      </span>
                    ) : null}
                    <span className="block text-2xl font-semibold text-primary">{term.apy.includes("APY") ? term.apy : `${term.apy} APY`}</span>
                    <span className="mt-1 block text-sm text-fg">{term.months}-month term</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button type="button" className="flex size-8 items-center justify-center text-action" aria-label="Previous terms" onClick={() => move(-1)}>
              ‹
            </button>
            <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5">
              {ordered.map((term, index) => (
                <button
                  key={term.id}
                  type="button"
                  aria-label={`Show term ${index + 1}`}
                  className={index === page ? "h-1.5 w-5 rounded-full bg-action" : "size-1.5 rounded-full bg-[#c5c8ce]"}
                  onClick={() => {
                    setPage(index);
                    scroller.current?.querySelectorAll<HTMLElement>("[data-term]")[index]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
                  }}
                />
              ))}
            </div>
            <button type="button" className="flex size-8 items-center justify-center text-action" aria-label="Next terms" onClick={() => move(1)}>
              ›
            </button>
          </div>
        </div>
      )}
      {showPromo ? <Field label="Promotional code">
        <input className={controlClass} value={form.promoCode} placeholder="Optional" readOnly={locked} onChange={(event) => patch("promoCode", event.target.value)} />
      </Field> : null}
      <Field label="Preferred investment amount" hint={promo.has(months) ? "Promotional certificates start at $100,000. Enter 100000 or 100,000." : "Enter 100000 or 100,000. A comma must separate thousands."}>
        <input
          className={controlClass}
          inputMode="decimal"
          placeholder="$100,000"
          value={form.preferredAmount}
          onChange={(event) => patch("preferredAmount", event.target.value)}
        />
      </Field>
      {showPromo && tiers.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-white text-sm">
          <div className="border-b border-border px-4 py-3 font-semibold text-primary">{months}-month promo bonus</div>
          {offer.startsOn && offer.endsOn ? (
            <p className="border-b border-border px-4 py-3 text-fg">Offer available from {formatOfferDate(offer.startsOn)} – {formatOfferDate(offer.endsOn)}.</p>
          ) : null}
          <div className="grid grid-cols-2 bg-[#f7f7f7] px-4 py-2 text-xs font-semibold tracking-wide text-heading uppercase">
            <span>Deposit</span>
            <span>Promo bonus</span>
          </div>
          {tiers.map((tier) => (
            <div key={tier.id} className={"grid grid-cols-2 border-t border-border px-4 py-3 " + (matched?.id === tier.id ? "bg-[#e8f4ff] font-semibold" : "")}>
              <span>{amountRange(tier)}</span>
              <span>{formatBonus(tier.bonusPercent)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Financial({ form, patch }: { form: FormState; patch: <K extends keyof FormState>(key: K, value: FormState[K]) => void }) {
  return (
    <div className="grid gap-5">
      <SectionIntro eyebrow="Section" title="Financial profile" body="Tell us about your sources of wealth and investment objectives." />
      <SelectField label="Source of wealth" value={form.sourceOfWealth} options={WEALTH_SOURCES} placeholder="Select a source" onChange={(value) => patch("sourceOfWealth", value)} />
      <SelectField label="Source of funds" value={form.sourceOfFunds} options={FUND_SOURCES} placeholder="Select a source" onChange={(value) => patch("sourceOfFunds", value)} />
      <SelectField label="Investment purpose" value={form.investmentPurpose} options={PURPOSES} placeholder="Select a purpose" onChange={(value) => patch("investmentPurpose", value)} />
      <SelectField label="Estimated net worth" value={form.netWorth} options={NET_WORTH} placeholder="Select a range" onChange={(value) => patch("netWorth", value)} />
    </div>
  );
}

function Documents({ form, patch }: { form: FormState; patch: <K extends keyof FormState>(key: K, value: FormState[K]) => void }) {
  const [fileError, setFileError] = useState("");

  function take(file: File | undefined, nameKey: "idFileName" | "addressFileName", dataKey: "idFile" | "addressFile") {
    if (!file) {
      patch(nameKey, "");
      patch(dataKey, "");
      return;
    }
    if (file.size > 5_000_000 || !/^(application\/pdf|image\/png|image\/jpeg)$/.test(file.type)) {
      setFileError("Attach a PDF, PNG, or JPEG under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      patch(nameKey, file.name);
      patch(dataKey, typeof reader.result === "string" ? reader.result : "");
      setFileError("");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-5">
      <SectionIntro eyebrow="Section" title="Verification documents" body="Choose the document types and attach files for identity and address verification." />
      <SelectField label="Identity document" value={form.idType} options={ID_TYPES} onChange={(value) => patch("idType", value as FormState["idType"])} />
      <Field label="Identity file" hint={form.idFileName || "Optional. PDF, PNG, or JPEG"}>
        <input type="file" accept="application/pdf,image/png,image/jpeg" className={controlClass} onChange={(event) => take(event.target.files?.[0], "idFileName", "idFile")} />
      </Field>
      <SelectField label="Proof of address" value={form.addressDocType} options={ADDRESS_DOCS} onChange={(value) => patch("addressDocType", value as FormState["addressDocType"])} />
      <Field label="Address file" hint={form.addressFileName || "Optional. PDF, PNG, or JPEG"}>
        <input type="file" accept="application/pdf,image/png,image/jpeg" className={controlClass} onChange={(event) => take(event.target.files?.[0], "addressFileName", "addressFile")} />
      </Field>
      {fileError ? <p className="text-sm text-danger">{fileError}</p> : null}
    </div>
  );
}

function Funding({ form, patch }: { form: FormState; patch: <K extends keyof FormState>(key: K, value: FormState[K]) => void }) {
  return (
    <div className="grid gap-5">
      <SectionIntro eyebrow="Section" title="Funding information" body="Please confirm the details of the bank that you will be making payment from." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Bank name *">
          <input className={controlClass} value={form.bankName} onChange={(event) => patch("bankName", event.target.value)} />
        </Field>
        <Field label="Account holder's name *">
          <input className={controlClass} value={form.accountHolder} onChange={(event) => patch("accountHolder", event.target.value)} />
        </Field>
      </div>
      <div className="grid gap-5 border-t border-border pt-5">
        <p className="text-sm font-medium">Bank address and postcode</p>
        <Field label="Street address">
          <input className={controlClass} value={form.bankStreet} onChange={(event) => patch("bankStreet", event.target.value)} />
        </Field>
        <Field label="Address line 2">
          <input className={controlClass} value={form.bankLine2} onChange={(event) => patch("bankLine2", event.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City">
            <input className={controlClass} value={form.bankCity} onChange={(event) => patch("bankCity", event.target.value)} />
          </Field>
          <SelectField label="State" value={form.bankState} options={US_STATES} placeholder="Select state" onChange={(value) => patch("bankState", value)} />
        </div>
        <Field label="ZIP code">
          <input className={controlClass} value={form.bankZip} onChange={(event) => patch("bankZip", event.target.value)} />
        </Field>
      </div>
      <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
        <Field label="Routing number *">
          <input className={controlClass} inputMode="numeric" value={form.routingNumber} onChange={(event) => patch("routingNumber", event.target.value)} />
        </Field>
        <Field label="Account number *">
          <input className={controlClass} inputMode="numeric" value={form.accountNumber} onChange={(event) => patch("accountNumber", event.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function Declarations({ form, patch }: { form: FormState; patch: <K extends keyof FormState>(key: K, value: FormState[K]) => void }) {
  return (
    <div className="grid gap-5">
      <SectionIntro eyebrow="Section" title="Declarations" body="Review each statement, then sign. This signature is used on your account documents." />
      {DECLARATIONS.map((item) => (
        <label key={item.key} className="flex min-h-11 items-start gap-3 rounded-md border border-border px-4 py-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={form[item.key]}
            onChange={(event) => patch(item.key, event.target.checked)}
          />
          <span>{item.label}</span>
        </label>
      ))}
      <div>
        <p className="text-sm font-medium">Signature</p>
        <p className="mt-1 text-sm text-fg">Draw the signature that will appear on your certificates. You can lift the pointer and keep drawing.</p>
        <SignaturePad onChange={(value) => patch("signature", value ?? "")} />
      </div>
    </div>
  );
}
