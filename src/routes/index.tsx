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
  TrendingDown,
  Wrench,
  Zap,
} from "lucide-react";
import { memo } from "react";
import { EnergyFlow } from "@/components/site/EnergyFlow";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS, CATEGORIES, type ProductCategory } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Itel Energy — Power Independence Starts Here" },
      {
        name: "description",
        content:
          "Premium solar panels, inverters, batteries and complete kits engineered for Nigeria. Size your system in 60 seconds.",
      },
      { property: "og:title", content: "Itel Energy — Power Independence" },
      {
        property: "og:description",
        content: "Premium solar equipment + intelligent sizing. Built for African sun.",
      },
    ],
  }),
  component: Home,
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
  const featured = PRODUCTS.filter((p) => p.badge).slice(0, 4);
  const deals = PRODUCTS.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 3);
  const newArrivals = PRODUCTS.filter((p) => p.badge === "New").slice(0, 4);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 -z-10 energy-grid opacity-60" />
        <div className="container-page grid gap-12 pb-16 pt-16 md:grid-cols-[1.1fr_1fr] md:gap-8 md:pb-20 md:pt-24">
          <div className="flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-hairline bg-background/40 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--solar)] animate-pulse-glow" />
              New · N-Type 600W bifacial panels in stock
            </span>
            <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Power independence
              <br />
              <span className="bg-[var(--gradient-gold)] bg-clip-text text-transparent">
                starts here.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
              Premium solar equipment + an intelligent sizing engine. Helping homes and businesses
              across Nigeria leave generators behind.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-red)] transition-transform hover:scale-[1.02]"
              >
                <Package className="h-4 w-4" />
                Shop now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 rounded-full border border-hairline px-6 py-3.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Calculator className="h-4 w-4" />
                Calculate my needs
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-hairline pt-7">
              <Stat value="12k+" label="systems shipped" />
              <Stat value="4.9★" label="average rating" />
              <Stat value="24hr" label="dispatch time" />
            </dl>
          </div>
          <div className="relative">
            <div className="surface relative aspect-[5/4] overflow-hidden rounded-3xl p-6">
              <EnergyFlow />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-hairline bg-background/70 px-4 py-3 backdrop-blur">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Live system · sample
                  </p>
                  <p className="text-sm font-semibold">5.2 kW producing · battery 86%</p>
                </div>
                <Zap className="h-4 w-4 text-[var(--solar)] animate-pulse-glow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEALS BANNER ── */}
      {deals.length > 0 && (
        <section className="container-page pt-6 md:pt-10">
          <div className="rounded-2xl bg-gradient-to-r from-red-500/10 via-primary/5 to-transparent border border-red-500/20 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                  SALE
                </span>
                <p className="text-sm font-medium">
                  Up to <span className="text-primary font-bold">30% off</span> selected items —
                  limited stock
                </p>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                View deals <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORIES ── */}
      <section className="container-page pt-8 pb-6 md:py-12">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--solar)]">
            Shop by category
          </p>
          <Link
            to="/shop"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all <ArrowRight className="inline h-3 w-3" />
          </Link>
        </div>
        <div className="mt-4 flex snap-x snap-mandatory overflow-x-auto scrollbar-hide gap-2 pb-2 sm:hidden">
          {CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c.id];
            const Icon = meta.icon;
            return (
              <Link
                key={c.id}
                to="/shop"
                className="card-cmp group relative w-[76px] shrink-0 snap-start overflow-hidden rounded-xl transition-all active:scale-[0.97]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-90`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                <div className="relative flex flex-col items-center gap-0.5 px-1 py-2">
                  <div className="grid h-5 w-5 place-items-center rounded-lg bg-white/20 text-white">
                    <Icon className="h-2.5 w-2.5" />
                  </div>
                  <span className="text-[8px] font-semibold text-white text-center leading-tight">
                    {c.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c.id];
            const Icon = meta.icon;
            const count = PRODUCTS.filter((p) => p.category === c.id).length;
            return (
              <Link
                key={c.id}
                to="/shop"
                className="card-cmp group relative overflow-hidden rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-90`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                <div className="relative flex flex-col items-center gap-1 px-2 py-3 md:gap-1.5 md:px-3 md:py-4">
                  <div className="grid h-6 w-6 place-items-center rounded-lg bg-white/20 text-white md:h-9 md:w-9">
                    <Icon className="h-3 w-3 md:h-4 md:w-4" />
                  </div>
                  <span className="text-[9px] font-semibold text-white text-center leading-tight md:text-xs">
                    {c.label}
                  </span>
                  <span className="hidden text-[9px] text-white/70 text-center leading-tight md:block">
                    {c.blurb}
                  </span>
                  <span className="text-[8px] font-medium text-white/50 text-center">
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="container-page pb-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight md:text-2xl">Featured products</h2>
          <Link
            to="/shop"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-hairline px-4 py-2 text-xs font-medium hover:bg-accent"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      {newArrivals.length > 0 && (
        <section className="container-page pb-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--solar)]" />
              <h2 className="text-lg font-semibold tracking-tight md:text-2xl">New arrivals</h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-hairline px-4 py-2 text-xs font-medium hover:bg-accent"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── DISCOUNTED DEALS ── */}
      {deals.length > 0 && (
        <section className="container-page pb-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <h2 className="text-lg font-semibold tracking-tight md:text-2xl">Best deals</h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-hairline px-4 py-2 text-xs font-medium hover:bg-accent"
            >
              Shop deals <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {deals.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── SOLAR SYSTEMS PROMO ── */}
      <section className="container-page pb-10">
        <Link
          to="/solar-systems"
          className="card-cmp group relative block overflow-hidden rounded-2xl border border-hairline bg-card transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-[var(--solar)]/5" />
          <div className="relative p-6 md:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Package className="h-3 w-3" /> Pre-engineered
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight md:text-3xl">
              Complete solar systems
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Panels, inverter, battery, and all accessories — selected, tested, and guaranteed by
              Itel engineers. Ready to install.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-medium transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
              Browse systems <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="border-y border-hairline bg-surface/40">
        <div className="container-page grid grid-cols-2 gap-4 py-6 md:grid-cols-4 md:gap-6 md:py-8">
          <Trust icon={ShieldCheck} title="Tier-1 components" sub="Itel-certified" />
          <Trust icon={Truck} title="Nationwide delivery" sub="Free in Lagos" />
          <Trust icon={BatteryCharging} title="10-year battery" sub="Smart BMS" />
          <Trust icon={Sun} title="25-year panel" sub="Linear warranty" />
        </div>
      </section>

      {/* ── CALCULATOR CTA ── */}
      <section className="container-page py-10 md:py-16">
        <div className="surface relative overflow-hidden rounded-3xl p-8 md:p-16">
          <div className="absolute inset-0 opacity-60 energy-grid" />
          <div
            className="absolute right-0 top-0 h-full w-1/2 opacity-70"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="relative grid gap-6 md:grid-cols-2 md:items-center md:gap-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--solar)]">
                The Itel calculator
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-5xl">
                Don't guess your system size.
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground md:mt-4">
                Size your panels, inverter and battery, estimate cost and payback in under 60s.
              </p>
              <Link
                to="/calculator"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-red)] transition-transform hover:scale-[1.02]"
              >
                Start the calculator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-2 md:gap-3">
              <CalcStat label="Daily energy" value="14.6 kWh" tone="solar" />
              <CalcStat label="Recommended array" value="6 × 550W = 3.3 kW" tone="solar" />
              <CalcStat label="Battery bank" value="10.2 kWh LiFePO4" tone="tech" />
              <CalcStat label="Payback period" value="22 months" tone="solar" />
            </div>
          </div>
        </div>
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
    <div className="flex items-center gap-2.5 md:items-start md:gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent md:h-9 md:w-9">
        <Icon className="h-3.5 w-3.5 text-[var(--solar)] md:h-4 md:w-4" />
      </span>
      <div>
        <p className="text-xs font-semibold md:text-sm">{title}</p>
        <p className="text-[10px] text-muted-foreground md:text-xs">{sub}</p>
      </div>
    </div>
  );
});

const CalcStat = memo(function CalcStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "solar" | "tech";
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-hairline bg-background/50 px-4 py-3 backdrop-blur md:px-5 md:py-4">
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:text-xs">
        {label}
      </span>
      <span
        className="font-mono text-xs font-semibold md:text-sm"
        style={{ color: tone === "solar" ? "var(--solar)" : "var(--tech)" }}
      >
        {value}
      </span>
    </div>
  );
});
