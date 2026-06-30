import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { toast } from "sonner";

export type Category = {
  id: string;
  label: string;
  blurb: string;
};

// We still keep an array of fallback categories just in case the DB is totally empty on first load.
// But we no longer use localStorage.
const DEFAULTS: Category[] = [
  { id: "panels", label: "Solar Panels", blurb: "Mono PERC & N-Type panels" },
  { id: "inverters", label: "Inverters", blurb: "Hybrid, off-grid, on-grid" },
  { id: "batteries", label: "Batteries", blurb: "LiFePO4 & tubular" },
  { id: "controllers", label: "Charge Controllers", blurb: "MPPT controllers" },
  { id: "kits", label: "Complete Kits", blurb: "Plug-and-play systems" },
  { id: "accessories", label: "Accessories", blurb: "Cables, breakers, mounts" },
];

let _cachedCategories: Category[] | null = null;

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from("categories").select("*");
    if (error || !data || data.length === 0) {
      // If table is missing/empty, return defaults but don't persist them
      return DEFAULTS;
    }
    _cachedCategories = data as Category[];
    return _cachedCategories;
  } catch {
    return DEFAULTS;
  }
}

export function useCategories(): [Category[], (cat: Category) => void, (id: string) => void, (id: string, updates: Partial<Category>) => void] {
  const [list, setList] = useState<Category[]>(DEFAULTS);

  useEffect(() => {
    fetchCategories().then(setList);
  }, []);

  const add = useCallback((cat: Category) => {
    setList((prev) => {
      if (prev.find((c) => c.id === cat.id)) return prev;
      return [...prev, cat];
    });
    supabase.from("categories").insert(cat).then(({ error }) => {
      if (error) toast.error("Failed to add category");
    });
  }, []);

  const remove = useCallback((id: string) => {
    setList((prev) => prev.filter((c) => c.id !== id));
    supabase.from("categories").delete().eq("id", id).then(({ error }) => {
      if (error) toast.error("Failed to delete category");
    });
  }, []);

  const update = useCallback((id: string, updates: Partial<Category>) => {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    supabase.from("categories").update(updates).eq("id", id).then(({ error }) => {
      if (error) toast.error("Failed to update category");
    });
  }, []);

  return [list, add, remove, update];
}
