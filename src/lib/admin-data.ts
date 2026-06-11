import { useCallback, useEffect, useMemo, useState } from "react";
import { PRODUCTS, seedProductImages, type Product, type ProductCategory } from "./products";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

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

// ── Seed data ──────────────────────────────────────────

const now = new Date();

function seedOrders(): Order[] {
  return [
    { id: "ITL-A7F3B2", date: new Date(now.getTime() - 3 * 86400000).toISOString(), customer: { name: "Chidi Okonkwo", email: "chidi@example.com", phone: "+234 802 111 2233" }, items: [{ slug: "itel-starter-3kva", name: "Itel Starter Kit \u00b7 3kVA Home Bundle", price: 1850000, qty: 1, spec: "3kVA \u00b7 5kWh" }], subtotal: 1850000, shipping: 0, total: 1850000, status: "shipped", payment: "paystack", address: { line: "15 Adeola Odeku St", city: "Lagos", state: "Lagos" } },
    { id: "ITL-D9C1E4", date: new Date(now.getTime() - 5 * 86400000).toISOString(), customer: { name: "Amina Bello", email: "amina@example.com", phone: "+234 803 555 7788" }, items: [{ slug: "itel-mono-550w", name: "Itel Mono PERC 550W", price: 165000, qty: 8, spec: "550W" }, { slug: "itel-hybrid-5kva", name: "Itel Hybrid Inverter 5kVA / 48V", price: 685000, qty: 1, spec: "5kVA \u00b7 48V" }, { slug: "itel-lifepo4-5kwh", name: "Itel LiFePO4 5.12kWh Wall-Mount", price: 1450000, qty: 2, spec: "5.12kWh \u00b7 48V" }], subtotal: 4905000, shipping: 0, total: 4905000, status: "processing", payment: "flutterwave", address: { line: "42 Ahmadu Bello Way", city: "Abuja", state: "FCT" } },
    { id: "ITL-E2F8G1", date: new Date(now.getTime() - 1 * 86400000).toISOString(), customer: { name: "Emeka Nwosu", email: "emeka@example.com", phone: "+234 805 777 9900" }, items: [{ slug: "itel-pro-10kva", name: "Itel Pro Kit \u00b7 10kVA Business System", price: 6500000, qty: 1, spec: "10kVA \u00b7 20kWh" }], subtotal: 6500000, shipping: 0, total: 6500000, status: "pending", payment: "transfer", address: { line: "7 Port Harcourt Rd", city: "Enugu", state: "Enugu" } },
    { id: "ITL-H4I2J5", date: new Date(now.getTime() - 10 * 86400000).toISOString(), customer: { name: "Folake Adeyemi", email: "folake@example.com", phone: "+234 806 333 4455" }, items: [{ slug: "itel-ntype-600w", name: "Itel N-Type Bifacial 600W", price: 198000, qty: 12, spec: "600W" }, { slug: "itel-hybrid-10kva", name: "Itel Hybrid Inverter 10kVA / 48V", price: 1250000, qty: 1, spec: "10kVA \u00b7 48V" }, { slug: "itel-lifepo4-5kwh", name: "Itel LiFePO4 5.12kWh Wall-Mount", price: 1450000, qty: 4, spec: "5.12kWh \u00b7 48V" }], subtotal: 9366000, shipping: 0, total: 9366000, status: "delivered", payment: "paystack", address: { line: "25 Marina Way", city: "Lagos", state: "Lagos" } },
    { id: "ITL-K6L3M7", date: new Date(now.getTime() - 7 * 86400000).toISOString(), customer: { name: "Yusuf Ibrahim", email: "yusuf@example.com", phone: "+234 809 222 5566" }, items: [{ slug: "itel-mppt-60a", name: "Itel MPPT Charge Controller 60A", price: 145000, qty: 2, spec: "60A \u00b7 150VDC" }, { slug: "itel-dc-cable-6mm", name: "Itel Solar DC Cable 6mm\u00b2 (100m)", price: 95000, qty: 3, spec: "6mm\u00b2 \u00b7 100m" }], subtotal: 575000, shipping: 15000, total: 590000, status: "confirmed", payment: "flutterwave", address: { line: "10 Kano Rd", city: "Kaduna", state: "Kaduna" } },
    { id: "ITL-N8O4P9", date: new Date(now.getTime() - 2 * 86400000).toISOString(), customer: { name: "Ngozi Eze", email: "ngozi@example.com", phone: "+234 810 888 1122" }, items: [{ slug: "itel-streetlight-60w", name: "Itel All-in-One Solar Street Light 60W", price: 135000, qty: 5, spec: "60W \u00b7 6000lm" }], subtotal: 675000, shipping: 15000, total: 690000, status: "cancelled", payment: "paystack", address: { line: "8 Market Rd", city: "Onitsha", state: "Anambra" } },
    { id: "ITL-R5S6T7", date: new Date(now.getTime() - 14 * 86400000).toISOString(), customer: { name: "Tunde Balogun", email: "tunde@example.com", phone: "+234 812 444 7788" }, items: [{ slug: "itel-tubular-220ah", name: "Itel Deep-Cycle Tubular 220Ah", price: 245000, qty: 4, spec: "220Ah \u00b7 12V" }, { slug: "itel-mppt-60a", name: "Itel MPPT Charge Controller 60A", price: 145000, qty: 1, spec: "60A \u00b7 150VDC" }], subtotal: 1125000, shipping: 0, total: 1125000, status: "delivered", payment: "transfer", address: { line: "3 Ibadan Rd", city: "Ibadan", state: "Oyo" } },
    { id: "ITL-U8V9W1", date: new Date(now.getTime() - 4 * 86400000).toISOString(), customer: { name: "Chioma Okafor", email: "chioma@example.com", phone: "+234 813 777 3344" }, items: [{ slug: "itel-ntype-600w", name: "Itel N-Type Bifacial 600W", price: 198000, qty: 6, spec: "600W" }, { slug: "itel-lifepo4-5kwh", name: "Itel LiFePO4 5.12kWh Wall-Mount", price: 1450000, qty: 2, spec: "5.12kWh \u00b7 48V" }], subtotal: 4088000, shipping: 0, total: 4088000, status: "processing", payment: "paystack", address: { line: "22 Benin Rd", city: "Warri", state: "Delta" } },
  ];
}

