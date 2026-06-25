import type { Product } from "./products";

function img(slug: string, name: string, spec: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 400 250"><rect width="400" height="250" fill="#6b7280" rx="12"/><rect width="400" height="250" fill="url(#g)" rx="12" opacity="0.35"/><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.15"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></linearGradient></defs><text x="200" y="125" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="system-ui,sans-serif" font-size="18" font-weight="700">${name}</text><text x="200" y="148" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="system-ui,sans-serif" font-size="12">${spec}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const p = (slug: string, name: string, brand: string, category: string, price: number, spec: string, tagline: string, highlights: string[], description: string, warranty: string, badge?: string, originalPrice?: number): Product => ({
  slug, name, brand, category, price, originalPrice,
  images: [img(slug, name, spec)],
  rating: 4.8, reviews: 100, tagline, badge, spec, highlights, description, warranty, inStock: true,
});

export const SEED_PRODUCTS: Product[] = [
  p("itel-mono-550w", "Itel Mono PERC 550W", "ItelNigeria", "panels", 165000, "550W",
    "Tier-1 monocrystalline. Built for African sun.",
    ["21.4% module efficiency", "Half-cut PERC cells", "25-year linear power warranty", "Anti-PID, salt mist & ammonia resistant"],
    "A high-efficiency 550W monocrystalline panel engineered for harsh climates.", "12 yrs product · 25 yrs power", "Best seller", 190000),

  p("itel-ntype-600w", "Itel N-Type Bifacial 600W", "ItelNigeria", "panels", 198000, "600W",
    "Bifacial gain. Premium yield.",
    ["N-Type TOPCon cells", "Up to 25% bifacial gain", "30-year power warranty", "Lower temperature coefficient"],
    "Next-generation N-Type bifacial module.", "15 yrs product · 30 yrs power", "New"),

  p("itel-hybrid-3kva", "Itel Hybrid Inverter 3kVA / 24V", "ItelNigeria", "inverters", 450000, "3kVA · 24V",
    "Reliable pure sine wave hybrid.",
    ["3000W continuous", "MPPT 60A", "Smart battery management"],
    "Pure sine wave hybrid inverter for essential home backup.", "5 years", undefined, 520000),

  p("itel-hybrid-5kva", "Itel Hybrid Inverter 5kVA / 48V", "ItelNigeria", "inverters", 685000, "5kVA · 48V",
    "Pure sine wave hybrid with WiFi monitoring.",
    ["5000W continuous · 10000W surge", "MPPT 80A · 450VDC", "Parallel up to 9 units", "Live monitoring via app"],
    "Pure sine wave hybrid inverter for homes and small businesses.", "5 years", "Pro pick", 785000),

  p("itel-hybrid-10kva", "Itel Hybrid Inverter 10kVA / 48V", "ItelNigeria", "inverters", 1125000, "10kVA · 48V",
    "Three-phase hybrid. Dual MPPT.",
    ["10000W continuous", "Dual MPPT 80A each", "Parallel up to 6 units", "3-phase or split-phase"],
    "Three-phase hybrid inverter for commercial properties.", "5 years", undefined, 1350000),

  p("itel-hybrid-15kva", "Itel Hybrid Inverter 15kVA / 48V", "ItelNigeria", "inverters", 1580000, "15kVA · 48V",
    "Heavy-duty hybrid. Triple MPPT.",
    ["15000W continuous", "Triple MPPT", "Parallel up to 6 units", "3-phase + generator input"],
    "Heavy-duty hybrid inverter for large properties.", "5 years"),

  p("itel-hybrid-3kva-onsite", "Itel On-Site Inverter 3kVA / 24V", "ItelNigeria", "inverters", 385000, "3kVA · 24V",
    "Cost-effective on-site inverter.",
    ["3000W continuous", "MPPT 40A", "Wide PV input range"],
    "On-site inverter for budget-conscious installations.", "3 years", "Best value", 450000),

  p("itel-lifepo4-512", "Itel LiFePO4 Battery 5.12kWh", "ItelNigeria", "batteries", 1250000, "5.12kWh · 48V",
    "6000+ cycles. 10-year design life.",
    ["LiFePO4 safe chemistry", "6000+ cycles at 80% DoD", "Built-in BMS", "Wall-mount design"],
    "High-cycle LiFePO4 battery for daily solar cycling.", "10 years", undefined, 1500000),

  p("itel-lifepo4-1024", "Itel LiFePO4 Battery 10.24kWh", "ItelNigeria", "batteries", 2250000, "10.24kWh · 48V",
    "Dual-pack. Double the backup.",
    ["Two 5.12kWh modules", "Parallel-ready", "Built-in BMS", "6000+ cycles"],
    "Dual-module LiFePO4 battery system.", "10 years", "Popular pick", 2650000),

  p("itel-lifepo4-1536", "Itel LiFePO4 Battery 15.36kWh", "ItelNigeria", "batteries", 3150000, "15.36kWh · 48V",
    "Triple-pack. Whole-home backup.",
    ["Three 5.12kWh modules", "Expandable to 30.72kWh", "Built-in BMS", "6000+ cycles"],
    "Triple-module LiFePO4 battery system.", "10 years"),

  p("itel-lifepo4-2048", "Itel LiFePO4 Battery 20.48kWh", "ItelNigeria", "batteries", 3950000, "20.48kWh · 48V",
    "Quad-pack. Maximum autonomy.",
    ["Four 5.12kWh modules", "Expandable to 40.96kWh", "Built-in BMS", "6000+ cycles"],
    "Quad-module LiFePO4 battery system.", "10 years", "Enterprise"),

  p("itel-tubular-150ah", "Itel Tubular Battery 150Ah", "ItelNigeria", "batteries", 285000, "150Ah · 12V",
    "Deep-cycle tubular. Budget-friendly.",
    ["150Ah C10 rating", "Tubular plate design", "Low maintenance", "3-5 year life"],
    "Deep-cycle tubular battery for backup systems.", "36 months", "Best value", 350000),

  p("itel-tubular-200ah", "Itel Tubular Battery 200Ah", "ItelNigeria", "batteries", 365000, "200Ah · 12V",
    "Higher capacity. Same reliability.",
    ["200Ah C10 rating", "Tubular plate design", "Low maintenance", "3-5 year life"],
    "High-capacity deep-cycle tubular battery.", "36 months", undefined, 430000),

  p("itel-mppt-40a", "Itel MPPT Charge Controller 40A", "ItelNigeria", "controllers", 145000, "40A · 12/24V",
    "Efficient MPPT charging.",
    ["40A output", "98% efficiency", "LCD display", "12/24V auto-detect"],
    "MPPT charge controller for efficient solar charging.", "3 years"),

  p("itel-mppt-60a", "Itel MPPT Charge Controller 60A", "ItelNigeria", "controllers", 195000, "60A · 12/24V",
    "Higher current. Faster charge.",
    ["60A output", "98% efficiency", "LCD display", "12/24V auto-detect"],
    "High-current MPPT charge controller.", "3 years", "Pro pick", 240000),

  p("itel-mppt-80a", "Itel MPPT Charge Controller 80A", "ItelNigeria", "controllers", 275000, "80A · 12/24/48V",
    "High-power MPPT for large arrays.",
    ["80A output", "99% efficiency", "LCD display", "12/24/48V auto-detect"],
    "High-power MPPT charge controller for large solar arrays.", "5 years"),

  p("itel-mppt-100a", "Itel MPPT Charge Controller 100A", "ItelNigeria", "controllers", 345000, "100A · 12/24/48V",
    "Maximum power. Maximum efficiency.",
    ["100A output", "99% efficiency", "LCD display", "12/24/48V auto-detect"],
    "100A MPPT charge controller for commercial arrays.", "5 years"),

  p("itel-complete-kit-3kva", "Itel 3kVA Complete Solar Kit", "ItelNigeria", "kits", 2650000, "3kVA · 24V",
    "Everything you need. In one box.",
    ["4 × 550W panels", "3kVA hybrid inverter", "5.12kWh LiFePO4", "All accessories included"],
    "Complete plug-and-play solar kit for 2-3 bedroom homes.", "5 years", "Best seller"),

  p("itel-complete-kit-5kva", "Itel 5kVA Complete Solar Kit", "ItelNigeria", "kits", 4950000, "5kVA · 48V",
    "Whole-home solar solution.",
    ["6 × 550W panels", "5kVA hybrid inverter", "10.24kWh LiFePO4", "All accessories included"],
    "Complete solar kit for whole-home backup.", "5 years", "Popular pick"),

  p("itel-complete-kit-10kva", "Itel 10kVA Complete Solar Kit", "ItelNigeria", "kits", 8650000, "10kVA · 48V",
    "Business-grade solar system.",
    ["8 × 550W panels", "10kVA hybrid inverter", "15.36kWh LiFePO4", "All accessories included"],
    "Complete solar kit for small businesses.", "5 years", "For business"),

  p("itel-complete-kit-15kva", "Itel 15kVA Complete Solar Kit", "ItelNigeria", "kits", 15200000, "15kVA · 48V",
    "Enterprise solar. Zero compromise.",
    ["12 × 600W bifacial panels", "15kVA hybrid inverter", "20.48kWh LiFePO4", "All accessories included"],
    "Complete solar kit for large properties.", "5 years", "Premium"),

  p("itel-cable-6mm", "Solar DC Cable 6mm² — 50m", "ItelNigeria", "accessories", 35000, "6mm² · 50m",
    "UV-resistant. Tinned copper.",
    ["6mm² cross-section", "UV-resistant XLPE insulation", "Tinned copper conductor"],
    "High-quality solar DC cable for PV installations.", "5 years"),

  p("itel-cable-10mm", "Solar DC Cable 10mm² — 50m", "ItelNigeria", "accessories", 55000, "10mm² · 50m",
    "Heavy-duty. For large arrays.",
    ["10mm² cross-section", "UV-resistant XLPE insulation", "Tinned copper conductor"],
    "Heavy-duty solar DC cable.", "5 years"),

  p("itel-mc4", "MC4 Connectors — 10 Pairs", "ItelNigeria", "accessories", 12000, "10 pairs · IP67",
    "IP67 rated. Industry standard.",
    ["IP67 rated", "Compatible with all panels", "Tinned copper contacts"],
    "Industry-standard MC4 solar connectors.", "2 years"),

  p("itel-breaker-32a", "DC Breaker 32A — DIN Rail", "ItelNigeria", "accessories", 8500, "32A · DIN",
    "Essential DC circuit protection.",
    ["32A rated", "DIN rail mount", "DC-optimized arc suppression"],
    "DC circuit breaker for solar array protection.", "2 years"),

  p("itel-breaker-63a", "DC Breaker 63A — DIN Rail", "ItelNigeria", "accessories", 11000, "63A · DIN",
    "Higher ampacity. Same reliability.",
    ["63A rated", "DIN rail mount", "DC-optimized arc suppression"],
    "63A DC circuit breaker.", "2 years"),

  p("itel-rack-kit-4", "Panel Roof Mount Kit — 4 Panels", "ItelNigeria", "accessories", 85000, "4-panel kit",
    "Corrosion-resistant aluminum.",
    ["Aluminum alloy rails", "Stainless steel hardware", "Universal panel compatibility"],
    "Complete roof mounting kit for 4 solar panels.", "10 years"),
];

export function getSeedProducts(): Product[] {
  return SEED_PRODUCTS;
}
