import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { Component, useState } from "react";
import {
  APPLIANCE_PRESETS,
  calculate,
  uid,
  type Appliance,
} from "@/lib/calculator";
import { formatNGN, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Solar Calculator — Itel Energy" },
      { name: "description", content: "Size your solar system in 60 seconds." },
    ],
  }),
  component: CalculatorPageWrapper,
});

class CalcErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(e: Error) { console.error("Calculator error:", e); return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div className="container-page py-20 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Error in calculator</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">{this.state.error.message}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function CalculatorPageWrapper() {
  return <CalcErrorBoundary><CalculatorPage /></CalcErrorBoundary>;
}

const STARTER: Appliance[] = [
  { id: uid(), name: "LED bulb", watts: 10, qty: 8, hours: 6 },
  { id: uid(), name: 'TV (LED 43")', watts: 100, qty: 1, hours: 6 },
  { id: uid(), name: "Refrigerator", watts: 150, qty: 1, hours: 24 },
  { id: uid(), name: "Ceiling fan", watts: 75, qty: 2, hours: 8 },
  { id: uid(), name: "Router / WiFi", watts: 15, qty: 1, hours: 24 },
  { id: uid(), name: "Laptop", watts: 65, qty: 1, hours: 6 },
];

function CalculatorPage() {
  const [appliances, setAppliances] = useState<Appliance[]>(STARTER);
  const [sunHours, setSunHours] = useState(5);
  const [autonomyDays, setAutonomyDays] = useState(1);
  const [battery, setBattery] = useState<"lithium" | "tubular">("lithium");
  const [systemVoltage, setSystemVoltage] = useState<24 | 48>(48);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customWatts, setCustomWatts] = useState("200");

  let result = null;
  try {
    result = calculate({ appliances, sunHours, autonomyDays, battery, systemVoltage });
  } catch (e) {
    console.error("calculate failed:", e);
  }

  function addAppliance(preset?: { name: string; watts: number }) {
    const p = preset ?? APPLIANCE_PRESETS[0];
    setAppliances((prev) => [...prev, { id: uid(), name: p.name, watts: p.watts, qty: 1, hours: 4 }]);
  }

  function addCustomAppliance() {
    const w = parseInt(customWatts, 10);
    if (!customName.trim() || isNaN(w) || w < 1) return;
    setAppliances((prev) => [...prev, { id: uid(), name: customName.trim(), watts: w, qty: 1, hours: 4 }]);
    setShowCustom(false);
    setCustomName("");
    setCustomWatts("200");
  }

  function removeAppliance(id: string) {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  }

