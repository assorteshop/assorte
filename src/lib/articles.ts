import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "./supabase";

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_url: string | null;
  related_slugs: string[];
  published_at: string | null;
};

export type Banner = {
  slot: number;
  eyebrow: string;
  title: string;
  body: string | null;
  button_label: string;
  href: string;
  image_url: string | null;
  tone: "light" | "red";
};

const articleColumns = "id, slug, title, excerpt, body, cover_url, related_slugs, published_at";

export async function getArticles(): Promise<Article[]> {
  "use cache";
  cacheTag("articles");
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("articles")
    .select(articleColumns)
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error) {
    console.error("[assorte] articles query failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  "use cache";
  cacheTag("articles");
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("articles")
    .select(articleColumns)
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[assorte] article query failed:", error.message);
    return null;
  }
  return data;
}

// The homepage keeps working with these defaults if the table is empty or unreachable.
export const defaultBanners: Banner[] = [
  { slot: 1, eyebrow: "Заряд енергії скрізь, де ти", title: "Надійний павербанк для активного життя", body: null, button_label: "Дізнатися більше", href: "/catalog/tech", image_url: null, tone: "light" },
  { slot: 2, eyebrow: "Подарунки з характером", title: "Скриньки, які дивують", body: "Більше, ніж подарунок — це емоція.", button_label: "До колекції", href: "/catalog/gifts", image_url: null, tone: "red" },
  { slot: 3, eyebrow: "Теплі аксесуари на кожен день", title: "Стиль, комфорт і турбота", body: null, button_label: "Переглянути", href: "/catalog/style", image_url: null, tone: "light" },
];

export async function getBanners(): Promise<Banner[]> {
  "use cache";
  cacheTag("banners");
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  if (!supabase) return defaultBanners;

  const { data, error } = await supabase
    .from("home_banners")
    .select("slot, eyebrow, title, body, button_label, href, image_url, tone")
    .eq("is_active", true)
    .order("slot", { ascending: true });
  if (error || !data?.length) return defaultBanners;
  return data as Banner[];
}
