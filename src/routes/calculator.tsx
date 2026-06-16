import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { formatNGN } from "@/lib/format";
import {
  APPLIANCE_PRESETS,
  calculate,
  uid,
} from "@/lib/calculator";
import {
  Calculator,
  Plus,
  Trash2,
  Sparkles,
  Sun,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Solar Calculator — Itel Energy" },
      { name: "description", content: "Size your system in 60 seconds." },
    ],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const [items, setItems] = useState(() => [
    { id: uid(), name: "LED bulb", w: 10, q: 8, h: 6 },
    { id: uid(), name: 'TV (LED 43")', w: 100, q: 1, h: 6 },
    { id: uid(), name: "Refrigerator", w: 150, q: 1, h: 24 },
    { id: uid(), name: "Ceiling fan", w: 75, q: 2, h: 8 },
    { id: uid(), name: "Router", w: 15, q: 1, h: 24 },
    { id: uid(), name: "Laptop", w: 65, q: 1, h: 6 },
  ]);
  const [sun, setSun] = useState(5);
  const [auto, setAuto] = useState(1);
  const [bat, setBat] = useState("lithium");
  const [volt, setVolt] = useState(48);

  const r = calculate({
    appliances: items.map((i) => ({ id: i.id, name: i.name, watts: i.w, qty: i.q, hours: i.h })),
    sunHours: sun,
    autonomyDays: auto,
    battery: bat as "lithium" | "tubular",
    systemVoltage: volt as 24 | 48,
  });

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-page py-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Itel Smart Sizing
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
            Solar System Calculator
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Add your appliances, get instant results.
          </p>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="mx-auto max-w-5xl">
          {/* Inputs */}
          <div className="rounded-2xl border bg-card p-4 md:p-6">
            <h2 className="text-base font-semibold">Your Appliances</h2>
            <div className="mt-3 space-y-2">
              {items.map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-lg border bg-surface px-3 py-2">
                  <input
                    type="text"
                    value={a.name}
                    onChange={(e) => setItems((prev) => prev.map((x) => x.id === a.id ? { ...x, name: e.target.value } : x))}
                    className="min-w-0 flex-1 rounded bg-transparent px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="number"
                    value={a.w}
                    onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) setItems((prev) => prev.map((x) => x.id === a.id ? { ...x, w: Math.max(1, Math.min(5000, v)) } : x)); }}
                    className="w-14 rounded bg-background/60 px-1 py-1 text-right text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    min={1}
                    max={5000}
                  />
                  <input
                    type="number"
                    value={a.q}
                    onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) setItems((prev) => prev.map((x) => x.id === a.id ? { ...x, q: Math.max(0, Math.min(50, v)) } : x)); }}
                    className="w-12 rounded bg-background/60 px-1 py-1 text-right text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    min={0}
                    max={50}
                  />
                  <input
                    type="number"
                    value={a.h}
                    onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setItems((prev) => prev.map((x) => x.id === a.id ? { ...x, h: Math.max(0, Math.min(24, v)) } : x)); }}
                    className="w-12 rounded bg-background/60 px-1 py-1 text-right text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    min={0}
                    max={24}
                    step={0.5}
                  />
                  <button type="button" onClick={() => setItems((prev) => prev.filter((x) => x.id !== a.id))}
                    className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:text-destructive" aria-label="Remove">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {APPLIANCE_PRESETS.map((p) => (
                <button key={p.name} type="button" onClick={() => setItems((prev) => [...prev, { id: uid(), name: p.name, w: p.watts, q: 1, h: 4 }])}
                  className="inline-flex items-center gap-1 rounded-full border bg-surface px-3 py-1.5 text-xs hover:bg-accent">
                  <Plus className="h-3 w-3" /> {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="mt-4 grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-4 md:p-6">
            <div>
              <label className="text-xs font-medium">Sun hours</label>
              <input type="range" value={sun} onChange={(e) => setSun(parseFloat(e.target.value))} min={3.5} max={6} step={0.1} className="range-slider mt-1 w-full" />
              <span className="text-xs text-muted-foreground">{sun} hrs</span>
            </div>
            <div>
              <label className="text-xs font-medium">Autonomy</label>
              <input type="range" value={auto} onChange={(e) => setAuto(parseFloat(e.target.value))} min={0.5} max={3} step={0.5} className="range-slider mt-1 w-full" />
              <span className="text-xs text-muted-foreground">{auto} days</span>
            </div>
            <div>
              <label className="text-xs font-medium">Battery</label>
              <select value={bat} onChange={(e) => setBat(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs">
                <option value="lithium">LiFePO4</option>
                <option value="tubular">Tubular</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Voltage</label>
              <select value={volt} onChange={(e) => setVolt(parseInt(e.target.value))} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs">
                <option value={24}>24 V</option>
                <option value={48}>48 V</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="mt-6 rounded-2xl border bg-card p-4 md:p-6">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Results</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border bg-surface p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Daily Energy</p>
                <p className="font-mono text-sm font-bold">{r.dailyEnergyKWh.toFixed(1)} kWh</p>
              </div>
              <div className="rounded-xl border bg-surface p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Solar Array</p>
                <p className="font-mono text-sm font-bold">{r.panelCountW550} × 550W</p>
              </div>
              <div className="rounded-xl border bg-surface p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Inverter</p>
                <p className="font-mono text-sm font-bold">{r.inverterKVA} kVA</p>
              </div>
              <div className="rounded-xl border bg-surface p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Battery</p>
                <p className="font-mono text-sm font-bold">{r.batteryCapacityKWh.toFixed(1)} kWh</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border bg-surface p-4">
              <p className="text-[10px] uppercase text-muted-foreground">Estimated Cost</p>
              <p className="text-2xl font-bold text-primary">{formatNGN(r.estimatedCostNGN)}</p>
            </div>
            <div className="mt-4">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                Shop equipment <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
