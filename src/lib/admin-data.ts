import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { toast } from "sonner";
import { withRetry } from "./utils";
import { type Product } from "./products";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  spec: string;
};

export type Order = {
  id: string;
  date: string;
  customer: { name: string; email: string; phone: string };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  payment: "paystack" | "flutterwave" | "transfer";
  address: { line: string; city: string; state: string };
};

export type CalculatorSession = {
  id: string;
  date: string;
  applianceCount: number;
  dailyKWh: number;
  batteryType: "lithium" | "tubular";
  systemVoltage: 24 | 48;
  panelCount: number;
  inverterKVA: number;
  batteryKWh: number;
  estimatedCost: number;
};

// ── Supabase-backed Orders hook ──────────────────────────────────────────────

export function useOrders(): [Order[], (id: string, status: OrderStatus) => void, boolean] {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("date", { ascending: false });
        if (error) {
          console.warn("Orders table not found:", error.message);
          setOrders([]);
        } else if (!data || data.length === 0) {
          setOrders([]);
        } else {
          setOrders(data as Order[]);
        }
      } catch {
        setOrders([]);
      }
      setLoading(false);
    })();
  }, []);

  // Real-time subscription for new orders from checkout
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => {
          const newOrder = payload.new as Order;
          // Avoid duplicates
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o))
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .then(({ error }) => {
        if (error) toast.error("Failed to update order status");
      });
  }, []);

  return [orders, updateStatus, loading] as const;
}

// ── Insert order from checkout ───────────────────────────────────────────────

export async function insertOrder(order: Order): Promise<{ error: string | null }> {
  const { error } = await supabase.from("orders").insert(order);
  if (error) {
    console.error("Failed to save order:", error);
    return { error: error.message };
  }
  return { error: null };
}

// ── Calculator sessions (localStorage fallback only) ─────────────────────────

export function useCalculatorSessions(): [CalculatorSession[], boolean] {
  const [sessions, setSessions] = useState<CalculatorSession[]>([]);
  const [loading, setLoading] = useState(false);
  return [sessions, loading] as const;
}

// ── Products (Supabase-backed + localStorage fallback) ───────────────

const LOCAL_KEY = "itel.admin.products";

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setLocalProducts(list: Product[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); } catch { }
}

function migrateProduct(p: Product): Product {
  return {
    ...p,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [],
    originalPrice: "originalPrice" in p ? p.originalPrice : undefined,
  };
}

export function useProducts() {
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    // Load from localStorage first for instant render
    const local = getLocalProducts();
    if (local.length > 0) {
      setList(local.map(migrateProduct));
      setLoading(false);
    }

    // Then try Supabase to sync
    withRetry(async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return (data as Product[]) ?? [];
    }, 0, 3000)
      .then((products) => {
        if (!mounted) return;
        // Only overwrite localStorage if we actually got data
        if (products.length > 0) {
          const migrated = products.map(migrateProduct);
          setList(migrated);
          setLocalProducts(migrated);
        }
        setLoading(false);
      })
      .catch((error) => {
        if (!mounted) return;
        const errMsg = error?.message || error?.toString?.() || "Unknown error";
        console.warn("[useProducts] Supabase error:", errMsg);
        // If localStorage was already loaded above, this is a no-op
        if (getLocalProducts().length === 0 && local.length === 0) {
          setList([]);
        }
        setLoading(false);
      });
  }, []);

  const updateStock = useCallback((slug: string, inStock: boolean) => {
    setList((prev) => {
      const next = prev.map((p) => (p.slug === slug ? { ...p, inStock } : p));
      setLocalProducts(next);
      return next;
    });
    supabase
      .from("products")
      .update({ inStock })
      .eq("slug", slug)
      .then(({ error }) => {
        if (error) console.error("Supabase stock update failed:", error.message);
      });
  }, []);

  const addProduct = useCallback((product: Product) => {
    const migrated = migrateProduct(product);
    setList((prev) => {
      const next = [...prev, migrated];
      setLocalProducts(next);
      return next;
    });
    supabase
      .from("products")
      .insert(product)
      .then(({ error }) => {
        if (error) {
          console.error("Supabase insert failed:", error.message);
          toast.error(`Saved locally — ${error.message}`);
        } else {
          toast.success("Product saved to cloud");
        }
      });
  }, []);

  const updateProduct = useCallback((slug: string, updates: Partial<Omit<Product, "slug">>) => {
    setList((prev) => {
      const next = prev.map((p) => (p.slug === slug ? migrateProduct({ ...p, ...updates }) : p));
      setLocalProducts(next);
      return next;
    });
    supabase
      .from("products")
      .update(updates)
      .eq("slug", slug)
      .then(({ error }) => {
        if (error) console.error("Supabase update failed:", error.message);
      });
  }, []);

  const deleteProduct = useCallback((slug: string) => {
    setList((prev) => {
      const next = prev.filter((p) => p.slug !== slug);
      setLocalProducts(next);
      return next;
    });
    supabase
      .from("products")
      .delete()
      .eq("slug", slug)
      .then(({ error }) => {
        if (error) console.error("Supabase delete failed:", error.message);
      });
  }, []);

  return [list, updateStock, addProduct, updateProduct, deleteProduct, loading] as const;
}

// ── Stateless helpers ─────────────────────────────────────────────────────────

export function getDashboardStats(
  orders: Order[],
  sessions: CalculatorSession[],
  totalProducts: number = 0,
) {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "processing",
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const avgSystemCost =
    sessions.length > 0
      ? Math.round(sessions.reduce((s, c) => s + c.estimatedCost, 0) / sessions.length)
      : 0;
  return {
    totalProducts,
    totalOrders: orders.length,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
    avgSystemCost,
    totalCalculatorSessions: sessions.length,
  };
}

export function statusColor(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "oklch(0.6 0.18 244)";
    case "confirmed":
      return "oklch(0.65 0.16 82)";
    case "processing":
      return "oklch(0.55 0.18 244)";
    case "shipped":
      return "oklch(0.6 0.22 27)";
    case "delivered":
      return "oklch(0.55 0.18 150)";
    case "cancelled":
      return "oklch(0.55 0.15 30)";
  }
}

export function statusLabel(status: OrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
