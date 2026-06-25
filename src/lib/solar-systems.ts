import { useCallback, useEffect, useState } from "react";
import { getProducts } from "./products";
import { SEED_PRODUCTS } from "./seed-products";
import { supabase } from "./supabase";

function _adminProducts() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("itel.admin.products") : null;
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p) && p.length > 0) return p;
    }
  } catch {}
  return null;
}

export function calculateSystemPrice(components: SolarComponent[]): number {
  const products = _adminProducts() ?? SEED_PRODUCTS;
  let total = 0;
  for (const comp of components) {
    const p = products.find((p) => p.name.includes(comp.name) || comp.name.includes(p.name));
    if (p) {
      total += p.price * comp.qty;
    } else {
      let fallbackPrice = 50000;
      if (comp.name.includes("32A") || comp.name.includes("63A")) fallbackPrice = 25000;
      else if (comp.name.includes("Combiner")) fallbackPrice = 65000;
      else if (comp.name.includes("100A") || comp.name.includes("160A")) fallbackPrice = 85000;
      else if (comp.name.includes("Surge")) fallbackPrice = 40000;
      else if (comp.name.includes("Meter")) fallbackPrice = 120000;
      else if (comp.name.includes("Gateway")) fallbackPrice = 90000;
      total += fallbackPrice * comp.qty;
    }
  }
  return Math.round((total * 1.15) / 1000) * 1000;
}

export type SolarComponent = {
  type: "panel" | "inverter" | "battery" | "accessory";
  name: string;
  spec: string;
  qty: number;
};

export type SolarSystem = {
  slug: string;
  name: string;
  tagline: string;
  description?: string;
  images: string[];
  badge?: string;
  rating: number;
  reviews: number;
  voltage: "24V" | "48V";
  totalPanels: number;
  panelWattage: number;
  inverterKVA: number;
  batteryCapacityKWh: number;
  batteryType: "LiFePO4" | "Tubular";
  price: number;
  /** Full price before discount — if set, a discount badge is shown to customers */
  originalPrice?: number;
  whatItPowers: string;
  components: SolarComponent[];
  installationAccessories: string[];
  highlights: string[];
};

