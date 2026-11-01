export const STEP_NAMES = [
  "Before you begin",
  "About you",
  "Address and tax",
  "Financial and funding",
  "Verification",
  "Declarations",
] as const;

export const ACCOUNT_TYPES = ["Individual", "Joint", "Business", "Trust"] as const;
export const CURRENCIES = ["USD"] as const;

export const PHONE_COUNTRIES = [
  "United States / Canada (+1)",
  "Mexico (+52)",
  "United Kingdom (+44)",
  "Ireland (+353)",
  "France (+33)",
  "Germany (+49)",
  "Spain (+34)",
  "Italy (+39)",
  "Netherlands (+31)",
  "Switzerland (+41)",
  "United Arab Emirates (+971)",
  "Saudi Arabia (+966)",
  "Australia (+61)",
  "New Zealand (+64)",
  "Singapore (+65)",
  "Hong Kong (+852)",
  "Japan (+81)",
  "South Korea (+82)",
  "India (+91)",
  "Other international code",
] as const;

export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Ireland",
  "Australia",
  "New Zealand",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Switzerland",
  "Sweden",
  "Norway",
  "Denmark",
  "Portugal",
  "Belgium",
  "Austria",
  "Japan",
  "South Korea",
  "Singapore",
  "Hong Kong",
  "India",
  "United Arab Emirates",
  "Saudi Arabia",
  "Mexico",
  "Brazil",
  "South Africa",
] as const;

export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "District of Columbia",
] as const;

export const OCCUPATIONS = [
  "Executive or senior management",
  "Professional",
  "Business owner",
  "Self-employed",
  "Finance or investment professional",
  "Healthcare professional",
  "Legal professional",
  "Technology professional",
  "Education professional",
  "Government employee",
  "Retired",
  "Homemaker",
  "Student",
  "Unemployed",
  "Other",
] as const;

export const WEALTH_SOURCES = [
  "Employment income",
  "Business ownership",
  "Sale of a business",
  "Investment returns",
  "Inheritance",
  "Other",
] as const;

export const FUND_SOURCES = [
  "Personal savings",
  "Employment income",
  "Brokerage or investment liquidation",
  "Business proceeds",
  "Other",
] as const;

export const PURPOSES = [
  "Capital preservation",
  "Income generation",
  "Long-term growth",
  "Retirement planning",
  "Other",
] as const;

export const NET_WORTH = [
  "Under $100,000",
  "$100,000 – $500,000",
  "$500,000 – $1,000,000",
  "$1,000,000 – $5,000,000",
  "Over $5,000,000",
] as const;

export const ID_TYPES = [
  "Passport",
  "Driver’s license",
  "Government-issued identification card",
  "Permanent Resident Card",
] as const;

export const ADDRESS_DOCS = [
  "Bank or credit-card statement",
  "Utility bill",
  "Government correspondence or tax statement",
  "Mortgage statement",
  "Current lease agreement",
] as const;

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export const YEARS = Array.from({ length: 109 }, (_, i) => String(2008 - i));
export const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

export type FormState = {
  accountType: (typeof ACCOUNT_TYPES)[number];
  currency: (typeof CURRENCIES)[number];
  firstName: string;
  middleName: string;
  surname: string;
  email: string;
  phoneCountry: (typeof PHONE_COUNTRIES)[number];
  phone: string;
  password: string;
  confirmPassword: string;
  dobYear: string;
  dobMonth: string;
  dobDay: string;
  nationality: string;
  residence: string;
  occupation: string;
  street: string;
  apt: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  taxResidence: string;
  taxId: string;
  sourceOfWealth: string;
  sourceOfFunds: string;
  investmentPurpose: string;
  netWorth: string;
  preferredAmount: string;
  preferredTerm: string;
  promoCode: string;
  inviteToken: string;
  idType: (typeof ID_TYPES)[number];
  addressDocType: (typeof ADDRESS_DOCS)[number];
  idFileName: string;
  idFile: string;
  addressFileName: string;
  addressFile: string;
  bankName: string;
  accountHolder: string;
  bankStreet: string;
  bankLine2: string;
  bankCity: string;
  bankState: string;
  bankZip: string;
  routingNumber: string;
  accountNumber: string;
  d1: boolean;
  d2: boolean;
  d3: boolean;
  d4: boolean;
  signature: string;
};

