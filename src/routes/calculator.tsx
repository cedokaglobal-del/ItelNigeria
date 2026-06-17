import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
      { title: "Solar Calculator — ItelNigeria" },
      { name: "description", content: "Size your solar system in 60 seconds. Add appliances, get panel, inverter, battery and cost estimates with payback period." },
    ],
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
  const [appliances, setAppliances] = useState<Appliance[]>(STARTER);
  const [sunHours, setSunHours] = useState(5);
  const [autonomyDays, setAutonomyDays] = useState(1);
  const [battery, setBattery] = useState<"lithium" | "tubular">("lithium");
  const [systemVoltage, setSystemVoltage] = useState<24 | 48>(48);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customWatts, setCustomWatts] = useState(200);

  const r = calculate({ appliances, sunHours, autonomyDays, battery, systemVoltage });

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
                  <div key={a.id} className="rounded-xl border bg-surface px-2.5 py-2 transition-colors has-[input:focus]:border-primary/40 md:flex md:items-center md:gap-2 md:px-3 md:py-2">
                    <div className="flex items-center gap-2 md:flex-1 md:gap-0">
                      <input
                        type="text"
                        value={a.name}
                        onChange={(e) => updateAppliance(a.id, { name: e.target.value })}
                        className="min-w-0 flex-1 rounded bg-transparent px-1 py-1 text-sm focus:outline-none"
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
                          className="w-14 rounded-md bg-background/60 px-2 py-1.5 text-right text-xs font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-primary md:w-16 md:px-1.5 md:py-1"
                          min={1} max={5000}
                        />
                        <span className="ml-0.5 text-[10px] text-muted-foreground md:ml-0 md:text-[10px]">W</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={a.qty}
                          onChange={(e) => { const c = clamp(e.target.value, 0, 50); if (c !== null) updateAppliance(a.id, { qty: c }); }}
                          className="w-10 rounded-md bg-background/60 px-1.5 py-1.5 text-right text-xs font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-primary md:w-12 md:px-1.5 md:py-1"
                          min={0} max={50}
                        />
                        <span className="ml-0.5 text-[10px] text-muted-foreground md:ml-0 md:text-[10px]">×</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={a.hours}
                          onChange={(e) => { const c = clamp(e.target.value, 0, 24); if (c !== null) updateAppliance(a.id, { hours: c }); }}
                          className="w-10 rounded-md bg-background/60 px-1.5 py-1.5 text-right text-xs font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-primary md:w-12 md:px-1.5 md:py-1"
                          min={0} max={24} step={0.5}
                        />
                        <span className="ml-0.5 text-[10px] text-muted-foreground md:ml-0 md:text-[10px]">h/d</span>
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
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border bg-surface px-2.5 py-1.5 text-[11px] text-foreground/80 transition-colors hover:bg-accent hover:text-foreground active:scale-[0.97]">
                      <Plus className="h-3 w-3" /> {p.name}
                    </button>
                  ))}
                  <button type="button" onClick={() => setShowCustom(true)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-dashed border-primary/30 bg-primary/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10 active:scale-[0.97]">
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
              <div className="mt-4 grid gap-4 md:mt-5 md:gap-5 sm:grid-cols-2">
                <RangeField label="Peak sun hours" value={sunHours} onChange={setSunHours} min={3.5} max={6} step={0.1} unit="hrs" hint="Nigeria averages 5.0 hrs/day" />
                <RangeField label="Battery autonomy" value={autonomyDays} onChange={setAutonomyDays} min={0.5} max={3} step={0.5} unit="days" hint="Backup without sun" />
                <Segmented label="Battery type" value={battery} onChange={(v) => setBattery(v as "lithium" | "tubular")} options={[{ value: "lithium", label: "LiFePO₄" }, { value: "tubular", label: "Tubular" }]} />
                <Segmented label="System voltage" value={String(systemVoltage)} onChange={(v) => setSystemVoltage(Number(v) as 24 | 48)} options={[{ value: "24", label: "24 V" }, { value: "48", label: "48 V" }]} />
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

function RangeField({ label, value, onChange, min, max, step, unit, hint }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; unit: string; hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="font-mono text-xs font-semibold text-primary tabular-nums">{value.toFixed(step < 1 ? 1 : 0)} {unit}</span>
      </div>
      <input type="range" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} min={min} max={max} step={step} className="range-slider mt-1.5 w-full md:mt-2" />
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground md:mt-1">{hint}</p>}
    </div>
  );
}

function Segmented({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium md:mb-2">{label}</p>
      <div className="inline-flex w-full rounded-xl border bg-surface p-0.5">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              className={"flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all md:px-3 md:py-2 md:text-sm " + (active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {opt.label}
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
