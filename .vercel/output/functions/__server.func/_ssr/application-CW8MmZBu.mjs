import { o as __toESM } from "../_runtime.mjs";
import { a as matchTier, i as formatOfferDate, n as amountRange, r as formatBonus, s as promoMonths, t as EMPTY_PROMO } from "./promo-a-oE9-Iz.mjs";
import { S as require_jsx_runtime, X as require_react, b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as FileText, b as Check, d as MapPin, h as IdCard, o as ShieldCheck, v as ChevronLeft } from "../_libs/lucide-react.mjs";
import { T as getLeadInvite, i as headerActionClass, j as investorLogout, k as getPromo, n as AppCover, nt as submitApplication, r as SiteHeader, w as getInvestorSession, x as getCdTerms } from "./router-BgWJKDCs.mjs";
import { t as SignaturePad } from "./signature-pad-C-nQ00Yq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/application-CW8MmZBu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEP_NAMES = [
	"Before you begin",
	"About you",
	"Address and tax",
	"Financial and funding",
	"Verification",
	"Declarations"
];
var ACCOUNT_TYPES = [
	"Individual",
	"Joint",
	"Business",
	"Trust"
];
var PHONE_COUNTRIES = [
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
	"Other international code"
];
var COUNTRIES = [
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
	"South Africa"
];
var US_STATES = [
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
	"District of Columbia"
];
var OCCUPATIONS = [
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
	"Other"
];
var WEALTH_SOURCES = [
	"Employment income",
	"Business ownership",
	"Sale of a business",
	"Investment returns",
	"Inheritance",
	"Other"
];
var FUND_SOURCES = [
	"Personal savings",
	"Employment income",
	"Brokerage or investment liquidation",
	"Business proceeds",
	"Other"
];
var PURPOSES = [
	"Capital preservation",
	"Income generation",
	"Long-term growth",
	"Retirement planning",
	"Other"
];
var NET_WORTH = [
	"Under $100,000",
	"$100,000 – $500,000",
	"$500,000 – $1,000,000",
	"$1,000,000 – $5,000,000",
	"Over $5,000,000"
];
var ID_TYPES = [
	"Passport",
	"Driver’s license",
	"Government-issued identification card",
	"Permanent Resident Card"
];
var ADDRESS_DOCS = [
	"Bank or credit-card statement",
	"Utility bill",
	"Government correspondence or tax statement",
	"Mortgage statement",
	"Current lease agreement"
];
var MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
var YEARS = Array.from({ length: 109 }, (_, i) => String(2008 - i));
var DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
var EMPTY_FORM = {
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
	signature: ""
};
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateStep(step, form) {
	const errors = [];
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
		if (!form.d1 || !form.d2 || !form.d3 || !form.d4) errors.push("Confirm every declaration before submitting.");
		if (!form.signature.startsWith("data:image/png;base64,")) errors.push("Draw your signature.");
	}
	return errors;
}
var STORAGE_KEY = "account-holding-application";
var PREPARE = [
	{
		icon: IdCard,
		title: "Government-issued identification",
		body: "Passport, driver’s license, or national identity card."
	},
	{
		icon: MapPin,
		title: "Proof of address",
		body: "A recent statement or bill showing your residential address."
	},
	{
		icon: FileText,
		title: "Tax information",
		body: "Your tax residence and taxpayer identification number."
	},
	{
		icon: ShieldCheck,
		title: "A few minutes",
		body: "Most applicants finish in a single sitting."
	}
];
var DECLARATIONS = [
	{
		key: "d1",
		label: "I confirm the information in this application is accurate and complete."
	},
	{
		key: "d2",
		label: "I am the beneficial owner of the assets that will be held in this account."
	},
	{
		key: "d3",
		label: "I understand the portfolio stays unavailable until this application is approved."
	},
	{
		key: "d4",
		label: "I agree to the account terms and to electronic delivery of statements."
	}
];
function loadDraft() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return EMPTY_FORM;
		const parsed = JSON.parse(raw);
		return {
			...EMPTY_FORM,
			...parsed,
			password: "",
			confirmPassword: ""
		};
	} catch {
		return EMPTY_FORM;
	}
}
function Field({ label, children, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-1.5 block text-sm font-medium",
				children: label
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-xs text-fg",
				children: hint
			}) : null
		]
	});
}
var controlClass = "w-full rounded-md border border-border bg-surface px-3.5 py-3 text-base text-fg outline-none transition focus:border-primary";
function SelectField({ label, value, onChange, options, placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
			className: controlClass,
			value,
			onChange: (event) => onChange(event.target.value),
			children: [placeholder ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "",
				children: placeholder
			}) : null, options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: option,
				children: option
			}, option))]
		})
	});
}
function ApplicationForm() {
	const navigate = useNavigate();
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	const [step, setStep] = (0, import_react.useState)(0);
	const [errors, setErrors] = (0, import_react.useState)([]);
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [session, setSession] = (0, import_react.useState)(void 0);
	const [terms, setTerms] = (0, import_react.useState)([]);
	const [offer, setOffer] = (0, import_react.useState)(EMPTY_PROMO);
	const [inviteGate, setInviteGate] = (0, import_react.useState)("none");
	const cardRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		getInvestorSession().then((value) => {
			if (value?.destination === "portal") {
				navigate({ to: "/portal" });
				return;
			}
			setSession(value);
		}).catch(() => setSession(null));
	}, [navigate]);
	(0, import_react.useEffect)(() => {
		const params = new URLSearchParams(window.location.search);
		const invite = params.get("invite")?.trim() || "";
		const draft = loadDraft();
		if (!invite) {
			const term = params.get("term")?.replace(/\D/g, "") || "";
			const code = params.get("code")?.trim().slice(0, 40) || "";
			setForm({
				...draft,
				preferredTerm: term || draft.preferredTerm,
				promoCode: code || draft.promoCode || "",
				inviteToken: ""
			});
			setInviteGate("none");
			setReady(true);
			return;
		}
		setInviteGate("checking");
		getLeadInvite({ data: { token: invite } }).then((result) => {
			if (result.status !== "open") {
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
				firstName: draft.firstName || first
			});
			setInviteGate("open");
			setReady(true);
		}).catch(() => {
			setInviteGate("expired");
			setReady(true);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		Promise.all([getCdTerms(), getPromo()]).then(([nextTerms, nextOffer]) => {
			setTerms(nextTerms);
			setOffer(nextOffer);
		}).catch(() => {
			setTerms([]);
			setOffer(EMPTY_PROMO);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready || submitted || session) return;
		const rest = {
			...form,
			password: "",
			confirmPassword: ""
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
	}, [
		form,
		ready,
		submitted,
		session
	]);
	const percent = (0, import_react.useMemo)(() => step / (STEP_NAMES.length - 1) * 100, [step]);
	function patch(key, value) {
		setForm((current) => ({
			...current,
			[key]: value
		}));
	}
	function go(next) {
		setErrors([]);
		setStep(next);
		cardRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	}
	async function onContinue() {
		const nextErrors = validateStep(step, form);
		if (nextErrors.length) {
			setErrors(nextErrors);
			cardRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
			return;
		}
		if (step === STEP_NAMES.length - 1) {
			try {
				await submitApplication({ data: {
					...form,
					currency: "USD"
				} });
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
		navigate({ to: "/login" });
	}
	if (session === void 0 || inviteGate === "checking") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { eyebrow: "Investor application" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppCover, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-3xl px-4 py-10 text-sm text-fg",
				children: "Checking your application…"
			})
		]
	});
	if (inviteGate === "expired") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { eyebrow: "Investor application" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppCover, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-border bg-surface px-6 py-12 text-center shadow-sm sm:px-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-semibold",
						children: "This application link has expired"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-3 max-w-md text-fg",
						children: "The link in your email lasts 24 hours. Ask your advisor to send a new one."
					})]
				})
			})
		]
	});
	if (session && session.status !== "approved") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
				eyebrow: "Investor application",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: headerActionClass,
					onClick: () => void signOut(),
					children: "Sign out"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppCover, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-border bg-surface px-6 py-12 text-center shadow-sm sm:px-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-widest text-primary uppercase",
							children: session.status === "hold" ? "On hold" : "In review"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-3xl font-semibold",
							children: "Application sent"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mx-auto mt-3 max-w-md text-fg",
							children: [session.name, ", your application is with the desk. Your investor portal opens when it is approved."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-6 text-sm text-fg",
							children: [
								session.accountType,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								session.email
							]
						})
					]
				})
			})
		]
	});
	if (submitted) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
				eyebrow: "Investor application",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: headerActionClass,
					children: "Sign in"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppCover, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-border bg-surface px-6 py-12 text-center shadow-sm sm:px-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-soft text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								className: "size-7",
								"aria-hidden": "true"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-widest text-primary uppercase",
							children: "Submitted"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-3xl font-semibold",
							children: "Application received"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mx-auto mt-3 max-w-md text-fg",
							children: [form.firstName, ", sign in with the email and password from this application. The investor portal opens after the desk approves it."]
						})
					]
				})
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
				eyebrow: "Investor application",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: headerActionClass,
					children: "Sign in"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppCover, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto my-6 w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-surface px-4 py-8 shadow-sm sm:my-10 sm:px-8 sm:py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "mb-8 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-3xl font-semibold tracking-tight sm:text-4xl",
							children: "Open an account relationship"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-3 max-w-xl text-fg",
							children: "Complete each section in one session. Your portfolio remains unavailable until the compliance team approves the application."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-semibold text-step",
									children: [
										"Step ",
										step + 1,
										" of ",
										STEP_NAMES.length
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-fg",
									children: [Math.round(percent), "%"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-lg font-semibold text-primary",
								children: STEP_NAMES[step]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative mt-3 h-1.5 overflow-hidden rounded-full bg-step-track",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "progress-fill relative h-full rounded-full bg-step-fill",
									style: { width: `${percent}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "mt-4 flex items-center justify-between gap-1",
								children: STEP_NAMES.map((name, index) => {
									const done = index < step;
									const active = index === step;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: index < STEP_NAMES.length - 1 ? "flex flex-1 items-center" : "shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold " + (active ? "bg-step text-on-primary" : done ? "bg-step-done text-on-primary" : "bg-step-idle text-step"),
											"aria-current": active ? "step" : void 0,
											"aria-label": name,
											disabled: index > step,
											onClick: () => index < step && go(index),
											children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
												className: "size-3.5",
												"aria-hidden": "true"
											}) : index + 1
										}), index < STEP_NAMES.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mx-1 h-0.5 flex-1 rounded-full " + (index < step ? "bg-step-done" : "bg-step-idle"),
											"aria-hidden": "true"
										}) : null]
									}, name);
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: cardRef,
						children: [
							errors.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-6 rounded-md bg-danger-bg px-4 py-3 text-sm text-danger",
								role: "alert",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: "Check the following fields:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-1 list-disc pl-5",
									children: errors.map((error) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: error }, error))
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "step-enter",
								children: [
									step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Prepare, {}) : null,
									step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-10",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Account, {
											form,
											patch
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Personal, {
											form,
											patch
										})]
									}) : null,
									step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Address, {
										form,
										patch
									}) : null,
									step === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid min-w-0 gap-10",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Preference, {
												form,
												patch,
												terms,
												offer,
												locked: inviteGate === "open"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Financial, {
												form,
												patch
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funding, {
												form,
												patch
											})
										]
									}) : null,
									step === 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Documents, {
										form,
										patch
									}) : null,
									step === 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Declarations, {
										form,
										patch
									}) : null
								]
							}, step),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex items-center justify-between gap-3",
								children: [step > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "inline-flex min-h-11 items-center gap-1 rounded-md border border-border px-5 py-3 font-semibold text-primary",
									onClick: () => go(step - 1),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
										className: "size-4",
										"aria-hidden": "true"
									}), "Back"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 rounded-md bg-action px-6 py-3 font-semibold text-on-primary hover:bg-action-deep",
									onClick: () => void onContinue(),
									children: step === STEP_NAMES.length - 1 ? "Submit application" : "Continue"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 text-center text-sm text-fg",
						children: [
							"Keep this page open until your application has been submitted.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "font-semibold text-primary underline",
								children: "Return to sign in"
							})
						]
					})
				]
			})
		]
	});
}
function SectionIntro({ eyebrow, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-widest text-primary uppercase",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 text-2xl font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-fg",
				children: body
			})
		]
	});
}
function Prepare() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionIntro, {
		eyebrow: "Preparation",
		title: "Before you begin",
		body: "You will need the following to complete the application in one session."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-4",
		children: PREPARE.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex gap-3 rounded-md border border-border px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
				className: "mt-0.5 size-5 shrink-0 text-primary",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block font-semibold text-primary",
				children: item.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-fg",
				children: item.body
			})] })]
		}, item.title))
	})] });
}
function Account({ form, patch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionIntro, {
				eyebrow: "Section",
				title: "Account and contact",
				body: "Choose the legal account structure and create the primary holder’s access."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
				className: "mb-2 text-sm font-medium",
				children: "Account type"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: ACCOUNT_TYPES.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-3 rounded-md border border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "radio",
						name: "accountType",
						checked: form.accountType === type,
						onChange: () => patch("accountType", type)
					}), type]
				}, type))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "First name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.firstName,
						onChange: (event) => patch("firstName", event.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Middle name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.middleName,
						onChange: (event) => patch("middleName", event.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Surname",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					value: form.surname,
					onChange: (event) => patch("surname", event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Email address",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "email",
					className: controlClass,
					value: form.email,
					onChange: (event) => patch("email", event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "Telephone country",
					value: form.phoneCountry,
					options: PHONE_COUNTRIES,
					onChange: (value) => patch("phoneCountry", value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Telephone number",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.phone,
						onChange: (event) => patch("phone", event.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Password",
					hint: "At least 8 characters. This becomes your portal sign-in.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						className: controlClass,
						value: form.password,
						onChange: (event) => patch("password", event.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Confirm password",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						className: controlClass,
						value: form.confirmPassword,
						onChange: (event) => patch("confirmPassword", event.target.value)
					})
				})]
			})
		]
	});
}
function Personal({ form, patch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionIntro, {
				eyebrow: "Section",
				title: "Personal information",
				body: "Provide information exactly as it appears on official records."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
				className: "mb-2 text-sm font-medium",
				children: "Date of birth"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						value: form.dobMonth,
						onChange: (event) => patch("dobMonth", event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Month"
						}), MONTHS.map((month) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: month }, month))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						value: form.dobDay,
						onChange: (event) => patch("dobDay", event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Day"
						}), DAYS.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: day }, day))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						value: form.dobYear,
						onChange: (event) => patch("dobYear", event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Year"
						}), YEARS.map((year) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: year }, year))]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "Nationality",
					value: form.nationality,
					options: COUNTRIES,
					onChange: (value) => patch("nationality", value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "Country of residence",
					value: form.residence,
					options: COUNTRIES,
					onChange: (value) => patch("residence", value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Occupation",
				value: form.occupation,
				options: OCCUPATIONS,
				placeholder: "Select occupation",
				onChange: (value) => patch("occupation", value)
			})
		]
	});
}
function Address({ form, patch }) {
	const unitedStates = form.country === "United States";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionIntro, {
				eyebrow: "Section",
				title: "Address and tax",
				body: "Provide your residential address and tax residency information."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Street address",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					value: form.street,
					onChange: (event) => patch("street", event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Apartment or suite",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					value: form.apt,
					onChange: (event) => patch("apt", event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "City",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.city,
						onChange: (event) => patch("city", event.target.value)
					})
				}), unitedStates ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "State",
					value: form.region,
					options: US_STATES,
					placeholder: "Select state",
					onChange: (value) => patch("region", value)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "State or region",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.region,
						onChange: (event) => patch("region", event.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Postal code",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.postal,
						onChange: (event) => patch("postal", event.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "Country",
					value: form.country,
					options: COUNTRIES,
					onChange: (value) => patch("country", value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "Tax residence",
					value: form.taxResidence,
					options: COUNTRIES,
					onChange: (value) => patch("taxResidence", value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Taxpayer identification number",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.taxId,
						onChange: (event) => patch("taxId", event.target.value)
					})
				})]
			})
		]
	});
}
function Preference({ form, patch, terms, offer, locked = false }) {
	const scroller = (0, import_react.useRef)(null);
	const [page, setPage] = (0, import_react.useState)(0);
	const promo = new Set(promoMonths(offer));
	const ordered = locked ? terms.filter((term) => String(term.months) === form.preferredTerm) : [...terms].sort((a, b) => Number(promo.has(b.months)) - Number(promo.has(a.months)) || Number(b.featured) - Number(a.featured) || a.months - b.months);
	const months = Number(form.preferredTerm);
	const shown = ordered.length > 0 || !locked || !months ? ordered : [{
		id: "invite",
		months,
		apy: "—",
		featured: false
	}];
	const amount = Number(form.preferredAmount.replace(/[^0-9.]/g, ""));
	const tiers = offer.tiers.filter((tier) => tier.months.includes(months));
	const matched = matchTier(offer, months, amount);
	function move(direction) {
		const next = Math.min(Math.max(page + direction, 0), Math.max(ordered.length - 1, 0));
		setPage(next);
		scroller.current?.querySelectorAll("[data-term]")[next]?.scrollIntoView({
			behavior: "smooth",
			inline: "start",
			block: "nearest"
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-w-0 max-w-full gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionIntro, {
				eyebrow: "Section",
				title: "Preferred certificate",
				body: locked ? "This term and promotional code come from your email link. They stay fixed for this application." : "Choose a term and the amount you expect to invest. Promotional terms are shown first."
			}),
			shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg",
				children: "No certificate terms are available right now."
			}) : locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-full",
				children: [shown.map((term) => {
					const isPromo = promo.has(term.months);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-3 flex min-h-40 max-w-sm flex-col rounded-xl border border-action bg-white px-5 pt-12 pb-5 text-left",
						children: [
							term.featured || isPromo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "absolute -top-3 left-4 flex flex-col items-start gap-1",
								children: [isPromo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex rounded-md bg-[#e24b2a] px-2 py-1 text-xs font-semibold text-white",
									children: "Promotional Offer"
								}) : null, term.featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex rounded-md bg-action px-2 py-1 text-xs font-semibold text-white",
									children: "Featured APY"
								}) : null]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-2xl font-semibold text-primary",
								children: term.apy.includes("APY") ? term.apy : `${term.apy} APY`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-1 block text-sm text-fg",
								children: [term.months, "-month term"]
							})
						]
					}, term.id);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-fg",
					children: "Ask your advisor if you need another term."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-full overflow-hidden rounded-xl bg-[#f3f4f6] px-4 py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: scroller,
					className: "w-full max-w-full overflow-x-auto scroll-smooth pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex w-max items-stretch gap-3 pt-4",
						children: ordered.map((term) => {
							const selected = form.preferredTerm === String(term.months);
							const isPromo = promo.has(term.months);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-term": true,
								className: "relative mt-3 flex min-h-40 min-w-[200px] shrink-0 flex-col rounded-xl border bg-white px-5 pt-12 pb-5 text-left " + (selected ? "border-action" : "border-[#e7e7e7]"),
								onClick: () => {
									if (!locked) patch("preferredTerm", String(term.months));
								},
								children: [
									term.featured || isPromo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "absolute -top-3 left-4 flex flex-col items-start gap-1",
										children: [isPromo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-flex rounded-md bg-[#e24b2a] px-2 py-1 text-xs font-semibold text-white",
											children: "Promotional Offer"
										}) : null, term.featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-flex rounded-md bg-action px-2 py-1 text-xs font-semibold text-white",
											children: "Featured APY"
										}) : null]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-2xl font-semibold text-primary",
										children: term.apy.includes("APY") ? term.apy : `${term.apy} APY`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-1 block text-sm text-fg",
										children: [term.months, "-month term"]
									})
								]
							}, term.id);
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center justify-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex size-8 items-center justify-center text-action",
							"aria-label": "Previous terms",
							onClick: () => move(-1),
							children: "‹"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex max-w-full flex-wrap items-center justify-center gap-1.5",
							children: ordered.map((term, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `Show term ${index + 1}`,
								className: index === page ? "h-1.5 w-5 rounded-full bg-action" : "size-1.5 rounded-full bg-[#c5c8ce]",
								onClick: () => {
									setPage(index);
									scroller.current?.querySelectorAll("[data-term]")[index]?.scrollIntoView({
										behavior: "smooth",
										inline: "start",
										block: "nearest"
									});
								}
							}, term.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex size-8 items-center justify-center text-action",
							"aria-label": "Next terms",
							onClick: () => move(1),
							children: "›"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Promotional code",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					value: form.promoCode,
					placeholder: "Optional",
					readOnly: locked,
					onChange: (event) => patch("promoCode", event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Preferred investment amount",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					inputMode: "decimal",
					placeholder: "$100,000",
					value: form.preferredAmount,
					onChange: (event) => patch("preferredAmount", event.target.value)
				})
			}),
			tiers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-xl border border-border bg-white text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-border px-4 py-3 font-semibold text-primary",
						children: [months, "-month promo bonus"]
					}),
					offer.startsOn && offer.endsOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "border-b border-border px-4 py-3 text-fg",
						children: [
							"Offer available from ",
							formatOfferDate(offer.startsOn),
							" – ",
							formatOfferDate(offer.endsOn),
							"."
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 bg-[#f7f7f7] px-4 py-2 text-xs font-semibold tracking-wide text-heading uppercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Deposit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Promo bonus" })]
					}),
					tiers.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 border-t border-border px-4 py-3 " + (matched?.id === tier.id ? "bg-[#e8f4ff] font-semibold" : ""),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: amountRange(tier) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatBonus(tier.bonusPercent) })]
					}, tier.id))
				]
			}) : null
		]
	});
}
function Financial({ form, patch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionIntro, {
				eyebrow: "Section",
				title: "Financial profile",
				body: "Tell us about your sources of wealth and investment objectives."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Source of wealth",
				value: form.sourceOfWealth,
				options: WEALTH_SOURCES,
				placeholder: "Select a source",
				onChange: (value) => patch("sourceOfWealth", value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Source of funds",
				value: form.sourceOfFunds,
				options: FUND_SOURCES,
				placeholder: "Select a source",
				onChange: (value) => patch("sourceOfFunds", value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Investment purpose",
				value: form.investmentPurpose,
				options: PURPOSES,
				placeholder: "Select a purpose",
				onChange: (value) => patch("investmentPurpose", value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Estimated net worth",
				value: form.netWorth,
				options: NET_WORTH,
				placeholder: "Select a range",
				onChange: (value) => patch("netWorth", value)
			})
		]
	});
}
function Documents({ form, patch }) {
	const [fileError, setFileError] = (0, import_react.useState)("");
	function take(file, nameKey, dataKey) {
		if (!file) {
			patch(nameKey, "");
			patch(dataKey, "");
			return;
		}
		if (file.size > 5e6 || !/^(application\/pdf|image\/png|image\/jpeg)$/.test(file.type)) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionIntro, {
				eyebrow: "Section",
				title: "Verification documents",
				body: "Choose the document types and attach files for identity and address verification."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Identity document",
				value: form.idType,
				options: ID_TYPES,
				onChange: (value) => patch("idType", value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Identity file",
				hint: form.idFileName || "Optional. PDF, PNG, or JPEG",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "application/pdf,image/png,image/jpeg",
					className: controlClass,
					onChange: (event) => take(event.target.files?.[0], "idFileName", "idFile")
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Proof of address",
				value: form.addressDocType,
				options: ADDRESS_DOCS,
				onChange: (value) => patch("addressDocType", value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Address file",
				hint: form.addressFileName || "Optional. PDF, PNG, or JPEG",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "application/pdf,image/png,image/jpeg",
					className: controlClass,
					onChange: (event) => take(event.target.files?.[0], "addressFileName", "addressFile")
				})
			}),
			fileError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: fileError
			}) : null
		]
	});
}
function Funding({ form, patch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionIntro, {
				eyebrow: "Section",
				title: "Funding information",
				body: "Please confirm the details of the bank that you will be making payment from."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Bank name *",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.bankName,
						onChange: (event) => patch("bankName", event.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Account holder's name *",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.accountHolder,
						onChange: (event) => patch("accountHolder", event.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 border-t border-border pt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Bank address and postcode"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Street address",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: controlClass,
							value: form.bankStreet,
							onChange: (event) => patch("bankStreet", event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Address line 2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: controlClass,
							value: form.bankLine2,
							onChange: (event) => patch("bankLine2", event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-5 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "City",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: controlClass,
								value: form.bankCity,
								onChange: (event) => patch("bankCity", event.target.value)
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
							label: "State",
							value: form.bankState,
							options: US_STATES,
							placeholder: "Select state",
							onChange: (value) => patch("bankState", value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "ZIP code",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: controlClass,
							value: form.bankZip,
							onChange: (event) => patch("bankZip", event.target.value)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 border-t border-border pt-5 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Routing number *",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						inputMode: "numeric",
						value: form.routingNumber,
						onChange: (event) => patch("routingNumber", event.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Account number *",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						inputMode: "numeric",
						value: form.accountNumber,
						onChange: (event) => patch("accountNumber", event.target.value)
					})
				})]
			})
		]
	});
}
function Declarations({ form, patch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionIntro, {
				eyebrow: "Section",
				title: "Declarations",
				body: "Review each statement, then sign. This signature is used on your account documents."
			}),
			DECLARATIONS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-start gap-3 rounded-md border border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					className: "mt-1",
					checked: form[item.key],
					onChange: (event) => patch(item.key, event.target.checked)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
			}, item.key)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Signature"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-fg",
					children: "Draw the signature that will appear on your certificates. You can lift the pointer and keep drawing."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignaturePad, { onChange: (value) => patch("signature", value ?? "") })
			] })
		]
	});
}
var SplitComponent = ApplicationForm;
//#endregion
export { SplitComponent as component };
