import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BatteryCharging, Calculator, ShieldCheck, Sun, Truck, Zap } from "lucide-react";
import { EnergyFlow } from "@/components/site/EnergyFlow";
import { ProductCard } from "@/components/site/ProductCard";
import { PRODUCTS, CATEGORIES } from "@/lib/products";

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

function Home() {
  const featured = PRODUCTS.filter((p) => p.badge).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="absolute inset-0 -z-10 energy-grid opacity-60" />

        <div className="container-page grid gap-12 pb-20 pt-16 md:grid-cols-[1.1fr_1fr] md:gap-8 md:pb-28 md:pt-24">
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
              across Nigeria leave generators behind — for good.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/calculator"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-red)] transition-transform hover:scale-[1.02]"
              >
                <Calculator className="h-4 w-4" />
                Calculate my solar needs
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-hairline px-6 py-3.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Shop products
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-hairline pt-7">
              <Stat value="12k+" label="systems shipped" />
              <Stat value="₦4.2B" label="generator costs avoided" />
              <Stat value="4.9★" label="average rating" />
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

      {/* TRUST STRIP */}
      <section className="lazy-section border-y border-hairline bg-surface/40">
        <div className="container-page grid gap-6 py-8 md:grid-cols-4">
          <Trust icon={ShieldCheck} title="Tier-1 components only" sub="Every product Itel-certified" />
          <Trust icon={Truck} title="Nationwide delivery" sub="Free in Lagos · 3–7 days others" />
          <Trust icon={BatteryCharging} title="10-year battery warranty" sub="LiFePO4 with smart BMS" />
          <Trust icon={Sun} title="25-year panel warranty" sub="Linear power guarantee" />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="lazy-section container-page py-20">
        <SectionHeader
          eyebrow="Shop by category"
          title="Everything to engineer your system."
          subtitle="From single panels to turnkey kits, every component is tested for African conditions."
        />
        <div className="mt-10 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              className="group surface rounded-2xl p-5 transition-all hover:border-white/20 hover:bg-surface-2"
            >
              <div className="mb-8 grid h-10 w-10 place-items-center rounded-lg bg-[var(--gradient-red)] text-primary-foreground">
                <Sun className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.blurb}</p>
              <ArrowRight className="mt-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="lazy-section container-page pb-20">
        <div className="flex items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Featured"
            title="Engineered. Tested. Trusted."
            subtitle="Best-selling panels, inverters, batteries and kits — picked by our engineers."
          />
          <Link
            to="/shop"
            className="hidden shrink-0 items-center gap-1 rounded-full border border-hairline px-4 py-2 text-xs font-medium hover:bg-accent md:inline-flex"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* CALCULATOR CTA */}
      <section className="lazy-section container-page pb-24">
        <div className="surface relative overflow-hidden rounded-3xl p-10 md:p-16">
          <div className="absolute inset-0 opacity-60 energy-grid" />
          <div
            className="absolute right-0 top-0 h-full w-1/2 opacity-70"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--solar)]">
                The Itel calculator
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                Don't guess your system size.
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Tell us what you run. We'll size your panels, inverter and battery, estimate cost,
                payback period and CO₂ savings — in under 60 seconds.
              </p>
              <Link
                to="/calculator"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-red)] transition-transform hover:scale-[1.02]"
              >
                Start the calculator
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3">
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-2xl font-semibold tracking-tight md:text-3xl">{value}</dt>
      <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
    </div>
  );
}

function Trust({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent">
        <Icon className="h-4 w-4 text-[var(--solar)]" />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--solar)]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function CalcStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "solar" | "tech";
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-hairline bg-background/50 px-5 py-4 backdrop-blur">
      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span
        className="font-mono text-sm font-semibold"
        style={{ color: tone === "solar" ? "var(--solar)" : "var(--tech)" }}
      >
        {value}
      </span>
    </div>
  );
}
