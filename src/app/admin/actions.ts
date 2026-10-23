"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { categories } from "@/lib/categories";
import { createSupabaseServer, requireAdmin } from "@/lib/supabase-server";

export type FormState = { error: string | null };

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Введіть email і пароль." };

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Невірний email або пароль." };

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: "Цей акаунт не має доступу до адмінки." };
  }
  redirect("/admin/products");
}

export async function logout() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hexPattern = /^#[0-9a-fA-F]{6}$/;

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const id = text("id");
  const name = text("name");
  const slug = text("slug");
  const tagline = text("tagline");
  const description = text("description");
  const badge = text("badge");
  const category = text("category");
  const price = Number(text("price_uah"));
  const sortOrder = Number(text("sort_order") || "0");

  if (!name || name.length > 200) return { error: "Вкажіть назву (до 200 символів)." };
  if (!slugPattern.test(slug) || slug.length > 80) {
    return { error: "Адреса сторінки: лише малі латинські літери, цифри та дефіси." };
  }
  if (!categories.some((c) => c.slug === category)) return { error: "Оберіть категорію." };
  if (!Number.isInteger(price) || price < 0 || price > 1_000_000) {
    return { error: "Ціна має бути цілим числом у гривнях." };
  }
  if (!Number.isInteger(sortOrder)) return { error: "Порядок має бути цілим числом." };
  if (badge.length > 30 || tagline.length > 200 || description.length > 3000) {
    return { error: "Один із текстів задовгий." };
  }

  const colors = text("colors")
    .split(/[\s,;]+/)
    .filter(Boolean);
  if (colors.some((c) => !hexPattern.test(c))) {
    return { error: "Кольори вказуйте у форматі #171717 через кому." };
  }

  let images: string[];
  try {
    const parsed = JSON.parse(text("images") || "[]");
    if (!Array.isArray(parsed) || parsed.length > 10) throw new Error("bad");
    images = parsed.map(String);
    if (images.some((u) => u.length > 500 || !(u.startsWith("https://") || u.startsWith("/")))) {
      throw new Error("bad");
    }
  } catch {
    return { error: "Не вдалося прочитати список фото." };
  }

  const row = {
    name,
    slug,
    tagline,
    description: description || null,
    price_uah: price,
    badge: badge || null,
    category,
    colors,
    images,
    image_url: images[0] ?? null,
    is_published: formData.get("is_published") === "on",
    is_featured: formData.get("is_featured") === "on",
    sort_order: sortOrder,
  };

  const { error } = id
    ? await supabase.from("products").update(row).eq("id", id)
    : await supabase.from("products").insert(row);

  if (error) {
    if (error.code === "23505") return { error: "Товар з такою адресою сторінки вже існує." };
    console.error("[assorte] saveProduct failed:", error.message);
    return { error: "Не вдалося зберегти. Перевірте поля й спробуйте ще раз." };
  }

  updateTag("products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await supabase.from("products").delete().eq("id", id);
    updateTag("products");
  }
  redirect("/admin/products");
}

const orderStatuses = ["new", "confirmed", "shipped", "done", "cancelled"];

export async function setOrderStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (id && orderStatuses.includes(status)) {
    await supabase.from("orders").update({ status }).eq("id", id);
  }
  redirect("/admin/orders");
}
