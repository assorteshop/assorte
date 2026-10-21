import { supabase } from "./supabase";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price_uah: number;
  badge: string | null;
  image_url: string | null;
  colors: string[];
};

// Shown only while Supabase is not configured, so the layout can be reviewed.
// Names, taglines and prices come from the approved homepage design.
const designPlaceholders: Product[] = [
  {
    id: "placeholder-1",
    slug: "powerbank-20000",
    name: "Повербанк 20 000 мАг",
    tagline: "Швидка зарядка · Компактний дизайн",
    price_uah: 1490,
    badge: "Хіт",
    image_url: null,
    colors: ["#171717", "#e9e1d6", "#5d7260", "#e9a0a0"],
  },
  {
    id: "placeholder-2",
    slug: "muff-bag",
    name: "Сумка-муфта Muff Bag",
    tagline: "Тепло для рук · Стильний аксесуар",
    price_uah: 1990,
    badge: "Новинка",
    image_url: null,
    colors: ["#5a2e1f", "#171717", "#d9c2a7"],
  },
  {
    id: "placeholder-3",
    slug: "wooden-puzzle-box",
    name: "Скринька-головоломка",
    tagline: "Незвичайний подарунок · Натуральне дерево",
    price_uah: 1790,
    badge: "Хіт подарунків",
    image_url: null,
    colors: ["#8a5a35", "#e6c9a8", "#6e5a3a"],
  },
];

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  if (!supabase) return designPlaceholders;

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, tagline, price_uah, badge, image_url, colors")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[assorte] products query failed:", error.message);
    return [];
  }
  return data ?? [];
}

export const formatUah = (value: number) =>
  `${new Intl.NumberFormat("uk-UA").format(value).replace(/ /g, " ")} грн`;
