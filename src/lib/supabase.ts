import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials are not set in the environment variables.");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
);

export async function uploadImage(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
  const { data, error } = await supabase.storage.from("images").upload(fileName, file);
  if (error) {
    console.error("Upload error", error);
    return null;
  }
  const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(fileName);
  return publicUrlData.publicUrl;
}
