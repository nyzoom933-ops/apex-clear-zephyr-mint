import { o as __toESM } from "../_runtime.mjs";
import { a as matchTier, o as parseApy, r as formatBonus } from "./promo-a-oE9-Iz.mjs";
import { n as templateCatalog } from "./email-templates-8axwok5k.mjs";
import { S as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as X, u as Menu, y as ChevronDown } from "../_libs/lucide-react.mjs";
import { A as listApplications, B as saveInvestmentType, C as getMailSetup, E as getPromo, F as rejectPayment, G as setSiteBrand, H as saveMailSetup, I as runDatabaseBackup, L as saveAdvisor, N as listNotifications, R as saveCdTerms, T as getPaymentFile, U as savePromo, V as saveInvoiceBilling, W as setApplicationStatus, X as updateFunding, _ as downloadInvoicePdf, a as useBrand, b as getInvestmentTypes, c as approveInvoice, d as clearDatabase, f as createDeskLogin, h as deleteFunding, i as headerActionClass, j as listFundings, k as listAdvisors, l as approvePayment, m as deleteApplication, o as adminLogin, p as deleteAdvisor, q as signInAsClient, r as SiteHeader, s as adminLogout, v as getAdminSession, y as getCdTerms, z as saveDeskLogin } from "./router-B75_K_o9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DRdKYU0l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var controlClass = "w-full rounded-md border border-border bg-surface px-3.5 py-3 text-base text-fg outline-none focus:border-primary";
function AdminPage() {
	const [session, setSession] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getAdminSession().then((next) => setSession(next)).catch(() => setSession({
			signedIn: false,
			needsSetup: false
		}));
	}, []);
	if (session === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto max-w-md px-6 py-24 text-center text-sm text-fg",
		children: "Checking the desk…"
	});
	if (!session.signedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLogin, {
		needsSetup: session.needsSetup,
		onSuccess: () => setSession({
			signedIn: true,
			needsSetup: false
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cabinet, { onSignOut: () => setSession({
		signedIn: false,
		needsSetup: false
	}) });
}
function AdminLogin({ needsSetup, onSuccess }) {
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	async function onSubmit(event) {
		event.preventDefault();
		setError("");
		if (needsSetup && password !== confirm) {
			setError("Passwords do not match.");
			return;
		}
		setPending(true);
		try {
			if (needsSetup) await createDeskLogin({ data: {
				email,
				password
			} });
			else await adminLogin({ data: {
				email,
				password
			} });
			onSuccess();
		} catch {
			setError(needsSetup ? "The desk login could not be created." : "Those credentials are not recognized.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
			eyebrow: "Operations",
			action: null
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-md flex-col justify-center px-4 py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-surface px-6 py-10 shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-4xl font-semibold tracking-tight",
						children: needsSetup ? "Create the desk login" : "Admin sign in"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-fg",
						children: needsSetup ? "This server has no desk password yet. Create one before reviewing applications." : "Enter the desk credentials to review investor applications."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-8 grid gap-5",
						onSubmit,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mb-1.5 block text-sm font-medium",
									children: "Email address"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									type: "email",
									autoComplete: "username",
									value: email,
									onChange: (event) => setEmail(event.target.value),
									className: controlClass
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mb-1.5 block text-sm font-medium",
									children: "Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										required: true,
										type: showPassword ? "text" : "password",
										autoComplete: needsSetup ? "new-password" : "current-password",
										value: password,
										onChange: (event) => setPassword(event.target.value),
										className: controlClass + " pr-16"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "absolute top-1/2 right-3 -translate-y-1/2 text-sm font-semibold text-primary",
										onClick: () => setShowPassword((value) => !value),
										children: showPassword ? "Hide" : "Show"
									})]
								})]
							}),
							needsSetup ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mb-1.5 block text-sm font-medium",
									children: "Confirm password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									type: showPassword ? "text" : "password",
									autoComplete: "new-password",
									value: confirm,
									onChange: (event) => setConfirm(event.target.value),
									className: controlClass
								})]
							}) : null,
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-danger",
								role: "alert",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: pending,
								className: "min-h-12 rounded-md bg-action py-3 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60",
								children: pending ? "Saving…" : needsSetup ? "Create login" : "Sign in"
							})
						]
					})
				]
			})
		})]
	});
}
function Cabinet({ onSignOut }) {
	const [tab, setTab] = (0, import_react.useState)("dashboard");
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [rows, setRows] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [mailReady, setMailReady] = (0, import_react.useState)(true);
	async function refresh() {
		const next = await listApplications();
		setRows(next);
		setSelectedId((current) => current && next.some((row) => row.id === current) ? current : next[0]?.id ?? null);
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => setError("Applications could not be loaded."));
		getMailSetup().then((setup) => setMailReady(setup.hasKey)).catch(() => setMailReady(false));
	}, []);
	const stats = (0, import_react.useMemo)(() => {
		const list = rows ?? [];
		return {
			total: list.length,
			pending: list.filter((row) => row.status === "pending").length,
			approved: list.filter((row) => row.status === "approved").length,
			hold: list.filter((row) => row.status === "hold").length
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
	async function removeApplication(id) {
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
	async function updateStatus(id, status) {
		setError("");
		setNotice("");
		try {
			const result = await setApplicationStatus({ data: {
				id,
				status
			} });
			if (result.loginEmail) setNotice(`Sign-in created for ${result.loginEmail}.`);
			else if (status !== "approved") setNotice("Investor sign-in removed.");
			await refresh();
		} catch {
			setError("Could not update this application. A login needs the password from the form.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
			eyebrow: "Operations desk",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: headerActionClass,
				onClick: () => void signOut(),
				children: "Sign out"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskNav, {
					tab,
					onSelect: setTab
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4 lg:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3",
							"aria-expanded": menuOpen,
							"aria-label": menuOpen ? "Close menu" : "Open menu",
							onClick: () => setMenuOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold text-primary",
								children: DESK_MENU.flatMap((group) => group.items).find((item) => item.id === tab)?.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {
								className: "size-5 text-primary",
								"aria-hidden": "true"
							})]
						})
					}),
					menuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "fixed inset-0 z-40 lg:hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "absolute inset-0 bg-primary/30",
							"aria-label": "Close menu",
							onClick: () => setMenuOpen(false)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-y-0 left-0 w-[min(100%,280px)] overflow-y-auto bg-surface p-4 shadow-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold text-primary",
									children: "Desk"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "flex size-11 items-center justify-center rounded-lg border border-border",
									"aria-label": "Close menu",
									onClick: () => setMenuOpen(false),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskNav, {
								tab,
								onSelect: (id) => {
									setTab(id);
									setMenuOpen(false);
								}
							})]
						})]
					}) : null,
					mailReady ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 rounded-md border border-border bg-surface px-4 py-3 text-sm text-fg",
						children: "Mail is not sending yet. Open Settings and save a Resend API key and from address. Logos, the company name, and the backup email from the preview also need to be entered again on this server."
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-sm text-danger",
						children: error
					}) : null,
					notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-sm text-fg",
						children: notice
					}) : null,
					tab === "dashboard" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-3xl font-semibold",
							children: "Dashboard"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-fg",
							children: "Investor applications waiting on the compliance desk."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Submitted",
									value: stats.total
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Pending",
									value: stats.pending
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Approved",
									value: stats.approved
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-8 text-lg font-semibold text-primary",
							children: "Latest submissions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplicationTable, {
							rows: (rows ?? []).slice(0, 5),
							selectedId,
							onSelect: (id) => {
								setSelectedId(id);
								const row = (rows ?? []).find((item) => item.id === id);
								setTab(row?.status === "approved" ? "clients" : "applications");
							}
						})
					] }) : tab === "applications" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-3xl font-semibold",
							children: "Submitted applications"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-fg",
							children: "Select a row to open the full application, including the identity and address documents."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [
								"all",
								"pending",
								"approved",
								"hold"
							].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 rounded-md border px-3 py-2 text-sm font-semibold " + (filter === key ? "border-action bg-action text-on-primary" : "border-border text-primary"),
								onClick: () => setFilter(key),
								children: key === "all" ? "All" : key === "hold" ? "On hold" : key[0].toUpperCase() + key.slice(1)
							}, key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplicationTable, {
							rows: visible,
							selectedId,
							onSelect: setSelectedId
						}),
						selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplicationDetail, {
							row: selected,
							onStatus: (status) => void updateStatus(selected.id, status),
							onRemove: () => void removeApplication(selected.id)
						}) : null
					] }) : tab === "clients" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientsPanel, {
						rows: clients,
						onStatus: (id, status) => void updateStatus(id, status),
						onRemove: (id) => void removeApplication(id)
					}) : tab === "investments" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvestmentTypesPanel, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromoPanel, {})]
					}) : tab === "funding" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FundingDesk, {}) : tab === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveCdsDesk, {}) : tab === "invoices" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoicesDesk, {}) : tab === "advisors" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvisorsPanel, {}) : tab === "emails" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmailsPanel, {}) : tab === "settings-logos" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, { section: "logos" }) : tab === "settings-misc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, { section: "misc" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, { section: "general" })
				]
			})]
		})]
	});
}
function EmailsPanel() {
	const [rows, setRows] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [audience, setAudience] = (0, import_react.useState)("all");
	const [origin, setOrigin] = (0, import_react.useState)("");
	const brand = useBrand();
	const templates = templateCatalog(brand.companyName, brand.emailLogo, brand.publicDomain || origin).filter((item) => audience === "all" || item.audience === audience);
	(0, import_react.useEffect)(() => {
		setOrigin(window.location.origin);
	}, []);
	(0, import_react.useEffect)(() => {
		listNotifications().then(setRows).catch(() => setError("Emails could not be loaded."));
	}, []);
	const visible = (rows ?? []).filter((row) => audience === "all" || row.audience === audience);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "Email templates"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-2xl text-fg",
			children: "Each step has a client template and a desk template. Sent mail uses these layouts."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: [
				"all",
				"client",
				"admin"
			].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "min-h-11 rounded-md border px-3 py-2 text-sm font-semibold " + (audience === key ? "border-action bg-action text-on-primary" : "border-border text-primary"),
				onClick: () => setAudience(key),
				children: key === "all" ? "All" : key === "client" ? "Client" : "Admin"
			}, key))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 grid gap-4",
			children: templates.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-md border border-border bg-surface px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-semibold uppercase tracking-wide text-action",
						children: [
							item.audience === "admin" ? "Desk" : "Client",
							" · ",
							item.label
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-semibold text-primary",
						children: item.subject
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						title: item.subject,
						srcDoc: item.html,
						className: "mt-3 h-80 w-full rounded-md border border-border bg-white"
					})
				]
			}, `${item.step}-${item.audience}`))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 text-lg font-semibold text-primary",
			children: "Sent"
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-danger",
			children: error
		}) : null,
		rows && visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: "No emails yet. They appear as applications and certificates move forward."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 grid gap-3",
			children: visible.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-md border border-border bg-surface px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-primary",
							children: row.subject
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-fg",
							children: [
								row.createdAt,
								" UTC · ",
								row.delivery === "sent" ? "Sent" : row.delivery === "failed" ? "Not delivered" : "Logged"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-fg",
						children: [
							row.audience === "admin" ? "Admin" : "Client",
							" · ",
							row.recipient
						]
					}),
					row.html ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						title: row.subject,
						srcDoc: row.html,
						className: "mt-3 h-72 w-full rounded-md border border-border bg-white"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 whitespace-pre-wrap text-sm text-fg",
						children: row.body
					})
				]
			}, row.id))
		})
	] });
}
function InvestmentTypesPanel() {
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [terms, setTerms] = (0, import_react.useState)([]);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		Promise.all([getInvestmentTypes(), getCdTerms()]).then(([next, nextTerms]) => {
			setDraft(next[0] ?? null);
			setTerms(nextTerms);
		}).catch(() => setError("Certificates could not be loaded."));
	}, []);
	function patch(key, value) {
		setDraft((current) => current ? {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "Certificates of deposit"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-fg",
			children: "Investors browse these terms when they fund a certificate."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 rounded-lg border border-border bg-surface p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold tracking-widest text-primary uppercase",
					children: "Available terms"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3",
					children: terms.map((term) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_120px_auto_auto] sm:items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
								label: "APY",
								value: term.apy,
								onChange: (value) => setTerms((current) => current.map((item) => item.id === term.id ? {
									...item,
									apy: value
								} : item))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
								label: "Months",
								value: String(term.months),
								onChange: (value) => setTerms((current) => current.map((item) => item.id === term.id ? {
									...item,
									months: Number(value) || 0
								} : item))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-h-11 items-center gap-2 text-sm font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: term.featured,
									onChange: (event) => {
										const featured = event.currentTarget.checked;
										setTerms((current) => current.map((item) => item.id === term.id ? {
											...item,
											featured
										} : item));
									}
								}), "Featured"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 text-sm font-semibold text-primary",
								onClick: () => setTerms((current) => current.filter((item) => item.id !== term.id)),
								children: "Remove"
							})
						]
					}, term.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-4 text-sm font-semibold text-primary",
					onClick: () => setTerms((current) => [...current, {
						id: crypto.randomUUID(),
						apy: "",
						months: 12,
						featured: false
					}]),
					children: "Add term"
				})
			]
		}),
		draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold tracking-widest text-primary uppercase",
						children: "Certificate overview"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
							label: "Issuer",
							value: draft.issuer,
							onChange: (value) => patch("issuer", value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
							label: "Structure",
							value: draft.structure,
							onChange: (value) => patch("structure", value)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold tracking-widest text-primary uppercase",
						children: "Key terms"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
							label: "Minimum investment",
							value: draft.minimumInvestment,
							onChange: (value) => patch("minimumInvestment", value)
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block rounded-lg border border-border bg-surface p-5 lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1.5 block text-sm font-medium",
						children: "Capital protection"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: controlClass + " min-h-24",
						value: draft.capitalProtection,
						onChange: (event) => patch("capitalProtection", event.target.value)
					})]
				})
			]
		}) : null,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-danger",
			children: error
		}) : null,
		notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: notice
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			disabled: pending || !draft,
			className: "mt-6 min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60",
			onClick: () => void save(),
			children: pending ? "Saving…" : "Save"
		})
	] });
}
function PromoPanel() {
	const [offer, setOffer] = (0, import_react.useState)(null);
	const [terms, setTerms] = (0, import_react.useState)([]);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [bonusDraft, setBonusDraft] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		Promise.all([getPromo(), getCdTerms()]).then(([next, nextTerms]) => {
			setOffer(next);
			setTerms(nextTerms);
		}).catch(() => setError("The promotional offer could not be loaded."));
	}, []);
	function patchOffer(key, value) {
		setOffer((current) => current ? {
			...current,
			[key]: value
		} : current);
	}
	function patchTier(id, patch) {
		setOffer((current) => current ? {
			...current,
			tiers: current.tiers.map((tier) => tier.id === id ? {
				...tier,
				...patch
			} : tier)
		} : current);
	}
	function toggleMonth(tier, month) {
		const months = tier.months.includes(month) ? tier.months.filter((item) => item !== month) : [...tier.months, month].sort((a, b) => a - b);
		patchTier(tier.id, { months });
	}
	function setBonus(id, value) {
		if (!/^\d*\.?\d*$/.test(value)) return;
		setBonusDraft((current) => ({
			...current,
			[id]: value
		}));
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
				return {
					...tier,
					bonusPercent: parsed
				};
			});
			await savePromo({ data: {
				...offer,
				tiers
			} });
			setBonusDraft({});
			setOffer(await getPromo());
			setNotice("Promotional offer saved.");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Could not save the promotional offer.");
		} finally {
			setPending(false);
		}
	}
	if (!offer) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-fg",
		children: error || "Opening the promotional offer…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-2xl font-semibold text-primary",
			children: "Promotional offers"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-fg",
			children: "Set the offer copy, dates, and which certificate terms earn a bonus at each amount."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1.5 block text-sm font-medium",
						children: "Introduction"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: controlClass + " min-h-24",
						value: offer.intro,
						onChange: (event) => patchOffer("intro", event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
					label: "Protection line",
					value: offer.protection,
					onChange: (value) => patchOffer("protection", value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-sm font-medium",
							children: "Starts"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: controlClass,
							type: "date",
							value: offer.startsOn,
							onChange: (event) => patchOffer("startsOn", event.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-sm font-medium",
							children: "Ends"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: controlClass,
							type: "date",
							value: offer.endsOn,
							onChange: (event) => patchOffer("endsOn", event.target.value)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1.5 block text-sm font-medium",
						children: "Fine print"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: controlClass + " min-h-20",
						value: offer.finePrint,
						onChange: (event) => patchOffer("finePrint", event.target.value)
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-4",
			children: offer.tiers.map((tier, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-[1fr_1fr_140px_auto] sm:items-end",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
								label: "Minimum",
								value: String(tier.minAmount),
								onChange: (value) => patchTier(tier.id, { minAmount: Number(value) || 0 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
								label: "Maximum",
								value: tier.maxAmount == null ? "" : String(tier.maxAmount),
								onChange: (value) => patchTier(tier.id, { maxAmount: value.trim() === "" ? null : Number(value) || 0 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
								label: "Bonus %",
								value: bonusDraft[tier.id] ?? String(tier.bonusPercent),
								onChange: (value) => setBonus(tier.id, value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 text-sm font-semibold text-primary",
								onClick: () => setOffer({
									...offer,
									tiers: offer.tiers.filter((item) => item.id !== tier.id)
								}),
								children: "Remove"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm font-medium",
						children: ["Terms for band ", index + 1]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-3",
						children: terms.map((term) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "inline-flex min-h-11 items-center gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: tier.months.includes(term.months),
									onChange: () => toggleMonth(tier, term.months)
								}),
								term.months,
								"-month"
							]
						}, term.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-fg",
						children: "Leave maximum empty for an open-ended band, such as $500,000+."
					})
				]
			}, tier.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "mt-4 text-sm font-semibold text-primary",
			onClick: () => setOffer({
				...offer,
				tiers: [...offer.tiers, {
					id: crypto.randomUUID(),
					minAmount: 1e5,
					maxAmount: 174999,
					bonusPercent: .75,
					months: terms.slice(0, 1).map((term) => term.months)
				}]
			}),
			children: "Add amount band"
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-danger",
			children: error
		}) : null,
		notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: notice
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			disabled: pending,
			className: "mt-6 min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary disabled:opacity-60",
			onClick: () => void save(),
			children: pending ? "Saving…" : "Save offer"
		})
	] });
}
function DeskLoginSettings() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	async function onSubmit(event) {
		event.preventDefault();
		setError("");
		setNotice("");
		setPending(true);
		try {
			await saveDeskLogin({ data: {
				email,
				currentPassword,
				newPassword
			} });
			setCurrentPassword("");
			setNewPassword("");
			setNotice("Desk login updated.");
		} catch {
			setError("Could not update the desk login. Check the current password.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-6 max-w-xl rounded-lg border border-border bg-surface p-4",
		onSubmit: (event) => void onSubmit(event),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold text-primary",
				children: "Desk login"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-fg",
				children: "Change the email and password for this desk. Leave the new password blank to keep the current one."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-4 block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1.5 block text-sm font-medium",
					children: "Desk email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					required: true,
					type: "email",
					className: controlClass,
					value: email,
					onChange: (event) => setEmail(event.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-4 block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1.5 block text-sm font-medium",
					children: "Current password"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					required: true,
					type: "password",
					autoComplete: "current-password",
					className: controlClass,
					value: currentPassword,
					onChange: (event) => setCurrentPassword(event.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-4 block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1.5 block text-sm font-medium",
					children: "New password"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "password",
					autoComplete: "new-password",
					className: controlClass,
					value: newPassword,
					onChange: (event) => setNewPassword(event.target.value)
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-danger",
				children: error
			}) : null,
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-fg",
				children: notice
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: pending,
				className: "mt-4 min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60",
				children: pending ? "Saving…" : "Update desk login"
			})
		]
	});
}
function AdminField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1.5 block text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: controlClass,
			value,
			onChange: (event) => onChange(event.target.value)
		})]
	});
}
function SettingsPanel({ section }) {
	const brand = useBrand();
	const [logo, setLogo] = (0, import_react.useState)(brand.logo);
	const [favicon, setFavicon] = (0, import_react.useState)(brand.favicon);
	const [companyName, setCompanyName] = (0, import_react.useState)(brand.companyName);
	const [cloudflareCode, setCloudflareCode] = (0, import_react.useState)(brand.cloudflareCode);
	const [cover, setCover] = (0, import_react.useState)(brand.cover);
	const [socialBanner, setSocialBanner] = (0, import_react.useState)(brand.socialBanner);
	const [emailLogo, setEmailLogo] = (0, import_react.useState)(brand.emailLogo);
	const [footerLogo, setFooterLogo] = (0, import_react.useState)(brand.footerLogo);
	const [footerText, setFooterText] = (0, import_react.useState)(brand.footerText);
	const [backupEmail, setBackupEmail] = (0, import_react.useState)(brand.backupEmail);
	const [publicDomain, setPublicDomain] = (0, import_react.useState)(brand.publicDomain);
	const [lastBackupAt, setLastBackupAt] = (0, import_react.useState)(brand.lastBackupAt);
	const [backupPending, setBackupPending] = (0, import_react.useState)(false);
	const [resendKey, setResendKey] = (0, import_react.useState)("");
	const [mailFrom, setMailFrom] = (0, import_react.useState)("");
	const [keyHint, setKeyHint] = (0, import_react.useState)("");
	const [hasKey, setHasKey] = (0, import_react.useState)(false);
	const [mailPending, setMailPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
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
	}, [
		brand.logo,
		brand.favicon,
		brand.companyName,
		brand.cloudflareCode,
		brand.cover,
		brand.socialBanner,
		brand.emailLogo,
		brand.footerLogo,
		brand.footerText,
		brand.backupEmail,
		brand.publicDomain,
		brand.lastBackupAt
	]);
	(0, import_react.useEffect)(() => {
		getMailSetup().then((setup) => {
			setMailFrom(setup.mailFrom);
			setKeyHint(setup.keyHint);
			setHasKey(setup.hasKey);
		}).catch(() => void 0);
	}, []);
	async function onFile(file, kind) {
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
		if (file.size > (share ? 1e6 : 4e5)) {
			setError(share ? "Use a JPEG or PNG under 1 MB." : "Use an image under 400 KB.");
			return;
		}
		const dataUrl = await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result));
			reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that file."));
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
			await setSiteBrand({ data: {
				logo,
				favicon,
				companyName,
				cloudflareCode,
				cover,
				socialBanner,
				emailLogo,
				footerLogo,
				footerText,
				backupEmail,
				lastBackupAt,
				publicDomain
			} });
			await brand.refresh();
			setNotice("Settings updated.");
		} catch (caught) {
			setError(caught instanceof Error && caught.message ? caught.message : "Could not save settings.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: section === "logos" ? "Logos" : section === "misc" ? "Misc" : "General"
		}),
		section === "general" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-fg",
				children: "The company name is used in the header, page titles, emails, and certificates."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-6 block max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1.5 block text-sm font-medium",
					children: "Company name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: controlClass,
					value: companyName,
					onChange: (event) => setCompanyName(event.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-6 block max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1.5 block text-sm font-medium",
						children: "Public domain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: publicDomain,
						placeholder: "https://www.example.com",
						onChange: (event) => setPublicDomain(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-fg",
						children: "Client emails use this for the Open the investor portal button. Use the public site, not the Vercel address."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskLoginSettings, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 max-w-xl rounded-lg border border-danger/40 bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold text-primary",
						children: "Clear database"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-fg",
						children: "Deletes applications, clients, investments, invoices, active CDs, and notifications. Settings, rates, advisors, and the desk login stay."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-3 min-h-11 rounded-md border border-danger px-4 py-2 text-sm font-semibold text-danger",
						onClick: () => {
							if (!window.confirm("Clear the database? Applications, clients, investments, invoices, active CDs, and notifications will be deleted. This cannot be undone.")) return;
							setError("");
							setNotice("");
							setPending(true);
							clearDatabase().then(() => setNotice("Database cleared. Settings and the desk login were kept.")).catch((caught) => setError(caught instanceof Error && caught.message ? caught.message : "The database could not be cleared.")).finally(() => setPending(false));
						},
						children: pending ? "Clearing…" : "Clear database"
					})
				]
			})
		] }) : null,
		section === "misc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-fg",
				children: "Mail delivery, the daily database backup, and site analytics."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 max-w-xl rounded-lg border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-sm font-medium",
							children: "Database backup email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							className: controlClass,
							value: backupEmail,
							placeholder: "admin@accountholding.com",
							onChange: (event) => setBackupEmail(event.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-fg",
						children: [
							"A zip of the database is emailed here every day at 12:00 UTC on the published server.",
							lastBackupAt ? ` Last backup: ${lastBackupAt.replace("T", " ").slice(0, 16)} UTC.` : " No backup has been sent yet.",
							" ",
							"Set CRON_SECRET on the host so only that job can run the backup."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: backupPending,
						className: "mt-3 min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60",
						onClick: () => {
							setError("");
							setNotice("");
							setBackupPending(true);
							runDatabaseBackup().then(async (result) => {
								setLastBackupAt(result.at);
								await brand.refresh();
								setNotice(result.delivery === "sent" ? `Backup emailed to ${result.to}.` : `Backup prepared for ${result.to}. Add a mail key to deliver the zip.`);
							}).catch(() => setError("The backup could not be sent.")).finally(() => setBackupPending(false));
						},
						children: backupPending ? "Preparing backup…" : "Send backup now"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 max-w-xl rounded-lg border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold text-primary",
						children: "Resend"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-fg",
						children: "Used for investor emails and the daily backup zip. The key is stored on the server and is not shown again."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-4 block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-sm font-medium",
							children: "API key"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							autoComplete: "off",
							className: controlClass,
							value: resendKey,
							placeholder: hasKey ? `Saved ${keyHint}` : "re_...",
							onChange: (event) => setResendKey(event.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-4 block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-sm font-medium",
							children: "From address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: controlClass,
							value: mailFrom,
							placeholder: "Account Holding <onboarding@resend.dev>",
							onChange: (event) => setMailFrom(event.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-fg",
						children: "Until your domain is verified, use onboarding@resend.dev and send only to the inbox on your Resend account."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: mailPending,
							className: "min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60",
							onClick: () => {
								setError("");
								setNotice("");
								setMailPending(true);
								saveMailSetup({ data: {
									apiKey: resendKey,
									mailFrom,
									clearKey: false
								} }).then((setup) => {
									setResendKey("");
									setMailFrom(setup.mailFrom);
									setKeyHint(setup.keyHint);
									setHasKey(setup.hasKey);
									setNotice(setup.hasKey ? "Resend settings saved." : "From address saved. Add an API key to send mail.");
								}).catch(() => setError("Could not save Resend settings. Check the key and from address.")).finally(() => setMailPending(false));
							},
							children: mailPending ? "Saving…" : "Save Resend"
						}), hasKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: mailPending,
							className: "min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60",
							onClick: () => {
								setError("");
								setNotice("");
								setMailPending(true);
								saveMailSetup({ data: {
									apiKey: "",
									mailFrom,
									clearKey: true
								} }).then((setup) => {
									setResendKey("");
									setKeyHint(setup.keyHint);
									setHasKey(setup.hasKey);
									setNotice("Resend API key removed.");
								}).catch(() => setError("Could not remove the Resend key.")).finally(() => setMailPending(false));
							},
							children: "Remove key"
						}) : null]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-6 block max-w-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1.5 block text-sm font-medium",
					children: "Cloudflare code"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: controlClass + " min-h-28 font-mono text-sm",
					value: cloudflareCode,
					placeholder: "Paste the Cloudflare Web Analytics snippet or token",
					onChange: (event) => setCloudflareCode(event.target.value)
				})]
			})
		] }) : null,
		section === "logos" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-fg",
				children: "These images replace the wordmark, browser icon, email header, footer, application cover, and shared-link image."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageSetting, {
						label: "Website logo",
						value: logo,
						onFile: (file) => void onFile(file, "logo"),
						onClear: () => setLogo(null)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageSetting, {
						label: "Email header logo",
						hint: "Replaces the company name in the email header.",
						value: emailLogo,
						onFile: (file) => void onFile(file, "emailLogo"),
						onClear: () => setEmailLogo(null)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageSetting, {
						label: "Footer logo",
						hint: "Shown in the portal footer. The company name is used if this is empty.",
						value: footerLogo,
						onFile: (file) => void onFile(file, "footerLogo"),
						onClear: () => setFooterLogo(null)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageSetting, {
						label: "Favicon",
						value: favicon,
						onFile: (file) => void onFile(file, "favicon"),
						onClear: () => setFavicon(null)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageSetting, {
						label: "App cover",
						hint: "Shown on the application. Also used for the shared link if no banner is set.",
						value: cover,
						wide: true,
						accept: "image/png,image/jpeg",
						onFile: (file) => void onFile(file, "cover"),
						onClear: () => setCover(null)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageSetting, {
						label: "Social link banner",
						hint: "Image shown when the site link is shared.",
						value: socialBanner,
						wide: true,
						accept: "image/png,image/jpeg",
						onFile: (file) => void onFile(file, "socialBanner"),
						onClear: () => setSocialBanner(null)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-6 block max-w-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1.5 block text-sm font-medium",
						children: "Footer text"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: controlClass + " min-h-28",
						value: footerText,
						placeholder: "FDIC insurance covers the first $250,000 per individual or $500,000 per joint account. Rates and calculator results are illustrations. Early withdrawal penalties may apply.",
						onChange: (event) => setFooterText(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-fg",
						children: "Shown under the footer logo. Leave blank to use the standard note."
					})
				]
			})
		] }) : null,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-danger",
			children: error
		}) : null,
		notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: notice
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			disabled: pending,
			className: "mt-6 min-h-11 rounded-md bg-action px-5 py-2 font-semibold text-on-primary hover:bg-action-deep disabled:opacity-60",
			onClick: () => void save(),
			children: pending ? "Saving…" : "Save"
		})
	] });
}
function ImageSetting({ label, hint, value, onFile, onClear, wide = false, accept = "image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold text-primary",
				children: label
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-fg",
				children: hint
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex items-center justify-center overflow-hidden rounded-md border border-border bg-bg " + (wide ? "h-36" : "h-16"),
				children: value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: value,
					alt: "",
					className: "max-w-full " + (wide ? "h-full w-full object-cover" : "max-h-12 object-contain")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-fg",
					children: "No image"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				accept,
				className: "mt-3 block w-full text-sm",
				onChange: (event) => onFile(event.target.files?.[0])
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-3 text-sm font-semibold text-primary",
				onClick: onClear,
				children: "Remove"
			})
		]
	});
}
function InvoicesDesk() {
	const [rows, setRows] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	function load() {
		return listFundings().then((next) => setRows(next.filter((row) => row.signed && (row.status === "approved_phone" || row.status === "instructions_sent")))).catch(() => setError("Invoices could not be loaded."));
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function removeInvoice(id) {
		if (!window.confirm("Remove this invoice and its investment? No email will be sent.")) return;
		setError("");
		try {
			await deleteFunding({ data: { id } });
			await load();
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "The invoice could not be removed.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "Invoices"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-fg",
			children: "Signed certificates approved by phone. Approve an invoice here to generate it for the client."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-danger",
			children: error
		}) : null,
		!rows ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: "Loading…"
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: "No certificates are waiting for an invoice."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 grid gap-4",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceCard, {
				row,
				onApproved: () => void load(),
				onRemove: () => void removeInvoice(row.id)
			}, row.id))
		})
	] });
}
var BILLING_FIELDS = [
	{
		key: "brand",
		label: "Header name"
	},
	{
		key: "bankName",
		label: "Bank name"
	},
	{
		key: "accountName",
		label: "Account name"
	},
	{
		key: "beneficiaryAddress",
		label: "Beneficiary address",
		wide: true
	},
	{
		key: "accountNumber",
		label: "Account number"
	},
	{
		key: "routingNumber",
		label: "Routing number"
	},
	{
		key: "crn",
		label: "CRN"
	},
	{
		key: "purpose",
		label: "Purpose of wire"
	},
	{
		key: "contactName",
		label: "Contact name"
	},
	{
		key: "phone",
		label: "Phone"
	},
	{
		key: "fdic",
		label: "FDIC certificate"
	},
	{
		key: "contactAddress",
		label: "Contact address",
		wide: true
	}
];
function InvoiceCard({ row, onApproved, onRemove }) {
	const [billing, setBilling] = (0, import_react.useState)(row.billing);
	const [pending, setPending] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	function setField(key, value) {
		setBilling((current) => ({
			...current,
			[key]: value
		}));
	}
	async function save() {
		setError("");
		setNotice("");
		setPending("save");
		try {
			const result = await saveInvoiceBilling({ data: {
				id: row.id,
				billing
			} });
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
			await approveInvoice({ data: {
				id: row.id,
				billing
			} });
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
			await saveInvoiceBilling({ data: {
				id: row.id,
				billing
			} });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-primary",
					children: row.signerName || row.email
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-fg",
					children: [
						row.termLabel || "Certificate",
						" · ",
						row.amount
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg",
				children: row.email
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg",
				children: generated ? "Invoice generated" : "Waiting for approval"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: BILLING_FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: field.wide ? "block sm:col-span-2" : "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1.5 block text-sm font-medium",
						children: field.label
					}), field.key === "contactAddress" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: controlClass,
						rows: 2,
						value: billing[field.key],
						onChange: (event) => setField(field.key, event.target.value)
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: billing[field.key],
						onChange: (event) => setField(field.key, event.target.value)
					})]
				}, field.key))
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-danger",
				children: error
			}) : null,
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-fg",
				children: notice
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60",
						disabled: pending !== "",
						onClick: () => void save(),
						children: pending === "save" ? "Saving…" : "Save billing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60",
						disabled: pending !== "",
						onClick: () => void approve(),
						children: pending === "approve" ? "Saving…" : generated ? "Update invoice" : "Approve invoice"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60",
						disabled: pending !== "",
						onClick: () => void download(),
						children: pending === "pdf" ? "Creating…" : "Preview PDF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-danger disabled:opacity-60",
						disabled: pending !== "",
						onClick: onRemove,
						children: "Remove"
					})
				]
			}),
			row.paymentFileName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentReview, {
				id: row.id,
				name: row.paymentFileName,
				canReview: generated,
				onChanged: onApproved
			}) : null
		]
	});
}
function ActiveCdsDesk() {
	const [rows, setRows] = (0, import_react.useState)(null);
	const [offer, setOffer] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		Promise.all([listFundings(), getPromo()]).then(([next, promo]) => {
			setRows(next.filter((row) => row.status === "payment_approved"));
			setOffer(promo);
		}).catch(() => setError("Active CDs could not be loaded."));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "text-3xl font-semibold",
			children: ["Active CDs", rows ? ` (${rows.length})` : ""]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-fg",
			children: "Certificates whose payment the advisor confirmed. An active CD is removed only when the client is deleted."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-danger",
			children: error
		}) : null,
		!rows ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: "Loading…"
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: "No active certificates yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 grid gap-3",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveCdDeskRow, {
				row,
				offer
			}, row.id))
		})
	] });
}
function ActiveCdDeskRow({ row, offer }) {
	const [open, setOpen] = (0, import_react.useState)(false);
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
	const facts = [
		["Client", row.signerName || row.email],
		["Email", row.email],
		["Issuer", row.issuer],
		["Structure", row.structure],
		["Amount", row.amount],
		["Term", months ? `${months} months` : row.termLabel],
		["Base APY", row.termLabel.match(/([\d.]+%)/)?.[1] ?? "—"],
		["Promo APY", promo],
		["Final APY", finalApy],
		["Expected payout", payout ? payout.toLocaleString("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0
		}) : "—"],
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
		["Wire confirmation", row.paymentFileName || "—"]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg border border-border bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex w-full items-center gap-3 px-4 py-3 text-left",
			"aria-expanded": open,
			onClick: () => setOpen((value) => !value),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-semibold text-primary",
						children: row.signerName || row.email
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-0.5 block text-sm text-fg",
						children: [
							row.termLabel || row.name,
							" · ",
							row.amount,
							" · opened ",
							row.createdAt
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden text-sm text-fg sm:block",
					children: row.advisorName || "No advisor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
					className: "size-4 shrink-0 text-primary transition-transform " + (open ? "rotate-180" : ""),
					"aria-hidden": "true"
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
			className: "grid border-t border-border sm:grid-cols-2 lg:grid-cols-3",
			children: facts.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-[11px] font-semibold tracking-wide text-[#12315c] uppercase",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "mt-1 text-sm text-fg",
					children: value || "—"
				})]
			}, label))
		}) : null]
	});
}
function addMonths(iso, months) {
	const [year, month, day] = iso.split("-").map(Number);
	if (!year || !month || !day || !months) return "—";
	return new Date(Date.UTC(year, month - 1 + months, day)).toISOString().slice(0, 10);
}
function FundingDesk() {
	const [rows, setRows] = (0, import_react.useState)(null);
	const [advisors, setAdvisors] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	function load() {
		return Promise.all([listFundings(), listAdvisors()]).then(([nextRows, nextAdvisors]) => {
			setRows(nextRows);
			setAdvisors(nextAdvisors);
		});
	}
	(0, import_react.useEffect)(() => {
		load().catch((caught) => setError(caught instanceof Error ? caught.message : "Investments could not be loaded."));
	}, []);
	async function save(row, status, advisorId, codes) {
		setError("");
		setNotice("");
		try {
			await updateFunding({ data: {
				id: row.id,
				status,
				advisorId,
				...codes
			} });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "Client investments"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-fg",
			children: "New certificates start as pending. Assign the advisor for the call, then mark the investment approved by phone."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-danger",
			children: error
		}) : null,
		notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-fg",
			children: notice
		}) : null,
		!rows ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: "Loading…"
		}) : rows.filter((row) => row.status !== "payment_approved").length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: "No investments in progress. Active certificates are on the Active CDs tab."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 grid gap-3",
			children: rows.filter((row) => row.status !== "payment_approved").map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FundingRow, {
				row,
				advisors,
				onSave: save,
				onReload: () => void reload(),
				onRemove: () => void remove(row.id)
			}, row.id))
		})
	] });
}
function FundingRow({ row, advisors, onSave, onReload, onRemove }) {
	const [status, setStatus] = (0, import_react.useState)(row.status);
	const [advisorId, setAdvisorId] = (0, import_react.useState)(row.advisorId);
	const [depositCode, setDepositCode] = (0, import_react.useState)(row.depositCode);
	const [depositNumber, setDepositNumber] = (0, import_react.useState)(row.depositNumber);
	const [accountNumber, setAccountNumber] = (0, import_react.useState)(row.accountNumber);
	const [referenceNumber, setReferenceNumber] = (0, import_react.useState)(row.referenceNumber);
	const [amount, setAmount] = (0, import_react.useState)(row.amount);
	const [openedOn, setOpenedOn] = (0, import_react.useState)(row.createdAt);
	(0, import_react.useEffect)(() => {
		setStatus(row.status);
		setAdvisorId(row.advisorId);
		setDepositCode(row.depositCode);
		setDepositNumber(row.depositNumber);
		setAccountNumber(row.accountNumber);
		setReferenceNumber(row.referenceNumber);
		setAmount(row.amount);
		setOpenedOn(row.createdAt);
	}, [row]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-md border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-semibold text-primary",
				children: [
					row.email,
					" · ",
					row.termLabel || row.name
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-fg",
				children: [
					row.amount,
					" · ",
					row.createdAt,
					row.signed ? " · Terms signed" : row.status === "pending" ? " · Awaiting signature" : ""
				]
			}),
			row.signed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-fg",
				children: row.contactBy === "email" ? "Do not call. Use email." : `Call ${row.contactPhone || "the number on the application"}`
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-primary",
						children: "Advisor"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: `${controlClass} mt-1`,
						value: advisorId,
						onChange: (event) => setAdvisorId(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Unassigned"
						}), advisors.map((advisor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: advisor.id,
							children: [advisor.name, advisor.phone ? ` · ${advisor.phone}` : ""]
						}, advisor.id))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-primary",
						children: "Status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: `${controlClass} mt-1`,
						value: status,
						onChange: (event) => setStatus(event.target.value),
						children: [
							row.status === "instructions_sent" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "instructions_sent",
								children: "Invoice created"
							}) : null,
							row.status === "pending" || row.status === "approved_phone" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "pending",
								children: "Pending"
							}) : null,
							row.status === "pending" || row.status === "approved_phone" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "approved_phone",
								children: "Approved by phone"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "cancelled",
								children: "Cancelled"
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
						label: "Amount",
						value: amount,
						onChange: setAmount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-sm font-medium",
							children: "Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: controlClass,
							type: "date",
							value: openedOn,
							onChange: (event) => setOpenedOn(event.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
						label: "Deposit code",
						value: depositCode,
						onChange: setDepositCode
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
						label: "Deposit number",
						value: depositNumber,
						onChange: setDepositNumber
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
						label: "Account number",
						value: accountNumber,
						onChange: setAccountNumber
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
						label: "Reference number",
						value: referenceNumber,
						onChange: setReferenceNumber
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary",
					onClick: () => onSave(row, status, advisorId, {
						depositCode,
						depositNumber,
						accountNumber,
						referenceNumber,
						amount,
						openedOn
					}),
					children: "Save"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-md border border-border px-4 py-2 text-sm font-semibold text-danger",
					onClick: onRemove,
					children: "Remove"
				})]
			}),
			row.paymentFileName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentReview, {
				id: row.id,
				name: row.paymentFileName,
				canReview: row.status === "instructions_sent",
				onChanged: onReload
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
function PaymentReview({ id, name, canReview, onChanged }) {
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)("");
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 border-t border-border pt-3 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-fg",
				children: ["Wire confirmation: ", name]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-md border border-border px-4 py-2 font-semibold text-primary",
					onClick: () => void open(),
					children: "View confirmation"
				}), canReview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-md bg-action px-4 py-2 font-semibold text-on-primary disabled:opacity-60",
					disabled: pending !== "",
					onClick: () => void approve(),
					children: pending === "approve" ? "Approving…" : "Approve payment"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-md border border-border px-4 py-2 font-semibold text-danger disabled:opacity-60",
					disabled: pending !== "",
					onClick: () => void reject(),
					children: pending === "reject" ? "Rejecting…" : "Reject file"
				})] }) : null]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-danger",
				children: error
			}) : null
		]
	});
}
function AdvisorsPanel() {
	const [rows, setRows] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)({
		id: "",
		name: "",
		phone: "",
		email: ""
	});
	const [error, setError] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	function load() {
		return listAdvisors().then(setRows);
	}
	(0, import_react.useEffect)(() => {
		load().catch(() => setError("Advisors could not be loaded."));
	}, []);
	async function save(event) {
		event.preventDefault();
		setError("");
		setNotice("");
		try {
			await saveAdvisor({ data: draft });
			setDraft({
				id: "",
				name: "",
				phone: "",
				email: ""
			});
			await load();
			setNotice("Advisor saved.");
		} catch {
			setError("Could not save this advisor.");
		}
	}
	async function remove(id) {
		setError("");
		try {
			await deleteAdvisor({ data: { id } });
			await load();
		} catch {
			setError("Could not remove this advisor.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "Advisors"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-fg",
			children: "Assign one of these advisors when a client investment needs a call."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-danger",
			children: error
		}) : null,
		notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-fg",
			children: notice
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 grid gap-3",
			children: (rows ?? []).map((advisor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-primary",
					children: advisor.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-fg",
					children: [advisor.phone || "No phone", advisor.email ? ` · ${advisor.email}` : ""]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 px-3 text-sm font-semibold text-primary",
						onClick: () => setDraft(advisor),
						children: "Edit"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 px-3 text-sm font-semibold text-primary",
						onClick: () => void remove(advisor.id),
						children: "Remove"
					})]
				})]
			}, advisor.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-6 grid gap-3 rounded-md border border-border bg-surface p-4 sm:grid-cols-2",
			onSubmit: (event) => void save(event),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold text-primary sm:col-span-2",
					children: draft.id ? "Edit advisor" : "Add advisor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
					label: "Name",
					value: draft.name,
					onChange: (name) => setDraft({
						...draft,
						name
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
					label: "Phone",
					value: draft.phone,
					onChange: (phone) => setDraft({
						...draft,
						phone
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminField, {
					label: "Email",
					value: draft.email,
					onChange: (email) => setDraft({
						...draft,
						email
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "min-h-11 rounded-md bg-action px-4 py-2 font-semibold text-on-primary",
						children: "Save advisor"
					})
				})
			]
		})
	] });
}
function ClientsPanel({ rows, onStatus, onRemove }) {
	const [pendingId, setPendingId] = (0, import_react.useState)(null);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const selected = rows.find((row) => row.id === selectedId) ?? null;
	async function openAs(id) {
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
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "text-3xl font-semibold",
		children: "Clients"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 rounded-lg border border-border bg-surface px-4 py-6 text-sm text-fg",
		children: "No approved clients yet."
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "Clients"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-fg",
			children: "Approved investors. Select a row to open the full application. Sign in as a client to open their portal."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-danger",
			children: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 overflow-x-auto rounded-lg border border-border bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[640px] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-border text-xs tracking-wide text-primary uppercase",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-semibold",
							children: "Client"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-semibold",
							children: "Account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-semibold",
							children: "Approved"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3 font-semibold" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "cursor-pointer border-b border-border last:border-0 " + (row.id === selectedId ? "bg-step-idle" : ""),
					onClick: () => setSelectedId(row.id),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-semibold text-primary",
								children: row.applicantName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: row.email
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: row.accountType
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [row.submittedAt, " UTC"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60",
								disabled: pendingId === row.id,
								onClick: (event) => {
									event.stopPropagation();
									openAs(row.id);
								},
								children: pendingId === row.id ? "Signing in…" : "Sign in as user"
							})
						})
					]
				}, row.id)) })]
			})
		}),
		selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplicationDetail, {
			row: selected,
			onStatus: (status) => onStatus(selected.id, status),
			onRemove: () => onRemove(selected.id)
		}) : null
	] });
}
var DESK_MENU = [
	{
		label: "Pipeline",
		items: [{
			id: "dashboard",
			label: "Dashboard"
		}, {
			id: "applications",
			label: "Applications"
		}]
	},
	{
		label: "Certificates",
		items: [
			{
				id: "funding",
				label: "Investments"
			},
			{
				id: "active",
				label: "Active CDs"
			},
			{
				id: "invoices",
				label: "Invoices"
			}
		]
	},
	{
		label: "Desk",
		items: [{
			id: "clients",
			label: "Clients"
		}, {
			id: "advisors",
			label: "Advisors"
		}]
	},
	{
		label: "Settings",
		items: [
			{
				id: "settings-general",
				label: "General"
			},
			{
				id: "settings-logos",
				label: "Logos"
			},
			{
				id: "settings-misc",
				label: "Misc"
			},
			{
				id: "emails",
				label: "Email templates"
			}
		]
	},
	{
		label: "Pricing",
		items: [{
			id: "investments",
			label: "Rates and promo"
		}]
	}
];
function DeskNav({ tab, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "grid content-start gap-6",
		"aria-label": "Desk",
		children: DESK_MENU.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-3 text-[11px] font-semibold tracking-widest text-[#8c8c8c] uppercase",
			children: group.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-1 grid gap-0.5",
			children: group.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
				active: tab === item.id,
				onClick: () => onSelect(item.id),
				children: item.label
			}) }, item.id))
		})] }, group.label))
	});
}
function TabButton({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "min-h-10 w-full rounded-lg px-3 py-2 text-left text-sm " + (active ? "bg-[#e8f4ff] font-semibold text-action" : "font-medium text-primary hover:bg-white"),
		"aria-current": active ? "page" : void 0,
		onClick,
		children
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-surface px-4 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold tracking-widest text-primary uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-3xl font-semibold",
			children: rowsafe(value)
		})]
	});
}
function rowsafe(value) {
	return Number.isFinite(value) ? value : 0;
}
function ApplicationTable({ rows, selectedId, onSelect }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 rounded-lg border border-border bg-surface px-4 py-6 text-sm text-fg",
		children: "No applications in this view."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 overflow-x-auto rounded-lg border border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[640px] text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "border-b border-border text-xs tracking-wide text-primary uppercase",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 font-semibold",
						children: "Applicant"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 font-semibold",
						children: "Account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 font-semibold",
						children: "Status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 font-semibold",
						children: "Submitted"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "cursor-pointer border-b border-border last:border-0 " + (row.id === selectedId ? "bg-step-idle" : ""),
				onClick: () => onSelect(row.id),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-semibold text-primary",
							children: row.applicantName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: row.email
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3",
						children: row.accountType
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-3 capitalize",
						children: row.status === "hold" ? "On hold" : row.status
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "px-4 py-3",
						children: [row.submittedAt, " UTC"]
					})
				]
			}, row.id)) })]
		})
	});
}
function StoredDocument({ label, name, file }) {
	const ready = Boolean(file?.startsWith("data:"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-wide text-primary uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-fg",
				children: name || "No file"
			}),
			ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-md bg-action px-3 py-2 text-sm font-semibold text-on-primary",
					onClick: () => openStoredFile(file, name, false),
					children: "View"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary",
					onClick: () => openStoredFile(file, name, true),
					children: "Download"
				})]
			}) : name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-fg",
				children: "Only the file name was saved. Ask the applicant to submit the document again."
			}) : null
		]
	});
}
function openStoredFile(file, name, download) {
	const [meta, data] = file.split(",");
	const mime = meta.match(/data:(.*);base64/)?.[1] ?? "application/octet-stream";
	const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
	const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
	const link = document.createElement("a");
	link.href = url;
	if (download) link.download = name || "document";
	else link.target = "_blank";
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 6e4);
}
function ApplicationDetail({ row, onStatus, onRemove }) {
	const form = row.payload;
	const fields = [
		["Account", form.accountType],
		["Phone", `${form.phoneCountry} ${form.phone}`],
		["Date of birth", [
			form.dobDay,
			form.dobMonth,
			form.dobYear
		].filter(Boolean).join(" ")],
		["Nationality", form.nationality],
		["Residence", form.residence],
		["Occupation", form.occupation],
		["Address", [
			form.street,
			form.apt,
			form.city,
			form.region,
			form.postal,
			form.country
		].filter(Boolean).join(", ")],
		["Tax residence", form.taxResidence],
		["Tax ID", form.taxId],
		["Source of wealth", form.sourceOfWealth],
		["Source of funds", form.sourceOfFunds],
		["Purpose", form.investmentPurpose],
		["Net worth", form.netWorth],
		["Preferred amount", form.preferredAmount],
		["Preferred term", form.preferredTerm ? `${form.preferredTerm}-month` : ""],
		["Identity document", `${form.idType}${form.idFileName ? ` · ${form.idFileName}` : ""}`],
		["Address document", `${form.addressDocType}${form.addressFileName ? ` · ${form.addressFileName}` : ""}`],
		["Bank", form.bankName],
		["Account holder", form.accountHolder],
		["Bank address", [
			form.bankStreet,
			form.bankLine2,
			form.bankCity,
			form.bankState,
			form.bankZip
		].filter(Boolean).join(", ")],
		["Routing number", form.routingNumber],
		["Account number", form.accountNumber]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mt-4 rounded-lg border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold text-primary",
						children: row.applicantName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg",
						children: row.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-fg",
						children: row.status === "approved" ? "Sign-in is active. The investor portal opens with this email and the application password." : "Approving creates a sign-in and opens the investor portal with this email and the application password."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-md bg-action px-3 py-2 text-sm font-semibold text-on-primary",
							onClick: () => onStatus("approved"),
							children: "Approve"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary",
							onClick: () => onStatus("hold"),
							children: "Hold"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary",
							onClick: () => onStatus("pending"),
							children: "Pending"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-danger",
							onClick: onRemove,
							children: "Remove"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: fields.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-xs font-semibold tracking-wide text-primary uppercase",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "text-sm text-fg",
					children: value || "—"
				})] }, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoredDocument, {
					label: "Identity document",
					name: form.idFileName,
					file: form.idFile
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoredDocument, {
					label: "Address document",
					name: form.addressFileName,
					file: form.addressFile
				})]
			}),
			form.signature?.startsWith("data:image/") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-wide text-primary uppercase",
					children: "Signature"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: form.signature,
					alt: "Applicant signature",
					className: "mt-2 h-24 rounded-md border border-border bg-white object-contain"
				})]
			}) : null
		]
	});
}
//#endregion
export { AdminPage as component };
