// Search and filters for the admin «Товари» list. Pure functions, so they are easy to test;

import { type PriceRow, toPriceRow } from "./sale-price";
// the list itself is in src/components/admin/ProductList.tsx.

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price_uah: number;
  old_price_uah: number | null;
  category: string | null;
  audience: string | null;
  is_published: boolean;
  is_featured: boolean;
  image_url: string | null;
  images: string[] | null;
  article: string | null;
  variant_label: string | null;
};

export type Show = "all" | "published" | "draft" | "sale" | "nophoto";

export const SHOWS: { id: Show; label: string }[] = [
  { id: "all", label: "Усі" },
  { id: "published", label: "Опубліковані" },
  { id: "draft", label: "Чернетки" },
  { id: "sale", label: "Зі знижкою" },
  { id: "nophoto", label: "Без фото" },
];

export type ListFilter = { q: string; cat: string; aud: string; show: Show };

/** Lower case, no apostrophes of any kind, single spaces: «П’ятниця» finds «пятниця». */
export const normalize = (s: string) =>
  s.toLowerCase().replace(/['’ʼ`]/g, "").replace(/\s+/g, " ").trim();

const haystack = (p: AdminProduct) =>
  normalize([p.name, p.variant_label, p.article, p.slug].filter(Boolean).join(" "));

/** Every word typed must be found in the name, variant, article or slug. */
export function matchesQuery(p: AdminProduct, q: string) {
  const words = normalize(q).split(" ").filter(Boolean);
  if (!words.length) return true;
  const h = haystack(p);
  return words.every((w) => h.includes(w));
}

const hasPhoto = (p: AdminProduct) => Boolean(p.image_url || p.images?.some(Boolean));

export function matchesShow(p: AdminProduct, show: Show) {
  switch (show) {
    case "published":
      return p.is_published;
    case "draft":
      return !p.is_published;
    case "sale":
      return p.old_price_uah != null && p.old_price_uah > p.price_uah;
    case "nophoto":
      return !hasPhoto(p);
    default:
      return true;
  }
}

/** Category tab: "" = all, "none" = without a category. Audience only matters inside watches. */
export function matchesCategory(p: AdminProduct, cat: string, aud: string) {
  if (!cat) return true;
  if (cat === "none") return !p.category;
  if (p.category !== cat) return false;
  return !aud || p.audience === aud;
}

export function filterProducts(products: AdminProduct[], f: ListFilter) {
  return products.filter((p) => matchesQuery(p, f.q) && matchesShow(p, f.show) && matchesCategory(p, f.cat, f.aud));
}

/** How many products each category tab would show with the current search and «Показати». */
export function countByCategory(products: AdminProduct[], f: Pick<ListFilter, "q" | "show">) {
  const counts: Record<string, number> = { "": 0 };
  for (const p of products) {
    if (!matchesQuery(p, f.q) || !matchesShow(p, f.show)) continue;
    counts[""]++;
    const key = p.category ?? "none";
    counts[key] = (counts[key] ?? 0) + 1;
    if (p.audience) counts[`${key}/${p.audience}`] = (counts[`${key}/${p.audience}`] ?? 0) + 1;
  }
  return counts;
}

const SHOW_IDS = new Set(SHOWS.map((s) => s.id));

/** Read the filter from the address (?q=&cat=&for=&show=), so «Назад» from a product keeps it. */
export function filterFromParams(p: Record<string, string | string[] | undefined>): ListFilter {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const show = one(p.show) as Show;
  return { q: one(p.q), cat: one(p.cat), aud: one(p.for), show: SHOW_IDS.has(show) ? show : "all" };
}

export function filterToQuery(f: ListFilter) {
  const sp = new URLSearchParams();
  if (f.q.trim()) sp.set("q", f.q.trim());
  if (f.cat) sp.set("cat", f.cat);
  if (f.cat && f.aud) sp.set("for", f.aud);
  if (f.show !== "all") sp.set("show", f.show);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Where to go after saving or deleting: the list with the same filter. Only our own filter
 *  parameters are kept (rebuilt from scratch), so a crafted «back» cannot send you elsewhere. */
export function listPath(back: unknown) {
  if (typeof back !== "string" || !back.startsWith("?")) return "/admin/products";
  const params = Object.fromEntries(new URLSearchParams(back));
  return `/admin/products${filterToQuery(filterFromParams(params))}`;
}

/** Quick price edit in the list: «15 999» and «12 499» → database row, or an error text.
 *  Same rules as the product form (whole hryvnias, sale lower than the regular price). */
export function parseQuickPrice(regularText: string, saleText: string): PriceRow | { error: string } {
  const num = (s: string) => (s.replace(/[\s ]/g, "").replace(/грн\.?$/i, "") || null);
  const r = num(regularText);
  const s = num(saleText);
  const price = r === null ? NaN : Number(r);
  if (!Number.isInteger(price) || price < 0 || price > 1_000_000) return { error: "Ціна має бути цілим числом у гривнях." };
  const sale = s === null ? null : Number(s);
  if (sale !== null && (!Number.isInteger(sale) || sale < 0)) return { error: "Ціна зі знижкою має бути цілим числом у гривнях." };
  return toPriceRow(price, sale);
}
