export type ProductCategory =
  | "panels"
  | "inverters"
  | "batteries"
  | "controllers"
  | "kits"
  | "accessories";

export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number; // NGN (current/sale price)
  originalPrice?: number; // higher price for discount display
  images: string[];
  rating: number;
  reviews: number;
  tagline: string;
  badge?: string;
  /** Key spec for badges (e.g. "550W", "5kVA / 48V") */
  spec: string;
  highlights: string[];
  description: string;
  warranty: string;
  inStock: boolean;
};

function productImg(slug: string, name: string, cat: ProductCategory, spec: string): string {
  const gradients: Record<ProductCategory, [string, string, string]> = {
    panels: ["#0f766e", "#0d9488", "#14b8a6"],
    inverters: ["#1e40af", "#2563eb", "#3b82f6"],
    batteries: ["#6d28d9", "#7c3aed", "#8b5cf6"],
    controllers: ["#92400e", "#b45309", "#d97706"],
    kits: ["#9a3412", "#c2410c", "#ea580c"],
    accessories: ["#4b5563", "#6b7280", "#9ca3af"],
  };
  const [c1, c2, c3] = gradients[cat];
  const icons: Record<ProductCategory, string> = {
    panels: `<g transform="translate(200,80)"><rect x="-70" y="-50" width="140" height="65" rx="6" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/><rect x="-60" y="-40" width="120" height="45" rx="3" fill="rgba(255,255,255,0.06)"/><line x1="-60" y1="-17.5" x2="60" y2="-17.5" stroke="rgba(255,255,255,0.1)" stroke-width="1"/><line x1="0" y1="-40" x2="0" y2="5" stroke="rgba(255,255,255,0.1)" stroke-width="1"/><rect x="-25" y="-35" width="15" height="10" rx="2" fill="rgba(255,255,255,0.2)"/><rect x="10" y="-35" width="15" height="10" rx="2" fill="rgba(255,255,255,0.2)"/></g>`,
    inverters: `<g transform="translate(200,80)"><rect x="-55" y="-45" width="110" height="90" rx="8" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/><rect x="-40" y="-30" width="30" height="20" rx="3" fill="rgba(255,255,255,0.2)"/><rect x="10" y="-30" width="30" height="20" rx="3" fill="rgba(255,255,255,0.2)"/><rect x="-40" y="0" width="30" height="20" rx="3" fill="rgba(255,255,255,0.2)"/><rect x="10" y="0" width="30" height="20" rx="3" fill="rgba(255,255,255,0.2)"/><circle cx="0" cy="35" r="6" fill="rgba(255,255,255,0.3)"/></g>`,
    batteries: `<g transform="translate(200,75)"><rect x="-35" y="-55" width="70" height="110" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/><rect x="-20" y="-40" width="40" height="20" rx="4" fill="rgba(255,255,255,0.2)"/><rect x="-20" y="-10" width="40" height="20" rx="4" fill="rgba(255,255,255,0.2)"/><rect x="-20" y="20" width="40" height="20" rx="4" fill="rgba(255,255,255,0.2)"/><line x1="-5" y1="-55" x2="-5" y2="-65" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round"/><line x1="5" y1="-55" x2="5" y2="-65" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round"/><rect x="-15" y="-62" width="8" height="8" rx="1" fill="rgba(255,0,0,0.4)"/><rect x="7" y="-62" width="8" height="8" rx="1" fill="rgba(255,0,0,0.4)"/></g>`,
    controllers: `<g transform="translate(200,80)"><rect x="-50" y="-45" width="100" height="90" rx="6" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/><text x="0" y="-15" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="monospace" font-size="10">MPPT</text><rect x="-30" y="0" width="60" height="25" rx="4" fill="rgba(255,255,255,0.15)"/><text x="0" y="17" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="system-ui,sans-serif" font-size="9" font-weight="600">60A</text></g>`,
    kits: `<g transform="translate(200,75)"><circle cx="0" cy="-10" r="35" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/><path d="M-15 -25 L0 -45 L15 -25 Z" fill="rgba(255,255,255,0.3)"/><rect x="-20" y="-10" width="40" height="8" rx="3" fill="rgba(255,255,255,0.2)"/><rect x="-15" y="5" width="12" height="25" rx="2" fill="rgba(255,255,255,0.15)"/><rect x="3" y="5" width="12" height="25" rx="2" fill="rgba(255,255,255,0.15)"/><line x1="-30" y1="-10" x2="-55" y2="-10" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="3,3"/><line x1="30" y1="-10" x2="55" y2="-10" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="3,3"/></g>`,
    accessories: `<g transform="translate(200,80)"><rect x="-45" y="-40" width="90" height="80" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/><circle cx="0" cy="-10" r="12" fill="rgba(255,255,255,0.2)"/><circle cx="0" cy="-10" r="5" fill="rgba(255,255,255,0.3)"/><line x1="-20" y1="-10" x2="-30" y2="-10" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><line x1="20" y1="-10" x2="30" y2="-10" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><rect x="-20" y="15" width="40" height="6" rx="2" fill="rgba(255,255,255,0.15)"/><rect x="-15" y="25" width="30" height="6" rx="2" fill="rgba(255,255,255,0.15)"/></g>`,
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 400 250">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${c1}"/><stop offset="50%" style="stop-color:${c2}"/><stop offset="100%" style="stop-color:${c3}"/></linearGradient></defs>
    <rect width="400" height="250" fill="url(#g)" rx="12"/>
    ${icons[cat]}
    <text x="200" y="200" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="system-ui,sans-serif" font-size="14" font-weight="700">${name}</text>
    <text x="200" y="218" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="10">${spec}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function seedProductImages(
  slug: string,
  name: string,
  cat: ProductCategory,
  spec: string,
): string[] {
  return [productImg(slug, name, cat, spec)];
}

export const CATEGORIES: { id: ProductCategory; label: string; blurb: string }[] = [
  { id: "panels", label: "Solar Panels", blurb: "Mono PERC & N-Type panels" },
  { id: "inverters", label: "Inverters", blurb: "Hybrid, off-grid, on-grid" },
  { id: "batteries", label: "Batteries", blurb: "LiFePO4 & tubular" },
  { id: "controllers", label: "Charge Controllers", blurb: "MPPT controllers" },
  { id: "kits", label: "Complete Kits", blurb: "Plug-and-play systems" },
  { id: "accessories", label: "Accessories", blurb: "Cables, breakers, mounts" },
];

function imgFor(slug: string, name: string, cat: ProductCategory, spec: string): string[] {
  return seedProductImages(slug, name, cat, spec);
}

export const PRODUCTS: Product[] = [
  {
    slug: "itel-mono-550w",
    name: "Itel Mono PERC 550W",
    brand: "ItelNigeria",
    category: "panels",
    price: 165000,
    originalPrice: 190000,
    images: imgFor("itel-mono-550w", "Itel Mono PERC 550W", "panels", "550W"),
    rating: 4.9,
    reviews: 412,
    tagline: "Tier-1 monocrystalline. Built for African sun.",
    badge: "Best seller",
    spec: "550W",
    highlights: [
      "21.4% module efficiency",
      "Half-cut PERC cells",
      "25-year linear power warranty",
      "Anti-PID, salt mist & ammonia resistant",
    ],
    description:
      "A high-efficiency 550W monocrystalline panel engineered for harsh climates. Half-cut PERC technology delivers exceptional low-light performance and resilience against dust, heat, and humidity.",
    warranty: "12 yrs product · 25 yrs power",
    inStock: true,
  },
  {
    slug: "itel-ntype-600w",
    name: "Itel N-Type Bifacial 600W",
    brand: "ItelNigeria",
    category: "panels",
    price: 198000,
    images: imgFor("itel-ntype-600w", "Itel N-Type Bifacial 600W", "panels", "600W"),
    rating: 4.95,
    reviews: 187,
    tagline: "Bifacial gain. Premium yield.",
    badge: "New",
    spec: "600W",
    highlights: [
      "N-Type TOPCon cells",
      "Up to 25% bifacial gain",
      "30-year power warranty",
      "Lower temperature coefficient",
    ],
    description:
      "Next-generation N-Type bifacial module producing energy from both sides for up to 25% additional yield on reflective surfaces.",
    warranty: "15 yrs product · 30 yrs power",
    inStock: true,
  },
  {
    slug: "itel-hybrid-5kva",
    name: "Itel Hybrid Inverter 5kVA / 48V",
    brand: "ItelNigeria",
    category: "inverters",
    price: 685000,
    originalPrice: 785000,
    images: imgFor(
      "itel-hybrid-5kva",
      "Itel Hybrid Inverter 5kVA / 48V",
      "inverters",
      "5kVA · 48V",
    ),
    rating: 4.85,
    reviews: 318,
    tagline: "Pure sine wave hybrid with WiFi monitoring.",
    badge: "Pro pick",
    spec: "5kVA · 48V",
    highlights: [
      "5000W continuous · 10000W surge",
      "MPPT 80A · 450VDC",
      "Parallel up to 9 units",
      "Live monitoring via app",
    ],
    description:
      "A pure sine wave hybrid inverter built for homes and small businesses. Seamlessly switches between solar, battery, and grid with sub-10ms transfer time.",
    warranty: "5 years",
    inStock: true,
  },
  {
    slug: "itel-hybrid-10kva",
    name: "Itel Hybrid Inverter 10kVA / 48V",
    brand: "ItelNigeria",
    category: "inverters",
    price: 1250000,
    images: imgFor(
      "itel-hybrid-10kva",
      "Itel Hybrid Inverter 10kVA / 48V",
      "inverters",
      "10kVA · 48V",
    ),
    rating: 4.9,
    reviews: 142,
    tagline: "Commercial-grade hybrid. Whisper quiet.",
    spec: "10kVA · 48V",
    highlights: [
      "Dual MPPT trackers",
      "Smart load management",
      "Generator-friendly",
      "Remote firmware updates",
    ],
    description:
      "10kVA hybrid inverter for larger homes, SMEs, and commercial loads. Dual MPPT trackers maximize harvest across multiple roof orientations.",
    warranty: "5 years",
    inStock: true,
  },
  {
    slug: "itel-lifepo4-5kwh",
    name: "Itel LiFePO4 5.12kWh Wall-Mount",
    brand: "ItelNigeria",
    category: "batteries",
    price: 1450000,
    originalPrice: 1650000,
    images: imgFor(
      "itel-lifepo4-5kwh",
      "Itel LiFePO4 5.12kWh Wall-Mount",
      "batteries",
      "5.12kWh · 48V",
    ),
    rating: 4.92,
    reviews: 256,
    tagline: "6000+ cycles. 10-year life. Maintenance free.",
    badge: "Top rated",
    spec: "5.12kWh · 48V",
    highlights: [
      "Grade-A EVE cells",
      "Smart BMS with cell balancing",
      "Up to 16 units parallel",
      "Wall or rack mount",
    ],
    description:
      "Premium lithium iron phosphate battery with built-in smart BMS. Safer chemistry, deeper discharge, and longer life than lead-acid alternatives.",
    warranty: "10 years",
    inStock: true,
  },
  {
    slug: "itel-tubular-220ah",
    name: "Itel Deep-Cycle Tubular 220Ah",
    brand: "ItelNigeria",
    category: "batteries",
    price: 245000,
    images: imgFor(
      "itel-tubular-220ah",
      "Itel Deep-Cycle Tubular 220Ah",
      "batteries",
      "220Ah · 12V",
    ),
    rating: 4.6,
    reviews: 510,
    tagline: "Workhorse deep-cycle for budget builds.",
    spec: "220Ah · 12V",
    highlights: [
      "Thick tubular plates",
      "Low self-discharge",
      "18-month warranty",
      "Excellent recovery from deep discharge",
    ],
    description:
      "Heavy-duty tubular battery for cost-effective solar systems. Engineered for deep cycling and long stand-by life.",
    warranty: "18 months",
    inStock: true,
  },
  {
    slug: "itel-mppt-60a",
    name: "Itel MPPT Charge Controller 60A",
    brand: "ItelNigeria",
    category: "controllers",
    price: 145000,
    originalPrice: 170000,
    images: imgFor(
      "itel-mppt-60a",
      "Itel MPPT Charge Controller 60A",
      "controllers",
      "60A · 150VDC",
    ),
    rating: 4.7,
    reviews: 98,
    tagline: "99% tracking efficiency.",
    spec: "60A · 150VDC",
    highlights: [
      "Auto 12/24/48V detection",
      "LCD + Bluetooth",
      "Multi-stage charging",
      "Temperature compensation",
    ],
    description:
      "High-efficiency MPPT charge controller that extracts up to 30% more power from your panels compared to PWM controllers.",
    warranty: "3 years",
    inStock: true,
  },
  {
    slug: "itel-starter-3kva",
    name: "Itel Starter Kit · 3kVA Home Bundle",
    brand: "ItelNigeria",
    category: "kits",
    price: 1850000,
    originalPrice: 2100000,
    images: imgFor(
      "itel-starter-3kva",
      "Itel Starter Kit · 3kVA Home Bundle",
      "kits",
      "3kVA · 5kWh",
    ),
    rating: 4.88,
    reviews: 76,
    tagline: "Everything to power essentials. Plug & play.",
    badge: "Bundle save 12%",
    spec: "3kVA · 5kWh",
    highlights: [
      "4 × 550W panels",
      "3kVA hybrid inverter",
      "5.12kWh lithium battery",
      "Mounts, cables, breakers included",
    ],
    description:
      "A complete kit for backing up fans, lights, TV, fridge, and laptops in a 2-3 bedroom home. Designed by Itel engineers — installs in a day.",
    warranty: "Component-wise",
    inStock: true,
  },
  {
    slug: "itel-pro-10kva",
    name: "Itel Pro Kit · 10kVA Business System",
    brand: "ItelNigeria",
    category: "kits",
    price: 6500000,
    images: imgFor(
      "itel-pro-10kva",
      "Itel Pro Kit · 10kVA Business System",
      "kits",
      "10kVA · 20kWh",
    ),
    rating: 4.95,
    reviews: 41,
    tagline: "Run your business through any blackout.",
    badge: "Premium",
    spec: "10kVA · 20kWh",
    highlights: [
      "16 × 600W bifacial panels",
      "10kVA hybrid inverter",
      "20kWh lithium storage",
      "Pro installation included",
    ],
    description:
      "Engineered for shops, clinics, and small offices. Eliminates generator costs within 24 months for most businesses.",
    warranty: "Component-wise",
    inStock: true,
  },
  {
    slug: "itel-dc-cable-6mm",
    name: "Itel Solar DC Cable 6mm² (100m)",
    brand: "ItelNigeria",
    category: "accessories",
    price: 95000,
    originalPrice: 110000,
    images: imgFor(
      "itel-dc-cable-6mm",
      "Itel Solar DC Cable 6mm² (100m)",
      "accessories",
      "6mm² · 100m",
    ),
    rating: 4.5,
    reviews: 220,
    tagline: "UV & weather resistant tinned copper.",
    spec: "6mm² · 100m",
    highlights: ["Tinned copper", "1500V DC rated", "TÜV certified", "25-year UV life"],
    description: "Professional-grade solar DC cable for panel-to-inverter wiring.",
    warranty: "Lifetime",
    inStock: true,
  },
  {
    slug: "itel-rail-kit",
    name: "Itel Roof Mount Rail Kit (4 panels)",
    brand: "ItelNigeria",
    category: "accessories",
    price: 78000,
    images: imgFor(
      "itel-rail-kit",
      "Itel Roof Mount Rail Kit (4 panels)",
      "accessories",
      "4-panel set",
    ),
    rating: 4.6,
    reviews: 134,
    tagline: "Aluminum rails for pitched roofs.",
    spec: "4-panel set",
    highlights: [
      "Anodized aluminum",
      "Stainless hardware",
      "Pitched & flat roof",
      "Cyclone tested",
    ],
    description: "Complete mounting hardware for installing up to 4 panels on a pitched roof.",
    warranty: "10 years",
    inStock: true,
  },
  {
    slug: "itel-streetlight-60w",
    name: "Itel All-in-One Solar Street Light 60W",
    brand: "ItelNigeria",
    category: "accessories",
    price: 135000,
    images: imgFor(
      "itel-streetlight-60w",
      "Itel All-in-One Solar Street Light 60W",
      "accessories",
      "60W · 6000lm",
    ),
    rating: 4.7,
    reviews: 312,
    tagline: "Dusk-to-dawn. Motion sensor.",
    spec: "60W · 6000lm",
    highlights: [
      "Integrated panel + battery",
      "PIR motion sensor",
      "IP67 rated",
      "3-night autonomy",
    ],
    description: "Self-contained solar street light. Installs in minutes, no wiring required.",
    warranty: "3 years",
    inStock: true,
  },
];

export function getProduct(slug: string): Product | undefined {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("itel.admin.products");
      if (raw) {
        const adminProducts = JSON.parse(raw) as Product[];
        const found = adminProducts.find((p) => p.slug === slug);
        if (found) return found;
      }
    }
  } catch {
    /* ignore */
  }
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProducts(): Product[] {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("itel.admin.products");
      if (raw) {
        const adminProducts = JSON.parse(raw) as Product[];
        if (adminProducts.length > 0) return adminProducts;
      }
    }
  } catch {
    /* ignore */
  }
  return PRODUCTS;
}
