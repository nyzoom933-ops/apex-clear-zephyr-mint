import { useEffect, useState, type ReactNode } from "react";
import { COUNTRIES } from "@/lib/application-data";
import { getLeadInvite, submitWealthApplication } from "@/lib/admin.functions";
import { useBrand } from "@/components/site-header";
import { wealthOfferById } from "@/lib/wealth-letter";

const TITLES = ["", "Mr", "Mrs", "Ms", "Mx", "Dr", "Prof"];
const EMPLOYMENT = ["Employed", "Self-employed", "Retired", "Not employed"];
const INCOME = ["Under $100,000", "$100,000 – $250,000", "$250,000 – $500,000", "$500,000 – $1,000,000", "Over $1,000,000"];
const NET_WORTH = ["Under $250,000", "$250,000 – $1,000,000", "$1,000,000 – $5,000,000", "$5,000,000 – $25,000,000", "Over $25,000,000"];
const FUNDS = ["Employment income", "Business ownership / sale", "Investments", "Inheritance", "Retirement savings", "Property", "Other"];
const OBJECTIVES = ["Capital preservation", "Income generation", "Balanced growth", "Long-term growth"];
const ID_TYPES = ["Passport", "Driver's license", "State ID card", "Permanent Resident Card"];

const fieldClass = "mt-1 w-full rounded-md border border-[#d5dee6] bg-white px-3 py-2 text-sm text-[#10233a] outline-none focus:border-[#0b6f8a]";

function Section({ index, title, note, children }: { index: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section className="border-t border-[#d5dee6] pt-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold text-[#10233a]"><span className="mr-2 text-[#6a7c8c]">{index}</span>{title}</h2>
        {note ? <p className="text-xs text-[#6a7c8c]">{note}</p> : null}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, hint, children, wide = false }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={wide ? "block sm:col-span-2" : "block"}>
      <span className="text-sm font-medium text-[#243746]">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-[#6a7c8c]">{hint}</span> : null}
    </label>
  );
}

async function readUpload(file: File | undefined) {
  if (!file) return { name: "", data: "" };
  if (file.size > 10 * 1024 * 1024) throw new Error("Each file must be 10MB or smaller.");
  if (!/^(image\/jpeg|image\/png|application\/pdf)$/.test(file.type)) throw new Error("Use a JPG, PNG, or PDF.");
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsDataURL(file);
  });
  return { name: file.name, data };
}