function seedCalculatorSessions(): CalculatorSession[] {
  return [
    { id: "cs-001", date: new Date(now.getTime() - 1 * 86400000).toISOString(), applianceCount: 8, dailyKWh: 14.6, batteryType: "lithium", systemVoltage: 48, panelCount: 6, inverterKVA: 5, batteryKWh: 10.2, estimatedCost: 4250000 },
    { id: "cs-002", date: new Date(now.getTime() - 2 * 86400000).toISOString(), applianceCount: 5, dailyKWh: 8.2, batteryType: "lithium", systemVoltage: 24, panelCount: 4, inverterKVA: 3, batteryKWh: 5.8, estimatedCost: 2450000 },
    { id: "cs-003", date: new Date(now.getTime() - 2 * 86400000).toISOString(), applianceCount: 12, dailyKWh: 28.4, batteryType: "tubular", systemVoltage: 48, panelCount: 12, inverterKVA: 10, batteryKWh: 22.0, estimatedCost: 6800000 },
    { id: "cs-004", date: new Date(now.getTime() - 3 * 86400000).toISOString(), applianceCount: 3, dailyKWh: 3.1, batteryType: "lithium", systemVoltage: 24, panelCount: 2, inverterKVA: 1, batteryKWh: 2.0, estimatedCost: 1200000 },
    { id: "cs-005", date: new Date(now.getTime() - 4 * 86400000).toISOString(), applianceCount: 7, dailyKWh: 11.8, batteryType: "lithium", systemVoltage: 48, panelCount: 5, inverterKVA: 5, batteryKWh: 8.5, estimatedCost: 3650000 },
    { id: "cs-006", date: new Date(now.getTime() - 5 * 86400000).toISOString(), applianceCount: 10, dailyKWh: 19.5, batteryType: "tubular", systemVoltage: 48, panelCount: 8, inverterKVA: 7, batteryKWh: 15.0, estimatedCost: 5100000 },
    { id: "cs-007", date: new Date(now.getTime() - 7 * 86400000).toISOString(), applianceCount: 4, dailyKWh: 5.7, batteryType: "lithium", systemVoltage: 24, panelCount: 3, inverterKVA: 3, batteryKWh: 4.2, estimatedCost: 1900000 },
    { id: "cs-008", date: new Date(now.getTime() - 10 * 86400000).toISOString(), applianceCount: 6, dailyKWh: 9.4, batteryType: "lithium", systemVoltage: 48, panelCount: 4, inverterKVA: 3, batteryKWh: 6.8, estimatedCost: 2850000 },
    { id: "cs-009", date: new Date(now.getTime() - 14 * 86400000).toISOString(), applianceCount: 15, dailyKWh: 35.2, batteryType: "lithium", systemVoltage: 48, panelCount: 14, inverterKVA: 15, batteryKWh: 25.0, estimatedCost: 8200000 },
    { id: "cs-010", date: new Date(now.getTime() - 21 * 86400000).toISOString(), applianceCount: 9, dailyKWh: 16.3, batteryType: "tubular", systemVoltage: 48, panelCount: 7, inverterKVA: 7, batteryKWh: 12.5, estimatedCost: 4400000 },
  ];
}

