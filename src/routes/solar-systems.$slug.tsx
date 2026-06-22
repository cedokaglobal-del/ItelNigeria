import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  BatteryCharging,
  Box,
  Check,
  Cpu,
  Lightbulb,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Sun,
  Wrench,
  Zap,
} from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatNGN } from "@/lib/format";
import { fetchSystem, generateDescription } from "@/lib/solar-systems";
import { ImageCarousel } from "@/components/site/ImageCarousel";
import { SystemShowcase } from "@/components/site/SystemShowcase";

export const Route = createFileRoute("/solar-systems/$slug")({
  loader: async ({ params }) => {
    const system = await fetchSystem(params.slug);
    if (!system) throw notFound();
    return { system };
  },
  head: ({ loaderData }) => {
    const slug = loaderData.system.slug;
    const name = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    const href = "https://itelenergy.com/solar-systems/" + slug;
    return {
      meta: [
        { title: name + " — ItelNigeria" },
        { name: "description", content: "The " + name + " — a complete pre-engineered solar system for Nigerian homes. See full specs, price, components, and what it powers." },
        { property: "og:title", content: name + " — ItelNigeria" },
        { property: "og:description", content: "Complete " + name + " with panels, inverter, battery, and installation accessories. Engineered for Nigeria." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: href },
        { property: "og:site_name", content: "ItelNigeria" },
        { property: "og:locale", content: "en_NG" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: name + " — ItelNigeria" },
        { name: "twitter:description", content: "Pre-engineered " + name + " — solar panels, hybrid inverter, and battery bank for Nigerian homes." },
      ],
      links: [{ rel: "canonical", href }],
    };
  },
  component: SolarSystemDetail,
});