export function WealthApplication({ invite, offer }: { invite: string; offer: string }) {
  const brand = useBrand();
  const selected = wealthOfferById(offer);
  const [status, setStatus] = useState<"loading" | "open" | "missing" | "expired" | "used" | "sent">("loading");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [joint, setJoint] = useState(false);
  const [form, setForm] = useState({
    title: "",
    firstName: "",
    surname: "",
    dob: "",
    citizenship: "United States",
    taxId: "",
    jointTitle: "",
    jointFirstName: "",
    jointSurname: "",
    jointDob: "",
    jointCitizenship: "United States",
    jointTaxId: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    region: "",
    postal: "",
    country: "United States",
    employment: "",
    occupation: "",
    income: "",
    netWorth: "",
    funds: "",
    objective: "",
    deposit: "",
    idType: "",
    idNumber: "",
    idFileName: "",
    idFile: "",
    addressFileName: "",
    addressFile: "",
    accuracy: false,
    identity: false,
    beneficial: false,
    privacy: false,
    pep: false,
  });
  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  useEffect(() => {
    if (!invite) {
      setStatus("missing");
      return;
    }
    getLeadInvite({ data: { token: invite } })
      .then((row) => {
        if (row.status !== "open") {
          setStatus(row.status === "used" ? "used" : row.status === "expired" ? "expired" : "missing");
          return;
        }
        const parts = (row.name || "").trim().split(/\s+/);
        setForm((current) => ({
          ...current,
          firstName: parts[0] || "",
          surname: parts.slice(1).join(" "),
          email: row.email || "",
        }));
        setStatus("open");
      })
      .catch(() => setStatus("missing"));
  }, [invite]);
  async function take(file: File | undefined, nameKey: "idFileName" | "addressFileName", dataKey: "idFile" | "addressFile") {
    setError("");
    try {
      const next = await readUpload(file);
      setForm((current) => ({ ...current, [nameKey]: next.name, [dataKey]: next.data }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The file could not be read.");
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await submitWealthApplication({
        data: {
          invite,
          offer,
          ...form,
        },
      });
      setStatus("sent");
    } catch (caught) {
      setError(caught instanceof Error && caught.message ? caught.message : "The application could not be submitted.");
    } finally {
      setPending(false);
    }
  }
  const company = brand.companyName || "Wealth";
  return (
    <main className="min-h-screen bg-[#f4f7f8] text-[#10233a]">
      <header className="bg-[#071b33] text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <p className="text-lg font-bold tracking-wide">{company.toUpperCase()}</p>
          <p className="text-xs tracking-[0.14em] text-[#9fb4c4]">CLIENT APPLICATION</p>
        </div>
        <div className="mx-auto max-w-3xl px-5 pb-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#2ee6c7]">NEW CLIENT ONBOARDING</p>
          <h1 className="mt-2 text-3xl font-semibold">Your {company} application</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#d5e4ee]">Please complete the details below and upload a valid form of identification. This information allows us to verify your identity and open your account in line with regulatory requirements. It should take around 10 minutes.</p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-8">
        {status === "loading" ? <p className="text-sm text-[#4d6272]">Opening your application…</p> : null}
        {status === "missing" ? <p className="rounded-lg border border-[#d5dee6] bg-white p-5 text-sm">This application link is not recognized. Ask your advisor to send a new one.</p> : null}
        {status === "expired" ? <p className="rounded-lg border border-[#d5dee6] bg-white p-5 text-sm">This application link has expired. Ask your advisor to send a new one.</p> : null}
        {status === "used" ? <p className="rounded-lg border border-[#d5dee6] bg-white p-5 text-sm">This application has already been submitted.</p> : null}
        {status === "sent" ? <p className="rounded-lg border border-[#d5dee6] bg-white p-5 text-sm">Thank you. Your application has been received. Your advisor will review it and contact you about the next step.</p> : null}
        {status === "open" ? (
          <form className="rounded-lg border border-[#d5dee6] bg-white p-5 shadow-sm" onSubmit={(event) => void submit(event)}>
            {selected ? <p className="mb-4 rounded-md bg-[#f4f8f8] px-3 py-2 text-sm text-[#243746]">Selected: <strong>{selected.bank}</strong> · {selected.term} · {selected.apy} APY · {selected.minimum}</p> : null}
            <Section index="01" title="Personal details" note="All fields required unless noted">
              <Field label="Title (optional)">
                <select className={fieldClass} value={form.title} onChange={(event) => set("title", event.target.value)}>
                  {TITLES.map((title) => <option key={title || "none"} value={title}>{title || "Select"}</option>)}
                </select>
              </Field>
              <span />
              <Field label="First name *"><input className={fieldClass} value={form.firstName} onChange={(event) => set("firstName", event.target.value)} required /></Field>
              <Field label="Last name *"><input className={fieldClass} value={form.surname} onChange={(event) => set("surname", event.target.value)} required /></Field>
              <Field label="Date of birth *"><input className={fieldClass} type="date" value={form.dob} onChange={(event) => set("dob", event.target.value)} required /></Field>
              <Field label="Country of citizenship *">
                <select className={fieldClass} value={form.citizenship} onChange={(event) => set("citizenship", event.target.value)}>{COUNTRIES.map((country) => <option key={country}>{country}</option>)}</select>
              </Field>
              <Field label="Social Security Number / Tax ID *" hint="Required for identity verification and tax reporting." wide>
                <input className={fieldClass} value={form.taxId} autoComplete="off" onChange={(event) => set("taxId", event.target.value)} required />
              </Field>
            </Section>
            <Section index="02" title="Joint accountholder" note="Only if opening a joint account">
              <label className="flex items-start gap-2 text-sm sm:col-span-2">
                <input type="checkbox" className="mt-1" checked={joint} onChange={(event) => setJoint(event.target.checked)} />
                <span><strong>This is a joint account — add a second accountholder</strong><br /><span className="text-[#6a7c8c]">Leave unticked for a single-holder account.</span></span>
              </label>
              {joint ? <>
                <Field label="Title (optional)">
                  <select className={fieldClass} value={form.jointTitle} onChange={(event) => set("jointTitle", event.target.value)}>{TITLES.map((title) => <option key={title || "none"} value={title}>{title || "Select"}</option>)}</select>
                </Field>
                <span />
                <Field label="First name *"><input className={fieldClass} value={form.jointFirstName} onChange={(event) => set("jointFirstName", event.target.value)} required /></Field>
                <Field label="Last name *"><input className={fieldClass} value={form.jointSurname} onChange={(event) => set("jointSurname", event.target.value)} required /></Field>
                <Field label="Date of birth *"><input className={fieldClass} type="date" value={form.jointDob} onChange={(event) => set("jointDob", event.target.value)} required /></Field>
                <Field label="Country of citizenship *">
                  <select className={fieldClass} value={form.jointCitizenship} onChange={(event) => set("jointCitizenship", event.target.value)}>{COUNTRIES.map((country) => <option key={country}>{country}</option>)}</select>
                </Field>
                <Field label="Social Security Number / Tax ID *" wide><input className={fieldClass} value={form.jointTaxId} autoComplete="off" onChange={(event) => set("jointTaxId", event.target.value)} required /></Field>
              </> : null}
            </Section>
            <Section index="03" title="Contact & address">
              <Field label="Email address *"><input className={fieldClass} type="email" value={form.email} readOnly /></Field>
              <Field label="Mobile number *"><input className={fieldClass} value={form.phone} onChange={(event) => set("phone", event.target.value)} required /></Field>
              <Field label="Residential address *" wide><input className={fieldClass} placeholder="Street address" value={form.street} onChange={(event) => set("street", event.target.value)} required /></Field>
              <Field label="City *"><input className={fieldClass} value={form.city} onChange={(event) => set("city", event.target.value)} required /></Field>
              <Field label="State / Region *"><input className={fieldClass} value={form.region} onChange={(event) => set("region", event.target.value)} required /></Field>
              <Field label="ZIP / Postal code *"><input className={fieldClass} value={form.postal} onChange={(event) => set("postal", event.target.value)} required /></Field>
              <Field label="Country *">
                <select className={fieldClass} value={form.country} onChange={(event) => set("country", event.target.value)}>{COUNTRIES.map((country) => <option key={country}>{country}</option>)}</select>
              </Field>
            </Section>
            <Section index="04" title="Financial profile" note="Helps us assess suitability">
              <Field label="Employment status *">
                <select className={fieldClass} value={form.employment} onChange={(event) => set("employment", event.target.value)} required>
                  <option value="">Select</option>
                  {EMPLOYMENT.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Occupation (if applicable)"><input className={fieldClass} value={form.occupation} onChange={(event) => set("occupation", event.target.value)} /></Field>
              <Field label="Annual income (USD) *">
                <select className={fieldClass} value={form.income} onChange={(event) => set("income", event.target.value)} required>
                  <option value="">Select range</option>
                  {INCOME.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Estimated net worth (USD) *">
                <select className={fieldClass} value={form.netWorth} onChange={(event) => set("netWorth", event.target.value)} required>
                  <option value="">Select range</option>
                  {NET_WORTH.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Source of funds *">
                <select className={fieldClass} value={form.funds} onChange={(event) => set("funds", event.target.value)} required>
                  <option value="">Select</option>
                  {FUNDS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Primary objective *">
                <select className={fieldClass} value={form.objective} onChange={(event) => set("objective", event.target.value)} required>
                  <option value="">Select</option>
                  {OBJECTIVES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Initial deposit amount (USD) (optional)" wide><input className={fieldClass} inputMode="decimal" value={form.deposit} onChange={(event) => set("deposit", event.target.value)} /></Field>
            </Section>
            <Section index="05" title="Identity verification">
              <Field label="ID document type *">
                <select className={fieldClass} value={form.idType} onChange={(event) => set("idType", event.target.value)} required>
                  <option value="">Select</option>
                  {ID_TYPES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="ID document number *"><input className={fieldClass} value={form.idNumber} onChange={(event) => set("idNumber", event.target.value)} required /></Field>
              <Field label="Upload identification *" hint={form.idFileName || "Passport, driver's license or state ID · JPG, PNG or PDF · max 10MB"} wide>
                <input className={fieldClass} type="file" accept="application/pdf,image/png,image/jpeg" onChange={(event) => void take(event.target.files?.[0], "idFileName", "idFile")} required={!form.idFile} />
              </Field>
              <Field label="Upload proof of address *" hint={form.addressFileName || "Utility bill or bank statement from the last 3 months · JPG, PNG or PDF · max 10MB"} wide>
                <input className={fieldClass} type="file" accept="application/pdf,image/png,image/jpeg" onChange={(event) => void take(event.target.files?.[0], "addressFileName", "addressFile")} required={!form.addressFile} />
              </Field>
            </Section>
            <section className="mt-5 border-t border-[#d5dee6] pt-5">
              <h2 className="text-base font-semibold"><span className="mr-2 text-[#6a7c8c]">06</span>Declarations & consent</h2>
              <div className="mt-3 grid gap-3 text-sm">
                <label className="flex gap-2"><input type="checkbox" checked={form.accuracy} onChange={(event) => set("accuracy", event.target.checked)} required /><span>Accuracy. I confirm that the information provided in this application is true, accurate and complete to the best of my knowledge.</span></label>
                <label className="flex gap-2"><input type="checkbox" checked={form.identity} onChange={(event) => set("identity", event.target.checked)} required /><span>Identity verification. I consent to {company} verifying my identity and performing checks against internal and third-party sources, which may include a credit reference check, in line with the USA PATRIOT Act and applicable anti-money-laundering (AML) requirements.</span></label>
                <label className="flex gap-2"><input type="checkbox" checked={form.beneficial} onChange={(event) => set("beneficial", event.target.checked)} required /><span>Beneficial ownership. I confirm I am applying on my own behalf and the funds are not derived from, or intended for, any unlawful activity.</span></label>
                <label className="flex gap-2"><input type="checkbox" checked={form.privacy} onChange={(event) => set("privacy", event.target.checked)} required /><span>Privacy. I have read and agree to the processing of my personal data for the purposes of account opening and ongoing servicing.</span></label>
                <label className="flex gap-2"><input type="checkbox" checked={form.pep} onChange={(event) => set("pep", event.target.checked)} /><span>PEP disclosure (tick if applicable). I am, or am closely associated with, a Politically Exposed Person (PEP).</span></label>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#6a7c8c]">{company} is required by federal law to obtain, verify and record information that identifies each person who opens an account. This application does not constitute an offer or acceptance. Account opening is subject to approval.</p>
            </section>
            {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="submit" className="min-h-12 rounded-md bg-[#071b33] px-5 py-3 text-sm font-semibold tracking-wide text-white disabled:opacity-60" disabled={pending}>{pending ? "Submitting…" : "SUBMIT APPLICATION"}</button>
              <p className="text-xs text-[#6a7c8c]">Your information is transmitted securely.</p>
            </div>
          </form>
        ) : null}
      </div>
      <footer className="bg-[#071b33] text-[#d5e4ee]">
        <p className="mx-auto max-w-3xl px-5 py-5 text-xs leading-5">{company}. Eligible deposits are insured by the FDIC up to $250,000 per depositor, per insured bank, per ownership category. This form collects personal and identifying information and is reviewed before an account is opened.</p>
      </footer>
    </main>
  );
}
