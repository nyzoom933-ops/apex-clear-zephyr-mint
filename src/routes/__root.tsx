import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { BrandProvider } from "@/components/site-header";
import appCss from "../styles.css?url";

const APP_NAME = "Account Holding";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: "Open an investor account relationship. Complete the application in one session." },
      { name: "theme-color", content: "#2E77BB" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var key="ah-chunk-reload";window.addEventListener("vite:preloadError",function(event){event.preventDefault();if(sessionStorage.getItem(key)==="1")return;sessionStorage.setItem(key,"1");window.location.reload();});window.addEventListener("load",function(){sessionStorage.removeItem(key);});})();`,
          }}
        />
        <PreviewHostBridge />
        <AuthProvider>
          <BrandProvider>
            <Outlet />
          </BrandProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});

export { APP_NAME };
