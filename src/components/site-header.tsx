import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cloudflareToken, DEFAULT_COMPANY_NAME } from "@/lib/company";
import { getSiteBrand, DEFAULT_THEME, type SiteBrand } from "@/lib/admin.functions";

type BrandState = SiteBrand & { ready: boolean; refresh: () => Promise<void> };

const BrandContext = createContext<BrandState>({
  logo: null,
  favicon: null,
  companyName: DEFAULT_COMPANY_NAME,
  companyPhone: "",
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
  refresh: async () => {},
});

export function useBrand() {
  return useContext(BrandContext);
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<SiteBrand>({
    logo: null,
    favicon: null,
    companyName: DEFAULT_COMPANY_NAME,
    companyPhone: "",
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
  });
  const [ready, setReady] = useState(false);

  async function refresh() {
    const next = await getSiteBrand();
    setBrand(next);
    setReady(true);
  }

  useEffect(() => {
    void refresh().catch(() => setReady(true));
  }, []);

  useEffect(() => {
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
  }, [brand.colorAction, brand.colorHeading, brand.colorText, brand.colorLabel, brand.colorBorder, brand.colorBackground, brand.pageBackground]);

  useEffect(() => {
    if (!brand.favicon) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = brand.favicon;
    const mime = brand.favicon.slice("data:".length, brand.favicon.indexOf(";"));
    if (mime) link.type = mime;
  }, [brand.favicon]);

  useEffect(() => {
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

  const appliedName = useRef(DEFAULT_COMPANY_NAME);

  useEffect(() => {
    const next = brand.companyName || DEFAULT_COMPANY_NAME;
    const apply = () => {
      let title = document.title;
      const previous = appliedName.current;
      if (previous !== next && title.includes(previous)) title = title.replaceAll(previous, next);
      if (next !== DEFAULT_COMPANY_NAME && title.includes(DEFAULT_COMPANY_NAME)) title = title.replaceAll(DEFAULT_COMPANY_NAME, next);
      if (title !== document.title) document.title = title;
    };
    apply();
    appliedName.current = next;
    const title = document.querySelector("title");
    if (!title) return;
    const observer = new MutationObserver(apply);
    observer.observe(title, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [brand.companyName]);

  return <BrandContext.Provider value={{ ...brand, ready, refresh }}>{children}</BrandContext.Provider>;
}

export function AppCover() {
  const { cover } = useBrand();
  if (!cover) return null;
  return (
    <div className="border-b border-border bg-surface">
      <img src={cover} alt="" className="mx-auto h-48 w-full max-w-6xl object-cover sm:h-64" />
    </div>
  );
}

export const headerActionClass =
  "inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary";

export function SiteHeader({ eyebrow, action }: { eyebrow: string; action?: ReactNode }) {
  const { logo, companyName } = useBrand();
  const name = companyName || DEFAULT_COMPANY_NAME;
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="min-w-0">
          {logo ? (
            <img src={logo} alt={name} className="h-8 w-auto max-w-[180px] object-contain" />
          ) : (
            <p className="text-sm font-bold tracking-wide text-primary">{name.toUpperCase()}</p>
          )}
          <p className="mt-2 text-xs font-semibold tracking-widest text-action uppercase">{eyebrow}</p>
        </div>
        {action}
      </div>
    </header>
  );
}
