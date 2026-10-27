"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { parseArticleForm } from "@/lib/article-schema";
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
  const article = text("article").toUpperCase();
  const variantLabel = text("variant_label");
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
  if (article.length > 40 || variantLabel.length > 40) {
    return { error: "Артикул і варіант: до 40 символів." };
  }
  if (article && !variantLabel) {
    return { error: "Вкажіть варіант (наприклад, 10 кг): без нього товар не потрапить у групу." };
  }
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
    article: article || null,
    variant_label: article ? variantLabel : null,
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
    if (error.code === "23505") {
      return {
        error: error.message.includes("products_article_variant_key")
          ? "У цього артикулу вже є такий варіант."
          : "Товар з такою адресою сторінки вже існує.",
      };
    }
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


const urlOk = (u: string) => u.startsWith("https://") || u.startsWith("/");

export async function saveArticle(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();

  const parsed = parseArticleForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const a = parsed.data;

  let publishedAt: string | null = null;
  if (id) {
    const { data: current } = await supabase.from("articles").select("published_at").eq("id", id).maybeSingle();
    publishedAt = current?.published_at ?? null;
  }
  if (a.is_published && !publishedAt) publishedAt = new Date().toISOString();

  const row = {
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    body: a.body,
    seo_title: a.seo_title,
    meta_description: a.meta_description,
    title_accent: a.title_accent,
    eyebrow: a.eyebrow,
    category_slug: a.category_slug,
    cover_url: a.cover_url,
    cover_alt: a.cover_alt,
    faq: a.faq,
    sources: a.sources,
    primary_product_id: a.primary_product_id,
    related_slugs: a.related,
    is_published: a.is_published,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  };

  let articleId = id;
  if (id) {
    const { error } = await supabase.from("articles").update(row).eq("id", id);
    if (error) return saveArticleError(error);
  } else {
    const { data, error } = await supabase.from("articles").insert(row).select("id").single();
    if (error || !data) return saveArticleError(error);
    articleId = data.id;
  }

  // Founder-only note, kept in a table the public API cannot read.
  const { error: noteError } = await supabase
    .from("article_private")
    .upsert({ article_id: articleId, target_query: a.target_query });
  if (noteError) console.error("[assorte] article note failed:", noteError.message);

  updateTag("articles");
  redirect("/admin/articles");
}

function saveArticleError(error: { code?: string; message: string } | null): FormState {
  if (error?.code === "23505") return { error: "Стаття з такою адресою сторінки вже існує." };
  console.error("[assorte] saveArticle failed:", error?.message);
  return { error: "Не вдалося зберегти. Перевірте поля й спробуйте ще раз." };
}

export async function deleteArticle(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await supabase.from("articles").delete().eq("id", id);
    updateTag("articles");
  }
  redirect("/admin/articles");
}

export async function saveBanner(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const slot = Number(text("slot"));
  const eyebrow = text("eyebrow");
  const title = text("title");
  const body = text("body");
  const buttonLabel = text("button_label");
  const href = text("href");
  const image = text("image_url");
  const tone = text("tone");
  const articleId = text("article_id");
  const fromArticle = articleId !== "";

  if (![1, 2, 3].includes(slot)) return { error: "Невідомий блок." };
  if (fromArticle && !/^[0-9a-f-]{36}$/i.test(articleId)) return { error: "Оберіть статтю зі списку." };
  if (!fromArticle && (!title || title.length > 120)) return { error: "Заголовок: до 120 символів." };
  if (title.length > 120) return { error: "Заголовок: до 120 символів." };
  if (eyebrow.length > 80 || body.length > 200 || buttonLabel.length > 30) {
    return { error: "Один із текстів задовгий." };
  }
  if (!buttonLabel) return { error: "Вкажіть текст кнопки." };
  if (!fromArticle && (!urlOk(href) || href.length > 300)) return { error: "Посилання має починатися з / або https://" };
  if (image && (!urlOk(image) || image.length > 500)) return { error: "Некоректне посилання на фото." };
  if (tone !== "light" && tone !== "red") return { error: "Оберіть колір блоку." };

  const { error } = await supabase.from("home_banners").upsert({
    slot,
    eyebrow,
    title: title || "Стаття",
    body: body || null,
    button_label: buttonLabel,
    href: fromArticle ? "/blog" : href,
    article_id: fromArticle ? articleId : null,
    image_url: image || null,
    tone,
    is_active: formData.get("is_active") === "on",
  });
  if (error) {
    console.error("[assorte] saveBanner failed:", error.message);
    return { error: "Не вдалося зберегти." };
  }
  updateTag("banners");
  return { error: null };
}
