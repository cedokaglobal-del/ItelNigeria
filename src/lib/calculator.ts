/**
 * ItelNigeria solar sizing engine.
 * Conservative, transparent assumptions tuned for Nigeria.
 * All hardware prices are pulled LIVE from the product catalog.
 */

import type { Product } from "./products";

/** Generate a unique ID with a polyfill-safe fallback */
export function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
  }
}

export type Appliance = {
  id: string;
  name: string;
  watts: number;
  qty: number;
  hours: number;
};

export const APPLIANCE_PRESETS: Omit<Appliance, "id" | "qty" | "hours">[] = [
  { name: "LED bulb", watts: 10 },
  { name: "Ceiling fan", watts: 75 },
  { name: "Standing fan", watts: 60 },
  { name: 'TV (LED 43")', watts: 100 },
  { name: "Decoder", watts: 25 },
  { name: "Laptop", watts: 65 },
  { name: "Desktop PC", watts: 200 },
  { name: "Refrigerator", watts: 150 },
  { name: "Freezer", watts: 250 },
  { name: "Chest freezer", watts: 120 },
  { name: "Microwave", watts: 1100 },
  { name: "Electric kettle", watts: 1500 },
  { name: "Toaster", watts: 800 },
  { name: "Iron", watts: 1200 },
  { name: "Washing machine", watts: 500 },
  { name: "1HP AC", watts: 750 },
  { name: "1.5HP AC", watts: 1100 },
  { name: "Water heater", watts: 1500 },
  { name: "Water pump", watts: 750 },
  { name: "Borehole pump", watts: 1500 },
  { name: "CCTV system", watts: 50 },
  { name: "Sound system", watts: 200 },
  { name: "Router / WiFi", watts: 15 },
];

export type CalcInput = {
  appliances: Appliance[];
  /** Peak sun hours per day (Nigeria avg ~5.0) */
  sunHours: number;
  /** Days of autonomy from batteries */
  autonomyDays: number;
  /** Battery type */
  battery: "lithium" | "tubular";
  /** System voltage */
  systemVoltage: 24 | 48;
};

export type CalcResult = {
  dailyEnergyKWh: number;
  peakLoadW: number;
  panelCountW550: number;
  panelArrayKW: number;
  inverterKVA: number;
  batteryCapacityKWh: number;
  controllerAmps: number;
  estimatedCostNGN: number;
  monthlyGenSavingsNGN: number;
  paybackMonths: number;
  co2SavedKgPerYear: number;
  treesEquivalent: number;
  breakdown: { label: string; value: string; tone?: "solar" | "tech" | "muted" }[];
  costBreakdown: { label: string; amount: number }[];
};

const PANEL_W = 550;
const BOS_FACTOR = 0.18; // balance of system + install overhead

const LITHIUM_DOD = 0.9;
const TUBULAR_DOD = 0.5;
const INVERTER_EFF = 0.92;
const BATTERY_EFF = 0.95;
const PANEL_DERATE = 0.8; // dust/temp/wiring

/** Diesel-generator avoided cost per kWh in Nigeria (rough). */
const GEN_COST_PER_KWH = 850;

// ── Pull prices from the live product catalog ──────────────────────────────
function catalogPrice(products: Product[], category: string, minKVA?: number): number {
  const matches = products.filter((p) => p.category === category);
  if (matches.length === 0) return 0;

  if (category === "inverters" && minKVA) {
    // Find the cheapest inverter whose spec contains a kVA >= minKVA
    const suitable = matches
      .filter((p) => {
        const m = p.spec.match(/(\d+(?:\.\d+)?)\s*kVA/i);
        return m ? parseFloat(m[1]) >= minKVA : false;
      })
      .sort((a, b) => a.price - b.price);
    if (suitable.length > 0) return suitable[0].price;
    // Fall back to highest kVA available
    return matches.sort((a, b) => b.price - a.price)[0].price;
  }

  if (category === "batteries") {
    // Return price per kWh based on cheapest battery in catalog
    const cheapest = matches.sort((a, b) => a.price - b.price)[0];
    const m = cheapest.spec.match(/(\d+(?:\.\d+)?)\s*kWh/i);
    const kwh = m ? parseFloat(m[1]) : 5.12;
    return cheapest.price / kwh; // price per kWh
  }

  if (category === "controllers") {
    const cheapest = matches.sort((a, b) => a.price - b.price)[0];
    const m = cheapest.spec.match(/(\d+)\s*A/i);
    const amps = m ? parseInt(m[1]) : 60;
    return cheapest.price / amps; // price per amp
  }

  // panels: return price per panel (cheapest 550W)
  if (category === "panels") {
    const panel550 = matches
      .filter((p) => p.spec.includes("550"))
      .sort((a, b) => a.price - b.price);
    if (panel550.length > 0) return panel550[0].price;
    return matches.sort((a, b) => a.price - b.price)[0].price;
  }

  return matches.sort((a, b) => a.price - b.price)[0].price;
}

