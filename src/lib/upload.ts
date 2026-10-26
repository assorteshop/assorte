import { createSupabaseBrowser } from "./supabase-browser";

// Uploads an image to the public "products" bucket (admins only) and returns its URL.
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Можна завантажувати лише зображення.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Фото більше 8 МБ. Зменште його й спробуйте ще раз.");

  const supabase = createSupabaseBrowser();
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("products")
    .upload(path, file, { cacheControl: "31536000", contentType: file.type });
  if (error) throw new Error(`Не вдалося завантажити: ${error.message}`);
  return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
}
