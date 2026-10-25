import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as FileText, i as IdCard, n as ShieldCheck, o as ChevronLeft, r as MapPin, s as Check } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/application-2Y9luHqp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEP_NAMES = [
	"Before you begin",
	"Account and contact",
	"Personal information",
	"Address and tax",
	"Financial profile",
	"Verification documents",
	"Declarations"
];
var ACCOUNT_TYPES = [
	"Individual",
	"Joint",
	"Business",
	"Trust"
];
var CURRENCIES = [
	"USD",
	"GBP",
	"CAD"
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
	idType: "Passport",
	addressDocType: "Bank or credit-card statement",
	idFileName: "",
	addressFileName: "",
	d1: false,
	d2: false,
	d3: false,
	d4: false
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
	}
	if (step === 2) {
		if (!form.dobYear || !form.dobMonth || !form.dobDay) errors.push("Enter date of birth.");
		if (!form.occupation) errors.push("Select occupation.");
	}
	if (step === 3) {
		if (!form.street.trim()) errors.push("Enter a street address.");
		if (!form.city.trim()) errors.push("Enter a city.");
		if (!form.region.trim()) errors.push("Enter a state or region.");
		if (!form.postal.trim()) errors.push("Enter a postal code.");
	}
	if (step === 4) {
		if (!form.sourceOfWealth) errors.push("Select a source of wealth.");
		if (!form.sourceOfFunds) errors.push("Select a source of funds.");
		if (!form.investmentPurpose) errors.push("Select an investment purpose.");
		if (!form.netWorth) errors.push("Select an estimated net worth.");
	}
	if (step === 5) {
		if (!form.idFileName) errors.push("Attach an identity document.");
		if (!form.addressFileName) errors.push("Attach a proof-of-address document.");
	}
	if (step === 6) {
		if (!form.d1 || !form.d2 || !form.d3 || !form.d4) errors.push("Confirm every declaration before submitting.");
	}
	return errors;
}
var STORAGE_KEY = "account-holding-application";
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
				className: "mt-1 block text-xs text-muted",
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
			onChange: (e) => onChange(e.target.value),
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
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	const [step, setStep] = (0, import_react.useState)(0);
	const [errors, setErrors] = (0, import_react.useState)([]);
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	const cardRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setForm(loadDraft());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready || submitted) return;
		const rest = {
			...form,
			password: "",
			confirmPassword: ""
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
	}, [
		form,
		ready,
		submitted
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
	function onContinue() {
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
			localStorage.removeItem(STORAGE_KEY);
			setSubmitted(true);
			return;
		}
		go(step + 1);
	}
	if (submitted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
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
					className: "mx-auto mt-3 max-w-md text-muted",
					children: [form.firstName, ", your portfolio stays unavailable until the compliance team approves the application. Most reviews finish the same day."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-8 rounded-md bg-primary px-6 py-3 font-semibold text-on-primary hover:bg-primary-deep",
					onClick: () => {
						setForm(EMPTY_FORM);
						setStep(0);
						setSubmitted(false);
					},
					children: "Start another application"
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto my-6 max-w-3xl rounded-lg border border-border bg-surface px-4 py-8 shadow-sm sm:my-10 sm:px-8 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold tracking-wide text-primary",
						children: "ACCOUNT HOLDING"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs font-semibold tracking-widest text-muted uppercase",
						children: "Investor application"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-3xl font-semibold tracking-tight sm:text-4xl",
						children: "Open an account relationship"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-3 max-w-xl text-muted",
						children: "Complete each section in one session. Your portfolio remains unavailable until the compliance team approves the application."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 sm:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center text-sm font-semibold",
					children: [
						"Step ",
						step + 1,
						" of ",
						STEP_NAMES.length,
						" · ",
						STEP_NAMES[step]
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative mt-3 h-1.5 overflow-hidden rounded-full bg-border",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "progress-fill relative h-full rounded-full bg-accent",
						style: { width: `${percent}%` }
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mb-8 hidden gap-2 sm:grid sm:grid-cols-7",
				children: STEP_NAMES.map((name, index) => {
					const done = index < step;
					const active = index === step;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "min-w-0 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mx-auto mb-1 flex size-7 items-center justify-center rounded-full text-sm font-semibold " + (active || done ? "bg-primary text-on-primary" : "bg-border text-muted"),
							children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "size-4",
								"aria-hidden": "true"
							}) : index + 1
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs leading-tight " + (active ? "font-semibold text-primary" : "text-muted"),
							children: name
						})]
					}, name);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: cardRef,
				className: "rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-8",
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
							step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Account, {
								form,
								patch
							}) : null,
							step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Personal, {
								form,
								patch
							}) : null,
							step === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Address, {
								form,
								patch
							}) : null,
							step === 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Financial, {
								form,
								patch
							}) : null,
							step === 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Documents, {
								form,
								patch
							}) : null,
							step === 6 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Declarations, {
								form,
								patch
							}) : null
						]
					}, step),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "inline-flex min-h-11 items-center gap-1 rounded-md border border-border px-5 py-3 font-semibold text-muted " + (step === 0 ? "invisible" : ""),
							onClick: () => go(step - 1),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Back"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-md bg-primary px-6 py-3 font-semibold text-on-primary hover:bg-primary-deep",
							onClick: onContinue,
							children: step === STEP_NAMES.length - 1 ? "Submit application" : "Continue"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-center text-sm text-muted",
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
	});
}
function Prepare() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold tracking-widest text-primary uppercase",
			children: "Preparation"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 text-2xl font-semibold",
			children: "Before you begin"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "This takes a few minutes. Have a government-issued photo ID and a recent proof-of-address document available. Business and trust applicants will also need formation or governing documents."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-6 grid gap-3",
			children: [
				{
					icon: IdCard,
					title: "Identity",
					body: "Passport, driver's license or state ID"
				},
				{
					icon: MapPin,
					title: "Address",
					body: "Recent statement, bill or official correspondence"
				},
				{
					icon: FileText,
					title: "Your details",
					body: "Have your identity, address and tax information ready"
				}
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-3 rounded-md border border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
					className: "mt-0.5 size-5 shrink-0 text-primary",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
					className: "block",
					children: item.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: item.body
				})] })]
			}, item.title))
		})
	] });
}
function Account({ form, patch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-primary uppercase",
					children: "Section"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-2xl font-semibold",
					children: "Account and contact"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "Choose the legal account structure and create the primary holder's access."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "Account structure",
					value: form.accountType,
					options: ACCOUNT_TYPES,
					onChange: (v) => patch("accountType", v)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "Reporting currency",
					value: form.currency,
					options: CURRENCIES,
					onChange: (v) => patch("currency", v)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "First name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.firstName,
						autoComplete: "given-name",
						onChange: (e) => patch("firstName", e.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Middle name (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.middleName,
						autoComplete: "additional-name",
						onChange: (e) => patch("middleName", e.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Surname",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					value: form.surname,
					autoComplete: "family-name",
					onChange: (e) => patch("surname", e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Email address",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					type: "email",
					value: form.email,
					autoComplete: "email",
					onChange: (e) => patch("email", e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "Telephone country",
					value: form.phoneCountry,
					options: PHONE_COUNTRIES,
					onChange: (v) => patch("phoneCountry", v)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Telephone number",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						type: "tel",
						value: form.phone,
						autoComplete: "tel",
						onChange: (e) => patch("phone", e.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Create password",
					hint: "At least 8 characters.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						type: "password",
						value: form.password,
						autoComplete: "new-password",
						onChange: (e) => patch("password", e.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Confirm password",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						type: "password",
						value: form.confirmPassword,
						autoComplete: "new-password",
						onChange: (e) => patch("confirmPassword", e.target.value)
					})
				})]
			})
		]
	});
}
function Personal({ form, patch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-primary uppercase",
					children: "Section"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-2xl font-semibold",
					children: "Personal information"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "Provide information exactly as it appears on official records."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-1.5 text-sm font-medium",
				children: "Date of birth"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						"aria-label": "Year",
						value: form.dobYear,
						onChange: (e) => patch("dobYear", e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Year"
						}), YEARS.map((year) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: year }, year))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						"aria-label": "Month",
						value: form.dobMonth,
						onChange: (e) => patch("dobMonth", e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Month"
						}), MONTHS.map((month) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: month }, month))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						"aria-label": "Day",
						value: form.dobDay,
						onChange: (e) => patch("dobDay", e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Day"
						}), DAYS.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: day }, day))]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Nationality",
				value: form.nationality,
				options: COUNTRIES,
				onChange: (v) => patch("nationality", v)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Country of residence",
				value: form.residence,
				options: COUNTRIES,
				onChange: (v) => patch("residence", v)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Occupation",
				value: form.occupation,
				options: OCCUPATIONS,
				placeholder: "Select occupation",
				onChange: (v) => patch("occupation", v)
			})
		]
	});
}
function Address({ form, patch }) {
	const us = form.country === "United States";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-primary uppercase",
					children: "Section"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-2xl font-semibold",
					children: "Address and tax"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "Provide your residential address and tax residency information."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Street address",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					value: form.street,
					autoComplete: "street-address",
					onChange: (e) => patch("street", e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Apartment, suite, etc. (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					value: form.apt,
					onChange: (e) => patch("apt", e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "City",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.city,
						autoComplete: "address-level2",
						onChange: (e) => patch("city", e.target.value)
					})
				}), us ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "State",
					value: form.region,
					options: US_STATES,
					placeholder: "Select state",
					onChange: (v) => patch("region", v)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "State / region",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.region,
						onChange: (e) => patch("region", e.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Postal code",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: form.postal,
						autoComplete: "postal-code",
						onChange: (e) => patch("postal", e.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
					label: "Country",
					value: form.country,
					options: COUNTRIES,
					onChange: (v) => {
						patch("country", v);
						patch("region", "");
					}
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Tax residence",
				value: form.taxResidence,
				options: COUNTRIES,
				onChange: (v) => patch("taxResidence", v)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Tax identification number (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					value: form.taxId,
					onChange: (e) => patch("taxId", e.target.value)
				})
			})
		]
	});
}
function Financial({ form, patch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-primary uppercase",
					children: "Section"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-2xl font-semibold",
					children: "Financial profile"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "Tell us about your sources of wealth and investment objectives."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Source of wealth",
				value: form.sourceOfWealth,
				options: WEALTH_SOURCES,
				placeholder: "Select",
				onChange: (v) => patch("sourceOfWealth", v)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Source of funds",
				value: form.sourceOfFunds,
				options: FUND_SOURCES,
				placeholder: "Select",
				onChange: (v) => patch("sourceOfFunds", v)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Investment purpose",
				value: form.investmentPurpose,
				options: PURPOSES,
				placeholder: "Select",
				onChange: (v) => patch("investmentPurpose", v)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Estimated net worth (USD)",
				value: form.netWorth,
				options: NET_WORTH,
				placeholder: "Select range",
				onChange: (v) => patch("netWorth", v)
			})
		]
	});
}
function Documents({ form, patch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-primary uppercase",
					children: "Section"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-2xl font-semibold",
					children: "Verification documents"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "Choose the document types and attach files for identity and address verification."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Identity document type",
				value: form.idType,
				options: ID_TYPES,
				onChange: (v) => patch("idType", v)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Identity document",
				hint: form.idFileName ? `Attached: ${form.idFileName}` : "PDF or image.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					type: "file",
					accept: "image/*,.pdf",
					onChange: (e) => patch("idFileName", e.target.files?.[0]?.name ?? "")
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectField, {
				label: "Address document type",
				value: form.addressDocType,
				options: ADDRESS_DOCS,
				onChange: (v) => patch("addressDocType", v)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Address document",
				hint: form.addressFileName ? `Attached: ${form.addressFileName}` : "PDF or image.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					type: "file",
					accept: "image/*,.pdf",
					onChange: (e) => patch("addressFileName", e.target.files?.[0]?.name ?? "")
				})
			})
		]
	});
}
function Declarations({ form, patch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold tracking-widest text-primary uppercase",
			children: "Section"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 text-2xl font-semibold",
			children: "Declarations"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "Review and confirm each statement before you submit."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-6 grid gap-3",
			children: [
				{
					key: "d1",
					label: "I confirm that the information provided is true, accurate, and complete."
				},
				{
					key: "d2",
					label: "I understand that my account remains unavailable until approved by the compliance team."
				},
				{
					key: "d3",
					label: "I agree to the terms of service and privacy policy."
				},
				{
					key: "d4",
					label: "I am not a politically exposed person and I am not acting on behalf of one."
				}
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-start gap-3 rounded-md border border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					className: "mt-1 size-4 accent-primary",
					checked: form[item.key],
					onChange: (e) => patch(item.key, e.target.checked)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm",
					children: item.label
				})]
			}) }, item.key))
		})
	] });
}
var SplitComponent = ApplicationForm;
//#endregion
export { SplitComponent as component };
