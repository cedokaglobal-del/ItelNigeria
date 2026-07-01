import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

export function calculateSystemPrice(components: SolarComponent[], products: { name: string; price: number }[]): number {
  let total = 0;
  for (const comp of components) {
    const p = products.find((p) => p.name.includes(comp.name) || comp.name.includes(p.name));
    if (p) {
      total += p.price * comp.qty;
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

export function parseComponentSpec(comp: SolarComponent): {
  voltage?: number;
  watts?: number;
  kva?: number;
  kwh?: number;
} {
  const spec = comp.spec.toLowerCase();
  const result: { voltage?: number; watts?: number; kva?: number; kwh?: number } = {};

  // Parse voltage (e.g., "48V", "24V")
  const vMatch = spec.match(/(\d+(?:\.\d+)?)\s*v/);
  if (vMatch) result.voltage = parseFloat(vMatch[1]);

  // Parse watts (e.g., "550W", "600W")
  const wMatch = spec.match(/(\d+(?:\.\d+)?)\s*w(?!h)/);
  if (wMatch) result.watts = parseFloat(wMatch[1]);

  // Parse kVA (e.g., "5kVA", "3 kVA")
  const kvaMatch = spec.match(/(\d+(?:\.\d+)?)\s*kva/);
  if (kvaMatch) result.kva = parseFloat(kvaMatch[1]);

  // Parse kWh (e.g., "5.12kWh", "10 kWh")
  const kwhMatch = spec.match(/(\d+(?:\.\d+)?)\s*kwh/);
  if (kwhMatch) result.kwh = parseFloat(kwhMatch[1]);

  return result;
}

export function calculateSystemSpecs(components: SolarComponent[]): {
  voltage: "24V" | "48V";
  totalPanels: number;
  panelWattage: number;
  totalArrayKW: number;
  inverterKVA: number;
  batteryCapacityKWh: number;
  batteryType: "LiFePO4" | "Tubular";
} {
  let voltage: "24V" | "48V" = "48V";
  let totalPanels = 0;
  let panelWattage = 0;
  let inverterKVA = 0;
  let batteryCapacityKWh = 0;
  let batteryType: "LiFePO4" | "Tubular" = "LiFePO4";

  for (const comp of components) {
    if (!comp.name) continue;
    const parsed = parseComponentSpec(comp);
    const qty = comp.qty || 1;

    if (comp.type === "panel") {
      totalPanels += qty;
      if (parsed.watts) panelWattage = parsed.watts;
    } else if (comp.type === "inverter") {
      if (parsed.kva) inverterKVA = parsed.kva;
      if (parsed.voltage) voltage = parsed.voltage === 24 ? "24V" : "48V";
    } else if (comp.type === "battery") {
      if (parsed.kwh) batteryCapacityKWh += parsed.kwh * qty;
      if (comp.name.toLowerCase().includes("tubular")) batteryType = "Tubular";
    }
  }

  const totalArrayKW = (totalPanels * panelWattage) / 1000;

  return {
    voltage,
    totalPanels,
    panelWattage,
    totalArrayKW: Math.round(totalArrayKW * 100) / 100,
    inverterKVA,
    batteryCapacityKWh: Math.round(batteryCapacityKWh * 100) / 100,
    batteryType,
  };
}

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
  totalArrayKW: number;
  price: number;
  /** Full price before discount — if set, a discount badge is shown to customers */
  originalPrice?: number;
  whatItPowers: string;
  components: SolarComponent[];
  installationAccessories: string[];
  highlights: string[];
};

/**
 * Generates an SEO-optimised description for a solar system based on its components.
 * Uses dynamic values from the system data rather than hardcoded text blocks.
 */
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

const KEY = "itel.admin.solarsystems";

function migrateSystem(s: SolarSystem): SolarSystem {
  return {
    ...s,
    images: Array.isArray(s.images) && s.images.length > 0 ? s.images : [],
    whatItPowers: s.whatItPowers || "",
    // Preserve the stored price — don't recalculate from components
    price: s.price > 0 ? s.price : 0,
  };
}

export function useSolarSystems(): [
  SolarSystem[],
  (slug: string, price: number) => void,
  (system: SolarSystem) => void,
  (slug: string) => void,
  (slug: string, system: SolarSystem) => void,
] {
  const [systems, setSystems] = useState<SolarSystem[]>([]);

  useEffect(() => {
    supabase
      .from("solar_systems")
      .select("*")
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setSystems([]);
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
      { ...system, images: system.images?.length ? system.images : [] },
    ]);
    supabase.from("solar_systems").insert(system).then();
  }, []);

  const deleteSystem = useCallback((slug: string) => {
    setSystems((prev) => prev.filter((s) => s.slug !== slug));
    supabase.from("solar_systems").delete().eq("slug", slug).then();
  }, []);

  const updateSystem = useCallback((slug: string, system: SolarSystem) => {
    setSystems((prev) =>
      prev.map((s) => (s.slug === slug ? { ...system, images: system.images?.length ? system.images : [] } : s))
    );
    // Use upsert to avoid delete+insert race condition
    supabase
      .from("solar_systems")
      .upsert({ ...system, slug: system.slug })
      .then();
  }, []);

  return [systems, updatePrice, addSystem, deleteSystem, updateSystem];
}

export function getSystem(slug: string, systems: SolarSystem[]): SolarSystem | undefined {
  return systems.find((s) => s.slug === slug);
}

export async function fetchSolarSystems(): Promise<SolarSystem[]> {
  try {
    const { data, error } = await supabase.from("solar_systems").select("*");
    if (error || !data || data.length === 0) return [];
    return (data as SolarSystem[]).map(migrateSystem);
  } catch {
    return [];
  }
}

export async function fetchSystem(slug: string): Promise<SolarSystem | undefined> {
  try {
    const { data, error } = await supabase.from("solar_systems").select("*").eq("slug", slug).single();
    if (error || !data) return undefined;
    return data as SolarSystem;
  } catch {
    return undefined;
  }
}
