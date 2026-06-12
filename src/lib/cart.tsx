import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, type Product } from "./products";
import { useProducts } from "./admin-data";

export type CartItem = { slug: string; qty: number };

type CartCtx = {
  items: CartItem[];
  detailed: { product: Product; qty: number; lineTotal: number }[];
  count: number;
  subtotal: number;
  add: (slug: string, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "itel.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [adminProducts] = useProducts();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      console.warn("Cart: failed to parse saved items");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((slug: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === slug);
      if (existing) return prev.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { slug, qty }];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => (i.slug === slug ? { ...i, qty } : i)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(() => {
    const detailed = items
      .map((i) => {
        const product = getProduct(i.slug) ?? adminProducts.find((p) => p.slug === i.slug);
        if (!product) return null;
        return { product, qty: i.qty, lineTotal: product.price * i.qty };
      })
      .filter(Boolean) as CartCtx["detailed"];
    const count = detailed.reduce((s, i) => s + i.qty, 0);
    const subtotal = detailed.reduce((s, i) => s + i.lineTotal, 0);
    return { items, detailed, count, subtotal, add, remove, setQty, clear };
  }, [items, add, remove, setQty, clear, adminProducts]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