// ── localStorage hooks ──────────────────────────────────

function useLocalStorage<T>(key: string, seed: () => T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return seed();
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch { /* ignore */ }
    const s = seed();
    localStorage.setItem(key, JSON.stringify(s));
    return s;
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* ignore */ }
  }, [key, state]);

  return [state, setState];
}

// ── Hooks ───────────────────────────────────────────────

const ORDERS_KEY = "itel.admin.orders";
const SESSIONS_KEY = "itel.admin.sessions";

export function useOrders(): [Order[], (id: string, status: OrderStatus) => void] {
  const [orders, setOrders] = useLocalStorage<Order[]>(ORDERS_KEY, seedOrders);

  const updateStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, [setOrders]);

  return [orders, updateStatus];
}

export function useCalculatorSessions(): CalculatorSession[] {
  const [sessions] = useLocalStorage<CalculatorSession[]>(SESSIONS_KEY, seedCalculatorSessions);
  return sessions;
}

function migrateProduct(p: Product): Product {
  return {
    ...p,
    images: (p as any).images?.length ? (p as any).images : seedProductImages(p.slug, p.name, p.category, p.spec),
    originalPrice: (p as any).originalPrice ?? undefined,
  };
}

function seedProducts(): Product[] {
  return PRODUCTS.map(migrateProduct);
}

export function useProducts() {
  const [list, setList] = useLocalStorage<Product[]>("itel.admin.products", seedProducts);

  const updateStock = useCallback((slug: string, inStock: boolean) => {
    setList((prev) => prev.map((p) => (p.slug === slug ? { ...p, inStock } : p)));
  }, [setList]);

  const addProduct = useCallback((product: Product) => {
    setList((prev) => [...prev, migrateProduct(product)]);
  }, [setList]);

  const updateProduct = useCallback((slug: string, updates: Partial<Omit<Product, "slug">>) => {
    setList((prev) => prev.map((p) => (p.slug === slug ? migrateProduct({ ...p, ...updates }) : p)));
  }, [setList]);

  const deleteProduct = useCallback((slug: string) => {
    setList((prev) => prev.filter((p) => p.slug !== slug));
  }, [setList]);

  return [list, updateStock, addProduct, updateProduct, deleteProduct] as const;
}

// ── Stateless helpers ─────────────────────────────────────

export function getDashboardStats(orders: Order[], sessions: CalculatorSession[]) {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "processing").length;
  const avgSystemCost = sessions.length > 0 ? Math.round(sessions.reduce((s, c) => s + c.estimatedCost, 0) / sessions.length) : 0;
  return { totalProducts: PRODUCTS.length, totalOrders: orders.length, totalRevenue, pendingOrders, avgSystemCost, totalCalculatorSessions: sessions.length };
}

export function statusColor(status: OrderStatus): string {
  switch (status) {
    case "pending": return "oklch(0.6 0.18 244)";
    case "confirmed": return "oklch(0.65 0.16 82)";
    case "processing": return "oklch(0.55 0.18 244)";
    case "shipped": return "oklch(0.6 0.22 27)";
    case "delivered": return "oklch(0.55 0.18 150)";
    case "cancelled": return "oklch(0.55 0.15 30)";
  }
}

export function statusLabel(status: OrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
