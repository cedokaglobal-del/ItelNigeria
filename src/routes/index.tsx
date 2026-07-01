import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BatteryCharging,
  Calculator,
  Cpu,
  Package,
  ShieldCheck,
  Sun,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { memo } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { fetchProducts, type Product, type ProductCategory } from "@/lib/products";
import { fetchCategories } from "@/lib/categories";

function HomeSkeleton() {
  return (
    <div>
      <section className="bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="container-page pb-6 pt-4 md:py-12">
          <div className="flex flex-col items-start gap-2">
            <div className="h-5 w-48 rounded-full bg-primary/10 animate-shimmer" />
            <div className="mt-2 h-10 w-96 rounded-lg bg-primary/10 animate-shimmer" />
            <div className="mt-2 h-10 w-80 rounded-lg bg-primary/10 animate-shimmer" />
            <div className="mt-2 h-4 w-64 rounded bg-primary/5 animate-shimmer" />
          </div>
        </div>
      </section>
      <section className="container-page py-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border bg-card overflow-hidden">
              <div className="aspect-[4/5] bg-primary/5 animate-shimmer" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-16 rounded bg-primary/10 animate-shimmer" />
                <div className="h-4 w-24 rounded bg-primary/10 animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/")({
  loader: async () => {
    const [products, categories] = await Promise.all([
      fetchProducts(),
      fetchCategories()
    ]);
    return { products: products as Product[], categories };
  },
  head: () => ({
    meta: [
      { title: "ItelNigeria — Power Independence Starts Here" },
      {
        name: "description",
        content:
          "Premium solar panels, inverters, batteries and complete kits engineered for Nigeria. Size your system in 60 seconds.",
      },
      { property: "og:title", content: "ItelNigeria — Power Independence Starts Here" },
      { property: "og:description", content: "Premium solar equipment and intelligent sizing for Nigerian homes and businesses. Built for African sun." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://itelenergy.com" },
      { property: "og:site_name", content: "ItelNigeria" },
      { property: "og:locale", content: "en_NG" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ItelNigeria — Power Independence Starts Here" },
      { name: "twitter:description", content: "Premium solar panels, inverters, batteries and complete kits. Size your system in 60 seconds." },
    ],
    links: [{ rel: "canonical", href: "https://itelenergy.com" }],
  }),
  component: Home,
  pendingComponent: HomeSkeleton,
});

const CATEGORY_META: Record<
  ProductCategory,
  { gradient: string; icon: React.ComponentType<{ className?: string }> }
> = {
  panels: { gradient: "from-teal-600 to-emerald-500", icon: Sun },
  inverters: { gradient: "from-blue-600 to-indigo-500", icon: Cpu },
  batteries: { gradient: "from-violet-600 to-purple-500", icon: BatteryCharging },
  controllers: { gradient: "from-amber-600 to-orange-500", icon: Zap },
  kits: { gradient: "from-orange-600 to-red-500", icon: Package },
  accessories: { gradient: "from-slate-600 to-gray-500", icon: Wrench },
};

function Home() {
  const { products, categories } = Route.useLoaderData();
  const featured = products.filter((p) => p.badge).slice(0, 6);
  const deals = products.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 4);
  const newArrivals = products.filter((p) => p.badge === "New").slice(0, 6);

  return (
    <div>
      {/* ── COMPACT HERO ── */}
      <section className="bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="container-page pb-6 pt-4 md:py-12">
          <div className="flex flex-col items-start gap-2 animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-[10px] text-muted-foreground backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--solar)]" />
              New · N-Type 600W bifacial in stock
            </span>
            <h1 className="text-fluid-hero font-semibold tracking-tight">
              Power independence <br className="hidden md:block" />
              <span className="bg-[var(--gradient-gold)] bg-clip-text text-transparent">starts here.</span>
            </h1>
            <p className="max-w-lg text-fluid-lg text-muted-foreground">
              Premium solar + intelligent sizing. Helping homes and businesses across Nigeria leave generators behind.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 md:mt-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all active:scale-[0.97]"
              >
                <Package className="h-3.5 w-3.5" />
                Shop now
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/calculator"
                className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.97]"
              >
                <Calculator className="h-3.5 w-3.5" />
                Size my system
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEALS BANNER ── */}
      {deals.length > 0 && (
        <section className="container-page py-3 md:pt-6">
          <Link
            to="/shop"
            className="flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-red-500/10 via-primary/5 to-transparent px-4 py-3 border border-red-500/20 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                SALE
              </span>
              <p className="text-xs font-medium">
                Up to <span className="font-bold text-primary">30% off</span> — limited stock
              </p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </Link>
        </section>
      )}

      {/* ── CATEGORIES ── */}
      <section className="container-page py-4 md:py-10 animate-fade-in-up animate-delay-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--solar)]">Categories</p>
          <Link to="/shop" className="text-xs text-muted-foreground hover:text-foreground">View all <ArrowRight className="inline h-3 w-3" /></Link>
        </div>
        <div className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((c) => {
            const meta = CATEGORY_META[c.id] || CATEGORY_META["accessories"];
            const Icon = meta.icon;
            return (
              <Link
                key={c.id}
                to="/shop"
                className="card-cmp relative flex w-20 shrink-0 snap-start flex-col items-center gap-1 overflow-hidden rounded-xl px-1.5 py-3 transition-all active:scale-[0.95] hover:-translate-y-0.5 md:w-[68px] md:py-2.5"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-90`} />
                <div className="relative grid h-7 w-7 place-items-center rounded-lg bg-white/20 text-white md:h-6 md:w-6">
                  <Icon className="h-3.5 w-3.5 md:h-3 md:w-3" />
                </div>
                <span className="relative text-[10px] font-semibold text-white text-center leading-tight md:text-[8px]">{c.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="lazy-section container-page pb-6 md:pb-10 animate-fade-in-up animate-delay-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold md:text-2xl">Featured products</h2>
          <Link to="/shop" className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all hover:bg-accent hover:border-primary/30">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      {newArrivals.length > 0 && (
        <section className="lazy-section container-page pb-6 md:pb-10 animate-fade-in-up animate-delay-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--solar)]" />
              <h2 className="text-base font-semibold md:text-2xl">New arrivals</h2>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all hover:bg-accent hover:border-primary/30">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── DISCOUNTED DEALS ── */}
      {deals.length > 0 && (
        <section className="lazy-section container-page pb-6 md:pb-10 animate-fade-in-up animate-delay-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-red-500" />
              <h2 className="text-base font-semibold md:text-2xl">Best deals</h2>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all hover:bg-accent hover:border-primary/30">
              Shop deals <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {deals.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── SOLAR SYSTEMS PROMO ── */}
      <section className="lazy-section container-page pb-6 md:pb-10 animate-fade-in-up animate-delay-5">
        <Link
          to="/solar-systems"
          className="relative block overflow-hidden rounded-xl border bg-gradient-to-r from-primary/5 via-transparent to-[var(--solar)]/5 p-4 active:scale-[0.99] transition-transform hover:shadow-md md:rounded-2xl md:p-8"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
            <Package className="h-3 w-3" /> Pre-engineered
          </span>
          <h2 className="mt-2 text-base font-semibold md:text-2xl">Complete solar systems</h2>
          <p className="mt-1 max-w-lg text-xs text-muted-foreground md:text-sm">
            Panels, inverter, battery, and accessories — selected and guaranteed by Itel engineers. Ready to install.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary">
            Browse systems <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="lazy-section border-y bg-surface/40 animate-fade-in">
        <div className="container-page grid grid-cols-2 gap-2 py-4 md:gap-6 md:py-8 md:grid-cols-4">
          <Trust icon={ShieldCheck} title="Tier-1" sub="Certified" />
          <Trust icon={Truck} title="Delivery" sub="Free Lagos" />
          <Trust icon={BatteryCharging} title="10 yr" sub="Battery" />
          <Trust icon={Sun} title="25 yr" sub="Panels" />
        </div>
      </section>

      {/* ── CALCULATOR CTA ── */}
      <section className="lazy-section container-page py-6 md:py-12 animate-fade-in-up">
        <Link
          to="/calculator"
          className="relative block overflow-hidden rounded-xl border bg-card p-4 active:scale-[0.99] transition-all hover:shadow-md md:rounded-2xl md:p-10"
        >
          <div className="absolute inset-0 energy-grid opacity-40" />
          <div className="relative">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--solar)]">The Itel calculator</p>
            <h2 className="mt-1 text-base font-semibold md:text-3xl">Don't guess your system size.</h2>
            <p className="mt-1 max-w-md text-xs text-muted-foreground md:text-sm">Size your panels, inverter, battery — estimate cost and payback in 60 seconds.</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm">
              Start calculator <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}

const Stat = memo(function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-2xl font-semibold tracking-tight md:text-3xl">{value}</dt>
      <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
    </div>
  );
});

const Trust = memo(function Trust({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center md:flex-row md:gap-2.5 md:text-left">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent md:h-9 md:w-9">
        <Icon className="h-3 w-3 text-[var(--solar)] md:h-4 md:w-4" />
      </span>
      <div>
        <p className="text-[10px] font-semibold md:text-sm">{title}</p>
        <p className="text-[9px] text-muted-foreground md:text-xs">{sub}</p>
      </div>
    </div>
  );
});
