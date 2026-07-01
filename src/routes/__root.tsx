import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, HeadContent } from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../style.css?url";
import { CartProvider } from "@/lib/cart";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--solar)]">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">We lost the signal</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          That page isn't here. Let's get you back to powering up.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow-red)] transition-transform hover:scale-[1.02]"
          >
            Home
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-full border border-hairline px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Browse shop
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Something tripped a breaker</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. This is usually a temporary issue. Try again or refresh the page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { reset(); window.location.reload(); }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-full border border-hairline px-5 py-2.5 text-sm">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ItelNigeria — Power Independence Starts Here" },
      { name: "description", content: "Premium solar panels, inverters, batteries and complete kits. Size your system in 60 seconds with ItelNigeria's smart solar calculator." },
      { name: "author", content: "ItelNigeria" },
      { name: "theme-color", content: "#FFFFFF" },
      { property: "og:title", content: "ItelNigeria — Solar OS for homes & business" },
      { property: "og:description", content: "Premium solar equipment and intelligent sizing. Nigeria-built, world-class." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://itelenergy.com" },
      { property: "og:site_name", content: "ItelNigeria" },
      { property: "og:locale", content: "en_NG" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@itelenergy" },
      { name: "twitter:title", content: "ItelNigeria — Power Independence Starts Here" },
      { name: "twitter:description", content: "Premium solar panels, inverters, batteries and complete kits. Size your system in 60 seconds." },
      { name: "robots", content: "index, follow" },
      { name: "googlebot", content: "index, follow" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://itelenergy.com" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "preload", href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600&display=swap", as: "style" },
      { href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600&display=swap", rel: "stylesheet" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org", "@type": "Organization",
          name: "ItelNigeria", url: "https://itelenergy.com",
          description: "Premium solar equipment and intelligent sizing for homes and businesses across Nigeria.",
          foundingDate: "2024",
          contactPoint: { "@type": "ContactPoint", telephone: "+234-800-ITEL", contactType: "customer service", availableLanguage: ["English"] },
          sameAs: ["https://twitter.com/itelenergy"],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebSite",
          name: "ItelNigeria", url: "https://itelenergy.com",
          description: "Premium solar panels, inverters, batteries and complete kits engineered for Nigeria. Size your system in 60 seconds.",
          potentialAction: { "@type": "SearchAction", target: "https://itelenergy.com/shop?q={search_term_string}", "query-input": "required name=search_term_string" },
        }),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <CartProvider>
        <div className="flex min-h-dvh flex-col">
          <Nav />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}