  function updateAppliance(id: string, patch: Partial<Appliance>) {
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-page py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Itel Smart Sizing
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Size your system in <span className="text-primary">60 seconds</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Add your appliances — results update instantly.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          {/* Left column */}
          <div className="space-y-8">
            {/* Step 1: Appliances */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">1</span>
                <div>
                  <h2 className="text-lg font-semibold">Your appliances</h2>
                  <p className="text-sm text-muted-foreground">Add everything you plan to run on solar</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {appliances.map((a) => (
                  <div key={a.id} className="rounded-xl border bg-surface px-3 py-2 md:px-4">
                    <div className="flex flex-col gap-2 md:hidden">
                      <div className="flex items-center gap-2">
                        <input type="text" value={a.name} onChange={(e) => updateAppliance(a.id, { name: e.target.value })}
                          className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                        <button type="button" onClick={() => removeAppliance(a.id)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={"Remove " + a.name}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <NumberInput label="Watts" value={a.watts} min={1} max={5000} step={1} suffix="W"
                          onChange={(v) => updateAppliance(a.id, { watts: v })} />
                        <NumberInput label="Qty" value={a.qty} min={0} max={50} step={1} suffix="x"
                          onChange={(v) => updateAppliance(a.id, { qty: v })} />
                        <NumberInput label="Hrs" value={a.hours} min={0} max={24} step={0.5} suffix="h"
                          onChange={(v) => updateAppliance(a.id, { hours: v })} />
                      </div>
                    </div>
                    <div className="hidden items-center gap-2 md:grid md:grid-cols-[1fr_72px_64px_64px_36px]">
                      <input type="text" value={a.name} onChange={(e) => updateAppliance(a.id, { name: e.target.value })}
                        className="rounded-md bg-transparent px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      <NumberInput label="" value={a.watts} min={1} max={5000} step={1} suffix="W"
                        onChange={(v) => updateAppliance(a.id, { watts: v })} />
                      <NumberInput label="" value={a.qty} min={0} max={50} step={1} suffix="x"
                        onChange={(v) => updateAppliance(a.id, { qty: v })} />
                      <NumberInput label="" value={a.hours} min={0} max={24} step={0.5} suffix="h"
                        onChange={(v) => updateAppliance(a.id, { hours: v })} />
                      <button type="button" onClick={() => removeAppliance(a.id)}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={"Remove " + a.name}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Quick add an appliance</p>
                <div className="flex flex-wrap gap-1.5">
                  {APPLIANCE_PRESETS.map((p) => (
                    <button key={p.name} type="button" onClick={() => addAppliance(p)}
                      className="inline-flex items-center gap-1 rounded-full border bg-surface px-3 py-1.5 text-xs text-foreground/80 hover:bg-accent hover:text-foreground">
                      <Plus className="h-3 w-3" /> {p.name}
                    </button>
                  ))}
                  <button type="button" onClick={() => setShowCustom(true)}
                    className="inline-flex items-center gap-1 rounded-full border-2 border-dashed border-primary/40 bg-primary/[0.04] px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10">
                    <Wrench className="h-3 w-3" /> Custom
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Preferences */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">2</span>
                <div>
                  <h2 className="text-lg font-semibold">System preferences</h2>
                  <p className="text-sm text-muted-foreground">Fine-tune assumptions for your location</p>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <RangeField label="Peak sun hours" value={sunHours} onChange={setSunHours} min={3.5} max={6} step={0.1} suffix="hrs" hint="Nigeria averages ~5.0 hrs/day" />
                <RangeField label="Battery autonomy" value={autonomyDays} onChange={setAutonomyDays} min={0.5} max={3} step={0.5} suffix="days" hint="Backup days with no sun" />
                <Segmented label="Battery type" value={battery} onChange={(v) => setBattery(v as "lithium" | "tubular")} options={[{ value: "lithium", label: "LiFePO4" }, { value: "tubular", label: "Tubular" }]} />
                <Segmented label="System voltage" value={String(systemVoltage)} onChange={(v) => setSystemVoltage(Number(v) as 24 | 48)} options={[{ value: "24", label: "24 V" }, { value: "48", label: "48 V" }]} />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {!result ? (
              <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
                <Calculator className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">Add appliances to see live results</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      <Calculator className="-mt-0.5 mr-1 inline h-3.5 w-3.5" /> Recommended system
                    </p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">Live</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{appliances.length} appliance{appliances.length !== 1 ? "s" : ""}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <ResultCard icon={Zap} label="Daily energy need" value={`${result.dailyEnergyKWh.toFixed(1)} kWh`} />
                    <ResultCard icon={Sun} label="Solar array" value={`${result.panelCountW550} × 550W`} />
                    <ResultCard icon={Cpu} label="Inverter" value={`${result.inverterKVA} kVA`} />
                    <ResultCard icon={BatteryCharging} label="Battery bank" value={`${result.batteryCapacityKWh.toFixed(1)} kWh`} />
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-primary" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cost &amp; savings</p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="col-span-2 rounded-xl border bg-surface p-5">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Estimated total cost</p>
                      <p className="mt-1 text-3xl font-bold tracking-tight text-primary">{formatNGN(result.estimatedCostNGN)}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Hardware + BOS + installation</p>
                    </div>
                    <ImpactBadge icon={TrendingDown} label="Payback period" value={result.paybackMonths > 0 ? `${result.paybackMonths.toFixed(1)} months` : "—"} />
                    <ImpactBadge icon={Leaf} label="CO₂ avoided / yr" value={`${formatNumber(result.co2SavedKgPerYear)} kg`} />
                    <ImpactBadge icon={Zap} label="Monthly gen savings" value={formatNGN(result.monthlyGenSavingsNGN)} />
                    <ImpactBadge icon={Sun} label="Trees equivalent" value={`${result.treesEquivalent} trees`} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link to="/shop" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
                      Build this system <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to="/shop" className="inline-flex items-center justify-center rounded-full border bg-card px-6 py-3 text-sm font-medium hover:bg-surface">Shop kits</Link>
                  </div>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Specification breakdown</p>
                  <dl className="mt-4 divide-y">
                    {result.breakdown.map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-3 text-sm">
                        <dt className="text-muted-foreground">{row.label}</dt>
                        <dd className="font-mono text-xs font-semibold">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {renderChart(appliances, result.dailyEnergyKWh)}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Custom modal */}
      {showCustom && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" onClick={() => setShowCustom(false)}>
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold">Add custom appliance</p>
            <p className="mt-1 text-xs text-muted-foreground">Enter the details of your appliance</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
                <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Water heater" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Wattage (watts)</label>
                <input type="number" value={customWatts} onChange={(e) => setCustomWatts(e.target.value)} min={1} max={5000} className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setShowCustom(false)} className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent">Cancel</button>
              <button type="button" onClick={addCustomAppliance} className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110">Add appliance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NumberInput: plain controlled input ──
function NumberInput({ label, value, onChange, min, max, step, suffix }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix: string;
}) {
  return (
    <div className="flex flex-1 flex-col">
      {label && <p className="mb-0.5 text-[10px] font-medium text-muted-foreground">{label}</p>}
      <div className="relative">
        <input type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") return;
            const n = parseFloat(v);
            if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
          }}
          className="w-full rounded-md bg-background/60 px-2 py-1.5 pr-6 text-right font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
        <span className="pointer-events-none absolute inset-y-0 right-1.5 grid place-items-center text-[10px] text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

// ── renderChart: pure function, no hooks ──
function renderChart(appliances: Appliance[], dailyTotal: number) {
  try {
    const sorted = appliances
      .filter((a) => a.qty > 0 && a.hours > 0)
      .map((a) => ({
        name: a.name.length > 16 ? a.name.slice(0, 16) + "..." : a.name,
        kWh: Math.round(((a.watts * a.qty * a.hours) / 1000) * 100) / 100,
      }))
      .sort((a, b) => b.kWh - a.kWh)
      .slice(0, 8);
    if (sorted.length === 0) return null;
    const maxKWh = Math.max(...sorted.map((b) => b.kWh), 0.1);
    const bars = sorted.map((b) => ({ ...b, pct: Math.max((b.kWh / maxKWh) * 100, 2) }));

    return (
      <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Energy by appliance / kWh per day</p>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Total: {dailyTotal.toFixed(1)} kWh/day</p>
        <div className="mt-4 space-y-2.5">
          {bars.map((b) => (
            <div key={b.name} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-right text-[11px] text-foreground/80">{b.name}</span>
              <div className="flex-1">
                <div className="h-5 w-full overflow-hidden rounded-full bg-accent">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: b.pct + "%" }} />
                </div>
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-[11px] font-semibold text-foreground tabular-nums">{b.kWh.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  } catch { return null; }
}

// ── Small helpers ──
function RangeField({ label, value, onChange, min, max, step, suffix, hint }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix: string; hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="font-mono text-xs font-semibold text-primary">{value} {suffix}</span>
      </div>
      <div className="relative mt-2">
        <input type="range" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} min={min} max={max} step={step} className="range-slider w-full" />
      </div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Segmented({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="inline-flex w-full rounded-xl border bg-surface p-1">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              className={"flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all " + (active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-surface p-4">
      <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </div>
      <p className="mt-1.5 font-mono text-base font-semibold">{value}</p>
    </div>
  );
}

function ImpactBadge({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-background px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-xs font-semibold">{value}</p>
      </div>
    </div>
  );
}
