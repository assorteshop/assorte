import type { MetadataRoute } from "next";
import { getPublishedArticleSlugs } from "@/lib/articles";
import { categories } from "@/lib/categories";
import { getAllProductSlugs } from "@/lib/products";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [articles, products] = await Promise.all([getPublishedArticleSlugs(), getAllProductSlugs()]);
  return [
    { url: `${base}/` },
    { url: `${base}/catalog` },
    ...categories.map((c) => ({ url: `${base}/catalog/${c.slug}` })),
    { url: `${base}/blog` },
    ...articles.map((a) => ({ url: `${base}/blog/${a.slug}`, lastModified: a.updated_at ?? undefined })),
    ...products.map((slug) => ({ url: `${base}/products/${slug}` })),
  ];
}
