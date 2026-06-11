import { useCallback, useEffect, useState } from "react";

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
  whatItPowers: string;
  components: SolarComponent[];
  installationAccessories: string[];
  highlights: string[];
};

function genImg(slug: string, i: number): string {
  const gradients = [
    ["#f97316", "#ea580c", "#c2410c"],
    ["#2563eb", "#1d40e0", "#1e3bbd"],
    ["#059669", "#047857", "#065f46"],
    ["#d97706", "#b45309", "#92400e"],
    ["#7c3aed", "#6d28d9", "#5b21b6"],
  ];
  const [c1, c2, c3] = gradients[i % gradients.length];
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const icons = [
    // 0 — Hero card: large sun + system name + decorative elements
    `<g transform="translate(200,75)">
      <circle cx="0" cy="0" r="65" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <circle cx="0" cy="0" r="45" fill="rgba(255,255,255,0.12)"/>
      <circle cx="0" cy="0" r="25" fill="rgba(255,255,255,0.25)"/>
      <g transform="translate(0,0)" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" stroke-linecap="round">
        <line x1="0" y1="-70" x2="0" y2="-85"/><line x1="0" y1="70" x2="0" y2="85"/>
        <line x1="-70" y1="0" x2="-85" y2="0"/><line x1="70" y1="0" x2="85" y2="0"/>
        <line x1="-49" y1="-49" x2="-60" y2="-60"/><line x1="49" y1="-49" x2="60" y2="-60"/>
        <line x1="-49" y1="49" x2="-60" y2="60"/><line x1="49" y1="49" x2="60" y2="60"/>
      </g>
    </g>
    <g transform="translate(200,210)">
      <text text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="15" font-weight="700" opacity="0.95">${name}</text>
      <text y="18" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-family="system-ui,sans-serif" font-size="10">Complete Solar Energy System</text>
    </g>
    <rect x="24" y="24" width="352" height="202" rx="10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`,
    // 1 — Solar Array: panel grid on roof
    `<g transform="translate(60,55)">
      <path d="M0 120 L40 30 L240 30 L280 120 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <g transform="translate(45,35)">
        <rect x="0" y="0" width="45" height="35" rx="3" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <rect x="5" y="5" width="35" height="25" rx="1.5" fill="rgba(255,255,255,0.08)"/>
        <line x1="22.5" y1="5" x2="22.5" y2="30" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
        <line x1="5" y1="17.5" x2="40" y2="17.5" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
        <rect x="5" y="5" width="8" height="8" rx="1" fill="rgba(255,255,255,0.3)" opacity="0.4"/>
      </g>
      <g transform="translate(97,35)">
        <rect x="0" y="0" width="45" height="35" rx="3" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <rect x="5" y="5" width="35" height="25" rx="1.5" fill="rgba(255,255,255,0.08)"/>
        <line x1="22.5" y1="5" x2="22.5" y2="30" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
        <line x1="5" y1="17.5" x2="40" y2="17.5" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
      </g>
      <g transform="translate(149,35)">
        <rect x="0" y="0" width="45" height="35" rx="3" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <rect x="5" y="5" width="35" height="25" rx="1.5" fill="rgba(255,255,255,0.08)"/>
        <line x1="22.5" y1="5" x2="22.5" y2="30" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
        <line x1="5" y1="17.5" x2="40" y2="17.5" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
      </g>
      <path d="M67.5 70 L67.5 85" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
      <path d="M120 70 L120 85" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
      <path d="M172 70 L172 85" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
      <rect x="55" y="85" width="130" height="6" rx="3" fill="rgba(255,255,255,0.1)"/>
    </g>
    <g transform="translate(200,190)">
      <text text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="600" opacity="0.9">Solar Array</text>
      <text y="16" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="9">High-Efficiency Panels</text>
    </g>`,
    // 2 — Inverter & Battery: stacked battery + inverter unit
    `<g transform="translate(130,45)">
      <rect x="0" y="0" width="140" height="55" rx="6" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <rect x="10" y="8" width="25" height="15" rx="3" fill="rgba(255,255,255,0.25)"/>
      <rect x="10" y="30" width="25" height="15" rx="3" fill="rgba(255,255,255,0.25)"/>
      <rect x="42" y="8" width="25" height="15" rx="3" fill="rgba(255,255,255,0.25)"/>
      <rect x="42" y="30" width="25" height="15" rx="3" fill="rgba(255,255,255,0.25)"/>
      <rect x="74" y="8" width="25" height="15" rx="3" fill="rgba(255,255,255,0.25)"/>
      <rect x="74" y="30" width="25" height="15" rx="3" fill="rgba(255,255,255,0.25)"/>
      <rect x="106" y="8" width="25" height="15" rx="3" fill="rgba(255,255,255,0.25)"/>
      <rect x="106" y="30" width="25" height="15" rx="3" fill="rgba(255,255,255,0.25)"/>
      <rect x="0" y="55" width="140" height="30" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <rect x="50" y="62" width="40" height="16" rx="4" fill="rgba(255,255,255,0.25)"/>
      <circle cx="70" cy="70" r="3" fill="rgba(255,255,255,0.5)"/>
    </g>
    <g transform="translate(200,195)">
      <text text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="600" opacity="0.9">Inverter & Battery Bank</text>
      <text y="16" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="9">Hybrid Inverter + LiFePO₄ Storage</text>
    </g>`,
    // 3 — Installation: roof + house schematic
    `<g transform="translate(80,30)">
      <path d="M120 45 L240 45 L200 10 L160 10 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
      <rect x="145" y="45" width="70" height="60" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <rect x="170" y="70" width="20" height="35" rx="2" fill="rgba(255,255,255,0.15)"/>
      <rect x="150" y="50" width="12" height="12" rx="1" fill="rgba(255,255,255,0.2)"/>
      <rect x="198" y="50" width="12" height="12" rx="1" fill="rgba(255,255,255,0.2)"/>
      <path d="M160 10 L160 -15" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <path d="M200 10 L200 -15" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <rect x="148" y="-25" width="24" height="12" rx="2" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.25)" stroke-width="0.5"/>
      <rect x="188" y="-25" width="24" height="12" rx="2" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.25)" stroke-width="0.5"/>
      <line x1="148" y1="-19" x2="172" y2="-19" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
      <line x1="148" y1="-15" x2="172" y2="-15" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
      <line x1="188" y1="-19" x2="212" y2="-19" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
      <line x1="188" y1="-15" x2="212" y2="-15" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
      <path d="M220 60 L240 60 L240 110 L180 110" stroke="rgba(255,255,255,0.08)" stroke-width="1" fill="none"/>
    </g>
    <g transform="translate(200,200)">
      <text text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="600" opacity="0.9">Installation Preview</text>
      <text y="16" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="9">Turnkey Mounting & Wiring</text>
    </g>`,
    // 4 — System Overview: circular flow diagram
    `<g transform="translate(200,85)">
      <circle cx="0" cy="0" r="75" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="4,4"/>
      <circle cx="0" cy="0" r="50" fill="rgba(255,255,255,0.06)"/>
      <circle cx="0" cy="0" r="25" fill="rgba(255,255,255,0.15)"/>
      <g opacity="0.4" stroke="rgba(255,255,255,0.3)" stroke-width="1.5">
        <circle cx="0" cy="-55" r="10" fill="none"/><circle cx="0" cy="-55" r="4" fill="rgba(255,255,255,0.4)"/>
        <circle cx="55" cy="0" r="10" fill="none"/><circle cx="55" cy="0" r="4" fill="rgba(255,255,255,0.4)"/>
        <circle cx="-55" cy="0" r="10" fill="none"/><circle cx="-55" cy="0" r="4" fill="rgba(255,255,255,0.4)"/>
        <circle cx="0" cy="55" r="10" fill="none"/><circle cx="0" cy="55" r="4" fill="rgba(255,255,255,0.4)"/>
      </g>
      <line x1="12" y1="-48" x2="38" y2="-12" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <line x1="48" y1="-12" x2="38" y2="12" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <line x1="-12" y1="-48" x2="-38" y2="-12" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <line x1="-48" y1="12" x2="-12" y2="48" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <line x1="12" y1="48" x2="38" y2="12" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    </g>
    <g transform="translate(200,200)">
      <text text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="12" font-weight="600" opacity="0.9">System Overview</text>
      <text y="16" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="9">End-to-End Energy Flow</text>
    </g>`,
  ];
  const icon = icons[i % 5] || icons[0];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 400 250">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${c1}"/>
        <stop offset="50%" style="stop-color:${c2}"/>
        <stop offset="100%" style="stop-color:${c3}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.08)"/>
        <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="400" height="250" fill="url(#g)" rx="12"/>
    <rect width="400" height="250" fill="url(#glow)" rx="12"/>
    <g opacity="0.06">
      <line x1="0" y1="25" x2="400" y2="25" stroke="white" stroke-width="0.5"/>
      <line x1="0" y1="50" x2="400" y2="50" stroke="white" stroke-width="0.5"/>
      <line x1="0" y1="75" x2="400" y2="75" stroke="white" stroke-width="0.5"/>
      <line x1="0" y1="100" x2="400" y2="100" stroke="white" stroke-width="0.5"/>
      <line x1="0" y1="125" x2="400" y2="125" stroke="white" stroke-width="0.5"/>
      <line x1="0" y1="150" x2="400" y2="150" stroke="white" stroke-width="0.5"/>
      <line x1="0" y1="175" x2="400" y2="175" stroke="white" stroke-width="0.5"/>
      <line x1="0" y1="200" x2="400" y2="200" stroke="white" stroke-width="0.5"/>
      <line x1="0" y1="225" x2="400" y2="225" stroke="white" stroke-width="0.5"/>
      <line x1="50" y1="0" x2="50" y2="250" stroke="white" stroke-width="0.5"/>
      <line x1="100" y1="0" x2="100" y2="250" stroke="white" stroke-width="0.5"/>
      <line x1="150" y1="0" x2="150" y2="250" stroke="white" stroke-width="0.5"/>
      <line x1="200" y1="0" x2="200" y2="250" stroke="white" stroke-width="0.5"/>
      <line x1="250" y1="0" x2="250" y2="250" stroke="white" stroke-width="0.5"/>
      <line x1="300" y1="0" x2="300" y2="250" stroke="white" stroke-width="0.5"/>
      <line x1="350" y1="0" x2="350" y2="250" stroke="white" stroke-width="0.5"/>
    </g>
    ${icon}
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function seedImages(slug: string): string[] {
  return [0, 1, 2, 3, 4].map((i) => genImg(slug, i));
}

export function generateDescription(system: SolarSystem): string {
  const arrayKw = (system.totalPanels * system.panelWattage / 1000).toFixed(2);
  const dailyKwh = (system.totalPanels * system.panelWattage * 5.5 / 1000).toFixed(1);
  const monthlyKwh = (Number(dailyKwh) * 30).toFixed(0);
  const panelDesc = system.totalPanels >= 10 ? "high-efficiency N-type bifacial panels that capture light from both sides for maximum yield" : `premium ${system.panelWattage}W monocrystalline PERC panels with anti-reflective coating`;
  const batteryDesc = system.batteryCapacityKWh >= 10
    ? `${system.batteryCapacityKWh}kWh ${system.batteryType} battery bank delivers whole-home or business-grade energy reserve, supporting ${system.batteryCapacityKWh >= 15 ? "heavy loads like borehole pumps, multiple air conditioners, and commercial kitchen equipment" : "multiple air conditioners, kitchen appliances, and home entertainment systems"} through extended grid outages`
    : `${system.batteryCapacityKWh}kWh ${system.batteryType} battery provides enough stored energy to run your essential loads — lights, fans, TVs, refrigerator, and internet — through any outage`;
  const inverterDesc = system.inverterKVA >= 10
    ? `The ${system.inverterKVA}kVA hybrid inverter features ${system.inverterKVA >= 15 ? "triple MPPT" : "dual MPPT"} charge controllers, allowing it to harvest maximum power from ${system.totalPanels} panels even with ${system.totalPanels >= 10 ? "multiple roof orientations" : "mixed morning and afternoon sun"}`
    : `The ${system.inverterKVA}kVA pure sine wave hybrid inverter intelligently switches between solar, battery, and grid power — ensuring uninterrupted supply while prioritising solar to minimise your electricity bill`;

  const t = [
    `The <strong>${system.name}</strong> is a complete ${system.voltage} solar energy system engineered for Nigerian homes and businesses. It combines ${system.totalPanels} × ${system.panelWattage}W ${panelDesc} with a ${system.inverterKVA}kVA pure sine wave hybrid inverter and a ${system.batteryCapacityKWh}kWh ${system.batteryType} battery bank — delivering a total solar array capacity of <strong>${arrayKw}kW</strong>.`,
    `This system generates approximately <strong>${dailyKwh}kWh</strong> of clean energy per day (${monthlyKwh}kWh/month) based on Nigeria's average 5.5 peak sun hours. The ${batteryDesc}. ${inverterDesc}.`,
    `${system.whatItPowers.split(".")[0]}. Every component is selected, tested, and matched by Itel's engineers to ensure seamless integration, maximum efficiency, and years of trouble-free operation. All required installation accessories — including racking, cables, breakers, and earthing kit — ship with the system for a complete turnkey solution.`,
  ];
  return t.join("\n\n");
}

function seedSolarSystems(): SolarSystem[] {
  return [
    {
      slug: "solar-starter-3kva",
      name: "Itel Essential Home 3kVA",
      tagline: "Backup for lights, fans, TV, and router — keeps your essentials running through any outage.",
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
      whatItPowers: "8 LED bulbs (8 hrs), 2 ceiling fans (8 hrs), 43\" LED TV (6 hrs), decoder (6 hrs), WiFi router (24 hrs), refrigerator (24 hrs), 2 phones/laptops (4 hrs). Total daily load: ~4.8 kWh",
      components: [
        { type: "panel", name: "Itel Mono PERC 550W", spec: "550W / Mono PERC", qty: 4 },
        { type: "inverter", name: "Itel Hybrid Inverter 3kVA", spec: "3kVA / 24V / 60A MPPT", qty: 1 },
        { type: "battery", name: "Itel LiFePO4 5.12kWh", spec: "5.12kWh / 48V / Wall-Mount", qty: 1 },
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
      whatItPowers: "12 LED bulbs (8 hrs), 3 ceiling fans (10 hrs), 55\" LED TV (8 hrs), decoder (8 hrs), WiFi router (24 hrs), refrigerator (24 hrs), 1HP air conditioner (6 hrs), microwave (30 min/day), washing machine (2 hrs/day), 3 laptops (6 hrs). Total daily load: ~9.2 kWh",
      components: [
        { type: "panel", name: "Itel Mono PERC 550W", spec: "550W / Mono PERC", qty: 6 },
        { type: "inverter", name: "Itel Hybrid Inverter 5kVA", spec: "5kVA / 48V / 80A MPPT", qty: 1 },
        { type: "battery", name: "Itel LiFePO4 5.12kWh", spec: "5.12kWh / 48V / Wall-Mount", qty: 2 },
        { type: "accessory", name: "DC Isolator Switch 63A", spec: "63A / IP65", qty: 1 },
        { type: "accessory", name: "PV Combiner Box 6-String", spec: "6-string / 1000V", qty: 1 },
        { type: "accessory", name: "Surge Protection Device", spec: "40kA / Type 2 / DC+AC", qty: 2 },
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
      whatItPowers: "20 LED bulbs (10 hrs), 6 ceiling fans (10 hrs), 2 × 55\" TVs (10 hrs), CCTV system (24 hrs), WiFi + router (24 hrs), 2 refrigerators (24 hrs), 1.5HP AC (8 hrs), 1HP AC (6 hrs), microwave (1 hr/day), water dispenser (24 hrs), 4 laptops (8 hrs), printer (2 hrs), POS system (12 hrs). Total daily load: ~18.5 kWh",
      components: [
        { type: "panel", name: "Itel Mono PERC 550W", spec: "550W / Mono PERC", qty: 8 },
        { type: "inverter", name: "Itel Hybrid Inverter 10kVA", spec: "10kVA / 48V / Dual MPPT", qty: 1 },
        { type: "battery", name: "Itel LiFePO4 5.12kWh", spec: "5.12kWh / 48V / Wall-Mount", qty: 3 },
        { type: "accessory", name: "DC Isolator Switch 100A", spec: "100A / IP65", qty: 1 },
        { type: "accessory", name: "PV Combiner Box 8-String", spec: "8-string / 1000V", qty: 1 },
        { type: "accessory", name: "Surge Protection Device", spec: "40kA / Type 2 / DC+AC", qty: 2 },
        { type: "accessory", name: "Energy Meter (MID Certified)", spec: "3-phase / RS485", qty: 1 },
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
      whatItPowers: "30 LED bulbs (12 hrs), 8 ceiling fans (12 hrs), 3 × 65\" TVs (10 hrs), CCTV (24 hrs), whole-home WiFi mesh (24 hrs), 2 refrigerators (24 hrs), freezer (24 hrs), 1.5HP AC (10 hrs), 2 × 1HP AC (8 hrs), borehole pump 1HP (2 hrs/day), microwave (1 hr), oven (1 hr), washing machine (3 hrs), 6 laptops (8 hrs), home theatre (4 hrs), workshop tools (3 hrs). Total daily load: ~32 kWh",
      components: [
        { type: "panel", name: "Itel N-Type Bifacial 600W", spec: "600W / Bifacial / N-Type", qty: 12 },
        { type: "inverter", name: "Itel Hybrid Inverter 15kVA", spec: "15kVA / 48V / Triple MPPT", qty: 1 },
        { type: "battery", name: "Itel LiFePO4 5.12kWh", spec: "5.12kWh / 48V / Wall-Mount", qty: 4 },
        { type: "accessory", name: "DC Isolator Switch 160A", spec: "160A / IP65", qty: 1 },
        { type: "accessory", name: "PV Combiner Box 12-String", spec: "12-string / 1000V / With SPD", qty: 1 },
        { type: "accessory", name: "Surge Protection Device", spec: "40kA / Type 2 / DC+AC", qty: 2 },
        { type: "accessory", name: "Energy Meter (MID Certified)", spec: "3-phase / RS485 / Bi-directional", qty: 1 },
        { type: "accessory", name: "Remote Monitoring Gateway", spec: "4G / WiFi / Ethernet", qty: 1 },
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
}

const KEY = "itel.admin.solarsystems";

function migrateSystem(s: SolarSystem): SolarSystem {
  return {
    ...s,
    images: (s as any).images?.length ? (s as any).images : seedImages(s.slug),
    whatItPowers: (s as any).whatItPowers || "",
  };
}

export function useSolarSystems(): [SolarSystem[], (slug: string, price: number) => void, (system: SolarSystem) => void, (slug: string) => void] {
  const [systems, setSystems] = useState<SolarSystem[]>(() => {
    if (typeof window === "undefined") return seedSolarSystems();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SolarSystem[];
        if (Array.isArray(parsed)) return parsed.map(migrateSystem);
      }
    } catch { /* ignore */ }
    const s = seedSolarSystems();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(systems)); } catch { /* ignore */ }
  }, [systems]);

  const updatePrice = useCallback((slug: string, price: number) => {
    setSystems((prev) => prev.map((s) => (s.slug === slug ? { ...s, price } : s)));
  }, []);

  const addSystem = useCallback((system: SolarSystem) => {
    setSystems((prev) => [...prev, { ...system, images: system.images?.length ? system.images : seedImages(system.slug) }]);
  }, []);

  const deleteSystem = useCallback((slug: string) => {
    setSystems((prev) => prev.filter((s) => s.slug !== slug));
  }, []);

  return [systems, updatePrice, addSystem, deleteSystem];
}

export function getSystem(slug: string, systems: SolarSystem[]): SolarSystem | undefined {
  return systems.find((s) => s.slug === slug);
}
