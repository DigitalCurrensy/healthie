import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { PwaRegister } from "@/components/lumen/pwa-register";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "Honest Aisle";
const APP_DESCRIPTION =
  "Independent 0–100 pack scores. Scan a barcode. Read what is in it.";
const OG_IMAGE = "/og.jpg";
const OG_LOGO = "/brand/og-logo.png";
const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: APP_NAME,
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description: APP_DESCRIPTION,
  image: OG_IMAGE,
  logo: OG_LOGO,
  brand: { "@type": "Brand", name: APP_NAME, logo: OG_LOGO },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#ECEEE9" },
      { name: "format-detection", content: "telephone=no" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "msapplication-TileImage", content: "/apple-touch.png" },
      { name: "msapplication-TileColor", content: "#ECEEE9" },
      { "http-equiv": "Permissions-Policy", content: "camera=(self), microphone=()" },
      { name: "description", content: APP_DESCRIPTION },
      { name: "application-name", content: APP_NAME },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch.png" },
      { rel: "apple-touch-icon-precomposed", href: "/apple-touch.png" },
      { rel: "image_src", href: OG_IMAGE },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,SOFT,WONK,wght@9..144,0..100,0..1,400..700&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var f=window.frameElement;if(!f||f.tagName!=="IFRAME")return;var a=f.getAttribute("allow")||"";if(/camera/i.test(a))return;f.setAttribute("allow",(a?a+"; ":"")+"camera; fullscreen");f.setAttribute("allowfullscreen","true");try{if(!sessionStorage.getItem("healthie-camera-unlock")){sessionStorage.setItem("healthie-camera-unlock","1");location.replace(location.href);}}catch(e){}}catch(e){}try{window.parent.postMessage({channel:"grok-preview-bridge",version:1,type:"permissions",features:["camera"]},"*");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-bg text-fg">
        <PreviewHostBridge />
        <PwaRegister />
        <Toaster position="top-center" richColors={false} closeButton duration={2400} />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
