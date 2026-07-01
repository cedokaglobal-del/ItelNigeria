import { supabase } from "./supabase";
import { withRetry } from "./utils";

export type ProductCategory = string;

export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviews: number;
  tagline: string;
  badge?: string;
  spec: string;
  highlights: string[];
  description: string;
  warranty: string;
  inStock: boolean;
  tags?: string[];
};

/** Tiny placeholder SVG — ~200 bytes instead of 5-8KB */
function productImg(slug: string, name: string, cat: ProductCategory, spec: string): string {
  const colors: Record<string, string> = {
    panels: "#0d9488", inverters: "#2563eb", batteries: "#7c3aed",
    controllers: "#b45309", kits: "#c2410c", accessories: "#6b7280",
  };
  const c = colors[cat] ?? "#6b7280";
  const label = name.length > 20 ? name.slice(0, 17) + "…" : name;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 400 250">
    <rect width="400" height="250" fill="${c}" rx="12"/>
    <rect width="400" height="250" fill="url(#g)" rx="12" opacity="0.4"/>
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.15"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></linearGradient></defs>
    <text x="200" y="125" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="system-ui,sans-serif" font-size="22" font-weight="700">${label}</text>
    <text x="200" y="150" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="system-ui,sans-serif" font-size="13">${spec}</text>
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

const LOCAL_KEY = "itel.admin.products";

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function fetchProducts(): Promise<Product[]> {
  // Always return localStorage instantly — never wait for Supabase on public routes
  const local = getLocalProducts();
  if (local.length > 0) return local;
  // Fallback: quick Supabase check (200ms max) for fresh loads
  try {
    return await withRetry(async () => {
      const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true });
      if (error) throw error;
      return (data as Product[]) ?? [];
    }, 0, 200);
  } catch {
    return [];
  }
}

export async function fetchProduct(slug: string): Promise<Product | undefined> {
  // Return localStorage data instantly
  const local = getLocalProducts();
  if (local.length > 0) {
    const found = local.find((p) => p.slug === slug);
    if (found) return found;
  }
  // Otherwise quick Supabase check
  try {
    return await withRetry(async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single();
      if (error) throw error;
      return (data as Product) ?? undefined;
    }, 0, 200);
  } catch {
    return undefined;
  }
}

/** Async — reads from Supabase */
export async function getProduct(slug: string): Promise<Product | undefined> {
  return fetchProduct(slug);
}

/** Async — reads from Supabase */
export async function getProducts(): Promise<Product[]> {
  return fetchProducts();
}