/** Tiny placeholder SVG — ~200 bytes instead of ~6KB */
function genImg(slug: string, i: number): string {
  const palette = ["#f97316", "#2563eb", "#059669", "#d97706", "#7c3aed"];
  const c = palette[i % palette.length];
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 400 250">
    <rect width="400" height="250" fill="${c}" rx="12"/>
    <rect width="400" height="250" fill="url(#g)" rx="12" opacity="0.35"/>
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.15"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></linearGradient></defs>
    <text x="200" y="120" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="system-ui,sans-serif" font-size="20" font-weight="700">${name}</text>
    <text x="200" y="145" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="system-ui,sans-serif" font-size="12">Complete Solar Energy System</text>
    <text x="200" y="175" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-family="system-ui,sans-serif" font-size="10">Slide ${i + 1} of 5</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function seedImages(slug: string): string[] {
  return [0, 1, 2, 3, 4].map((i) => genImg(slug, i));
}

export function generateDescription(system: SolarSystem): string {
  const arrayKw = ((system.totalPanels * system.panelWattage) / 1000).toFixed(2);
  const dailyKwh = ((system.totalPanels * system.panelWattage * 5.5) / 1000).toFixed(1);
  const monthlyKwh = (Number(dailyKwh) * 30).toFixed(0);
  const panelDesc =
    system.totalPanels >= 10
      ? "high-efficiency N-type bifacial panels that capture light from both sides for maximum yield"
      : `premium ${system.panelWattage}W monocrystalline PERC panels with anti-reflective coating`;
  const batteryDesc =
    system.batteryCapacityKWh >= 10
      ? `${system.batteryCapacityKWh}kWh ${system.batteryType} battery bank delivers whole-home or business-grade energy reserve, supporting ${system.batteryCapacityKWh >= 15 ? "heavy loads like borehole pumps, multiple air conditioners, and commercial kitchen equipment" : "multiple air conditioners, kitchen appliances, and home entertainment systems"} through extended grid outages`
      : `${system.batteryCapacityKWh}kWh ${system.batteryType} battery provides enough stored energy to run your essential loads — lights, fans, TVs, refrigerator, and internet — through any outage`;
  const inverterDesc =
    system.inverterKVA >= 10
      ? `The ${system.inverterKVA}kVA hybrid inverter features ${system.inverterKVA >= 15 ? "triple MPPT" : "dual MPPT"} charge controllers, allowing it to harvest maximum power from ${system.totalPanels} panels even with ${system.totalPanels >= 10 ? "multiple roof orientations" : "mixed morning and afternoon sun"}`
      : `The ${system.inverterKVA}kVA pure sine wave hybrid inverter intelligently switches between solar, battery, and grid power — ensuring uninterrupted supply while prioritising solar to minimise your electricity bill`;

  const t = [
    `The <strong>${system.name}</strong> is a complete ${system.voltage} solar energy system engineered for Nigerian homes and businesses. It combines ${system.totalPanels} × ${system.panelWattage}W ${panelDesc} with a ${system.inverterKVA}kVA pure sine wave hybrid inverter and a ${system.batteryCapacityKWh}kWh ${system.batteryType} battery bank — delivering a total solar array capacity of <strong>${arrayKw}kW</strong>.`,
    `This system generates approximately <strong>${dailyKwh}kWh</strong> of clean energy per day (${monthlyKwh}kWh/month) based on Nigeria's average 5.5 peak sun hours. The ${batteryDesc}. ${inverterDesc}.`,
    `${system.whatItPowers.split(".")[0]}. Every component is selected, tested, and matched by Itel's engineers to ensure seamless integration, maximum efficiency, and years of trouble-free operation. All required installation accessories — including racking, cables, breakers, and earthing kit — ship with the system for a complete turnkey solution.`,
  ];
  return t.join("\n\n");
}

export function seedSolarSystems(): SolarSystem[] {
  const systems: SolarSystem[] = [
    {
      slug: "solar-starter-3kva",
      name: "Itel Essential Home 3kVA",
      tagline:
        "Backup for lights, fans, TV, and router — keeps your essentials running through any outage.",
      images: seedImages("solar-starter-3kva"),
      badge: "Best for homes",
      rating: 4.9,
      reviews: 312,
      voltage: "24V",
      totalPanels: 4,
      panelWattage: 550,
      inverterKVA: 3,
      batteryCapacityKWh: 5.12,
      batteryType: "LiFePO4",
      price: 2850000,
      whatItPowers:
        '8 LED bulbs (8 hrs), 2 ceiling fans (8 hrs), 43" LED TV (6 hrs), decoder (6 hrs), WiFi router (24 hrs), refrigerator (24 hrs), 2 phones/laptops (4 hrs). Total daily load: ~4.8 kWh',
      components: [
        { type: "panel", name: "Itel Mono PERC 550W", spec: "550W / Mono PERC", qty: 4 },
        {
          type: "inverter",
          name: "Itel Hybrid Inverter 3kVA",
          spec: "3kVA / 24V / 60A MPPT",
          qty: 1,
        },
        {
          type: "battery",
          name: "Itel LiFePO4 5.12kWh",
          spec: "5.12kWh / 48V / Wall-Mount",
          qty: 1,
        },
        { type: "accessory", name: "DC Isolator Switch 32A", spec: "32A / IP65", qty: 1 },
        { type: "accessory", name: "PV Combiner Box 4-String", spec: "4-string / 1000V", qty: 1 },
      ],
      installationAccessories: [
        "Roof mount rails (set of 4) — aluminum, corrosion-resistant",
        "Solar DC cable 6mm² — 50m, UV-resistant tinned copper",
        "MC4 connectors (8 pairs) — IP67 rated",
        "AC breaker 32A + DC breaker 63A — DIN rail mounted",
        "Earthing kit — copper rod + clamp + 6mm² earth cable",
        "Cable ties, conduit, and labelling kit",
      ],
      highlights: [
        "4 × 550W high-efficiency mono PERC panels",
        "3kVA pure sine wave hybrid inverter with 60A MPPT",
        "5.12kWh LiFePO4 battery — 6000+ cycles, 10-year life",
        "Supports 2–3 bedroom home essential loads",
        "Smart WiFi monitoring via mobile app",
        "18-month typical payback vs generator",
      ],
    },
    {
      slug: "solar-standard-5kva",
      name: "Itel Comfort Plus 5kVA",
      tagline: "Power your whole home — including a 1HP AC, microwave, and washing machine.",
      images: seedImages("solar-standard-5kva"),
      badge: "Popular pick",
      rating: 4.92,
      reviews: 487,
      voltage: "48V",
      totalPanels: 6,
      panelWattage: 550,
      inverterKVA: 5,
      batteryCapacityKWh: 10.24,
      batteryType: "LiFePO4",
      price: 5200000,
      whatItPowers:
        '12 LED bulbs (8 hrs), 3 ceiling fans (10 hrs), 55" LED TV (8 hrs), decoder (8 hrs), WiFi router (24 hrs), refrigerator (24 hrs), 1HP air conditioner (6 hrs), microwave (30 min/day), washing machine (2 hrs/day), 3 laptops (6 hrs). Total daily load: ~9.2 kWh',
      components: [
        { type: "panel", name: "Itel Mono PERC 550W", spec: "550W / Mono PERC", qty: 6 },
        {
          type: "inverter",
          name: "Itel Hybrid Inverter 5kVA",
          spec: "5kVA / 48V / 80A MPPT",
          qty: 1,
        },
        {
          type: "battery",
          name: "Itel LiFePO4 5.12kWh",
          spec: "5.12kWh / 48V / Wall-Mount",
          qty: 2,
        },
        { type: "accessory", name: "DC Isolator Switch 63A", spec: "63A / IP65", qty: 1 },
        { type: "accessory", name: "PV Combiner Box 6-String", spec: "6-string / 1000V", qty: 1 },
        {
          type: "accessory",
          name: "Surge Protection Device",
          spec: "40kA / Type 2 / DC+AC",
          qty: 2,
        },
      ],
      installationAccessories: [
        "Roof mount rails (set of 6) — aluminum, corrosion-resistant",
        "Solar DC cable 6mm² — 80m, UV-resistant tinned copper",
        "MC4 connectors (12 pairs) — IP67 rated",
        "AC breaker 63A + DC breaker 100A — DIN rail mounted",
        "Earthing kit — copper rod + clamp + 6mm² earth cable",
        "Battery rack (stackable) — for dual battery setup",
        "Cable ties, conduit, and labelling kit",
      ],
      highlights: [
        "6 × 550W high-efficiency mono PERC panels",
        "5kVA pure sine wave hybrid inverter with 80A dual MPPT",
        "10.24kWh LiFePO4 battery bank — 6000+ cycles",
        "Powers 1HP AC, microwave, washing machine + full home",
        "Parallel-ready — expand to 15kVA / 30kWh later",
        "Smart WiFi monitoring + generator auto-start",
      ],
    },
    {
      slug: "solar-business-10kva",
      name: "Itel Business Pro 10kVA",
      tagline: "Run a small business, clinic, or shop through any blackout — no generator needed.",
      images: seedImages("solar-business-10kva"),
      badge: "For business",
      rating: 4.95,
      reviews: 218,
      voltage: "48V",
      totalPanels: 8,
      panelWattage: 550,
      inverterKVA: 10,
      batteryCapacityKWh: 15.36,
      batteryType: "LiFePO4",
      price: 8950000,
      whatItPowers:
        '20 LED bulbs (10 hrs), 6 ceiling fans (10 hrs), 2 × 55" TVs (10 hrs), CCTV system (24 hrs), WiFi + router (24 hrs), 2 refrigerators (24 hrs), 1.5HP AC (8 hrs), 1HP AC (6 hrs), microwave (1 hr/day), water dispenser (24 hrs), 4 laptops (8 hrs), printer (2 hrs), POS system (12 hrs). Total daily load: ~18.5 kWh',
      components: [
        { type: "panel", name: "Itel Mono PERC 550W", spec: "550W / Mono PERC", qty: 8 },
        {
          type: "inverter",
          name: "Itel Hybrid Inverter 10kVA",
          spec: "10kVA / 48V / Dual MPPT",
          qty: 1,
        },
        {
          type: "battery",
          name: "Itel LiFePO4 5.12kWh",
          spec: "5.12kWh / 48V / Wall-Mount",
          qty: 3,
        },
        { type: "accessory", name: "DC Isolator Switch 100A", spec: "100A / IP65", qty: 1 },
        { type: "accessory", name: "PV Combiner Box 8-String", spec: "8-string / 1000V", qty: 1 },
        {
          type: "accessory",
          name: "Surge Protection Device",
          spec: "40kA / Type 2 / DC+AC",
          qty: 2,
        },
        {
          type: "accessory",
          name: "Energy Meter (MID Certified)",
          spec: "3-phase / RS485",
          qty: 1,
        },
      ],
      installationAccessories: [
        "Roof mount rails (set of 8) — heavy-duty aluminum",
        "Solar DC cable 10mm² — 100m, UV-resistant tinned copper",
        "MC4 connectors (16 pairs) — IP67 rated",
        "AC breaker 100A + DC breaker 160A",
        "Earthing kit — dual copper rods + 10mm² earth cable",
        "Battery rack (stackable) — for triple battery setup",
        "Cable tray + conduit + labelling kit",
        "Changeover switch (manual) — 100A, 4-pole",
      ],
      highlights: [
        "8 × 550W high-efficiency mono PERC panels",
        "10kVA pure sine wave hybrid inverter with dual MPPT",
        "15.36kWh LiFePO4 battery bank — 6000+ cycles",
        "Powers multiple ACs, full office, kitchen equipment",
        "Dual MPPT for east/west roof orientation harvest",
        "24-month typical payback vs diesel generator",
      ],
    },
    {
      slug: "solar-premium-15kva",
      name: "Itel Enterprise 15kVA",
      tagline: "Whole-property backup with 20kWh storage — the ultimate solar system.",
      images: seedImages("solar-premium-15kva"),
      badge: "Premium",
      rating: 4.98,
      reviews: 96,
      voltage: "48V",
      totalPanels: 12,
      panelWattage: 600,
      inverterKVA: 15,
      batteryCapacityKWh: 20.48,
      batteryType: "LiFePO4",
      price: 15800000,
      whatItPowers:
        '30 LED bulbs (12 hrs), 8 ceiling fans (12 hrs), 3 × 65" TVs (10 hrs), CCTV (24 hrs), whole-home WiFi mesh (24 hrs), 2 refrigerators (24 hrs), freezer (24 hrs), 1.5HP AC (10 hrs), 2 × 1HP AC (8 hrs), borehole pump 1HP (2 hrs/day), microwave (1 hr), oven (1 hr), washing machine (3 hrs), 6 laptops (8 hrs), home theatre (4 hrs), workshop tools (3 hrs). Total daily load: ~32 kWh',
      components: [
        {
          type: "panel",
          name: "Itel N-Type Bifacial 600W",
          spec: "600W / Bifacial / N-Type",
          qty: 12,
        },
        {
          type: "inverter",
          name: "Itel Hybrid Inverter 15kVA",
          spec: "15kVA / 48V / Triple MPPT",
          qty: 1,
        },
        {
          type: "battery",
          name: "Itel LiFePO4 5.12kWh",
          spec: "5.12kWh / 48V / Wall-Mount",
          qty: 4,
        },
        { type: "accessory", name: "DC Isolator Switch 160A", spec: "160A / IP65", qty: 1 },
        {
          type: "accessory",
          name: "PV Combiner Box 12-String",
          spec: "12-string / 1000V / With SPD",
          qty: 1,
        },
        {
          type: "accessory",
          name: "Surge Protection Device",
          spec: "40kA / Type 2 / DC+AC",
          qty: 2,
        },
        {
          type: "accessory",
          name: "Energy Meter (MID Certified)",
          spec: "3-phase / RS485 / Bi-directional",
          qty: 1,
        },
        {
          type: "accessory",
          name: "Remote Monitoring Gateway",
          spec: "4G / WiFi / Ethernet",
          qty: 1,
        },
      ],
      installationAccessories: [
        "Roof mount rails (set of 12) — heavy-duty galvanized steel",
        "Solar DC cable 10mm² — 150m, UV-resistant tinned copper",
        "MC4 connectors (24 pairs) — IP67 rated",
        "AC breaker 160A + DC breaker 200A",
        "Earthing kit — triple copper rods + 16mm² earth cable",
        "Battery rack (stackable) — for quad battery setup",
        "Cable tray + conduit + labelling kit",
        "Changeover switch (automatic) — 160A, 4-pole",
        "Fire extinguisher (CO₂) — for battery area",
      ],
      highlights: [
        "12 × 600W N-Type bifacial panels — up to 25% extra yield",
        "15kVA pure sine wave hybrid inverter with triple MPPT",
        "20.48kWh LiFePO4 battery bank — 6000+ cycles, 10-year warranty",
        "Runs entire property including borehole pump + ACs + kitchen",
        "N-Type TOPCon cells with 30-year power warranty",
        "Automatic changeover + remote monitoring included",
        "Eliminates generator completely — 30-month typical payback",
      ],
    },
  ];
  return systems.map((s) => ({ ...s, price: calculateSystemPrice(s.components) }));
}

const KEY = "itel.admin.solarsystems";

function migrateSystem(s: SolarSystem): SolarSystem {
  return {
    ...s,
    images: Array.isArray(s.images) && s.images.length > 0 ? s.images : seedImages(s.slug),
    whatItPowers: s.whatItPowers || "",
    price: s.components ? calculateSystemPrice(s.components) : s.price,
  };
}

export function useSolarSystems(): [
  SolarSystem[],
  (slug: string, price: number) => void,
  (system: SolarSystem) => void,
  (slug: string) => void,
] {
  const [systems, setSystems] = useState<SolarSystem[]>([]);

  useEffect(() => {
    supabase
      .from("solar_systems")
      .select("*")
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setSystems(seedSolarSystems());
        } else {
          setSystems((data as SolarSystem[]).map(migrateSystem));
        }
      });
  }, []);

  const updatePrice = useCallback((slug: string, price: number) => {
    setSystems((prev) => prev.map((s) => (s.slug === slug ? { ...s, price } : s)));
    supabase.from("solar_systems").update({ price }).eq("slug", slug).then();
  }, []);

  const addSystem = useCallback((system: SolarSystem) => {
    setSystems((prev) => [
      ...prev,
      { ...system, images: system.images?.length ? system.images : seedImages(system.slug) },
    ]);
    supabase.from("solar_systems").insert(system).then();
  }, []);

  const deleteSystem = useCallback((slug: string) => {
    setSystems((prev) => prev.filter((s) => s.slug !== slug));
    supabase.from("solar_systems").delete().eq("slug", slug).then();
  }, []);

  return [systems, updatePrice, addSystem, deleteSystem];
}

export function getSystem(slug: string, systems: SolarSystem[]): SolarSystem | undefined {
  return systems.find((s) => s.slug === slug);
}

export async function fetchSolarSystems(): Promise<SolarSystem[]> {
  try {
    const { data, error } = await supabase.from("solar_systems").select("*");
    if (error || !data || data.length === 0) return seedSolarSystems();
    return data as SolarSystem[];
  } catch {
    return seedSolarSystems();
  }
}

export async function fetchSystem(slug: string): Promise<SolarSystem | undefined> {
  try {
    const { data, error } = await supabase.from("solar_systems").select("*").eq("slug", slug).single();
    if (error || !data) {
      const fallback = seedSolarSystems();
      return getSystem(slug, fallback);
    }
    return data as SolarSystem;
  } catch {
    const fallback = seedSolarSystems();
    return getSystem(slug, fallback);
  }
}
