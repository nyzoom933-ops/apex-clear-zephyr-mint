import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as investorLogin, i as headerActionClass, n as AppCover, r as SiteHeader } from "./router-BgWJKDCs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CGb1faeW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [verified, setVerified] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	async function onSubmit(event) {
		event.preventDefault();
		if (!email.trim() || !password) {
			setError("Enter your email address and password.");
			return;
		}
		if (!verified) {
			setError("Security verification could not complete. Retry below. If it continues, reload the page or try another connection.");
			return;
		}
		let destination = "application";
		try {
			destination = (await investorLogin({ data: {
				email,
				password
			} })).destination;
		} catch {
			setError("Those credentials are not recognized.");
			return;
		}
		if ((new URLSearchParams(window.location.search).get("redirectTo") ?? "") === "/reset-password") {
			navigate({ to: "/reset-password" });
			return;
		}
		navigate({ to: destination === "portal" ? "/portal" : "/application" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
				eyebrow: "Investor access",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/application",
					className: headerActionClass,
					children: "Begin an application"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppCover, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-md flex-col justify-center px-4 py-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-surface px-6 py-10 shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-4xl font-semibold tracking-tight",
							children: "Sign in"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: "Enter your credentials to access your account."
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
										autoComplete: "email",
										value: email,
										onChange: (event) => setEmail(event.target.value),
										className: "w-full rounded-md border border-border bg-surface px-3.5 py-3 text-base outline-none focus:border-primary"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mb-1.5 flex items-center justify-between",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "password",
											className: "text-sm font-medium",
											children: "Password"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "password",
											required: true,
											type: showPassword ? "text" : "password",
											autoComplete: "current-password",
											placeholder: "Enter your password",
											value: password,
											onChange: (event) => setPassword(event.target.value),
											className: "w-full rounded-md border border-border bg-surface px-3.5 py-3 pr-16 text-base outline-none focus:border-primary"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "absolute top-1/2 right-3 -translate-y-1/2 text-sm font-semibold text-primary",
											onClick: () => setShowPassword((value) => !value),
											children: showPassword ? "Hide" : "Show"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/reset-password",
											className: "text-sm font-semibold text-primary",
											children: "Reset password"
										})
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md border border-border bg-surface px-4 py-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex min-h-11 items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												className: "size-5 accent-primary",
												checked: verified,
												onChange: (event) => {
													setVerified(event.target.checked);
													setError("");
												}
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm",
												children: "Verify you are human"
											})]
										}),
										error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-sm text-danger",
											role: "alert",
											children: [
												error,
												" ",
												error.startsWith("Security") ? "(Reference: 600010)" : null
											]
										}) : null,
										error.startsWith("Security") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "mt-2 text-sm font-semibold text-primary",
											onClick: () => setVerified(false),
											children: "Retry verification"
										}) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "min-h-12 rounded-md bg-action py-3 font-semibold text-on-primary hover:bg-action-deep",
									children: "Sign in"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-8 text-center text-sm text-muted",
							children: [
								"New investor?",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/application",
									className: "font-semibold text-primary",
									children: "Begin an application"
								})
							]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { LoginPage as component };
