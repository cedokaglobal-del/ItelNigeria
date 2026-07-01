import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Category = {
  id: string;
  label: string;
  blurb: string;
};

const STORAGE_KEY = "itel_categories";

function loadLocal(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Category[];
  } catch { /* ignore */ }
  return [];
}

function saveLocal(list: Category[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from("categories").select("*");
    if (!error && data && data.length > 0) {
      const cats = data as Category[];
      saveLocal(cats);
      return cats;
    }
  } catch { /* ignore */ }
  return loadLocal();
}

export function useCategories(): [Category[], (cat: Category) => void, (id: string) => void, (id: string, updates: Partial<Category>) => void] {
  const [list, setList] = useState<Category[]>(() => loadLocal());

  useEffect(() => {
    fetchCategories().then(setList);
  }, []);

  const persist = useCallback((fn: (prev: Category[]) => Category[]) => {
    setList((prev) => {
      const next = fn(prev);
      saveLocal(next);
      return next;
    });
  }, []);

  const add = useCallback((cat: Category) => {
    persist((prev) => {
      if (prev.find((c) => c.id === cat.id)) return prev;
      return [...prev, cat];
    });
    supabase.from("categories").insert(cat).then(({ error }) => {
      if (error) console.warn("Supabase insert failed, saved locally:", error.message);
    });
  }, [persist]);

  const remove = useCallback((id: string) => {
    persist((prev) => prev.filter((c) => c.id !== id));
    supabase.from("categories").delete().eq("id", id).then(({ error }) => {
      if (error) console.warn("Supabase delete failed, removed locally:", error.message);
    });
  }, [persist]);

  const update = useCallback((id: string, updates: Partial<Category>) => {
    persist((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    supabase.from("categories").update(updates).eq("id", id).then(({ error }) => {
      if (error) console.warn("Supabase update failed, updated locally:", error.message);
    });
  }, [persist]);

  return [list, add, remove, update];
}
