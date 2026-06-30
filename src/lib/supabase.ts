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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File): Promise<string | null> {
  // First try Supabase storage
  if (supabaseUrl && supabaseUrl !== "https://placeholder.supabase.co") {
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const { data, error } = await supabase.storage.from("images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(fileName);
        return publicUrlData.publicUrl;
      }
      console.warn("Supabase upload failed, falling back to data URL:", error?.message);
    } catch (e) {
      console.warn("Supabase upload exception, falling back to data URL:", e);
    }
  }
  // Fallback: convert to data URL (works immediately, no storage needed)
  try {
    return await fileToDataUrl(file);
  } catch {
    return null;
  }
}
