import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BatteryCharging,
  Calculator,
  Cpu,
  Leaf,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  TrendingDown,
  Wrench,
  Zap,
  Gauge,
  Clock,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  APPLIANCE_PRESETS,
  calculate,
  uid,
  type Appliance,
} from "@/lib/calculator";
import { fetchProducts } from "@/lib/products";
import { formatNGN, formatNumber } from "@/lib/format";

function CalculatorSkeleton() {
  return (
    <div className="container-page py-8">
      <div className="h-8 w-64 rounded-lg bg-primary/10 animate-shimmer mb-6" />
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl border bg-card p-4 animate-shimmer" />
          ))}
        </div>
        <div className="h-96 rounded-2xl border bg-card p-6 animate-shimmer" />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/calculator")({
  loader: () => fetchProducts(),
  pendingComponent: CalculatorSkeleton,
  head: () => ({
    meta: [
      { title: "Solar Calculator — ItelNigeria" },
      { name: "description", content: "Size your solar system in 60 seconds. Add appliances, get panel, inverter, battery and cost estimates with payback period." },
      { property: "og:title", content: "Solar Calculator — ItelNigeria" },
      { property: "og:description", content: "Size your solar system in 60 seconds. Add your appliances and get instant panel, inverter, battery, and cost estimates with payback period." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://itelenergy.com/calculator" },
      { property: "og:site_name", content: "ItelNigeria" },
      { property: "og:locale", content: "en_NG" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solar Calculator — ItelNigeria" },
      { name: "twitter:description", content: "Size your solar system in 60 seconds. Free solar sizing tool for Nigerian homes and businesses." },
    ],
    links: [{ rel: "canonical", href: "https://itelenergy.com/calculator" }],
  }),
  component: CalculatorPage,
});

const STARTER: Appliance[] = [
  { id: uid(), name: "LED bulb", watts: 10, qty: 8, hours: 6 },
  { id: uid(), name: 'TV (LED 43")', watts: 100, qty: 1, hours: 6 },
  { id: uid(), name: "Refrigerator", watts: 150, qty: 1, hours: 24 },
  { id: uid(), name: "Ceiling fan", watts: 75, qty: 2, hours: 8 },
  { id: uid(), name: "Router / WiFi", watts: 15, qty: 1, hours: 24 },
  { id: uid(), name: "Laptop", watts: 65, qty: 1, hours: 6 },
];