export function calculate(input: CalcInput, products: Product[]): CalcResult {
  const { appliances, sunHours, autonomyDays, battery, systemVoltage } = input;

  const dailyEnergyWh = appliances.reduce((s, a) => s + a.watts * a.qty * a.hours, 0);
  const dailyEnergyKWh = dailyEnergyWh / 1000;
  const peakLoadW = appliances.reduce((s, a) => s + a.watts * a.qty, 0);

  // Panel array sizing accounting for inverter & battery losses + derate
  const requiredSolarKWh = dailyEnergyKWh / (INVERTER_EFF * BATTERY_EFF * PANEL_DERATE);
  const panelArrayKW = sunHours > 0 ? requiredSolarKWh / sunHours : 0;
  const panelCountW550 = Math.max(1, Math.ceil((panelArrayKW * 1000) / PANEL_W));

  // Inverter: 1.25x peak load, rounded up to nearest 1kVA
  const inverterKVA = Math.max(1, Math.ceil(((peakLoadW / 1000) * 1.25) / 1) * 1);

  // Battery: cover autonomyDays of load, factoring DoD + inverter eff
  const dod = battery === "lithium" ? LITHIUM_DOD : TUBULAR_DOD;
  const batteryCapacityKWh = (dailyEnergyKWh * autonomyDays) / (dod * INVERTER_EFF);

  // Controller current
  const controllerAmps = Math.ceil((panelCountW550 * PANEL_W) / systemVoltage / 0.9);

  // ── Prices from product catalog ──
  const panelUnitPrice = catalogPrice(products, "panels");
  const batteryPricePerKWh = catalogPrice(products, "batteries");
  const inverterUnitPrice = catalogPrice(products, "inverters", inverterKVA);
  const controllerPricePerAmp = catalogPrice(products, "controllers") || 2400;

  const panelsCost = panelCountW550 * panelUnitPrice;
  const batteryCost = batteryCapacityKWh * batteryPricePerKWh;
  const inverterCost = inverterUnitPrice; // one inverter unit
  const controllerCost = controllerAmps * controllerPricePerAmp;
  const hardware = panelsCost + batteryCost + inverterCost + controllerCost;
  const bosCost = Math.round(hardware * BOS_FACTOR);
  const estimatedCostNGN = hardware + bosCost;

  // ROI vs generator
  const monthlyGenSavingsNGN = Math.round(dailyEnergyKWh * 30 * GEN_COST_PER_KWH);
  const paybackMonths = monthlyGenSavingsNGN > 0 ? estimatedCostNGN / monthlyGenSavingsNGN : 0;

  // Environmental impact
  const co2SavedKgPerYear = Math.round(dailyEnergyKWh * 365 * 0.7);
  const treesEquivalent = Math.round(co2SavedKgPerYear / 21);

  const costBreakdown: CalcResult["costBreakdown"] = [
    { label: `Solar panels (${panelCountW550} × 550W)`, amount: panelsCost },
    { label: `Inverter (${inverterKVA} kVA hybrid)`, amount: inverterCost },
    { label: `Battery bank (${batteryCapacityKWh.toFixed(1)} kWh)`, amount: Math.round(batteryCost) },
    { label: `Charge controller (${controllerAmps} A)`, amount: Math.round(controllerCost) },
    { label: "Balance of system + installation (18%)", amount: bosCost },
  ];

  const breakdown: CalcResult["breakdown"] = [
    { label: "Daily energy need", value: `${dailyEnergyKWh.toFixed(1)} kWh`, tone: "solar" },
    { label: "Peak load", value: `${(peakLoadW / 1000).toFixed(2)} kW` },
    {
      label: "Solar array",
      value: `${panelCountW550} × 550W = ${((panelCountW550 * PANEL_W) / 1000).toFixed(2)} kW`,
      tone: "solar",
    },
    { label: "Inverter", value: `${inverterKVA} kVA hybrid` },
    {
      label: "Battery bank",
      value: `${batteryCapacityKWh.toFixed(1)} kWh ${battery === "lithium" ? "LiFePO4" : "tubular"}`,
      tone: "tech",
    },
    { label: "Charge controller", value: `${controllerAmps} A MPPT` },
    { label: "System voltage", value: `${systemVoltage} V DC`, tone: "muted" },
  ];

  return {
    dailyEnergyKWh,
    peakLoadW,
    panelCountW550,
    panelArrayKW: (panelCountW550 * PANEL_W) / 1000,
    inverterKVA,
    batteryCapacityKWh,
    controllerAmps,
    estimatedCostNGN,
    monthlyGenSavingsNGN,
    paybackMonths,
    co2SavedKgPerYear,
    treesEquivalent,
    breakdown,
    costBreakdown,
  };
}
