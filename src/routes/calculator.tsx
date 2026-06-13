import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, Component } from "react";
import {
  APPLIANCE_PRESETS,
  calculate,
  uid,
  type Appliance,
} from "@/lib/calculator";
import { formatNGN, formatNumber } from "@/lib/format";
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

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Solar Calculator — Itel Energy" },
      { name: "description", content: "Size your solar system in 60 seconds." },
    ],
  }),
  component: CalculatorPageWrapper,
});

class ErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div className="container-page py-20 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">{this.state.error.message}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function CalculatorPageWrapper() {
  return <ErrorBoundary><CalculatorPage /></ErrorBoundary>;
}

const STARTER: Appliance[] = [
  { id: "1", name: "LED bulb", watts: 10, qty: 8, hours: 6 },
  { id: "2", name: 'TV (LED 43")', watts: 100, qty: 1, hours: 6 },
  { id: "3", name: "Refrigerator", watts: 150, qty: 1, hours: 24 },
  { id: "4", name: "Ceiling fan", watts: 75, qty: 2, hours: 8 },
  { id: "5", name: "Router / WiFi", watts: 15, qty: 1, hours: 24 },
  { id: "6", name: "Laptop", watts: 65, qty: 1, hours: 6 },
];

function CalculatorPage() {
  const [appliances, setAppliances] = useState<Appliance[]>(STARTER);
  const [sunHours, setSunHours] = useState(5);
  const [autonomyDays, setAutonomyDays] = useState(1);
  const [battery, setBattery] = useState<"lithium" | "tubular">("lithium");
  const [systemVoltage, setSystemVoltage] = useState<24 | 48>(48);
  const [result, setResult] = useState<ReturnType<typeof calculate> | null>(null);
  const refs = useRef<Record<string, { watts: HTMLInputElement | null; qty: HTMLInputElement | null; hours: HTMLInputElement | null }>>({});

  function addAppliance(preset?: { name: string; watts: number }) {
    const p = preset ?? APPLIANCE_PRESETS[0];
    setAppliances((prev) => [...prev, { id: uid(), name: p.name, watts: p.watts, qty: 1, hours: 4 }]);
    setResult(null);
  }

  function removeAppliance(id: string) {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
    setResult(null);
  }

  function updateName(id: string, name: string) {
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)));
  }

  function readAppliance(id: string): Partial<Appliance> {
    const r = refs.current[id];
    if (!r) return {};
    const watts = r.watts ? parseFloat(r.watts.value) : NaN;
    const qty = r.qty ? parseFloat(r.qty.value) : NaN;
    const hours = r.hours ? parseFloat(r.hours.value) : NaN;
    return {
      ...(!isNaN(watts) ? { watts: Math.max(1, Math.min(5000, Math.round(watts))) } : {}),
      ...(!isNaN(qty) ? { qty: Math.max(0, Math.min(50, Math.round(qty))) } : {}),
      ...(!isNaN(hours) ? { hours: Math.max(0, Math.min(24, hours)) } : {}),
    };
  }

  function handleCalculate() {
    const updated = appliances.map((a) => {
      const vals = readAppliance(a.id);
      return { ...a, ...vals };
    });
    setAppliances(updated);
    try {
      const r = calculate({ appliances: updated, sunHours, autonomyDays, battery, systemVoltage });
      setResult(r);
    } catch {
      setResult(null);
    }
  }

  return (
    <div>
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
              Add your appliances, set your preferences, then click <strong>Calculate</strong>.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        {/* Step 1: Appliances */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">1</span>
            <div>
              <h2 className="text-lg font-semibold">Your appliances</h2>
              <p className="text-sm text-muted-foreground">Everything you plan to run on solar</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {appliances.map((a) => (
              <div key={a.id} className="rounded-xl border bg-surface px-3 py-2 md:px-4">
                <input
                  type="text"
                  value={a.name}
                  onChange={(e) => updateName(a.id, e.target.value)}
                  className="mb-2 block w-full rounded-md bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-3">
                  <div className="flex flex-col md:flex-row md:items-center md:gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground md:sr-only">Watts</label>
                    <input
                      ref={(el) => { if (!refs.current[a.id]) refs.current[a.id] = { watts: null, qty: null, hours: null }; refs.current[a.id].watts = el; }}
                      type="number"
                      defaultValue={a.watts}
                      min={1}
                      max={5000}
                      className="w-full rounded-md bg-background/60 px-2 py-1.5 text-right font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground md:sr-only">Qty</label>
                    <input
                      ref={(el) => { if (!refs.current[a.id]) refs.current[a.id] = { watts: null, qty: null, hours: null }; refs.current[a.id].qty = el; }}
                      type="number"
                      defaultValue={a.qty}
                      min={0}
                      max={50}
                      className="w-full rounded-md bg-background/60 px-2 py-1.5 text-right font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground md:sr-only">Hrs</label>
                    <input
                      ref={(el) => { if (!refs.current[a.id]) refs.current[a.id] = { watts: null, qty: null, hours: null }; refs.current[a.id].hours = el; }}
                      type="number"
                      defaultValue={a.hours}
                      min={0}
                      max={24}
                      step={0.5}
                      className="w-full rounded-md bg-background/60 px-2 py-1.5 text-right font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAppliance(a.id)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={"Remove " + a.name}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Quick add</p>
            <div className="flex flex-wrap gap-1.5">
              {APPLIANCE_PRESETS.map((p) => (
                <button key={p.name} type="button" onClick={() => addAppliance(p)}
                  className="inline-flex items-center gap-1 rounded-full border bg-surface px-3 py-1.5 text-xs text-foreground/80 hover:bg-accent hover:text-foreground">
                  <Plus className="h-3 w-3" /> {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Preferences */}
        <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">2</span>
            <div>
              <h2 className="text-lg font-semibold">System preferences</h2>
              <p className="text-sm text-muted-foreground">Fine-tune for your location</p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <RangeField label="Peak sun hours" value={sunHours} onChange={setSunHours} min={3.5} max={6} step={0.1} suffix="hrs" hint="Nigeria averages ~5.0 hrs/day" />
            <RangeField label="Battery autonomy" value={autonomyDays} onChange={setAutonomyDays} min={0.5} max={3} step={0.5} suffix="days" hint="Backup days with no sun" />
            <Segmented label="Battery type" value={battery} onChange={(v) => setBattery(v as "lithium" | "tubular")} options={[{ value: "lithium", label: "LiFePO4" }, { value: "tubular", label: "Tubular" }]} />
            <Segmented label="System voltage" value={String(systemVoltage)} onChange={(v) => setSystemVoltage(Number(v) as 24 | 48)} options={[{ value: "24", label: "24 V" }, { value: "48", label: "48 V" }]} />
          </div>
        </div>

        {/* Calculate button */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleCalculate}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:brightness-110 active:scale-[0.97]"
          >
            <Calculator className="h-5 w-5" /> Calculate my system
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-10 space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  <Calculator className="-mt-0.5 mr-1 inline h-3.5 w-3.5" /> Recommended system
                </p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <ResultCard icon={Zap} label="Daily energy" value={`${result.dailyEnergyKWh.toFixed(1)} kWh`} />
                <ResultCard icon={Sun} label="Solar array" value={`${result.panelCountW550} × 550W`} />
                <ResultCard icon={Cpu} label="Inverter" value={`${result.inverterKVA} kVA`} />
                <ResultCard icon={BatteryCharging} label="Battery" value={`${result.batteryCapacityKWh.toFixed(1)} kWh`} />
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cost &amp; savings</p>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="col-span-2 rounded-xl border bg-surface p-5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Estimated total cost</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-primary">{formatNGN(result.estimatedCostNGN)}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Hardware + BOS + installation</p>
                </div>
                <ImpactBadge icon={TrendingDown} label="Payback" value={result.paybackMonths > 0 ? `${result.paybackMonths.toFixed(1)} mo` : "—"} />
                <ImpactBadge icon={Leaf} label="CO₂/yr" value={`${formatNumber(result.co2SavedKgPerYear)} kg`} />
                <ImpactBadge icon={Zap} label="Gen savings/mo" value={formatNGN(result.monthlyGenSavingsNGN)} />
                <ImpactBadge icon={Sun} label="Trees equiv." value={`${result.treesEquivalent} trees`} />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/shop" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
                  Build this system <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/shop" className="inline-flex items-center justify-center rounded-full border bg-card px-6 py-3 text-sm font-medium hover:bg-surface">
                  Shop kits
                </Link>
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
          </div>
        )}
      </section>
    </div>
  );
}

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
