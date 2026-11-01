import { o as __toESM } from "../_runtime.mjs";
import { a as matchTier, i as formatOfferDate, n as amountRange, o as parseApy, r as formatBonus, s as promoMonths, t as EMPTY_PROMO } from "./promo-a-oE9-Iz.mjs";
import { S as require_jsx_runtime, X as require_react, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Bell, S as CalendarClock, T as BadgePercent, a as Shield, b as Check, c as Plus, f as Lock, g as FileUp, i as SlidersHorizontal, l as Percent, m as Landmark, n as Wallet, p as LayoutDashboard, r as TriangleAlert, s as Receipt, t as X, u as Menu, w as Banknote, x as CalendarRange } from "../_libs/lucide-react.mjs";
import { n as getDocument } from "../_libs/pdfjs-dist.mjs";
import { C as getInvestorPortal, D as getMyFundings, I as listMyNotifications, O as getPaymentFile, R as markMyNotificationsRead, S as getInvestmentTypes, a as useBrand, b as getAdminSession, d as cancelFunding, et as signFunding, i as headerActionClass, j as investorLogout, k as getPromo, ot as uploadPaymentConfirmation, r as SiteHeader, rt as submitFunding, v as downloadInvestmentPdf, w as getInvestorSession, x as getCdTerms, y as downloadInvoicePdf } from "./router-BgWJKDCs.mjs";
import { t as SignaturePad } from "./signature-pad-C-nQ00Yq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal-Bw1mVkI4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PortalPage() {
	const navigate = useNavigate();
	const [account, setAccount] = (0, import_react.useState)(null);
	const [desk, setDesk] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		getInvestorPortal().then(setAccount).catch(() => {
			getInvestorSession().then((session) => {
				navigate({ to: session?.destination === "application" ? "/application" : "/login" });
			}).catch(() => {
				navigate({ to: "/login" });
			});
		});
	}, [navigate]);
	(0, import_react.useEffect)(() => {
		getAdminSession().then((session) => setDesk(session.signedIn)).catch(() => setDesk(false));
	}, []);
	async function signOut() {
		await investorLogout();
		navigate({ to: "/login" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
			eyebrow: "Investor portal",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					desk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: headerActionClass,
						onClick: () => void navigate({ to: "/admin" }),
						children: "Back to desk"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: headerActionClass,
						onClick: () => void signOut(),
						children: "Sign out"
					})
				]
			})
		}), !account ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto w-full max-w-6xl flex-1 px-4 py-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg",
				children: "Opening your account…"
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalBody, { account })]
	});
}
var PromoContext = (0, import_react.createContext)(EMPTY_PROMO);
function usePromo() {
	return (0, import_react.useContext)(PromoContext);
}
var PORTAL_TABS = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		id: "active",
		label: "Active CDs",
		icon: Landmark
	},
	{
		id: "investments",
		label: "Investments",
		icon: Wallet
	},
	{
		id: "fund",
		label: "Add investment",
		icon: Plus
	},
	{
		id: "manage",
		label: "Manage",
		icon: SlidersHorizontal
	}
];
function PortalMenu({ tab, onChange }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const current = PORTAL_TABS.find((item) => item.id === tab) ?? PORTAL_TABS[0];
	function choose(next) {
		onChange(next);
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative border-b border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-2 md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-1",
					"aria-expanded": open,
					"aria-label": open ? "Close menu" : "Open menu",
					onClick: () => setOpen((value) => !value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-3 text-sm font-semibold text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-9 items-center justify-center rounded-lg bg-step-idle/40 text-action",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(current.icon, {
								className: "size-4",
								"aria-hidden": "true"
							})
						}), current.label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-primary",
						children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-4" })
					})]
				})
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed inset-0 z-20 bg-primary/20 md:hidden",
				"aria-label": "Close menu",
				onClick: () => setOpen(false)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "menu-drop absolute inset-x-0 top-full z-30 grid gap-1 rounded-xl border border-border bg-surface p-2 shadow-lg md:hidden",
				children: PORTAL_TABS.map((item) => {
					const selected = tab === item.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "menu-link flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-sm " + (selected ? "bg-step-idle/40 font-semibold text-action" : "text-primary"),
						"aria-current": selected ? "page" : void 0,
						onClick: () => choose(item.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-8 items-center justify-center rounded-md " + (selected ? "bg-surface text-action" : "bg-bg text-primary"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
								className: "menu-icon size-4",
								"aria-hidden": "true"
							})
						}), item.label]
					}) }, item.id);
				})
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "hidden gap-1 md:flex",
				children: PORTAL_TABS.map((item) => {
					const selected = tab === item.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "menu-link relative flex min-h-11 items-center gap-2 px-3 text-sm " + (selected ? "font-semibold text-action" : "text-primary"),
						"aria-current": selected ? "page" : void 0,
						onClick: () => choose(item.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
								className: "menu-icon size-4",
								"aria-hidden": "true"
							}),
							item.label,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-3 bottom-0 h-0.5 origin-left bg-action transition-transform duration-200 " + (selected ? "scale-x-100" : "scale-x-0") })
						]
					}) }, item.id);
				})
			})
		]
	});
}
function PortalBody({ account }) {
	const [tab, setTab] = (0, import_react.useState)("dashboard");
	const [positions, setPositions] = (0, import_react.useState)([]);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [offer, setOffer] = (0, import_react.useState)(EMPTY_PROMO);
	function refresh() {
		return getMyFundings().then(setPositions).catch(() => setPositions([]));
	}
	(0, import_react.useEffect)(() => {
		refresh();
		getPromo().then(setOffer).catch(() => setOffer(EMPTY_PROMO));
	}, []);
	const holdings = positions.filter((position) => position.status === "payment_approved");
	const pipeline = positions.filter((position) => position.status !== "cancelled" && position.status !== "payment_approved");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromoContext.Provider, {
		value: offer,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-4 py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalMenu, {
						tab,
						onChange: setTab
					}),
					notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 rounded-md border border-border bg-surface px-4 py-3 text-sm text-fg",
						children: notice
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CelebrationBanners, {
						holdings,
						onActive: () => setTab("active")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "step-enter",
						children: [
							tab === "dashboard" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {
								account,
								holdings,
								pipeline,
								onAdd: () => setTab("fund"),
								onActive: () => setTab("active"),
								onView: () => setTab("investments")
							}) : null,
							tab === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveCds, {
								positions: holdings,
								waiting: pipeline.length,
								account,
								onAdd: () => setTab("fund")
							}) : null,
							tab === "investments" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvestmentList, {
								positions: pipeline,
								signature: account.payload.signature,
								phone: [account.payload.phoneCountry, account.payload.phone].filter(Boolean).join(" "),
								email: account.email,
								onAdd: () => setTab("fund"),
								onSigned: () => void refresh()
							}) : null,
							tab === "fund" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FundingPanel, {
								preferredTerm: account.payload.preferredTerm ?? "",
								preferredAmount: account.payload.preferredAmount ?? "",
								onSubmitted: () => {
									setNotice("Investment submitted. Accept the terms on the investment to continue.");
									setTab("investments");
									refresh();
								}
							}) : null,
							tab === "manage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManageInvestments, {
								positions,
								signature: account.payload.signature,
								phone: [account.payload.phoneCountry, account.payload.phone].filter(Boolean).join(" "),
								email: account.email,
								onAdd: () => setTab("fund"),
								onChanged: () => void refresh()
							}) : null
						]
					}, tab)
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalFooter, {
				tab,
				onChange: setTab
			})]
		})
	});
}
var DEFAULT_FOOTER_TEXT = "FDIC insurance covers the first $250,000 per individual or $500,000 per joint account. Rates and calculator results are illustrations. Early withdrawal penalties may apply.";
function PortalFooter({ tab, onChange }) {
	const { companyName, footerLogo, footerText } = useBrand();
	const name = companyName || "Account Holding";
	const note = footerText.trim() || DEFAULT_FOOTER_TEXT;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "mt-8 border-t border-border bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-[1.4fr_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				footerLogo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: footerLogo,
					alt: name,
					className: "h-8 w-auto max-w-[180px] object-contain"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold tracking-wide text-primary",
					children: name.toUpperCase()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-fg",
					children: "Investor accounts"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-xl text-xs leading-5 text-fg",
					children: note
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "Portal",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-heading uppercase",
					children: "Portal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-2",
					children: PORTAL_TABS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-left text-sm " + (tab === item.id ? "font-semibold text-action" : "text-primary"),
						"aria-current": tab === item.id ? "page" : void 0,
						onClick: () => {
							onChange(item.id);
							window.scrollTo({
								top: 0,
								behavior: "smooth"
							});
						},
						children: item.label
					}) }, item.id))
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mx-auto max-w-6xl px-4 py-4 text-xs text-fg",
				children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" ",
					name
				]
			})
		})]
	});
}
function FundingPanel({ onSubmitted, preferredTerm = "", preferredAmount = "" }) {
	const offer = usePromo();
	const scroller = (0, import_react.useRef)(null);
	const [cd, setCd] = (0, import_react.useState)(null);
	const [terms, setTerms] = (0, import_react.useState)([]);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [amount, setAmount] = (0, import_react.useState)(preferredAmount);
	const [appliedPreference, setAppliedPreference] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(0);
	const [summaryOpen, setSummaryOpen] = (0, import_react.useState)(false);
	const [ratesOpen, setRatesOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		Promise.all([getInvestmentTypes(), getCdTerms()]).then(([types, nextTerms]) => {
			setCd(types[0] ?? null);
			setTerms(nextTerms);
		}).catch(() => setError("Certificates could not be loaded."));
	}, []);
	const orderedTerms = [...terms].sort((a, b) => Number(b.featured) - Number(a.featured) || a.months - b.months);
	const selected = orderedTerms.find((term) => term.id === selectedId) ?? null;
	(0, import_react.useEffect)(() => {
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
			scroller.current?.querySelectorAll("[data-term]")[index]?.scrollIntoView({
				behavior: "smooth",
				inline: "start",
				block: "nearest"
			});
		}, 0);
	}, [
		appliedPreference,
		offer,
		terms,
		preferredTerm
	]);
	function move(direction) {
		const next = Math.min(Math.max(page + direction, 0), Math.max(orderedTerms.length - 1, 0));
		setPage(next);
		(scroller.current?.querySelectorAll("[data-term]")[next])?.scrollIntoView({
			behavior: "smooth",
			inline: "start",
			block: "nearest"
		});
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
			await submitFunding({ data: {
				typeId: "cd",
				termId: selected.id,
				amount
			} });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-[#f3f4f6] px-4 py-6 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-center text-2xl font-semibold text-fg",
						children: "Browse all available CD terms"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: scroller,
						className: "mt-6 overflow-x-auto scroll-smooth pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto flex w-max min-w-full items-stretch justify-center gap-3 px-1 pt-4",
							children: orderedTerms.map((term) => {
								const active = term.id === selectedId;
								const promo = promoMonths(offer).includes(term.months);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-term": true,
									role: "button",
									tabIndex: 0,
									className: "relative mt-3 flex min-h-48 min-w-[220px] shrink-0 cursor-pointer flex-col rounded-xl border bg-white px-5 pt-16 pb-5 text-left shadow-sm " + (active ? "border-action" : "border-[#e7e7e7]"),
									onClick: () => {
										setSelectedId(term.id);
										setRatesOpen(promo);
										setError("");
									},
									onKeyDown: (event) => {
										if (event.key !== "Enter" && event.key !== " ") return;
										event.preventDefault();
										setSelectedId(term.id);
										setRatesOpen(promo);
										setError("");
									},
									children: [
										term.featured || promo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "absolute -top-3 left-4 flex flex-col items-start gap-1",
											children: [term.featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1 rounded-md bg-action px-2.5 py-1 text-xs font-semibold text-white",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
													viewBox: "0 0 16 16",
													className: "size-3.5",
													"aria-hidden": "true",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
														d: "M2 12.5 6 8l2.5 2.5L14 4",
														fill: "none",
														stroke: "currentColor",
														strokeWidth: "1.6"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
														d: "M10 4h4v4",
														fill: "none",
														stroke: "currentColor",
														strokeWidth: "1.6"
													})]
												}), "Featured APY"]
											}) : null, promo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1 rounded-md bg-[#e24b2a] px-2.5 py-1 text-xs font-semibold text-white",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
													viewBox: "0 0 16 16",
													className: "size-3.5",
													"aria-hidden": "true",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
														d: "M2.5 8.5 8 3h4.5V7.5L7 13a1.5 1.5 0 0 1-2.1 0L2.5 10.6a1.5 1.5 0 0 1 0-2.1Z",
														fill: "none",
														stroke: "currentColor",
														strokeWidth: "1.4"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
														cx: "10.7",
														cy: "5.3",
														r: "0.8",
														fill: "currentColor"
													})]
												}), "Promotional Offer"]
											}) : null]
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-2xl font-semibold text-primary",
											children: term.apy.includes("APY") ? term.apy : `${term.apy} APY`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-1 block text-sm text-[#5c6370]",
											children: [term.months, "-month term"]
										}),
										promo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "mt-auto self-start pt-4 text-left text-sm font-semibold text-action",
											onClick: (event) => {
												event.stopPropagation();
												setSelectedId(term.id);
												setRatesOpen((open) => selectedId === term.id ? !open : true);
												setError("");
											},
											children: "Explore bonus rates"
										}) : null
									]
								}, term.id);
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								className: "flex items-center gap-1.5",
								children: orderedTerms.map((term, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
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
					}),
					ratesOpen && selected && promoMonths(offer).includes(selected.months) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromoRates, {
						offer,
						term: selected
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromoCalculator, {
				offer,
				selected,
				onApply: (months, value) => {
					const match = orderedTerms.find((term) => term.months === months);
					if (match) setSelectedId(match.id);
					setAmount(value);
					setError("");
				}
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-danger",
				children: error
			}) : null,
			cd && selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-white px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-fg",
					children: cd.issuer
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-lg font-semibold text-heading",
					children: [
						selected.months,
						"-month · ",
						moneyLabel(amount)
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: pending,
					className: "min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60",
					onClick: openSummary,
					children: pending ? "Submitting…" : "Review and confirm"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-fg",
				children: "Select a term to review the certificate."
			}),
			summaryOpen && cd && selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvestmentSummary, {
				type: cd,
				term: selected,
				amount,
				pending,
				error,
				onClose: () => setSummaryOpen(false),
				onConfirm: () => void fund()
			}) : null
		]
	});
}
var SUMMARY_STEPS = [
	"Confirm investment terms.",
	"Wait for advisor call for process details.",
	"Fund by received payment instructions."
];
function InvestmentSummary({ type, term, amount, pending, error, onClose, onConfirm }) {
	const offer = usePromo();
	(0, import_react.useEffect)(() => {
		function onKey(event) {
			if (event.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);
	const numeric = Number(amount.replace(/[^0-9.]/g, ""));
	const shown = Number.isFinite(numeric) ? numeric.toLocaleString("en-US", {
		style: "currency",
		currency: "USD"
	}) : amount;
	const promo = matchTier(offer, term.months, numeric);
	const apy = promo ? formatApy(parseApy(term.apy) + promo.bonusPercent / 100) : term.apy.includes("%") ? term.apy : `${term.apy}%`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center",
		role: "presentation",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "investment-summary-title",
			className: "max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl",
			onClick: (event) => event.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bg-[#0c2348] px-6 py-6 text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold tracking-widest text-white/70 uppercase",
								children: "Investment summary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "investment-summary-title",
								className: "confirm-title mt-1 text-3xl font-semibold text-white",
								children: shown
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-white/90",
								children: [
									term.months,
									"-month certificate · ",
									apy,
									" final APY"
								]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-2xl leading-none text-white/80",
							"aria-label": "Close",
							onClick: onClose,
							children: "×"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryFact, {
							label: "Issuer",
							value: type.issuer
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryFact, {
							label: "Structure",
							value: type.structure
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryFact, {
							label: "Term",
							value: `${term.months}-month`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryFact, {
							label: "Final APY",
							value: apy
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryFact, {
							label: "Minimum",
							value: type.minimumInvestment || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryFact, {
							label: "Callable",
							value: "Non-callable"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs font-semibold tracking-wide text-heading uppercase",
								children: "Capital protection"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 text-fg",
								children: "FDIC. 100% cover on the first $250,000 per individual or $500,000 per joint account."
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mx-6 grid gap-3 border-t border-border pt-5",
					children: SUMMARY_STEPS.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-6 shrink-0 items-center justify-center rounded-full bg-action text-xs font-semibold text-white",
							children: index + 1
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-fg",
							children: step
						})]
					}, step))
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-6 mt-4 text-sm text-danger",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 px-6 py-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-md border border-border px-5 py-2 font-semibold text-primary",
						onClick: onClose,
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: pending,
						className: "min-h-11 flex-1 rounded-md bg-action px-5 py-2 font-semibold text-on-primary disabled:opacity-60",
						onClick: onConfirm,
						children: pending ? "Submitting…" : "Confirm investment"
					})]
				})
			]
		})
	});
}
function SummaryFact({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs font-semibold tracking-wide text-heading uppercase",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-1 text-fg",
		children: value || "—"
	})] });
}
function moneyLabel(amount) {
	const value = Number(amount.replace(/[^0-9.]/g, ""));
	return Number.isFinite(value) && value > 0 ? value.toLocaleString("en-US", {
		style: "currency",
		currency: "USD"
	}) : "Enter an amount";
}
function PromoRates({ offer, term }) {
	const tiers = offer.tiers.filter((tier) => tier.months.includes(term.months));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto mt-6 max-w-3xl text-sm leading-6 text-primary",
		children: [
			offer.intro ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: offer.intro }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 overflow-hidden rounded-xl border border-border bg-white",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-[#e6e6e6] px-4 py-3 font-semibold",
						children: [term.months, "-Month CD"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-b border-[#e6e6e6] px-4 py-3",
						children: term.apy.includes("APY") ? term.apy : `${term.apy} APY`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 border-b border-[#e6e6e6] bg-[#f7f7f7] px-4 py-3 text-xs font-semibold tracking-wide uppercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Deposit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Promo bonus" })]
					}),
					tiers.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 border-b border-[#e6e6e6] px-4 py-3 last:border-b-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: amountRange(tier) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatBonus(tier.bonusPercent) })]
					}, tier.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-2",
				children: offerNotes(offer).map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(note.icon, {
						className: "mt-0.5 size-4 shrink-0 text-action",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: note.strong ? "font-semibold text-primary" : void 0,
						children: note.text
					})]
				}, note.text))
			})
		]
	});
}
function offerNotes(offer) {
	const notes = [];
	if (offer.protection) notes.push({
		icon: Shield,
		text: offer.protection,
		strong: true
	});
	for (const part of offer.finePrint.split(/(?<=\.)\s+/).map((item) => item.trim()).filter(Boolean)) {
		const icon = /minimum balance/i.test(part) ? Wallet : /penalt/i.test(part) ? TriangleAlert : Receipt;
		notes.push({
			icon,
			text: part.endsWith(".") ? part : `${part}.`
		});
	}
	if (offer.startsOn && offer.endsOn) notes.push({
		icon: CalendarRange,
		text: `Offer available from ${formatOfferDate(offer.startsOn)} – ${formatOfferDate(offer.endsOn)}.`
	});
	return notes;
}
function PromoCalculator({ offer, selected, onApply }) {
	const [deposit, setDeposit] = (0, import_react.useState)("100000");
	const months = selected?.months ?? 0;
	const amount = Number(deposit.replace(/[^0-9.]/g, ""));
	const tiers = offer.tiers.filter((tier) => tier.months.includes(months));
	const bonus = selected && Number.isFinite(amount) ? matchTier(offer, months, amount) : null;
	const base = parseApy(selected?.apy ?? "");
	const apy = base + (bonus ? bonus.bonusPercent / 100 : 0);
	const future = Number.isFinite(amount) && amount > 0 && selected ? amount * Math.pow(1 + apy, months / 12) : 0;
	const interest = Math.max(future - amount, 0);
	const floor = tiers.reduce((lowest, tier) => Math.min(lowest, tier.minAmount), Number.POSITIVE_INFINITY);
	function apply(nextDeposit) {
		setDeposit(nextDeposit);
		if (selected) onApply(months, nextDeposit.replace(/[^0-9.]/g, ""));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mt-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-action px-4 py-8 text-white sm:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "calc-title text-center text-3xl font-semibold tracking-tight text-white",
					children: "Calculate your money’s future value"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-2 max-w-xl text-center text-sm",
					children: selected ? `${selected.months}-month term · ${selected.apy.includes("APY") ? selected.apy : `${selected.apy} APY`} base rate.` : "Select a CD term above."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto mt-6 max-w-3xl rounded-2xl bg-white px-5 py-6 text-primary sm:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-center text-xl font-semibold",
							children: "Tell us how much you want to deposit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid gap-6 " + (tiers.length > 0 ? "sm:grid-cols-2" : ""),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-semibold",
									children: "Enter Initial Deposit Amount"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									inputMode: "decimal",
									className: "mt-3 w-full rounded-md border border-[#cfcfcf] px-3 py-3 text-base outline-none focus:border-action",
									value: deposit,
									onChange: (event) => apply(event.target.value)
								})]
							}), tiers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: tiers.map((tier) => {
									const picked = amount === tier.minAmount;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "min-h-9 rounded-full border px-3 py-1 text-sm font-semibold " + (picked ? "border-action bg-action text-white" : "border-[#cfcfcf] text-primary"),
										onClick: () => apply(String(tier.minAmount)),
										children: ["$", tier.minAmount.toLocaleString("en-US")]
									}, tier.id);
								})
							}) : null] }), tiers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:border-l sm:border-[#e6e6e6] sm:pl-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: "Available promo bonus tiers"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 divide-y divide-[#e6e6e6] text-sm",
									children: tiers.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center justify-between gap-3 py-2 " + (bonus?.id === tier.id ? "font-semibold text-action" : ""),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: amountRange(tier) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatBonus(tier.bonusPercent) })]
									}, tier.id))
								})]
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid gap-4 border-b border-[#e6e6e6] pb-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-semibold",
									children: "Base rate"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl font-semibold",
									children: selected ? formatApy(base) : "—"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "sm:border-l sm:border-[#e6e6e6] sm:pl-6",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-sm font-semibold",
											children: "Promo bonus APY"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-2xl font-semibold",
											children: bonus ? formatBonus(bonus.bonusPercent) : "—"
										}),
										!bonus && selected && Number.isFinite(floor) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-1 block text-sm text-[#8a5a00]",
											children: ["Bonuses start at $", floor.toLocaleString("en-US")]
										}) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "sm:border-l sm:border-[#e6e6e6] sm:pl-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-semibold",
										children: "Final APY"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-2xl font-semibold",
										children: selected ? formatApy(apy) : "—"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-semibold",
									children: "Future Balance"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl font-semibold",
									children: wholeDollars(future)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "sm:border-l sm:border-[#e6e6e6] sm:pl-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-semibold",
										children: "Interest Earned"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-2xl font-semibold",
										children: wholeDollars(interest)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "sm:border-l sm:border-[#e6e6e6] sm:pl-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-semibold",
										children: "Total return"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-2xl font-semibold",
										children: selected && amount > 0 ? `${(interest / amount * 100).toFixed(2)}%` : "—"
									})]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-center text-xs",
					children: "Interest compounds daily. Savings calculator is for illustration only."
				})
			]
		})
	});
}
function moneyValue(amount) {
	const value = Number(amount.replace(/[^0-9.]/g, ""));
	return Number.isFinite(value) ? value : 0;
}
function formatApy(rate) {
	const percent = rate * 100;
	const digits = Math.round(percent * 1e3) % 10 === 0 ? 2 : 3;
	return `${percent.toFixed(digits)}%`;
}
function wholeDollars(value) {
	return value.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0
	});
}
function investmentRates(position, offer) {
	const months = Number(position.termLabel.match(/(\d+)-month/)?.[1] ?? 0);
	const principal = moneyValue(position.amount);
	if (position.finalApy) return {
		promo: position.promoApy || "—",
		final: position.finalApy,
		rate: parseApy(position.finalApy),
		months,
		principal
	};
	const basePercent = Number(position.termLabel.match(/([\d.]+)%/)?.[1] ?? 0);
	const bonus = matchTier(offer, months, principal);
	const finalRate = basePercent / 100 + (bonus ? bonus.bonusPercent / 100 : 0);
	return {
		promo: bonus ? formatBonus(bonus.bonusPercent) : "—",
		final: basePercent ? formatApy(finalRate) : "—",
		rate: finalRate,
		months,
		principal
	};
}
var DEAL_STEPS = [
	"Accept terms",
	"Advisor call",
	"Invoice",
	"Upload payment",
	"Confirmation"
];
function fundStep(position) {
	if (position.status === "payment_approved") return DEAL_STEPS.length;
	if (!position.signed) return 0;
	if (position.status === "pending") return 1;
	if (position.status === "approved_phone") return 2;
	if (position.status === "instructions_sent" && !position.paymentFileName) return 3;
	if (position.status === "instructions_sent") return 4;
	return 0;
}
function statusLabel(status) {
	if (status === "cancelled") return "Cancelled";
	if (status === "approved_phone") return "Approved by phone";
	if (status === "instructions_sent") return "Invoice created";
	if (status === "payment_approved") return "Active";
	return "Pending call/email";
}
function certificateTitle(position, months = 0, apy = "") {
	const label = position.termLabel || "";
	const fromLabel = label.match(/(\d+)-month/i)?.[1];
	const fromRate = label.match(/([\d.]+%)/)?.[1];
	const term = fromLabel || (months ? String(months) : "");
	const rate = fromRate || (apy && apy !== "—" ? apy : "");
	if (term && rate) return `${term}-month · ${rate.includes("APY") ? rate : `${rate} APY`}`;
	if (position.termLabel && !/^cds?$/i.test(position.termLabel)) return position.termLabel;
	return "Certificate";
}
function statusDetail(position) {
	if (position.status === "cancelled") return "This investment was cancelled.";
	if (position.status === "payment_approved") return "This certificate is active through maturity.";
	if (!position.signed) return "Accept the terms to continue.";
	if (position.status === "instructions_sent" && position.paymentFileName) return "Wire confirmation is with your advisor.";
	if (position.status === "instructions_sent") return "Your invoice is ready. Send the wire, then upload the confirmation.";
	if (position.status === "approved_phone") return "Your advisor approved the call. The invoice is being prepared.";
	return "Terms are signed. Waiting for the advisor call.";
}
function money(value) {
	return value.toLocaleString("en-US", {
		style: "currency",
		currency: "USD"
	});
}
function maturityOn(opened, months) {
	const [year, month, day] = opened.split("-").map(Number);
	if (!year || !month || !day || !months) return null;
	return new Date(Date.UTC(year, month - 1 + months, day));
}
function formatDate(date) {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC"
	});
}
function elapsed(start, end) {
	const opened = Date.parse(`${start}T00:00:00Z`);
	const matures = end?.getTime() ?? opened;
	const span = Math.max(matures - opened, 1);
	return Math.min(Math.max((Date.now() - opened) / span * 100, 0), 100);
}
function TermChart({ items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-4 grid gap-4",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-10 overflow-hidden rounded-md bg-[#e7f6fc]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-y-0 left-0 bg-[#6cc4ee]",
				style: { width: `${elapsed(item.start, item.end)}%` }
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "relative flex h-full items-center px-3 text-xs font-semibold text-heading",
				children: [
					item.months,
					"-month · ",
					money(item.amount)
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex justify-between text-xs text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-[11px] font-semibold tracking-wide text-heading uppercase",
				children: "Funding date"
			}), formatDate(/* @__PURE__ */ new Date(`${item.start}T00:00:00Z`))] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[11px] font-semibold tracking-wide text-heading uppercase",
					children: "Mature date"
				}), item.end ? formatDate(item.end) : "—"]
			})]
		})] }, item.id))
	});
}
function CelebrationBanners({ holdings, onActive }) {
	const [hidden, setHidden] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
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
	function dismiss(id) {
		const next = [...hidden, id];
		setHidden(next);
		localStorage.setItem("ah-cd-celebrated", JSON.stringify(next));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 grid gap-3",
		children: fresh.map((position) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Celebration, {
			position,
			onOpen: () => {
				dismiss(position.id);
				onActive();
			}
		}, position.id))
	});
}
function Celebration({ position, onOpen }) {
	const rates = investmentRates(position, usePromo());
	const matures = maturityOn(position.createdAt, rates.months);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-2xl bg-[#0c2348] px-5 py-5 text-white sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-widest text-white/70 uppercase",
				children: "Payment confirmed"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "confirm-title mt-1 text-2xl font-semibold text-white",
				children: "Congratulations"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-white/90",
				children: "Your advisor confirmed the payment. This certificate is now active."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid gap-3 text-sm sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-white/70",
						children: "Certificate"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-semibold",
						children: rates.months ? `${rates.months}-month` : position.termLabel
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-white/70",
						children: "Amount"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-semibold",
						children: position.amount
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-white/70",
						children: "Final APY"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-semibold",
						children: rates.final
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-white/70",
						children: "Matures"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-semibold",
						children: matures ? formatDate(matures) : "—"
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-5 min-h-11 rounded-md bg-white px-5 py-2 text-sm font-semibold text-action",
				onClick: onOpen,
				children: "Active CDs"
			})
		]
	});
}
function Dashboard({ account, holdings, pipeline, onAdd, onActive, onView }) {
	const offer = usePromo();
	const lines = holdings.map((position) => ({
		position,
		...investmentRates(position, offer)
	}));
	const waiting = pipeline.map((position) => ({
		position,
		...investmentRates(position, offer)
	}));
	const total = lines.reduce((sum, line) => sum + line.principal, 0);
	const interest = lines.reduce((sum, line) => sum + line.principal * (Math.pow(1 + line.rate, line.months / 12) - 1), 0);
	const blended = total > 0 ? lines.reduce((sum, line) => sum + line.principal * line.rate, 0) / total : 0;
	const toSign = waiting.filter((line) => !line.position.signed && line.position.status !== "cancelled");
	const awaitingCall = waiting.filter((line) => line.position.status === "pending" && line.position.signed);
	const uploadPayment = waiting.filter((line) => line.position.signed && line.position.status === "instructions_sent" && !line.position.paymentFileName);
	const preparingInvoice = waiting.filter((line) => line.position.signed && line.position.status === "approved_phone");
	const allocation = lines.map((line) => {
		const start = line.position.createdAt;
		const end = maturityOn(start, line.months);
		return {
			id: line.position.id,
			months: line.months,
			amount: line.principal,
			start,
			end
		};
	}).sort((a, b) => a.months - b.months || a.start.localeCompare(b.start));
	const schedule = lines.map((line) => {
		const date = maturityOn(line.position.createdAt, line.months);
		const payout = line.principal * Math.pow(1 + line.rate, line.months / 12);
		return {
			...line,
			date,
			payout
		};
	}).filter((line) => line.date).sort((a, b) => a.date.getTime() - b.date.getTime());
	const nextMaturity = schedule[0];
	const next = toSign.length ? "Accept terms" : awaitingCall.length ? "Advisor call" : preparingInvoice.length ? "Invoice" : uploadPayment.length ? "Upload payment" : holdings.length ? "Active" : "Add a CD";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-widest text-primary uppercase",
				children: "Dashboard"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "mt-2 text-3xl font-semibold",
				children: ["Welcome, ", account.payload.firstName]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-fg",
				children: holdings.length === 0 && pipeline.length === 0 ? "You do not have a certificate yet." : pipeline.length > 0 && holdings.length === 0 ? "A certificate becomes active only after your advisor confirms the payment." : pipeline.length > 0 ? "A certificate becomes active only after your advisor confirms the payment. Figures below use active CDs." : "Figures below use active CDs."
			}),
			account.payload.preferredTerm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-fg",
				children: [
					"From your application: ",
					account.payload.preferredTerm,
					"-month",
					account.payload.preferredAmount ? ` · ${account.payload.preferredAmount}` : "",
					". Add investment opens with this choice."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Committed",
						value: money(total),
						icon: Wallet
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Interest to maturity",
						value: money(interest),
						icon: Landmark
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Value at maturity",
						value: money(total + interest),
						icon: LayoutDashboard
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: holdings.length === 1 ? "APY" : "Average APY",
						value: total ? formatApy(blended) : "—",
						icon: Percent
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-fg",
					children: ["Next step: ", next]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary",
						onClick: onAdd,
						children: "Add investment"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "min-h-11 rounded-md border border-border bg-surface px-5 py-2 font-semibold text-primary",
						onClick: onActive,
						children: [
							"Active CDs (",
							holdings.length,
							")"
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-border bg-surface px-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold text-primary",
							children: "Allocation by term"
						}), allocation.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-fg",
							children: "No active CDs yet."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermChart, { items: allocation })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromoBanner, { onAdd }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "overflow-hidden rounded-lg border border-border bg-surface p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold text-primary",
								children: "Needs attention"
							}),
							waiting.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-fg",
								children: "Nothing is waiting on you."
							}) : null,
							waiting.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 grid gap-3",
								children: waiting.map((line) => {
									const action = !line.position.signed ? "Accept terms" : line.position.status === "instructions_sent" && !line.position.paymentFileName ? "Upload payment" : "";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "rounded-md border border-border px-4 py-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-primary",
													children: certificateTitle(line.position, line.months, line.final)
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: line.position.status })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-sm text-fg",
												children: [
													money(line.principal),
													" · ",
													line.final,
													" final APY"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DealProgress, { step: fundStep(line.position) }),
											action ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-3 text-sm text-fg",
												children: statusDetail(line.position)
											}),
											action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "mt-3 min-h-11 rounded-md bg-action px-5 py-2 text-sm font-semibold text-on-primary",
												onClick: onView,
												children: action
											}) : null
										]
									}, line.position.id);
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold text-primary",
						children: "Maturity schedule"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-fg",
						children: nextMaturity?.date ? `Next maturity ${formatDate(nextMaturity.date)} · ${money(nextMaturity.payout)} expected.` : pipeline.length > 0 ? "Active certificates appear here after payment is confirmed." : "You do not have a certificate yet."
					}),
					schedule.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid gap-2",
						children: schedule.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "grid gap-2 rounded-md border border-border bg-surface px-3 py-3 text-sm sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:items-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-semibold text-primary",
									children: certificateTitle(line.position, line.months, line.final)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-fg",
									children: ["Opened ", line.position.createdAt]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[11px] font-semibold tracking-wide text-heading uppercase",
									children: "Matures"
								}), formatDate(line.date)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[11px] font-semibold tracking-wide text-heading uppercase",
									children: "Principal"
								}), money(line.principal)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[11px] font-semibold tracking-wide text-heading uppercase",
									children: "Expected payout"
								}), money(line.payout)] })
							]
						}, line.position.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtectionBanner, {})
			})
		]
	});
}
function PromoBanner({ onAdd }) {
	const offer = usePromo();
	const [terms, setTerms] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		getCdTerms().then(setTerms).catch(() => setTerms([]));
	}, []);
	const panes = terms.map((term) => ({
		term,
		tiers: offer.tiers.filter((tier) => tier.months.includes(term.months))
	})).filter((pane) => pane.tiers.length > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "relative overflow-hidden rounded-xl border border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/dash-promo.jpg",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-white/55" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex h-full min-h-72 flex-col p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-action uppercase",
						children: "Best current promo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 text-2xl font-semibold text-primary",
						children: "Give the next dollar a stronger rate."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-2 sm:grid-cols-2",
						children: [panes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-fg",
							children: "Selected terms include a new-money bonus for a limited time."
						}) : null, panes.map((pane) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-white/85 px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-semibold text-primary",
									children: [pane.term.months, "-month"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-fg",
									children: [pane.term.apy.includes("APY") ? pane.term.apy : `${pane.term.apy} APY`, " base"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 divide-y divide-border text-sm",
									children: pane.tiers.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center justify-between gap-2 py-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: amountRange(tier) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-primary",
											children: formatBonus(tier.bonusPercent)
										})]
									}, tier.id))
								})
							]
						}, pane.term.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-5 min-h-11 w-fit rounded-md bg-action px-5 py-2 font-semibold text-on-primary",
						onClick: onAdd,
						children: "Add investment"
					})
				]
			})
		]
	});
}
function ProtectionBanner() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "relative min-h-48 overflow-hidden rounded-xl border border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/dash-shield.jpg",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-white/50" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-action uppercase",
						children: "Your protection"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 max-w-sm text-2xl font-semibold text-primary",
						children: "The principal stays covered."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-sm leading-6 text-fg",
						children: "FDIC insurance covers the first $250,000 per individual or $500,000 per joint account. The certificate is non-callable, so the rate holds for the full term."
					})
				]
			})
		]
	});
}
function EmptyBanners({ onAdd }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromoBanner, { onAdd }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtectionBanner, {})]
	});
}
function DealProgress({ step }) {
	const percent = Math.min(100, Math.min(step, DEAL_STEPS.length) / DEAL_STEPS.length * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative h-1.5 overflow-hidden rounded-full bg-step-track",
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "progress-fill relative h-full rounded-full bg-step-fill",
				style: { width: `${percent}%` }
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-3 flex items-start",
			children: DEAL_STEPS.map((label, index) => {
				const done = index < step;
				const active = index === step;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: index < DEAL_STEPS.length - 1 ? "flex min-w-0 flex-1 items-center" : "shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-col items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-7 items-center justify-center rounded-full text-xs font-semibold " + (active ? "bg-step text-on-primary" : done ? "bg-step-done text-on-primary" : "bg-step-idle text-step"),
							children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "size-3.5",
								"aria-hidden": "true"
							}) : index + 1
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "max-w-[4.5rem] text-center text-[10px] leading-tight sm:text-[11px] " + (active ? "font-semibold text-step" : "text-fg"),
							children: label
						})]
					}), index < DEAL_STEPS.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-1 mb-4 h-0.5 flex-1 rounded-full " + (done ? "bg-step-done" : "bg-step-idle"),
						"aria-hidden": "true"
					}) : null]
				}, label);
			})
		})]
	});
}
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex min-h-7 items-center rounded-full px-3 text-xs font-semibold " + (status === "payment_approved" ? "bg-step text-on-primary" : "bg-step-idle text-primary"),
		children: statusLabel(status)
	});
}
function ActiveCds({ positions, waiting, account, onAdd }) {
	const empty = positions.length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "text-3xl font-semibold",
				children: [
					"Active CDs (",
					positions.length,
					")"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-fg",
				children: empty ? waiting > 0 ? "You do not have an active certificate yet. A CD appears here after your advisor confirms the payment." : "You do not have an active certificate yet." : "These certificates are active because your advisor confirmed the payment."
			}),
			empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyBanners, { onAdd }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-4",
				children: positions.map((position) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveCd, {
					position,
					account
				}, position.id))
			})
		]
	});
}
function ActiveCd({ position, account }) {
	const [open, setOpen] = (0, import_react.useState)(true);
	const rates = investmentRates(position, usePromo());
	const opened = position.createdAt;
	const matures = maturityOn(opened, rates.months);
	const payout = rates.principal * Math.pow(1 + rates.rate, rates.months / 12);
	const clientName = [
		account.payload.firstName,
		account.payload.middleName,
		account.payload.surname
	].filter(Boolean).join(" ");
	const address = [
		account.payload.street,
		account.payload.apt,
		account.payload.city,
		account.payload.region,
		account.payload.postal,
		account.payload.country
	].filter(Boolean).join(", ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-md border border-border bg-surface px-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold text-primary",
					children: certificateTitle(position, rates.months, rates.final)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [rates.promo !== "—" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex min-h-7 items-center rounded-full bg-[#e24b2a] px-3 text-xs font-semibold text-white",
						children: "Promo"
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: position.status })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						icon: Wallet,
						label: "Deposit",
						value: position.amount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						icon: Percent,
						label: "Final APY",
						value: rates.final
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						icon: CalendarRange,
						label: "Term",
						value: rates.months ? `${rates.months} months` : position.termLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						icon: CalendarClock,
						label: "Matures",
						value: matures ? formatDate(matures) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
						icon: Banknote,
						label: "Expected payout",
						value: money(payout)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-3 min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary",
				onClick: () => setOpen((value) => !value),
				"aria-expanded": open,
				children: open ? "Hide CD details" : "CD details"
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 border-t border-border pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg",
						children: position.issuer
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid border-t border-l border-border sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Client name",
								value: clientName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Address",
								value: address
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Deposit code",
								value: position.depositCode
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Deposit number",
								value: position.depositNumber
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Account number",
								value: position.accountNumber
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Confirmation date",
								value: slashDate(position.confirmedOn)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Reference number",
								value: position.referenceNumber
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Interest rate",
								value: "Fixed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Compounding frequency",
								value: "Daily"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Callable feature",
								value: "Non-callable"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Issue date",
								value: slashDate(opened)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Base APY",
								value: position.termLabel.match(/([\d.]+%)/)?.[1] ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Promo APY",
								value: rates.promo
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Minimum",
								value: position.minimumInvestment
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Structure",
								value: position.structure
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Advisor",
								value: position.advisorName ? `${position.advisorName}${position.advisorPhone ? ` · ${position.advisorPhone}` : ""}` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Deposit insurance",
								value: position.capitalProtection
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
								label: "Signed",
								value: position.signerName ? `${position.signerName}${position.signedOn ? ` · ${slashDate(position.signedOn)}` : ""}` : "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermsPdf, {
						id: position.id,
						compact: true
					})
				]
			}) : null
		]
	});
}
function Highlight({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-bg px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-heading uppercase",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "size-3.5",
				"aria-hidden": "true"
			}), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-2xl font-semibold text-primary",
			children: value || "—"
		})]
	});
}
function slashDate(iso) {
	const [year, month, day] = iso.split("-");
	if (!year || !month || !day) return iso || "—";
	return `${Number(month)}/${Number(day)}/${year}`;
}
function Fact({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-r border-b border-border px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-[11px] font-semibold tracking-wide text-heading uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 text-sm text-fg",
			children: value || "—"
		})]
	});
}
function invoiceReady(position) {
	return position.signed && position.status === "instructions_sent";
}
function InvoiceDownload({ position }) {
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [bytes, setBytes] = (0, import_react.useState)(null);
	const [viewing, setViewing] = (0, import_react.useState)(false);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-md border border-border bg-white px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-semibold tracking-wide text-heading uppercase",
				children: "Payment invoice"
			}),
			ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-fg",
				children: "Use this invoice for the wire. Include the customer reference on the payment."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60",
					disabled: pending,
					onClick: () => void view(),
					children: pending ? "Opening…" : "View PDF"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60",
					disabled: pending,
					onClick: () => void download(),
					children: "Download PDF"
				})]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-fg",
				children: position.signed ? "Your terms are accepted. The invoice appears after it is approved." : "Accept the terms first. The invoice appears after it is approved."
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-danger",
				children: error
			}) : null,
			viewing && bytes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
				role: "presentation",
				onClick: () => setViewing(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "dialog",
					"aria-modal": "true",
					"aria-label": "Payment invoice",
					className: "flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl",
					onClick: (event) => event.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold text-primary",
							children: "Payment invoice"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 px-3 text-sm font-semibold text-primary",
							onClick: () => setViewing(false),
							children: "Close"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfPages, { data: bytes })]
				})
			}) : null
		]
	});
}
function InvestmentList({ positions, signature, phone, email, onAdd, onSigned }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-semibold",
				children: "Investments"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-fg",
				children: positions.length === 0 ? "You do not have a certificate in progress." : "Certificates still being opened. They move to Active CDs after your advisor confirms payment."
			}),
			positions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyBanners, { onAdd }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-3",
				children: positions.map((position) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvestmentCard, {
					position,
					signature,
					phone,
					email,
					onSigned
				}, position.id))
			})
		]
	});
}
function InvestmentCard({ position, signature, phone, email, onSigned }) {
	const rates = investmentRates(position, usePromo());
	const step = fundStep(position);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-surface px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-primary",
					children: certificateTitle(position)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: position.status })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-fg",
				children: [
					position.amount,
					" · ",
					position.createdAt
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-fg",
				children: statusDetail(position)
			}),
			position.status === "cancelled" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceDownload, { position }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[11px] font-semibold tracking-wide text-heading uppercase",
					children: "Promo APY"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-semibold text-fg",
					children: rates.promo
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[11px] font-semibold tracking-wide text-heading uppercase",
					children: "Final APY"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-semibold text-fg",
					children: rates.final
				})] })]
			}),
			position.advisorName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-fg",
				children: [
					"Advisor ",
					position.advisorName,
					position.advisorPhone ? ` · ${position.advisorPhone}` : ""
				]
			}) : position.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-fg",
				children: "Advisor not assigned yet."
			}) : null,
			position.status === "cancelled" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DealProgress, { step }),
			position.status === "cancelled" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermsPdf, {
				id: position.id,
				signed: position.signed
			}),
			position.status !== "cancelled" && position.status !== "payment_approved" && !position.signed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignTerms, {
				position,
				signature,
				phone,
				email,
				rates,
				onSigned
			}) : null,
			position.signed && position.status === "instructions_sent" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentUpload, {
				id: position.id,
				replacing: Boolean(position.paymentFileName),
				onUploaded: onSigned
			}) : null,
			position.paymentFileName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentFileNote, {
				id: position.id,
				name: position.paymentFileName,
				approved: position.status === "payment_approved"
			}) : null
		]
	});
}
function openDataFile(file, name) {
	const [meta, data] = file.split(",");
	const mime = meta.match(/data:(.*);base64/)?.[1] ?? "application/octet-stream";
	const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
	const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
	const link = document.createElement("a");
	link.href = url;
	link.target = "_blank";
	link.download = name;
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function PaymentFileNote({ id, name, approved }) {
	const [error, setError] = (0, import_react.useState)("");
	async function open() {
		setError("");
		try {
			const file = await getPaymentFile({ data: { id } });
			openDataFile(file.file, file.fileName);
		} catch {
			setError("The confirmation could not be opened.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-3 text-sm text-fg",
		children: [
			"Wire confirmation: ",
			name,
			approved ? " · Payment approved" : " · Waiting for advisor approval",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "ml-2 font-semibold text-action",
				onClick: () => void open(),
				children: "View"
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-danger",
				children: error
			}) : null
		]
	});
}
function PaymentUpload({ id, replacing = false, onUploaded }) {
	const input = (0, import_react.useRef)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [over, setOver] = (0, import_react.useState)(false);
	function onFile(file) {
		if (!file) return;
		if (file.size > 5e6 || !/^(application\/pdf|image\/png|image\/jpeg)$/.test(file.type)) {
			setError("Use a PDF, PNG, or JPEG under 5 MB.");
			return;
		}
		setPending(true);
		setName(file.name);
		setError("");
		const reader = new FileReader();
		reader.onload = () => {
			uploadPaymentConfirmation({ data: {
				id,
				fileName: file.name,
				file: String(reader.result)
			} }).then(() => {
				setPending(false);
				onUploaded();
			}).catch(() => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-4 border-t border-border pt-4",
		onSubmit: (event) => event.preventDefault(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold text-primary",
				children: replacing ? "Replace the wire confirmation" : "Upload payment confirmation"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-fg",
				children: replacing ? "Upload another file if this confirmation is wrong. It replaces the one already sent." : "After you send the wire, attach the bank confirmation so your advisor can approve the payment."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: pending,
				className: "mt-3 flex w-full flex-col items-center rounded-xl border border-dashed px-4 py-6 text-center " + (over ? "border-action bg-[#e8f4ff]" : "border-[#8c8c8c] bg-white"),
				onClick: () => input.current?.click(),
				onDragOver: (event) => {
					event.preventDefault();
					setOver(true);
				},
				onDragLeave: () => setOver(false),
				onDrop: (event) => {
					event.preventDefault();
					setOver(false);
					onFile(event.dataTransfer.files?.[0]);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-11 items-center justify-center rounded-full bg-[#e8f4ff] text-action",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, {
							className: "size-5",
							"aria-hidden": "true"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-3 text-sm font-semibold text-primary",
						children: pending ? "Uploading…" : "Drop the wire confirmation here"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 text-sm text-fg",
						children: name || "or choose a PDF, PNG, or JPEG under 5 MB"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-3 inline-flex min-h-11 items-center rounded-md bg-action px-4 text-sm font-semibold text-on-primary",
						children: pending ? "Please wait" : "Choose file"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: input,
				className: "sr-only",
				type: "file",
				accept: "application/pdf,image/png,image/jpeg",
				disabled: pending,
				onChange: (event) => onFile(event.target.files?.[0])
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-danger",
				children: error
			}) : null
		]
	});
}
function SignTerms({ position, signature, phone, email, rates, onSigned }) {
	const saved = signature.startsWith("data:image/png;base64,");
	const [drawn, setDrawn] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [callNumber, setCallNumber] = (0, import_react.useState)(phone);
	const [editingNumber, setEditingNumber] = (0, import_react.useState)(false);
	const [emailInstead, setEmailInstead] = (0, import_react.useState)(false);
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
			await signFunding({ data: {
				id: position.id,
				signature: saved ? "" : drawn,
				contactPhone: callNumber,
				contactBy: emailInstead ? "email" : "call"
			} });
			onSigned();
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "The terms could not be accepted.");
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-4 border-t border-border pt-4",
		onSubmit: (event) => {
			event.preventDefault();
			openConfirm();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold text-primary",
				children: "Accept the investment terms"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-fg",
				children: saved ? "Your application signature is applied to this certificate." : "Sign in the box below. This signature is saved on the account and used on this certificate."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 divide-y divide-border overflow-hidden rounded-md border border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermLine, {
						icon: CalendarRange,
						label: "Term",
						value: position.termLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermLine, {
						icon: Wallet,
						label: "Amount",
						value: position.amount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermLine, {
						icon: Percent,
						label: "Promo APY",
						value: rates.promo
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermLine, {
						icon: BadgePercent,
						label: "Final APY",
						value: rates.final
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermLine, {
						icon: Receipt,
						label: "Dealing fee",
						value: "A $4.99 fee applies"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermLine, {
						icon: Lock,
						label: "Callable feature",
						value: "Non-callable"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermLine, {
						icon: TriangleAlert,
						label: "Early withdrawal",
						value: "Penalties may apply"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermLine, {
						icon: Shield,
						label: "Capital protection",
						value: "First $250,000 per individual or $500,000 per joint account"
					})
				]
			}),
			saved ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-primary",
						children: "Sign here"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-fg",
						children: "Draw your signature inside the box."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-2",
						children: [drawn ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pointer-events-none absolute top-4 left-4 text-sm text-[#8c8c8c]",
							children: "Sign here"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignaturePad, { onChange: (value) => setDrawn(value ?? "") })]
					})
				]
			}),
			error && !open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				className: "mt-3 min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary",
				children: "Accept terms"
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center",
				role: "presentation",
				onClick: () => !pending && setOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "terms-confirmed-title",
					className: "w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl",
					onClick: (event) => event.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-[#0c2348] px-6 py-6 text-white",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold tracking-widest text-white/70 uppercase",
								children: "Investment summary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "terms-confirmed-title",
								className: "confirm-title mt-1 text-3xl font-semibold text-white",
								children: "You confirmed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-white/90",
								children: "The investment process starts here."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-6 py-5",
						children: [
							emailInstead ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-fg",
								children: [
									"We will email ",
									email,
									" instead of calling."
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-fg",
									children: "Wait for an advisor to call"
								}),
								editingNumber ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-3 block text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-primary",
										children: "Call this number"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "mt-1 w-full rounded-md border border-border px-3 py-2",
										value: callNumber,
										onChange: (event) => setCallNumber(event.target.value)
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-lg font-semibold text-heading",
									children: callNumber || "No number on the application"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mt-2 text-sm font-semibold text-action",
									onClick: () => setEditingNumber((value) => !value),
									children: editingNumber ? "Use this number" : "Call another number"
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-4 flex items-start gap-2 text-sm text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: "mt-1",
									checked: emailInstead,
									onChange: (event) => setEmailInstead(event.target.checked)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Do not call, use email instead" })]
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-danger",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary",
									disabled: pending,
									onClick: () => setOpen(false),
									children: "Back"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 flex-1 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60",
									disabled: pending,
									onClick: () => void sign(),
									children: pending ? "Saving…" : "Start the process"
								})]
							})
						]
					})]
				})
			}) : null
		]
	});
}
function TermLine({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-start gap-3 bg-surface px-3 py-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "menu-icon mt-0.5 size-4 shrink-0 text-action",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-[11px] font-semibold tracking-wide text-heading uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-fg",
			children: value || "—"
		})] })]
	});
}
function TermsPdf({ id, compact = false, signed = false }) {
	const [url, setUrl] = (0, import_react.useState)(null);
	const [bytes, setBytes] = (0, import_react.useState)(null);
	const [sheet, setSheet] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [viewing, setViewing] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let objectUrl = "";
		let live = true;
		downloadInvestmentPdf({ data: { id } }).then(({ pdf, sheet: next }) => {
			if (!live) return;
			const file = Uint8Array.from(atob(pdf), (char) => char.charCodeAt(0));
			objectUrl = URL.createObjectURL(new Blob([file], { type: "application/pdf" }));
			setBytes(file);
			setUrl(objectUrl);
			setSheet(next);
		}).catch(() => {
			if (live) setError("The PDF could not be opened.");
		});
		return () => {
			live = false;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [id, signed]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: compact ? "mt-4" : "mt-4 rounded-md border border-border bg-white p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold tracking-wide text-primary uppercase",
					children: "Investor factsheet"
				}), url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary",
						onClick: () => setViewing(true),
						children: "View PDF"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: url,
						download: "investment-terms.pdf",
						className: "inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-semibold text-primary",
						children: "Download PDF"
					})]
				}) : null]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-danger",
				children: error
			}) : null,
			!compact && !sheet && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-fg",
				children: "Opening the factsheet…"
			}) : null,
			!compact && sheet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 text-sm text-fg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold text-primary",
						children: "Certificate of Deposit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTable, {
							title: "Certificate overview",
							rows: [["Issuer", sheet.issuer], ["Structure", sheet.structure]]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTable, {
							title: "Key terms",
							rows: [
								["Investment", sheet.termLabel],
								["Amount", sheet.amount],
								["Promo APY", sheet.promoApy],
								["Final APY", sheet.finalApy],
								["Minimum", sheet.minimum],
								["Callable feature", "Non-callable"]
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 font-semibold text-primary",
						children: "Capital protection"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1",
						children: sheet.capitalProtection || "100% cover on the first $250,000 per individual or $500,000 per joint account."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-semibold text-primary",
						children: "Fees"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1",
						children: "A fixed $4.99 dealing fee applies to each purchase. Early liquidation, where available, is $4.99 per request. No early-liquidation fee applies if the certificate is held to maturity."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-semibold text-primary",
						children: "Signature"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1",
						children: sheet.signerName ? `${sheet.signerName}${sheet.signedOn ? ` · signed ${sheet.signedOn}` : ""}` : "Not signed yet."
					})
				]
			}) : null,
			viewing && bytes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
				role: "presentation",
				onClick: () => setViewing(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "dialog",
					"aria-modal": "true",
					"aria-label": "Investment PDF",
					className: "flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl",
					onClick: (event) => event.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold text-primary",
							children: "Investment PDF"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 px-3 text-sm font-semibold text-primary",
							onClick: () => setViewing(false),
							children: "Close"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfPages, { data: bytes })]
				})
			}) : null
		]
	});
}
function PdfPages({ data }) {
	const host = (0, import_react.useRef)(null);
	const [failed, setFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const root = host.current;
		if (!root) return;
		let cancelled = false;
		setFailed(false);
		const task = getDocument({ data: data.slice() });
		task.promise.then(async (doc) => {
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
				await page.render({
					canvas,
					canvasContext: context,
					viewport
				}).promise;
			}
		}).catch(() => {
			if (!cancelled) setFailed(true);
		});
		return () => {
			cancelled = true;
			task.destroy();
		};
	}, [data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: host,
		className: "min-h-40 overflow-auto bg-[#f3f4f6] p-3",
		children: failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "p-4 text-sm text-fg",
			children: "The PDF could not be displayed. Use Download PDF instead."
		}) : null
	});
}
function SheetTable({ title, rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-semibold text-primary",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
		className: "mt-2",
		children: rows.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[110px_1fr] gap-2 border-b border-border py-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-primary",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: value || "—" })]
		}, label))
	})] });
}
function NotificationBell() {
	const root = (0, import_react.useRef)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [rows, setRows] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)("");
	const unread = rows.some((row) => row.unread);
	(0, import_react.useEffect)(() => {
		listMyNotifications().then(setRows).catch(() => setError("Notifications could not be loaded."));
	}, []);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		function onPointer(event) {
			if (!root.current?.contains(event.target)) setOpen(false);
		}
		function onKey(event) {
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
			setRows((current) => current.map((row) => ({
				...row,
				unread: false
			})));
		} catch {
			setError("Notifications could not be updated.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		ref: root,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "relative inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-primary",
			"aria-label": unread ? "Notifications, unread" : "Notifications",
			"aria-expanded": open,
			onClick: () => void toggle(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
				className: "size-5",
				"aria-hidden": "true"
			}), unread ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-2 right-2 size-2 rounded-full bg-[#e23b3b]" }) : null]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed inset-x-4 top-24 z-40 max-h-[70vh] overflow-hidden rounded-md border border-border bg-surface shadow-lg sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-80",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "border-b border-border px-3 py-2 text-sm font-semibold text-primary",
					children: "Notifications"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-3 text-sm text-danger",
					children: error
				}) : null,
				rows.length === 0 && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-3 text-sm text-fg",
					children: "No notifications yet."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "max-h-80 overflow-y-auto",
					children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid gap-0.5 border-b border-border px-3 py-2 text-sm last:border-b-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: row.subject
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-fg",
							children: [row.createdAt.slice(5), " UTC"]
						})]
					}, row.id))
				})
			]
		}) : null]
	});
}
function ManageInvestments({ positions, signature, phone, email, onAdd, onChanged }) {
	const [pendingId, setPendingId] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	async function cancel(id) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-semibold",
				children: "Manage"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-fg",
				children: positions.length === 0 ? "You do not have a certificate to manage." : "Review each certificate and cancel one that is still awaiting an advisor."
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-danger",
				children: error
			}) : null,
			positions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyBanners, { onAdd }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-3",
				children: positions.map((position) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvestmentCard, {
					position,
					signature,
					phone,
					email,
					onSigned: onChanged
				}), position.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: pendingId === position.id,
					className: "mt-3 min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60",
					onClick: () => void cancel(position.id),
					children: pendingId === position.id ? "Cancelling…" : "Cancel investment"
				}) : null] }, position.id))
			})
		]
	});
}
function Stat({ label, value, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-surface px-4 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "menu-icon size-3.5 text-action",
				"aria-hidden": "true"
			}), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xl font-semibold",
			children: value
		})]
	});
}
//#endregion
export { PortalPage as component };
