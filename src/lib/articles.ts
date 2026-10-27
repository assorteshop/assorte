import { cacheLife, cacheTag } from "next/cache";
import { readArticle } from "./article-html";
import { supabase } from "./supabase";

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_url: string | null;
  cover_alt: string | null;
  related_slugs: string[];
  published_at: string | null;
  updated_at: string | null;
  seo_title: string | null;
  meta_description: string | null;
  title_accent: string | null;
  eyebrow: string | null;
  category_slug: string | null;
  faq: { q: string; a: string }[];
  sources: { label: string; url: string }[];
  primary_product_id: string | null;
};

// What the list, the homepage blocks and category pages show for an article.
export type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string | null;
  excerpt: string;
  image: string | null;
  imageAlt: string;
  published_at: string | null;
  readingMinutes: number;
};

export type Banner = {
  slot: number;
  eyebrow: string;
  title: string;
  body: string | null;
  button_label: string;
  href: string | null;
  image_url: string | null;
  tone: "light" | "red";
};

const fullColumns =
  "id, slug, title, excerpt, body, cover_url, cover_alt, related_slugs, published_at, updated_at, seo_title, meta_description, title_accent, eyebrow, category_slug, faq, sources, primary_product_id";
const cardColumns = "id, slug, title, excerpt, body, cover_url, cover_alt, eyebrow, published_at";

function lifetime() {
  cacheTag("articles");
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
}

export function toCard(a: Pick<Article, "id" | "slug" | "title" | "excerpt" | "body" | "cover_url" | "cover_alt" | "eyebrow" | "published_at">): ArticleCard {
  const meta = readArticle(a.body);
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    eyebrow: a.eyebrow ?? meta.eyebrow,
    excerpt: a.excerpt || meta.lead || "",
    image: a.cover_url ?? meta.firstImage,
    imageAlt: a.cover_alt ?? a.title,
    published_at: a.published_at,
    readingMinutes: meta.readingMinutes,
  };
}

export async function getArticles(): Promise<ArticleCard[]> {
  "use cache";
  lifetime();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("articles")
    .select(cardColumns)
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error) {
    console.error("[assorte] articles query failed:", error.message);
    return [];
  }
  return (data ?? []).map(toCard);
}

export async function getArticlesByCategory(category: string, limit = 3): Promise<ArticleCard[]> {
  "use cache";
  lifetime();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("articles")
    .select(cardColumns)
    .eq("is_published", true)
    .eq("category_slug", category)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).map(toCard);
}

export async function getArticleForProduct(productId: string): Promise<{ slug: string; title: string } | null> {
  "use cache";
  lifetime();
  if (!supabase) return null;
  const { data } = await supabase
    .from("articles")
    .select("slug, title")
    .eq("is_published", true)
    .eq("primary_product_id", productId)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  "use cache";
  lifetime();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("articles")
    .select(fullColumns)
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[assorte] article query failed:", error.message);
    return null;
  }
  if (!data) return null;
  return { ...data, faq: data.faq ?? [], sources: data.sources ?? [], related_slugs: data.related_slugs ?? [] } as Article;
}

// Old address of a published article -> its current address (after a slug change).
export async function resolveOldArticleSlug(slug: string): Promise<string | null> {
  "use cache";
  lifetime();
  if (!supabase) return null;
  const { data } = await supabase.rpc("resolve_article_slug", { p_slug: slug });
  return typeof data === "string" ? data : null;
}

export async function getPublishedArticleSlugs(): Promise<{ slug: string; updated_at: string | null }[]> {
  "use cache";
  lifetime();
  if (!supabase) return [];
  const { data } = await supabase.from("articles").select("slug, updated_at").eq("is_published", true);
  return data ?? [];
}

// ---------- homepage blocks ----------

// The homepage keeps working with these defaults if the table is empty or unreachable.
export const defaultBanners: Banner[] = [
  { slot: 1, eyebrow: "Заряд енергії скрізь, де ти", title: "Надійний павербанк для активного життя", body: null, button_label: "Дізнатися більше", href: "/catalog/tech", image_url: null, tone: "light" },
  { slot: 2, eyebrow: "Подарунки з характером", title: "Скриньки, які дивують", body: "Більше, ніж подарунок — це емоція.", button_label: "До колекції", href: "/catalog/gifts", image_url: null, tone: "red" },
  { slot: 3, eyebrow: "Теплі аксесуари на кожен день", title: "Стиль, комфорт і турбота", body: null, button_label: "Переглянути", href: "/catalog/style", image_url: null, tone: "light" },
];

type BannerRow = Omit<Banner, "href"> & {
  href: string;
  article_id?: string | null;
  article?: Pick<Article, "id" | "slug" | "title" | "excerpt" | "body" | "cover_url" | "cover_alt" | "eyebrow" | "published_at"> | null;
};

export function bannerFromRow(row: BannerRow): Banner {
  if (!row.article_id) return { ...row };
  // Linked to an article. Unpublished articles are invisible here (row security),
  // so the block stays but loses its button.
  if (!row.article) return { ...row, href: null };
  const card = toCard(row.article);
  return {
    ...row,
    title: card.title,
    body: card.excerpt || row.body,
    image_url: card.image ?? row.image_url,
    button_label: row.button_label || "Читати далі",
    href: `/blog/${card.slug}`,
  };
}

export async function getBanners(): Promise<Banner[]> {
  "use cache";
  cacheTag("banners");
  cacheTag("articles");
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  if (!supabase) return defaultBanners;

  const base = "slot, eyebrow, title, body, button_label, href, image_url, tone";
  const withArticle = await supabase
    .from("home_banners")
    .select(`${base}, article_id, article:articles(${cardColumns})`)
    .eq("is_active", true)
    .order("slot", { ascending: true });

  // Until the article link column exists, fall back to the plain blocks.
  const result = withArticle.error
    ? await supabase.from("home_banners").select(base).eq("is_active", true).order("slot", { ascending: true })
    : withArticle;

  if (result.error || !result.data?.length) return defaultBanners;
  return (result.data as unknown as BannerRow[]).map(bannerFromRow);
}
