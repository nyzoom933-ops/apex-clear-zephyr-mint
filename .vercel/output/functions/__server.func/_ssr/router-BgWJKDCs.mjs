import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { a as cleanPublicDomain, i as cleanCompanyName, n as cleanBackupEmail, o as cloudflareToken, s as env, t as DEFAULT_COMPANY_NAME } from "./env.server-CXxi_iUv.mjs";
import { S as require_jsx_runtime, X as require_react, _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, q as redirect, v as createRootRoute, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { r as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as GlobalWorkerOptions } from "../_libs/pdfjs-dist.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BgWJKDCs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function staleModule(error) {
	const message = errorMessage(error);
	return message.includes("dynamically imported module") || message.includes("Importing a module script failed");
}
function AppErrorComponent({ error }) {
	(0, import_react.useEffect)(() => {
		if (!staleModule(error)) return;
		const key = "ah-chunk-reload";
		if (sessionStorage.getItem(key) === "1") return;
		sessionStorage.setItem(key, "1");
		window.location.reload();
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: staleModule(error) ? "The page was updated. Reload to open the latest version." : errorMessage(error)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-2 min-h-11 rounded-md bg-[#006fcf] px-4 py-2 text-sm font-semibold text-white",
				onClick: () => window.location.reload(),
				children: "Reload"
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getAdminSession = createServerFn({ method: "GET" }).handler(createSsrRpc("e79aab6a9c5d4179f7a176a6a650c1161fe7e7439ce653697dcfba8240b8006e"));
var adminLogin = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("89f029f4fc21ed092423cd54f44fb61078423691288a3a89663a6e0973cd86ea"));
var createDeskLogin = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("6e1efb263437baa4a649ac0395fdbd6290df839cd5f5e0afeb5b6fd9c9ff443f"));
var saveDeskLogin = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("765c7c71751ca870f5f7258b7f800a304c6a7ca77be480b2eeb48d9bf4356d6d"));
var adminLogout = createServerFn({ method: "POST" }).handler(createSsrRpc("b778199f0067dc3af0626a35537d9640eabb3a694e5f097e062cd440c74c2c03"));
var submitApplication = createServerFn({ method: "POST" }).validator((input) => {
	if (!input.password || input.password.length < 8) throw new Error("A password is required.");
	return input;
}).handler(createSsrRpc("8f2bb3bdd3e9a32bf9d20870c5b92b09afddb820fe7293f95701022b9848bc75"));
var getLeadInvite = createServerFn({ method: "GET" }).validator((input) => ({ token: (input.token || "").trim().slice(0, 80) })).handler(createSsrRpc("ea4f60a01a023ec8cd6db20b195514b2ab1f80974d6ac0d3302fc7b691665a83"));
var listApplications = createServerFn({ method: "GET" }).handler(createSsrRpc("1b59404f5dd7ebf22a4802040e66ad34f86c454a3111963b9acb931d6cb5f54e"));
var setApplicationStatus = createServerFn({ method: "POST" }).validator((input) => {
	if (![
		"pending",
		"approved",
		"hold"
	].includes(input.status)) throw new Error("Unknown status.");
	return input;
}).handler(createSsrRpc("dd2a8c89ce3736258bb458077f853a2565c444665a699be34aede0a82db3cbaf"));
var deleteApplication = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("7123a0f1827ab182e080b8ee5731e8656bf3eda9f728947ac3649ee265ee4bda"));
var clearDatabase = createServerFn({ method: "POST" }).handler(createSsrRpc("343321a975f0f5b1926cf4a4b702a28553cc355cbf8a5f1ca79197a7593bb8cf"));
var deleteFunding = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("4e0ee8356c5ccf6f9221df4d98ab36de6079de15b47569f344278a4287a5594b"));
var signInAsClient = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("c50efd40f7ae5cda51cd811e78d0e181402c25d11e95d42ed97f5803896f8074"));
var investorLogin = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("15bb4887dde39d3cd45f0ac0f1099831bb1e30bc708e9002486e6ac16d71333a"));
var DEFAULT_THEME = {
	colorAction: "#006fcf",
	colorHeading: "#12315c",
	colorText: "#3d3d3d",
	colorLabel: "#262626",
	colorBorder: "#e0e0e0",
	colorBackground: "#fbfbfb"
};
function cleanHex(value, fallback) {
	const next = (value || "").trim();
	if (!next) return fallback;
	if (!/^#[0-9a-fA-F]{6}$/.test(next)) throw new Error("Use a color like #006fcf.");
	return next.toLowerCase();
}
function assertPageBackground(value) {
	if (!value || value === "none") return value === "none" ? "none" : null;
	return assertShareImage(value);
}
function assertShareImage(value) {
	if (!value) return null;
	if (!/^data:image\/(png|jpeg);base64,/.test(value) || value.length > 14e5) throw new Error("Use a JPEG or PNG under 1 MB.");
	return value;
}
function assertImage(value) {
	if (!value) return null;
	if (!value.startsWith("data:image/") || value.length > 5e5) throw new Error("Use an image under 400 KB.");
	return value;
}
var getSiteBrand = createServerFn({ method: "GET" }).handler(createSsrRpc("48d5a6ea211957ef115da61e253a9c39f785ebf602da2d8a44e4178e61018144"));
var setSiteBrand = createServerFn({ method: "POST" }).validator((input) => ({
	logo: assertImage(input.logo),
	favicon: assertImage(input.favicon),
	companyName: cleanCompanyName(input.companyName || "Account Holding"),
	cloudflareCode: input.cloudflareCode || "",
	cover: assertShareImage(input.cover),
	socialBanner: assertShareImage(input.socialBanner),
	emailLogo: assertImage(input.emailLogo),
	footerLogo: assertImage(input.footerLogo),
	footerText: (input.footerText || "").slice(0, 800),
	backupEmail: cleanBackupEmail(input.backupEmail || ""),
	lastBackupAt: input.lastBackupAt || "",
	publicDomain: cleanPublicDomain(input.publicDomain || ""),
	colorAction: cleanHex(input.colorAction, DEFAULT_THEME.colorAction),
	colorHeading: cleanHex(input.colorHeading, DEFAULT_THEME.colorHeading),
	colorText: cleanHex(input.colorText, DEFAULT_THEME.colorText),
	colorLabel: cleanHex(input.colorLabel, DEFAULT_THEME.colorLabel),
	colorBorder: cleanHex(input.colorBorder, DEFAULT_THEME.colorBorder),
	colorBackground: cleanHex(input.colorBackground, DEFAULT_THEME.colorBackground),
	pageBackground: assertPageBackground(input.pageBackground)
})).handler(createSsrRpc("46b1c2c15b64cae3a5f34e1f1853ec2283ddfdfe186c71434db5870369340362"));
var runDatabaseBackup = createServerFn({ method: "POST" }).handler(createSsrRpc("6d04e2b2142ca7fdd455d85b986e7dc11f966e7df5a2ab55be070d017bdfb090"));
var getMailSetup = createServerFn({ method: "GET" }).handler(createSsrRpc("19f1231488dc5a012a40246146c49a527b94c53d3a06a4387cc28d0d8f08e030"));
var saveMailSetup = createServerFn({ method: "POST" }).validator((input) => ({
	apiKey: input.apiKey || "",
	mailFrom: input.mailFrom || "",
	clearKey: Boolean(input.clearKey)
})).handler(createSsrRpc("1b0a37303ffbd8eb9e7d9ffb7033bf9c04a2d7776b7ca0438dc0376b0f8319cb"));
var saveSmtpSetup = createServerFn({ method: "POST" }).validator((input) => ({
	apiKey: input.apiKey || "",
	clearKey: Boolean(input.clearKey)
})).handler(createSsrRpc("53eddeec68c65dab79a58ff3da78a86c23a311a0fd114a80d1bce986b77ddd5d"));
var getInvestorSession = createServerFn({ method: "GET" }).handler(createSsrRpc("d1ae43cae6d0be2d1f69d39a6ad79c690664eebd84c9b6bfd72617c644ea6513"));
var getInvestorPortal = createServerFn({ method: "GET" }).handler(createSsrRpc("8822e6aa5afc9ef8a0275f464bef174b9273dd274d0ef1ea1c5de2610cd2b22d"));
var investorLogout = createServerFn({ method: "POST" }).handler(createSsrRpc("238daabfda5c31e82d6a467078e892b727c983c5c9d29aa504fae0102a20f263"));
var getCdTerms = createServerFn({ method: "GET" }).handler(createSsrRpc("1d916ce53ed1636f14f29e607d03cd01c89f6e35b988da74a2dc466789b5ee25"));
var saveCdTerms = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("cd1fbe67fd52ea928df985cb29f4a0ad9e2a1ba0b044e5e598e5be1cbb04b220"));
var getPromo = createServerFn({ method: "GET" }).handler(createSsrRpc("28f25c5a8580090bdf548d7bf75d08544cfe13fdbdcb7b4bd24ed2098d8f3703"));
var savePromo = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("fe12b8e84d6c20adda97886a656f77d13598a1a522761d051162002f72576797"));
var getInvestmentTypes = createServerFn({ method: "GET" }).handler(createSsrRpc("0188318a2c47fa577e85feac06e6f5e249d0b6c7e53b943032e8bf9cbd432ce9"));
var saveInvestmentType = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("5edd854841c5220bfdf7cd162ccff167680add27784ef7b26a1accec376751da"));
var getMyFundings = createServerFn({ method: "GET" }).handler(createSsrRpc("371eaa94c7375a34014cafb3e1a903c29a0227fb832652248e5dfd387c9b158c"));
var submitFunding = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("e7d636636dc82c29558eb161011e78a0c993c313f396b7945fbd947e74255a10"));
var cancelFunding = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("7a25bb9444ff54d726f867aa071c78571c98f0852fce3af75bf6e281aaee9022"));
var sendLeadIntro = createServerFn({ method: "POST" }).validator((input) => {
	const name = input.name.trim().replace(/\s+/g, " ");
	const email = input.email.trim().toLowerCase();
	if (name.length < 2 || name.length > 80) throw new Error("Enter the lead's name.");
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter the lead's email.");
	if (!input.advisorId) throw new Error("Select an advisor.");
	const clip = (value, max) => (value || "").trim().slice(0, max);
	const copy = input.copy ? {
		subject: clip(input.copy.subject, 140),
		headline: clip(input.copy.headline, 180),
		welcome: clip(input.copy.welcome, 800),
		certificate: clip(input.copy.certificate, 500),
		offer: clip(input.copy.offer, 800),
		protection: clip(input.copy.protection, 500),
		ready: clip(input.copy.ready, 500),
		thanks: clip(input.copy.thanks, 400)
	} : null;
	return {
		advisorId: input.advisorId,
		name,
		email,
		copy
	};
}).handler(createSsrRpc("46006108a43b5955e153161c38d4a991ad7fb79bc7fb49b43872dc805a179a48"));
var sendLeadApplication = createServerFn({ method: "POST" }).validator((input) => {
	const name = input.name.trim().replace(/\s+/g, " ");
	const email = input.email.trim().toLowerCase();
	const months = Number(input.months);
	const kind = input.kind === "promo" ? "promo" : "custom";
	if (name.length < 2 || name.length > 80) throw new Error("Enter the lead's name.");
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter the lead's email.");
	if (!input.advisorId) throw new Error("Select an advisor.");
	if (!Number.isFinite(months) || months <= 0) throw new Error("Choose a certificate term.");
	const clip = (value, max) => (value || "").trim().slice(0, max);
	const copy = input.copy ? {
		subject: clip(input.copy.subject, 140),
		headline: clip(input.copy.headline, 180),
		hope: clip(input.copy.hope, 240),
		ready: clip(input.copy.ready, 800),
		instruction: clip(input.copy.instruction, 400),
		codeNote: clip(input.copy.codeNote, 400),
		followUp: clip(input.copy.followUp, 800),
		thanks: clip(input.copy.thanks, 400),
		promoCode: clip(input.copy.promoCode, 40)
	} : null;
	return {
		advisorId: input.advisorId,
		name,
		email,
		months,
		kind,
		copy
	};
}).handler(createSsrRpc("d4250d8ea37b0b6b6cc32aa247924d01849410ab372bc6eae17665d3df82d42e"));
var listCrmLeads = createServerFn({ method: "GET" }).handler(createSsrRpc("a1d7ac3394c7cf21e5123b186412df53214aea42f0c665a9437b989c15ea8a03"));
var saveCrmLead = createServerFn({ method: "POST" }).validator((input) => {
	const name = input.name.trim().replace(/\s+/g, " ");
	const email = input.email.trim().toLowerCase();
	if (name.length < 2) throw new Error("Enter the lead's name.");
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email or leave it blank.");
	const received = new Date(input.receivedAt || Date.now());
	if (Number.isNaN(received.getTime())) throw new Error("Enter when the lead was received.");
	const clip = (value) => (value || "").trim().slice(0, 240);
	return {
		id: input.id || "",
		name: name.slice(0, 120),
		email,
		phone: clip(input.phone),
		amount: clip(input.amount),
		term: clip(input.term),
		objective: clip(input.objective),
		liquidity: clip(input.liquidity),
		source: clip(input.source),
		receivedAt: received.toISOString()
	};
}).handler(createSsrRpc("320d5ad8293a8028b17b2a0c8ba59e0d25494a6dafccb7a8797177a2d0495ec8"));
var deleteCrmLead = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("1d3491e9a27c290f295bfb69f2dd0ee4ad31f715b28d28a35caa1a9795dd1685"));
var listAdvisors = createServerFn({ method: "GET" }).handler(createSsrRpc("0a4e4b3c4401fa3b3502245b8864092fe1dfbf357dc425ac9e606cc03de423a5"));
var saveAdvisor = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("c22e4f32fb4962874ec7588e1e0ddec4eddb22eaa12f9f6151d706503efd2f50"));
var deleteAdvisor = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("adcbca43e56dbbae11c96adf856861fa5bc00e25f0f7449583c4ec9b411e38d6"));
var listFundings = createServerFn({ method: "GET" }).handler(createSsrRpc("fcde75496a4a883be99631cbde15fcf5e2c6609cc6764c5351fe6366e3922405"));
var updateFunding = createServerFn({ method: "POST" }).validator((input) => {
	if (![
		"pending",
		"approved_phone",
		"instructions_sent",
		"payment_approved",
		"cancelled"
	].includes(input.status)) throw new Error("Unknown status.");
	const depositCode = input.depositCode.trim();
	const depositNumber = input.depositNumber.trim();
	const accountNumber = input.accountNumber.trim();
	const referenceNumber = input.referenceNumber.trim();
	if (!depositCode || !depositNumber || !accountNumber || !referenceNumber) throw new Error("Fill in every reference field.");
	const openedOn = input.openedOn.trim();
	if (!/^\d{4}-\d{2}-\d{2}$/.test(openedOn)) throw new Error("Enter the certificate date.");
	const numeric = Number(input.amount.replace(/[^0-9.]/g, ""));
	if (!Number.isFinite(numeric) || numeric <= 0) throw new Error("Enter an investment amount.");
	const amount = numeric.toLocaleString("en-US", {
		style: "currency",
		currency: "USD"
	});
	return {
		...input,
		depositCode,
		depositNumber,
		accountNumber,
		referenceNumber,
		amount,
		openedOn
	};
}).handler(createSsrRpc("2f83f4b9946b9da9bedd5b26404c83efb0b680df2d872ad2ea3fa0ce99fcd863"));
var uploadPaymentConfirmation = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("7dfd9b8a9038d0c6d84532cfdd58c0318d9fd8830fd7a88e28882e95dfaf5b9a"));
var getPaymentFile = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("670101ceb9a8c4921096966f8043a6883d6040bc7c4869c99684ec1805a93a9d"));
var approvePayment = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("be572942eeb298238365c54abae7a3b9a7377c3f9af2e62338f4a18ac7ca30c6"));
var rejectPayment = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("2e2eafc3c130800cd476299ebeff265ed2f9d9548eb67737a5d554f9e06a20e8"));
var signFunding = createServerFn({ method: "POST" }).validator((input) => ({
	id: input.id,
	signature: input.signature,
	contactPhone: (input.contactPhone || "").trim().slice(0, 80),
	contactBy: input.contactBy === "email" ? "email" : "call"
})).handler(createSsrRpc("36d26e5dce43d3d3a77fb6d34d8199bf57c9136b23385e8382c2cf06b4630848"));
var downloadInvestmentPdf = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("77d03951a209f31c50c597255d022704b13de997f740c7fb04bbbdb2cc02d8ee"));
var downloadInvoicePdf = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("219438d22bbc21708bd4abc3bd7eddea3cd96ec5b11376a18ba34dd62bba657c"));
var saveInvoiceBilling = createServerFn({ method: "POST" }).validator((input) => {
	const billing = { ...input.billing };
	Object.keys(billing).forEach((key) => {
		billing[key] = String(billing[key] ?? "").trim();
	});
	if (!billing.bankName || !billing.accountName || !billing.beneficiaryAddress || !billing.accountNumber || !billing.routingNumber || !billing.crn || !billing.purpose) throw new Error("Fill in every billing field.");
	return {
		id: input.id,
		billing
	};
}).handler(createSsrRpc("65a7a10b5c938741219fad35d71a6925b4094c3763aee671945a0ed540ab4900"));
var approveInvoice = createServerFn({ method: "POST" }).validator((input) => {
	const billing = { ...input.billing };
	Object.keys(billing).forEach((key) => {
		billing[key] = String(billing[key] ?? "").trim();
	});
	if (!billing.bankName || !billing.accountName || !billing.beneficiaryAddress || !billing.accountNumber || !billing.routingNumber || !billing.crn || !billing.purpose) throw new Error("Fill in every billing field.");
	return {
		id: input.id,
		billing
	};
}).handler(createSsrRpc("bd6078a16a27d37284969ff6fdbb85e565608b225b79da5f7e5edee1af8cc404"));
var listNotifications = createServerFn({ method: "GET" }).handler(createSsrRpc("7b50bd6e596679fe8759352efff6da788bf65b5c6f4458e7d4e70bcd96c23585"));
var syncMailStatuses = createServerFn({ method: "POST" }).handler(createSsrRpc("be53b2628abbad2d5bf831bbb6156af68ccb69338b6750eaa7b194b534d22dd9"));
var listMyNotifications = createServerFn({ method: "GET" }).handler(createSsrRpc("8b04ddee08d00402f35af241b8797321407d2743498150ff1167939f742f711c"));
var markMyNotificationsRead = createServerFn({ method: "POST" }).handler(createSsrRpc("15dca57f795e6ae56b7ab042755d2eeb7fb1aee841f555b937707d59a5fcbb88"));
var BrandContext = (0, import_react.createContext)({
	logo: null,
	favicon: null,
	companyName: DEFAULT_COMPANY_NAME,
	cloudflareCode: "",
	cover: null,
	socialBanner: null,
	emailLogo: null,
	footerLogo: null,
	footerText: "",
	backupEmail: "",
	lastBackupAt: "",
	publicDomain: "",
	...DEFAULT_THEME,
	pageBackground: null,
	ready: false,
	refresh: async () => {}
});
function useBrand() {
	return (0, import_react.useContext)(BrandContext);
}
function BrandProvider({ children }) {
	const [brand, setBrand] = (0, import_react.useState)({
		logo: null,
		favicon: null,
		companyName: DEFAULT_COMPANY_NAME,
		cloudflareCode: "",
		cover: null,
		socialBanner: null,
		emailLogo: null,
		footerLogo: null,
		footerText: "",
		backupEmail: "",
		lastBackupAt: "",
		publicDomain: "",
		...DEFAULT_THEME,
		pageBackground: null
	});
	const [ready, setReady] = (0, import_react.useState)(false);
	async function refresh() {
		const next = await getSiteBrand();
		setBrand(next);
		setReady(true);
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => setReady(true));
	}, []);
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		root.style.setProperty("--color-action", brand.colorAction);
		root.style.setProperty("--color-heading", brand.colorHeading);
		root.style.setProperty("--color-fg", brand.colorText);
		root.style.setProperty("--color-primary", brand.colorLabel);
		root.style.setProperty("--color-border", brand.colorBorder);
		root.style.setProperty("--color-bg", brand.colorBackground);
		const picture = brand.pageBackground;
		if (picture === "none") root.style.setProperty("--page-bg-layers", "none");
		else if (picture?.startsWith("data:image/")) root.style.setProperty("--page-bg-layers", `linear-gradient(rgb(255 255 255 / 30%), rgb(255 255 255 / 30%)), url("${picture}")`);
		else root.style.removeProperty("--page-bg-layers");
	}, [
		brand.colorAction,
		brand.colorHeading,
		brand.colorText,
		brand.colorLabel,
		brand.colorBorder,
		brand.colorBackground,
		brand.pageBackground
	]);
	(0, import_react.useEffect)(() => {
		if (!brand.favicon) return;
		let link = document.querySelector("link[rel='icon']");
		if (!link) {
			link = document.createElement("link");
			link.rel = "icon";
			document.head.appendChild(link);
		}
		link.href = brand.favicon;
		const mime = brand.favicon.slice(5, brand.favicon.indexOf(";"));
		if (mime) link.type = mime;
	}, [brand.favicon]);
	(0, import_react.useEffect)(() => {
		const token = cloudflareToken(brand.cloudflareCode);
		const current = document.getElementById("cf-beacon");
		if (!token) {
			current?.remove();
			return;
		}
		if (current?.getAttribute("data-token") === token) return;
		current?.remove();
		const script = document.createElement("script");
		script.id = "cf-beacon";
		script.defer = true;
		script.src = "https://static.cloudflareinsights.com/beacon.min.js";
		script.setAttribute("data-token", token);
		script.setAttribute("data-cf-beacon", JSON.stringify({ token }));
		document.body.appendChild(script);
	}, [brand.cloudflareCode]);
	const appliedName = (0, import_react.useRef)(DEFAULT_COMPANY_NAME);
	(0, import_react.useEffect)(() => {
		const next = brand.companyName || "Account Holding";
		const apply = () => {
			let title = document.title;
			const previous = appliedName.current;
			if (previous !== next && title.includes(previous)) title = title.replaceAll(previous, next);
			if (next !== "Account Holding" && title.includes("Account Holding")) title = title.replaceAll(DEFAULT_COMPANY_NAME, next);
			if (title !== document.title) document.title = title;
		};
		apply();
		appliedName.current = next;
		const title = document.querySelector("title");
		if (!title) return;
		const observer = new MutationObserver(apply);
		observer.observe(title, {
			childList: true,
			characterData: true,
			subtree: true
		});
		return () => observer.disconnect();
	}, [brand.companyName]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandContext.Provider, {
		value: {
			...brand,
			ready,
			refresh
		},
		children
	});
}
function AppCover() {
	const { cover } = useBrand();
	if (!cover) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: cover,
			alt: "",
			className: "mx-auto h-48 w-full max-w-6xl object-cover sm:h-64"
		})
	});
}
var headerActionClass = "inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary";
function SiteHeader({ eyebrow, action }) {
	const { logo, companyName } = useBrand();
	const name = companyName || "Account Holding";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "border-b border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: logo,
					alt: name,
					className: "h-8 w-auto max-w-[180px] object-contain"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold tracking-wide text-primary",
					children: name.toUpperCase()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs font-semibold tracking-widest text-action uppercase",
					children: eyebrow
				})]
			}), action]
		})
	});
}
var styles_default = "/assets/styles-BQ_7Vk7K.css";
var APP_NAME = "Account Holding";
var Route$9 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Open an investor account relationship. Complete the application in one session."
			},
			{
				name: "theme-color",
				content: "#2E77BB"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: `(function(){var key="ah-chunk-reload";window.addEventListener("vite:preloadError",function(event){event.preventDefault();if(sessionStorage.getItem(key)==="1")return;sessionStorage.setItem(key,"1");window.location.reload();});window.addEventListener("load",function(){sessionStorage.removeItem(key);});})();` } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var Route$8 = createFileRoute("/")({ beforeLoad: () => {
	throw redirect({ to: "/login" });
} });
var $$splitComponentImporter$4 = () => import("./admin-CchV_OX-.mjs");
var Route$7 = createFileRoute("/admin")({
	head: () => ({ meta: [{ title: "Operations · Account Holding" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./application-CW8MmZBu.mjs");
var Route$6 = createFileRoute("/application")({
	head: () => ({ meta: [{ title: "Application · Account Holding" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var Route$5 = createFileRoute("/email-logo")({ server: { handlers: { GET: async () => {
	const { getSql } = await import("./db-8lvi3Ffs.mjs");
	const match = ((await (await getSql())`select value from site_settings where key = 'email_logo'`)[0]?.value?.trim() || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=\s]+)$/);
	if (!match?.[2]) return new Response("Not found", { status: 404 });
	const bytes = Uint8Array.from(Buffer.from(match[2].replace(/\s/g, ""), "base64"));
	return new Response(bytes, { headers: {
		"Content-Type": match[1] || "image/png",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter$2 = () => import("./login-CGb1faeW.mjs");
var Route$4 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Sign in · Account Holding" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var pdf_worker_min_default = "/assets/pdf.worker.min-CjEcRF4W.mjs";
var $$splitComponentImporter$1 = () => import("./portal-Bw1mVkI4.mjs");
var Route$3 = createFileRoute("/portal")({
	head: () => ({ meta: [{ title: "Portal · Account Holding" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
GlobalWorkerOptions.workerSrc = pdf_worker_min_default;
var $$splitComponentImporter = () => import("./reset-password-79FfzNJt.mjs");
var Route$2 = createFileRoute("/reset-password")({
	head: () => ({ meta: [{ title: "Reset password · Account Holding" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route$1 = createFileRoute("/api/cron/backup")({ server: { handlers: { GET: async ({ request }) => {
	const secret = env("CRON_SECRET");
	const authorization = request.headers.get("authorization");
	const fromCron = request.headers.get("user-agent") === "vercel-cron/1.0";
	if (secret) {
		if (authorization !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
	} else if (!fromCron) return new Response("Unauthorized", { status: 401 });
	const { runBackup } = await import("./backup.server-skMXqjk0.mjs");
	const result = await runBackup();
	return Response.json(result);
} } } });
var Route = createFileRoute("/api/cron/lead-reminders")({ server: { handlers: { GET: async ({ request }) => {
	const secret = env("CRON_SECRET");
	const authorization = request.headers.get("authorization");
	const fromCron = request.headers.get("user-agent") === "vercel-cron/1.0";
	if (secret) {
		if (authorization !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
	} else if (!fromCron) return new Response("Unauthorized", { status: 401 });
	const { remindDueInvites } = await import("./lead-invites.server-DBOhEbbT.mjs");
	return Response.json(await remindDueInvites());
} } } });
var rootRouteChildren = {
	IndexRoute: Route$8.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$9
	}),
	AdminRoute: Route$7.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$9
	}),
	ApplicationRoute: Route$6.update({
		id: "/application",
		path: "/application",
		getParentRoute: () => Route$9
	}),
	EmailLogoRoute: Route$5.update({
		id: "/email-logo",
		path: "/email-logo",
		getParentRoute: () => Route$9
	}),
	LoginRoute: Route$4.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$9
	}),
	PortalRoute: Route$3.update({
		id: "/portal",
		path: "/portal",
		getParentRoute: () => Route$9
	}),
	ResetPasswordRoute: Route$2.update({
		id: "/reset-password",
		path: "/reset-password",
		getParentRoute: () => Route$9
	}),
	ApiCronBackupRoute: Route$1.update({
		id: "/api/cron/backup",
		path: "/api/cron/backup",
		getParentRoute: () => Route$9
	}),
	ApiCronLeadRemindersRoute: Route.update({
		id: "/api/cron/lead-reminders",
		path: "/api/cron/lead-reminders",
		getParentRoute: () => Route$9
	})
};
var routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { setSiteBrand as $, investorLogin as A, runDatabaseBackup as B, getInvestorPortal as C, getMyFundings as D, getMailSetup as E, listFundings as F, saveInvestmentType as G, saveCdTerms as H, listMyNotifications as I, savePromo as J, saveInvoiceBilling as K, listNotifications as L, listAdvisors as M, listApplications as N, getPaymentFile as O, listCrmLeads as P, setApplicationStatus as Q, markMyNotificationsRead as R, getInvestmentTypes as S, getLeadInvite as T, saveCrmLead as U, saveAdvisor as V, saveDeskLogin as W, sendLeadApplication as X, saveSmtpSetup as Y, sendLeadIntro as Z, deleteFunding as _, useBrand as a, updateFunding as at, getAdminSession as b, adminLogout as c, cancelFunding as d, signFunding as et, clearDatabase as f, deleteCrmLead as g, deleteApplication as h, headerActionClass as i, syncMailStatuses as it, investorLogout as j, getPromo as k, approveInvoice as l, deleteAdvisor as m, AppCover as n, submitApplication as nt, DEFAULT_THEME as o, uploadPaymentConfirmation as ot, createDeskLogin as p, saveMailSetup as q, SiteHeader as r, submitFunding as rt, adminLogin as s, router_exports as t, signInAsClient as tt, approvePayment as u, downloadInvestmentPdf as v, getInvestorSession as w, getCdTerms as x, downloadInvoicePdf as y, rejectPayment as z };
