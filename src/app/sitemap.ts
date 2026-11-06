import type { MetadataRoute } from "next";
import { getPublishedArticleSlugs } from "@/lib/articles";
import { categories } from "@/lib/categories";
import { getAllProductSlugs, getZherebVariants } from "@/lib/products";
import { zhereb } from "@/content/zhereb";
import { zherebState } from "@/lib/zhereb";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [articles, products, zherebVariants] = await Promise.all([
    getPublishedArticleSlugs(),
    getAllProductSlugs(),
    getZherebVariants(),
  ]);
  // /zhereb is listed only while it sells («ЖИВИЙ»); in «СКОРО» it stays hidden.
  const zherebLive = zherebState(zhereb.moods.items.map((m) => m.name), zherebVariants) === "live";
  return [
    { url: `${base}/` },
    { url: `${base}/catalog` },
    ...categories.map((c) => ({ url: `${base}/catalog/${c.slug}` })),
    { url: `${base}/blog` },
    { url: `${base}/about` },
    { url: `${base}/delivery-and-payment` },
    { url: `${base}/returns` },
    { url: `${base}/terms` },
    { url: `${base}/privacy` },
    { url: `${base}/contacts` },
    ...(zherebLive ? [{ url: `${base}/zhereb` }] : []),
    ...articles.map((a) => ({ url: `${base}/blog/${a.slug}`, lastModified: a.updated_at ?? undefined })),
    ...products.map((slug) => ({ url: `${base}/products/${slug}` })),
  ];
}