export const EMPTY_FORM: FormState = {
  accountType: "Individual",
  currency: "USD",
  firstName: "",
  middleName: "",
  surname: "",
  email: "",
  phoneCountry: "United States / Canada (+1)",
  phone: "",
  password: "",
  confirmPassword: "",
  dobYear: "",
  dobMonth: "",
  dobDay: "",
  nationality: "United States",
  residence: "United States",
  occupation: "",
  street: "",
  apt: "",
  city: "",
  region: "",
  postal: "",
  country: "United States",
  taxResidence: "United States",
  taxId: "",
  sourceOfWealth: "",
  sourceOfFunds: "",
  investmentPurpose: "",
  netWorth: "",
  preferredAmount: "",
  preferredTerm: "",
  promoCode: "",
  inviteToken: "",
  idType: "Passport",
  addressDocType: "Bank or credit-card statement",
  idFileName: "",
  idFile: "",
  addressFileName: "",
  addressFile: "",
  bankName: "",
  accountHolder: "",
  bankStreet: "",
  bankLine2: "",
  bankCity: "",
  bankState: "",
  bankZip: "",
  routingNumber: "",
  accountNumber: "",
  d1: false,
  d2: false,
  d3: false,
  d4: false,
  signature: "",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(step: number, form: FormState): string[] {
  const errors: string[] = [];
  if (step === 1) {
    if (!form.firstName.trim()) errors.push("Enter a first name.");
    if (!form.surname.trim()) errors.push("Enter a surname.");
    if (!EMAIL.test(form.email.trim())) errors.push("Enter a valid email address.");
    if (form.phone.replace(/\D/g, "").length < 7) errors.push("Enter a telephone number.");
    if (form.password.length < 8) errors.push("Create a password of at least 8 characters.");
    if (form.password !== form.confirmPassword) errors.push("Passwords do not match.");
    if (!form.dobYear || !form.dobMonth || !form.dobDay) errors.push("Enter date of birth.");
    if (!form.occupation) errors.push("Select occupation.");
  }
  if (step === 2) {
    if (!form.street.trim()) errors.push("Enter a street address.");
    if (!form.city.trim()) errors.push("Enter a city.");
    if (!form.region.trim()) errors.push("Enter a state or region.");
    if (!form.postal.trim()) errors.push("Enter a postal code.");
  }
  if (step === 3) {
    if (!form.sourceOfWealth) errors.push("Select a source of wealth.");
    if (!form.sourceOfFunds) errors.push("Select a source of funds.");
    if (!form.investmentPurpose) errors.push("Select an investment purpose.");
    if (!form.netWorth) errors.push("Select an estimated net worth.");
    if (!form.bankName.trim()) errors.push("Enter the bank name.");
    if (!form.accountHolder.trim()) errors.push("Enter the account holder's name.");
    if (!/^\d{9}$/.test(form.routingNumber.replace(/\D/g, ""))) errors.push("Enter a 9-digit routing number.");
    if (form.accountNumber.replace(/\D/g, "").length < 4) errors.push("Enter the account number.");
    const preferred = Number(form.preferredAmount.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(preferred) || preferred <= 0) errors.push("Enter a preferred investment amount.");
    if (!form.preferredTerm) errors.push("Choose a promotional term.");
  }
  if (step === 5) {
    if (!form.d1 || !form.d2 || !form.d3 || !form.d4) {
      errors.push("Confirm every declaration before submitting.");
    }
    if (!form.signature.startsWith("data:image/png;base64,")) errors.push("Draw your signature.");
  }
  return errors;
}
