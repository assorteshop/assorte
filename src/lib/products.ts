import { cacheLife } from "next/cache";
import type { CategorySlug } from "./categories";
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
};

const columns =
  "id, slug, name, tagline, description, price_uah, badge, image_url, images, category, colors";

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
    colors: ["#8a5a35", "#e6c9a8", "#6e5a3a"],
  },
];

function lifetime() {
  // Products edited in Supabase show up on the site within about a minute.
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  "use cache";
  lifetime();
  if (!supabase) return designPlaceholders;

  const { data, error } = await supabase
    .from("products")
    .select(columns)
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[assorte] featured products query failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProducts(category?: CategorySlug): Promise<Product[]> {
  "use cache";
  lifetime();
  if (!supabase) {
    return designPlaceholders.filter((p) => !category || p.category === category);
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
  return data ?? [];
}

export async function getNewProducts(limit = 12): Promise<Product[]> {
  "use cache";
  lifetime();
  if (!supabase) return designPlaceholders;

  const { data, error } = await supabase
    .from("products")
    .select(columns)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[assorte] new products query failed:", error.message);
    return [];
  }
  return data ?? [];
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

export const formatUah = (value: number) =>
  `${new Intl.NumberFormat("uk-UA").format(value).replace(/ /g, " ")} грн`;
