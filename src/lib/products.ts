import { cacheLife, cacheTag } from "next/cache";
import { categories, type CategorySlug } from "./categories";
import { supabase } from "./supabase";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string | null;
  price_uah: number;
  badge: string | null;
  image_url: string | null;
  images: string[];
  category: CategorySlug | null;
  colors: string[];
  article: string | null;
  variant_label: string | null;
};

// A catalogue card: all products sharing one article collapse into a single card.
export type ProductCardData = Product & { variantCount: number; priceFrom: boolean };

const columns =
  "id, slug, name, tagline, description, price_uah, badge, image_url, images, category, colors, article, variant_label";

// Shown only while Supabase is not configured, so the layout can be reviewed.
// Names, taglines and prices come from the approved homepage design.
const designPlaceholders: Product[] = [
  {
    id: "placeholder-1",
    slug: "powerbank-20000",
    name: "Повербанк 20 000 мАг",
    tagline: "Швидка зарядка · Компактний дизайн",
    description: null,
    price_uah: 1490,
    badge: "Хіт",
    image_url: null,
    images: [],
    category: "tech",
    article: null,
    variant_label: null,
    colors: ["#171717", "#e9e1d6", "#5d7260", "#e9a0a0"],
  },
  {
    id: "placeholder-2",
    slug: "muff-bag",
    name: "Сумка-муфта Muff Bag",
    tagline: "Тепло для рук · Стильний аксесуар",
    description: null,
    price_uah: 1990,
    badge: "Новинка",
    image_url: null,
    images: [],
    category: "style",
    article: null,
    variant_label: null,
    colors: ["#5a2e1f", "#171717", "#d9c2a7"],
  },
  {
    id: "placeholder-3",
    slug: "wooden-puzzle-box",
    name: "Скринька-головоломка",
    tagline: "Незвичайний подарунок · Натуральне дерево",
    description: null,
    price_uah: 1790,
    badge: "Хіт подарунків",
    image_url: null,
    images: [],
    category: "gifts",
    article: null,
    variant_label: null,
    colors: ["#8a5a35", "#e6c9a8", "#6e5a3a"],
  },
];

function lifetime() {
  // Edits made in the admin refresh the cache at once (tag "products").
  // Edits made straight in Supabase show up within about a minute.
  cacheTag("products");
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
}

export function collapseVariants(products: Product[]): ProductCardData[] {
  const groups = new Map<string, Product[]>();
  const order: string[] = [];
  for (const p of products) {
    const key = p.article ? `a:${p.article.toLowerCase()}` : `s:${p.id}`;
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(p);
  }
  return order.map((key) => {
    const list = groups.get(key)!;
    // The cheapest variant represents the group on the card.
    const rep = list.reduce((a, b) => (b.price_uah < a.price_uah ? b : a));
    return {
      ...rep,
      variantCount: list.length,
      priceFrom: list.some((p) => p.price_uah !== rep.price_uah),
    };
  });
}

export async function getFeaturedProducts(limit = 12): Promise<ProductCardData[]> {
  "use cache";
  lifetime();
  if (!supabase) return collapseVariants(designPlaceholders);

  const { data, error } = await supabase
    .from("products")
    .select(columns)
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(60);

  if (error) {
    console.error("[assorte] featured products query failed:", error.message);
    return [];
  }
  return collapseVariants(data ?? []).slice(0, limit);
}

export async function getProducts(category?: CategorySlug): Promise<ProductCardData[]> {
  "use cache";
  lifetime();
  if (!supabase) {
    return collapseVariants(designPlaceholders.filter((p) => !category || p.category === category));
  }

  let query = supabase
    .from("products")
    .select(columns)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) {
    console.error("[assorte] products query failed:", error.message);
    return [];
  }
  return collapseVariants(data ?? []);
}

export async function getNewProducts(limit = 12): Promise<ProductCardData[]> {
  "use cache";
  lifetime();
  if (!supabase) return collapseVariants(designPlaceholders);

  const { data, error } = await supabase
    .from("products")
    .select(columns)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    console.error("[assorte] new products query failed:", error.message);
    return [];
  }
  return collapseVariants(data ?? []).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  lifetime();
  if (!supabase) return designPlaceholders.find((p) => p.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("products")
    .select(columns)
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[assorte] product query failed:", error.message);
    return null;
  }
  return data;
}

export type VariantOption = {
  slug: string;
  variant_label: string;
  price_uah: number;
};

// Other products sharing the same article (for example 5 kg, 10 kg, 15 kg).
export async function getVariants(article: string | null): Promise<VariantOption[]> {
  "use cache";
  lifetime();
  if (!supabase || !article) return [];

  const { data, error } = await supabase
    .from("products")
    .select("slug, variant_label, price_uah")
    .eq("is_published", true)
    .eq("article", article)
    .not("variant_label", "is", null)
    .order("sort_order", { ascending: true })
    .order("price_uah", { ascending: true });

  if (error) {
    console.error("[assorte] variants query failed:", error.message);
    return [];
  }
  return (data ?? []) as VariantOption[];
}

const cleanTerm = (t: string) => t.replace(/[%_,()*"'\\]/g, " ").trim();

// Case-insensitive search by name, description, article, variant and category name.
// Every word of the query must match somewhere.
export async function searchProducts(query: string): Promise<ProductCardData[]> {
  "use cache";
  lifetime();

  const words = query
    .toLowerCase()
    .split(/\s+/)
    .map(cleanTerm)
    .filter(Boolean)
    .slice(0, 6);
  if (words.length === 0) return [];

  const categoryHits = (word: string) =>
    categories.filter((c) => c.name.toLowerCase().includes(word)).map((c) => c.slug);

  if (!supabase) {
    const hit = (p: Product, w: string) =>
      [p.name, p.tagline, p.description, p.article, p.variant_label]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(w)) ||
      (p.category !== null && categoryHits(w).includes(p.category));
    return collapseVariants(designPlaceholders.filter((p) => words.every((w) => hit(p, w))));
  }

  let q = supabase.from("products").select(columns).eq("is_published", true);
  for (const w of words) {
    const parts = ["name", "tagline", "description", "article", "variant_label"].map(
      (f) => `${f}.ilike.%${w}%`,
    );
    const cats = categoryHits(w);
    if (cats.length) parts.push(`category.in.(${cats.join(",")})`);
    q = q.or(parts.join(","));
  }
  const { data, error } = await q.order("sort_order", { ascending: true }).limit(80);

  if (error) {
    console.error("[assorte] search failed:", error.message);
    return [];
  }

  // Name matches first, then everything else in catalogue order.
  const rows = (data ?? []) as Product[];
  const score = (p: Product) => (words.every((w) => p.name.toLowerCase().includes(w)) ? 0 : 1);
  return collapseVariants([...rows].sort((a, b) => score(a) - score(b)));
}

export async function getProductsBySlugs(slugs: string[]): Promise<ProductCardData[]> {
  "use cache";
  lifetime();
  if (!slugs.length) return [];
  if (!supabase) return collapseVariants(designPlaceholders.filter((p) => slugs.includes(p.slug)));

  const { data, error } = await supabase
    .from("products")
    .select(columns)
    .eq("is_published", true)
    .in("slug", slugs);
  if (error) {
    console.error("[assorte] products by slugs failed:", error.message);
    return [];
  }
  const rows = (data ?? []) as Product[];
  // Keep the order the editor chose.
  rows.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
  return collapseVariants(rows);
}