function CalculatorPage() {
  const products = useLoaderData({ from: "/calculator" });
  const [appliances, setAppliances] = useState<Appliance[]>(STARTER);
  const [sunHours, setSunHours] = useState(5);
  const [autonomyDays, setAutonomyDays] = useState(1);
  const [battery, setBattery] = useState<"lithium" | "tubular">("lithium");
  const [systemVoltage, setSystemVoltage] = useState<24 | 48>(48);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customWatts, setCustomWatts] = useState(200);

  const r = calculate({ appliances, sunHours, autonomyDays, battery, systemVoltage }, products);

  function addAppliance(p?: { name: string; watts: number }) {
    const preset = p ?? APPLIANCE_PRESETS[0];
    setAppliances((prev) => [...prev, { id: uid(), name: preset.name, watts: preset.watts, qty: 1, hours: 4 }]);
  }

  function addCustom() {
    const w = Number(customWatts);
    if (!customName.trim() || !w || w < 1) return;
    setAppliances((prev) => [...prev, { id: uid(), name: customName.trim(), watts: Math.round(w), qty: 1, hours: 4 }]);
    setShowCustom(false);
    setCustomName("");
    setCustomWatts(200);
  }

  function removeAppliance(id: string) {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  }

  function updateAppliance(id: string, patch: Partial<Appliance>) {
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function clamp(v: string, min: number, max: number): number | null {
    const n = v.includes(".") ? parseFloat(v) : parseInt(v, 10);
    if (isNaN(n)) return null;
    return Math.max(min, Math.min(max, n));
  }

  const sorted = [...appliances]
    .filter((a) => a.qty > 0 && a.hours > 0)
    .map((a) => ({ name: a.name.length > 16 ? a.name.slice(0, 16) + "…" : a.name, kWh: Math.round((a.watts * a.qty * a.hours) / 10) / 100 }))
    .sort((a, b) => b.kWh - a.kWh)
    .slice(0, 8);
  const maxKWh = Math.max(...sorted.map((b) => b.kWh), 0.1);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="container-page py-10 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-primary" /> Itel Smart Sizing Engine
            </span>
            <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight md:text-5xl">
              Size your solar system in <span className="text-primary">60 seconds</span>
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground md:text-base">
              Tell us what you want to power. We calculate the exact solar array, inverter, battery bank, cost, and payback — instantly.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-6 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
          {/* ── Left: Inputs ── */}
          <div className="space-y-4 md:space-y-6">
            {/* Appliances */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground md:h-7 md:w-7 md:text-xs">1</span>
                <div>
                  <h2 className="text-sm font-semibold md:text-base">Your appliances</h2>
                  <p className="text-[11px] text-muted-foreground md:text-xs">Add everything you plan to run on solar</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 md:mt-5 md:space-y-1.5">
                {appliances.map((a) => (
                  <div key={a.id} className="group rounded-xl border bg-surface px-2.5 py-2 transition-colors has-[input:focus]:border-primary/40 md:flex md:items-center md:gap-2 md:px-3 md:py-2">
                    <div className="flex items-center gap-2 md:flex-1 md:gap-0">
                      <input
                        type="text"
                        value={a.name}
                        onChange={(e) => updateAppliance(a.id, { name: e.target.value })}
                        className="min-w-0 flex-1 rounded-lg border bg-background/40 px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:bg-transparent md:py-1"
                      />
                      <button type="button" onClick={() => removeAppliance(a.id)}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
                        aria-label={"Remove " + a.name}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 md:mt-0">
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          value={a.watts}
                          onChange={(e) => { const c = clamp(e.target.value, 1, 5000); if (c !== null) updateAppliance(a.id, { watts: c }); }}
                          className="w-14 rounded-lg border bg-background/60 px-2 py-1.5 text-right text-xs font-mono tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:w-16 md:px-1.5 md:py-1"
                          min={1} max={5000}
                        />
                        <span className="ml-1 text-[10px] font-medium text-muted-foreground">W</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={a.qty}
                          onChange={(e) => { const c = clamp(e.target.value, 0, 50); if (c !== null) updateAppliance(a.id, { qty: c }); }}
                          className="w-10 rounded-lg border bg-background/60 px-1.5 py-1.5 text-right text-xs font-mono tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:w-12 md:px-1.5 md:py-1"
                          min={0} max={50}
                        />
                        <span className="ml-1 text-[10px] font-medium text-muted-foreground">×</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={a.hours}
                          onChange={(e) => { const c = clamp(e.target.value, 0, 24); if (c !== null) updateAppliance(a.id, { hours: c }); }}
                          className="w-10 rounded-lg border bg-background/60 px-1.5 py-1.5 text-right text-xs font-mono tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:w-12 md:px-1.5 md:py-1"
                          min={0} max={24} step={0.5}
                        />
                        <span className="ml-1 text-[10px] font-medium text-muted-foreground">h/d</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 md:mt-5">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Quick add</p>
                <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                  {APPLIANCE_PRESETS.map((p) => (
                    <button key={p.name} type="button" onClick={() => addAppliance(p)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border bg-surface px-2.5 py-1.5 text-[11px] text-foreground/80 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground active:scale-[0.97]">
                      <Plus className="h-3 w-3" /> {p.name}
                    </button>
                  ))}
                  <button type="button" onClick={() => setShowCustom(true)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-dashed border-primary/30 bg-primary/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-primary transition-all hover:bg-primary/10 active:scale-[0.97]">
                    <Wrench className="h-3 w-3" /> Custom
                  </button>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground md:h-7 md:w-7 md:text-xs">2</span>
                <div>
                  <h2 className="text-sm font-semibold md:text-base">System preferences</h2>
                  <p className="text-[11px] text-muted-foreground md:text-xs">Fine-tune for your location and equipment</p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:gap-5 sm:grid-cols-2">
                <SliderField label="Peak sun hours" value={sunHours} onChange={setSunHours} min={3.5} max={6} step={0.1} unit="hrs" hint="Nigeria averages 5.0 hrs/day" icon={Sun} />
                <SliderField label="Battery autonomy" value={autonomyDays} onChange={setAutonomyDays} min={0.5} max={3} step={0.5} unit="days" hint="Backup without sun" icon={Clock} />
                <ToggleCard label="Battery type" value={battery} onChange={(v) => setBattery(v as "lithium" | "tubular")}
                  options={[
                    { value: "lithium", label: "Lithium", sub: "LiFePO₄", desc: "Lightweight, deep discharge, longer life" },
                    { value: "tubular", label: "Tubular", sub: "Lead-acid", desc: "Budget-friendly, proven, heavier" },
                  ]} />
                <ToggleCard label="System voltage" value={String(systemVoltage)} onChange={(v) => setSystemVoltage(Number(v) as 24 | 48)}
                  options={[
                    { value: "24", label: "24 V", sub: "Small", desc: "Good for loads under 3 kW" },
                    { value: "48", label: "48 V", sub: "Standard", desc: "Better for larger loads, higher efficiency" },
                  ]} />
              </div>
            </div>
          </div>

          {/* ── Right: Results ── */}
          <div className="space-y-4 md:space-y-5 lg:sticky lg:top-24 lg:self-start">
            {/* Summary */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-7">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary md:text-xs">
                  <Calculator className="-mt-0.5 mr-1 inline h-3 w-3 md:h-3.5 md:w-3.5" /> Recommended system
                </p>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary md:text-[10px]">Live</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground md:text-[11px]">
                {appliances.length} appliance{appliances.length !== 1 ? "s" : ""} · {appliances.reduce((s, a) => s + a.watts * a.qty, 0).toLocaleString()} W peak
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 md:mt-5 md:gap-3">
                <Summary icon={Zap} label="Daily energy" value={`${r.dailyEnergyKWh.toFixed(1)} kWh`} />
                <Summary icon={Sun} label="Solar array" value={`${r.panelCountW550} × 550W`} sub={r.panelArrayKW.toFixed(2) + " kW"} />
                <Summary icon={Cpu} label="Inverter" value={`${r.inverterKVA} kVA`} sub="Hybrid" />
                <Summary icon={BatteryCharging} label="Battery bank" value={`${r.batteryCapacityKWh.toFixed(1)} kWh`} sub={battery === "lithium" ? "LiFePO₄" : "Tubular"} />
              </div>
            </div>

            {/* Cost & Savings */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-7">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-3.5 w-3.5 text-primary md:h-4 md:w-4" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:text-xs">Cost &amp; savings</p>
              </div>
              <div className="mt-3 rounded-xl border bg-surface p-3 md:mt-4 md:p-4">
                <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground md:text-[10px]">Estimated total cost</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-primary md:text-3xl">{formatNGN(r.estimatedCostNGN)}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground md:text-[11px]">Hardware + balance of system + installation</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 md:mt-3 md:gap-3">
                <Metric icon={TrendingDown} label="Payback period" value={r.paybackMonths > 0 ? `${r.paybackMonths.toFixed(1)} months` : "N/A"} />
                <Metric icon={Leaf} label="CO₂ avoided / yr" value={`${formatNumber(r.co2SavedKgPerYear)} kg`} />
                <Metric icon={Zap} label="Monthly gen savings" value={formatNGN(r.monthlyGenSavingsNGN)} />
                <Metric icon={Sun} label="Trees equivalent" value={`${r.treesEquivalent} trees`} />
              </div>
              <div className="mt-4 flex flex-col gap-2 md:mt-5 md:flex-row">
                <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-[0.98]">
                  Build this system <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/shop" className="inline-flex items-center justify-center rounded-full border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface active:scale-[0.98]">
                  Shop kits
                </Link>
              </div>
            </div>

            {/* Cost breakdown */}
            {r.costBreakdown.length > 0 && (
              <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:text-xs flex items-center gap-1.5">
                  <TrendingDown className="h-3 w-3 text-primary" /> Cost breakdown
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground md:text-[11px]">Live prices from our catalog</p>
                <div className="mt-3 space-y-2 md:mt-4 md:space-y-2.5">
                  {r.costBreakdown.map((row) => {
                    const pct = r.estimatedCostNGN > 0 ? Math.round((row.amount / r.estimatedCostNGN) * 100) : 0;
                    return (
                      <div key={row.label}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-mono font-semibold tabular-nums">{formatNGN(row.amount)}</span>
                        </div>
                        <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-accent md:h-2">
                          <div className="h-full rounded-full bg-primary" style={{ width: Math.max(pct, 2) + "%" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 text-xs font-semibold">
                  <span>Estimated total</span>
                  <span className="font-mono text-sm text-primary">{formatNGN(r.estimatedCostNGN)}</span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><Info className="h-3 w-3" /> Hardware + balance of system + installation</p>
              </div>
            )}

            {/* Specification breakdown */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:text-xs">Specifications</p>
              <dl className="mt-3 divide-y divide-hairline">
                {r.breakdown.map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 text-sm md:py-2.5">
                    <dt className="text-xs text-muted-foreground md:text-sm">{row.label}</dt>
                    <dd className="font-mono text-[11px] font-semibold md:text-xs">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Energy chart */}
            {sorted.length > 0 && (
              <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-7">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-primary md:h-4 md:w-4" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:text-xs">Energy breakdown</p>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground md:text-[11px]">kWh per day — top 8 appliances</p>
                <div className="mt-3 space-y-1.5 md:mt-4 md:space-y-2">
                  {sorted.map((b) => (
                    <div key={b.name} className="flex items-center gap-2 md:gap-2.5">
                      <span className="w-16 shrink-0 truncate text-[10px] text-foreground/80 md:w-24 md:text-[11px]">{b.name}</span>
                      <div className="flex-1">
                        <div className="h-4 overflow-hidden rounded-full bg-accent md:h-5">
                          <div className="h-full rounded-full bg-primary" style={{ width: Math.max((b.kWh / maxKWh) * 100, 3) + "%" }} />
                        </div>
                      </div>
                      <span className="w-12 shrink-0 text-right font-mono text-[10px] font-semibold tabular-nums md:w-14 md:text-[11px]">{b.kWh.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Custom modal */}
      {showCustom && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4 backdrop-blur-sm" onClick={() => setShowCustom(false)}>
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold">Add custom appliance</p>
            <p className="mt-1 text-xs text-muted-foreground">Enter the name and wattage of your appliance</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Appliance name</label>
                <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Water heater" className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Power rating (watts)</label>
                <input type="number" value={customWatts} onChange={(e) => { const v = e.target.value; if (v === "") { setCustomWatts(0); return; } const n = parseFloat(v); if (!isNaN(n)) setCustomWatts(Math.max(1, Math.min(5000, n))); }} min={1} max={5000} className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setShowCustom(false)} className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent">Cancel</button>
              <button type="button" onClick={addCustom} className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110 active:scale-[0.98]">Add appliance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, step, unit, hint, icon: Icon }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; unit: string; hint?: string; icon: React.ComponentType<{ className?: string }>;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="rounded-xl border bg-surface p-3.5 md:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <label className="text-sm font-medium">{label}</label>
        </div>
        <span className="font-mono text-sm font-semibold text-primary tabular-nums">{value.toFixed(step < 1 ? 1 : 0)} <span className="text-[10px] font-normal text-muted-foreground">{unit}</span></span>
      </div>
      <div className="relative mt-3">
        <div className="relative before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-full before:shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]">
          <input type="range" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} min={min} max={max} step={step}
            className="range-slider relative z-0 w-full"
            style={{ "--pct": pct + "%" } as React.CSSProperties} />
        </div>
      </div>
      {hint && <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground"><Info className="h-3 w-3" />{hint}</p>}
    </div>
  );
}

function ToggleCard({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string; sub: string; desc: string }[];
}) {
  return (
    <div className="rounded-xl border bg-surface p-3.5 md:p-4">
      <p className="mb-2.5 text-sm font-medium">{label}</p>
      <div className="flex gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 text-center text-xs transition-all ${
                active
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-hairline bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              }`}>
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-[10px] opacity-70">{opt.sub}</span>
              <span className="mt-0.5 text-[9px] leading-tight opacity-60">{opt.desc}</span>
              {active && <CheckCircle2 className="mt-1 h-3 w-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Summary({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-surface p-2.5 md:p-3.5">
      <div className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground md:gap-1.5 md:text-[10px]">
        <Icon className="h-3 w-3 text-primary md:h-3.5 md:w-3.5" /> {label}
      </div>
      <p className="mt-0.5 font-mono text-sm font-semibold md:mt-1 md:text-base">{value}</p>
      {sub && <p className="text-[9px] text-muted-foreground md:mt-0.5 md:text-[10px]">{sub}</p>}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-2 md:gap-2.5 md:px-3 md:py-2.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary md:h-4 md:w-4" />
      <div className="min-w-0">
        <p className="truncate text-[9px] font-medium uppercase tracking-wider text-muted-foreground md:text-[10px]">{label}</p>
        <p className="truncate font-mono text-[11px] font-semibold md:text-xs">{value}</p>
      </div>
    </div>
  );
}
