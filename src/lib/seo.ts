import type { Category } from "./categories";
import type { Product } from "./products";
import { plainTextOf, richTextToHtml } from "./rich-text";

const DESCRIPTION_LENGTH = 155;

// First ~155 characters of the product description as plain text, cut at a word boundary.
export function descriptionSnippet(description: string | null | undefined, max = DESCRIPTION_LENGTH): string {
  const text = plainTextOf(richTextToHtml(description))
    .replace(/Технічні характеристики:?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-—]+$/, "")}…`;
}

export function productAlt(name: string, index: number): string {
  return `${name} — фото ${index + 1}`;
}

const absolute = (url: string, base: string) => (url.startsWith("/") ? `${base}${url}` : url);

export function productJsonLd(args: {
  product: Product;
  category?: Category;
  base: string;
  description: string;
}) {
  const { product, category, base, description } = args;
  const url = `${base}/products/${product.slug}`;
  const photos = product.images.length > 0 ? product.images : product.image_url ? [product.image_url] : [];

  const crumbs = [
    { name: "Головна", url: `${base}/` },
    ...(category ? [{ name: category.name, url: `${base}/catalog/${category.slug}` }] : []),
    { name: product.name, url },
  ];

  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      ...(photos.length > 0 && { image: photos.map((p) => absolute(p, base)) }),
      ...(description && { description }),
      ...(product.article && { sku: product.article }),
      offers: {
        "@type": "Offer",
        url,
        price: product.price_uah,
        priceCurrency: "UAH",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.url,
      })),
    },
  ];
}

export function organizationJsonLd(args: { base: string; instagram?: string; telegram?: string }) {
  const sameAs = [args.instagram, args.telegram].filter((v): v is string => !!v);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ASSORTE",
    url: args.base,
    ...(sameAs.length > 0 && { sameAs }),
  };
}

// JSON.stringify does not escape "<", so a "</script>" inside a product name could break out of the tag.
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
