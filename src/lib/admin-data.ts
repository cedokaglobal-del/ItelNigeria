import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { toast } from "sonner";
import { withRetry, safeLogError } from "./utils";
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

// ── Seed data (used as fallback when Supabase is empty) ──────────────────────

function seedOrders(): Order[] {
  const now = new Date();
  return [
    {
      id: "ITL-A7F3B2",
      date: new Date(now.getTime() - 3 * 86400000).toISOString(),
      customer: { name: "Chidi Okonkwo", email: "chidi@example.com", phone: "+234 802 111 2233" },
      items: [
        {
          slug: "itel-starter-3kva",
          name: "Itel Starter Kit · 3kVA Home Bundle",
          price: 1850000,
          qty: 1,
          spec: "3kVA · 5kWh",
        },
      ],
      subtotal: 1850000,
      shipping: 0,
      total: 1850000,
      status: "shipped",
      payment: "paystack",
      address: { line: "15 Adeola Odeku St", city: "Lagos", state: "Lagos" },
    },
    {
      id: "ITL-D9C1E4",
      date: new Date(now.getTime() - 5 * 86400000).toISOString(),
      customer: { name: "Amina Bello", email: "amina@example.com", phone: "+234 803 555 7788" },
      items: [
        { slug: "itel-mono-550w", name: "Itel Mono PERC 550W", price: 165000, qty: 8, spec: "550W" },
        { slug: "itel-hybrid-5kva", name: "Itel Hybrid Inverter 5kVA / 48V", price: 685000, qty: 1, spec: "5kVA · 48V" },
        { slug: "itel-lifepo4-5kwh", name: "Itel LiFePO4 5.12kWh Wall-Mount", price: 1450000, qty: 2, spec: "5.12kWh · 48V" },
      ],
      subtotal: 4905000,
      shipping: 0,
      total: 4905000,
      status: "processing",
      payment: "flutterwave",
      address: { line: "42 Ahmadu Bello Way", city: "Abuja", state: "FCT" },
    },
    {
      id: "ITL-E2F8G1",
      date: new Date(now.getTime() - 1 * 86400000).toISOString(),
      customer: { name: "Emeka Nwosu", email: "emeka@example.com", phone: "+234 805 777 9900" },
      items: [
        { slug: "itel-pro-10kva", name: "Itel Pro Kit · 10kVA Business System", price: 6500000, qty: 1, spec: "10kVA · 20kWh" },
      ],
      subtotal: 6500000,
      shipping: 0,
      total: 6500000,
      status: "pending",
      payment: "transfer",
      address: { line: "7 Port Harcourt Rd", city: "Enugu", state: "Enugu" },
    },
  ];
}

function seedCalculatorSessions(): CalculatorSession[] {
  const now = new Date();
  return [
    { id: "cs-001", date: new Date(now.getTime() - 1 * 86400000).toISOString(), applianceCount: 8, dailyKWh: 14.6, batteryType: "lithium", systemVoltage: 48, panelCount: 6, inverterKVA: 5, batteryKWh: 10.2, estimatedCost: 4250000 },
    { id: "cs-002", date: new Date(now.getTime() - 2 * 86400000).toISOString(), applianceCount: 5, dailyKWh: 8.2, batteryType: "lithium", systemVoltage: 24, panelCount: 4, inverterKVA: 3, batteryKWh: 5.8, estimatedCost: 2450000 },
    { id: "cs-003", date: new Date(now.getTime() - 2 * 86400000).toISOString(), applianceCount: 12, dailyKWh: 28.4, batteryType: "tubular", systemVoltage: 48, panelCount: 12, inverterKVA: 10, batteryKWh: 22.0, estimatedCost: 6800000 },
    { id: "cs-004", date: new Date(now.getTime() - 3 * 86400000).toISOString(), applianceCount: 3, dailyKWh: 3.1, batteryType: "lithium", systemVoltage: 24, panelCount: 2, inverterKVA: 1, batteryKWh: 2.0, estimatedCost: 1200000 },
    { id: "cs-005", date: new Date(now.getTime() - 4 * 86400000).toISOString(), applianceCount: 7, dailyKWh: 11.8, batteryType: "lithium", systemVoltage: 48, panelCount: 5, inverterKVA: 5, batteryKWh: 8.5, estimatedCost: 3650000 },
  ];
}

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
          console.warn("Orders table not found or empty, using seed data:", error.message);
          setOrders(seedOrders());
        } else if (!data || data.length === 0) {
          setOrders(seedOrders());
        } else {
          setOrders(data as Order[]);
        }
      } catch {
        setOrders(seedOrders());
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
  const [sessions, setSessions] = useState<CalculatorSession[]>(seedCalculatorSessions);
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
