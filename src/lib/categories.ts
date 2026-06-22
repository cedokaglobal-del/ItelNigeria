import { useCallback, useEffect, useState } from "react";

export type Category = {
  id: string;
  label: string;
  blurb: string;
};

const KEY = "itel.admin.categories";
const DEFAULTS: Category[] = [
  { id: "panels", label: "Solar Panels", blurb: "Mono PERC & N-Type panels" },
  { id: "inverters", label: "Inverters", blurb: "Hybrid, off-grid, on-grid" },
  { id: "batteries", label: "Batteries", blurb: "LiFePO4 & tubular" },
  { id: "controllers", label: "Charge Controllers", blurb: "MPPT controllers" },
  { id: "kits", label: "Complete Kits", blurb: "Plug-and-play systems" },
  { id: "accessories", label: "Accessories", blurb: "Cables, breakers, mounts" },
];

/** Static snapshot for synchronous use (e.g. route loaders) */
export const CATEGORIES: Category[] = DEFAULTS;

export function seedCategories(): Category[] {
  return DEFAULTS;
}

export function useCategories(): [Category[], (cat: Category) => void, (id: string) => void, (id: string, updates: Partial<Category>) => void] {
  const [list, setList] = useState<Category[]>(() => {
    if (typeof window === "undefined") return DEFAULTS;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Category[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULTS;
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  }, [list]);

  const add = useCallback((cat: Category) => {
    setList((prev) => {
      if (prev.find((c) => c.id === cat.id)) return prev;
      return [...prev, cat];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setList((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const update = useCallback((id: string, updates: Partial<Category>) => {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  return [list, add, remove, update];
}

export function getCategories(): Category[] {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Category[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULTS;
}
