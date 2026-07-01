import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { toast } from "sonner";

export type Category = {
  id: string;
  label: string;
  blurb: string;
};

let _cachedCategories: Category[] | null = null;

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from("categories").select("*");
    if (error || !data || data.length === 0) return [];
    _cachedCategories = data as Category[];
    return _cachedCategories;
  } catch {
    return [];
  }
}

export function useCategories(): [Category[], (cat: Category) => void, (id: string) => void, (id: string, updates: Partial<Category>) => void] {
  const [list, setList] = useState<Category[]>([]);

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
