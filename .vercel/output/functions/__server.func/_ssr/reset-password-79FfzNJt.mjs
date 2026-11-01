import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as headerActionClass, r as SiteHeader } from "./router-BgWJKDCs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-79FfzNJt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordPage() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [sent, setSent] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
			eyebrow: "Investor access",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: headerActionClass,
				children: "Sign in"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-md flex-col justify-center px-4 py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-surface px-6 py-10 shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-4xl font-semibold tracking-tight",
						children: "Reset password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "Enter the email on your account. We will send reset instructions."
					}),
					sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-8 rounded-md border border-border bg-surface px-4 py-3 text-sm",
						role: "status",
						children: [
							"If an account exists for ",
							email,
							", reset instructions are on the way."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-8 grid gap-5",
						onSubmit: (event) => {
							event.preventDefault();
							setSent(true);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
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
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "min-h-12 rounded-md bg-action py-3 font-semibold text-on-primary hover:bg-action-deep",
							children: "Send reset link"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-center text-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "font-semibold text-primary",
							children: "Return to sign in"
						})
					})
				]
			})
		})]
	});
}
//#endregion
export { ResetPasswordPage as component };