function SolarSystemDetail() {
  const { system } = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [showAccessories, setShowAccessories] = useState(true);

  if (!system) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--solar)]">
          Not found
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">We lost the signal</h1>
        <p className="mt-2 text-sm text-muted-foreground">That solar system doesn&apos;t exist.</p>
        <Link
          to="/solar-systems"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to solar systems
        </Link>
      </div>
    );
  }

  const desc = system.description || generateDescription(system);
  const arrayKw = ((system.totalPanels * system.panelWattage) / 1000).toFixed(2);
  const dailyKwh = ((system.totalPanels * system.panelWattage * 5.5) / 1000).toFixed(1);
  const monthlyKwh = (Number(dailyKwh) * 30).toFixed(0);

  return (
    <div className="pb-20 md:pb-0">
      {/* ── Mobile sticky CTA bar ── */}
      <div className="gpu fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            {system.originalPrice && system.originalPrice > system.price && (
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[12px] text-muted-foreground line-through">{formatNGN(system.originalPrice)}</span>
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  -{Math.round((1 - system.price / system.originalPrice) * 100)}%
                </span>
              </div>
            )}
            <p className="text-lg font-bold tracking-tight text-primary">
              {formatNGN(system.price)}
            </p>
            <p className="text-[10px] text-muted-foreground">Complete system price</p>
          </div>
          <div className="flex items-center rounded-xl border border-hairline">
            <button
              type="button"
              onClick={() => setQty((v) => Math.max(1, v - 1))}
              className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-foreground active:bg-accent rounded-xl"
              aria-label="Decrease"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex w-9 items-center justify-center text-sm font-semibold tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((v) => v + 1)}
              className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-foreground active:bg-accent rounded-xl"
              aria-label="Increase"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              add(system.slug, qty);
              toast.success(`Added ${qty} × ${system.name} to cart`);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      <div className="container-page py-6 md:py-10">
        <Link
          to="/solar-systems"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to solar systems
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          {/* Main content */}
          <div className="space-y-10">
            {/* Hero */}
            <div>
              <ImageCarousel
                images={system.images}
                alt={system.name}
                hero={<SystemShowcase system={system} />}
              />
              <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                    <span>{system.voltage} System</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{arrayKw}kW Solar Array</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{system.inverterKVA}kVA Inverter</span>
                  </div>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                    {system.name}
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">{system.tagline}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Star className="h-4 w-4 fill-[var(--solar)] text-[var(--solar)]" />
                  <span className="font-semibold text-sm">{system.rating}</span>
                  <span className="text-xs text-muted-foreground">({system.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Quick stats strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <QuickStat
                icon={Sun}
                label="Solar array"
                value={`${arrayKw} kW`}
                sub={`${system.totalPanels} × ${system.panelWattage}W`}
              />
              <QuickStat
                icon={Cpu}
                label="Inverter"
                value={`${system.inverterKVA} kVA`}
                sub="Pure sine wave hybrid"
              />
              <QuickStat
                icon={BatteryCharging}
                label="Battery bank"
                value={`${system.batteryCapacityKWh} kWh`}
                sub={system.batteryType}
              />
              <QuickStat
                icon={Zap}
                label="Daily energy"
                value={`~${dailyKwh} kWh`}
                sub="Based on 5.5 peak sun hrs"
              />
            </div>

            {/* Generated humanized description */}
            <div className="rounded-2xl border bg-card p-6 md:p-8">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Box className="h-4 w-4 text-primary" /> System overview
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {desc
                  .split("\n\n")
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i}>{renderBold(p)}</p>
                  ))}
              </div>
            </div>

            {/* Energy capacity */}
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" /> Energy capacity
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <CapacityCard label="Solar array capacity" value={arrayKw} unit="kW" />
                <CapacityCard label="Daily generation" value={dailyKwh} unit="kWh" />
                <CapacityCard label="Monthly yield" value={monthlyKwh} unit="kWh" />
                <CapacityCard
                  label="Battery storage"
                  value={String(system.batteryCapacityKWh)}
                  unit="kWh"
                />
              </div>
            </div>

            {/* What this system powers */}
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Lightbulb className="h-4 w-4 text-primary" /> What this system powers
              </h2>
              <div className="mt-3 rounded-xl border bg-surface p-5">
                <p className="text-sm leading-relaxed">{system.whatItPowers}</p>
              </div>
            </div>

            {/* Key highlights */}
            {system.highlights.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Star className="h-4 w-4 text-primary" /> Key highlights
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {system.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2.5 rounded-xl border bg-surface px-4 py-3 text-sm"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bill of materials (power accessories) */}
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <ShoppingBag className="h-4 w-4 text-primary" /> Bill of materials — power
                accessories
              </h2>
              <div className="mt-3 space-y-2">
                {system.components.map((c) => (
                  <div
                    key={`${c.type}-${c.name}`}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold uppercase ${
                          c.type === "panel"
                            ? "bg-amber-100 text-amber-700"
                            : c.type === "inverter"
                              ? "bg-blue-100 text-blue-700"
                              : c.type === "battery"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c.type === "panel"
                          ? "P"
                          : c.type === "inverter"
                            ? "I"
                            : c.type === "battery"
                              ? "B"
                              : "A"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.spec}</p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-sm font-semibold">×{c.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Installation accessories (required) */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Wrench className="h-4 w-4 text-primary" /> Required installation accessories
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAccessories(!showAccessories)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAccessories ? "Hide" : `Show ${system.installationAccessories.length} items`}
                </button>
              </div>
              {showAccessories && (
                <ul className="mt-3 space-y-1.5 rounded-xl border bg-surface p-4">
                  {system.installationAccessories.map((a) => {
                    const [name, ...rest] = a.split("—");
                    return (
                      <li key={a} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                        <span>
                          <span className="font-medium text-foreground">{name.trim()}</span>
                          {rest.length > 0 && (
                            <span className="text-muted-foreground">
                              {" "}
                              — {rest.join("—").trim()}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Sticky pricing sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
              <div className="text-center lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Complete system price
                </p>
                {system.originalPrice && system.originalPrice > system.price && (
                  <div className="mt-1 flex items-center gap-2 justify-center lg:justify-start">
                    <span className="font-mono text-sm text-muted-foreground line-through">
                      {formatNGN(system.originalPrice)}
                    </span>
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      -{Math.round((1 - system.price / system.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
                <p className="mt-1 text-4xl font-bold tracking-tight text-primary">
                  {formatNGN(system.price)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  All components + installation accessories included
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center justify-center gap-3 lg:justify-start">
                  <div className="inline-flex items-center rounded-xl border">
                    <button
                      type="button"
                      onClick={() => setQty((v) => Math.max(1, v - 1))}
                      className="grid h-11 w-11 place-items-center text-lg text-muted-foreground hover:text-foreground"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="flex w-10 items-center justify-center text-sm font-semibold">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((v) => v + 1)}
                      className="grid h-11 w-11 place-items-center text-lg text-muted-foreground hover:text-foreground"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    add(system.slug, qty);
                    toast.success(`Added ${qty} × ${system.name} to cart`);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </button>
              </div>

              <div className="mt-6 space-y-3 rounded-xl border bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center lg:text-left">
                  System summary
                </p>
                <div className="space-y-2 text-sm">
                  <SummaryRow label="Array capacity" value={`${arrayKw} kW`} />
                  <SummaryRow
                    label="Solar panels"
                    value={`${system.totalPanels} × ${system.panelWattage}W`}
                  />
                  <SummaryRow label="Inverter" value={`${system.inverterKVA} kVA hybrid`} />
                  <SummaryRow
                    label="Battery bank"
                    value={`${system.batteryCapacityKWh} kWh ${system.batteryType}`}
                  />
                  <SummaryRow label="System voltage" value={system.voltage} />
                  <SummaryRow label="Daily generation" value={`~${dailyKwh} kWh`} />
                  <SummaryRow label="Monthly yield" value={`~${monthlyKwh} kWh`} />
                  <SummaryRow
                    label="Power accessories"
                    value={`${system.components.length} items`}
                  />
                  <SummaryRow
                    label="Installation accessories"
                    value={`${system.installationAccessories.length} items`}
                  />
                </div>
              </div>

              <div className="mt-4 rounded-xl border bg-primary/[0.04] px-4 py-3 text-xs text-center lg:text-left text-muted-foreground">
                <Check className="-mt-0.5 mr-1 inline h-3 w-3 text-primary" />
                Free delivery in Lagos · 14-day satisfaction guarantee · 2-year warranty
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border bg-surface p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </div>
      <p className="mt-1 font-mono text-base font-semibold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function CapacityCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl border bg-surface p-4 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold tracking-tight text-primary">{value}</p>
      <p className="text-[11px] text-muted-foreground">{unit}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-xs font-semibold">{value}</span>
    </div>
  );
}

function renderBold(text: string) {
  const parts = text.split(/(<strong>|<\/strong>)/g);
  const nodes: React.ReactNode[] = [];
  let bold = false;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === "<strong>") {
      bold = true;
      continue;
    }
    if (parts[i] === "</strong>") {
      bold = false;
      continue;
    }
    if (bold) {
      nodes.push(<strong key={i}>{parts[i]}</strong>);
    } else {
      nodes.push(<Fragment key={i}>{parts[i]}</Fragment>);
    }
  }
  return nodes;
}
