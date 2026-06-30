import { supabase } from "./supabase";

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

export function generateSeoTags(name: string, description: string, category: ProductCategory): string {
  const stopWords = new Set([
    "the", "and", "is", "in", "on", "of", "for", "to", "a", "an", "with", "at", "from", "by", "or", "as", "it", "its",
    "that", "be", "have", "has", "had", "not", "or", "but", "they", "this", "are", "was", "were", "will", "can", "could",
    "should", "would", "so", "if", "do", "does", "did", "up", "out", "about", "into", "over", "after", "again", "here",
    "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no",
    "nor", "only", "own", "same", "than", "too", "very", "just", "also", "now", "like", "get", "go", "see", "know", "use",
    "want", "need", "back", "how", "time", "people", "make", "more", "even", "way", "may", "because", "good", "new",
  ]);

  const extractWords = (text: string): string[] => {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w) && !/^(a|an|the|and|or|but|if|as|at|by|for|from|into|of|on|to|up|via|with|within)$/i.test(w));
    return [...new Set(words)].slice(0, 8);
  };

  const nameWords = extractWords(name);
  const descWords = extractWords(description);
  const catWords = category ? category.toLowerCase().split("").filter((w) => w.length > 2) : [];

  const priority = [...nameWords, ...descWords, ...catWords];
  const seen = new Set();
  const unique = priority.filter((w) => {
    if (seen.has(w)) return false;
    seen.add(w);
    return true;
  });

  return unique.slice(0, 8).join(", ");
}

export function seedProductImages(
  slug: string,
  name: string,
  cat: ProductCategory,
  spec: string,
): string[] {
  return [productImg(slug, name, cat, spec)];
}


export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true });
    if (error) {
      console.error("Failed to fetch products:", error);
      return [];
    }
    return (data || []) as Product[];
  } catch {
    return [];
  }
}

export async function fetchProduct(slug: string): Promise<Product | undefined> {
  try {
    const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single();
    if (error || !data) return undefined;
    return data as Product;
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
