import { describe, expect, it } from "vitest";
import { getCategory } from "./categories";
import type { Product } from "./products";
import { descriptionSnippet, jsonLdString, organizationJsonLd, productAlt, productJsonLd } from "./seo";

const product: Product = {
  id: "1",
  slug: "bezperebiinyk-10400",
  name: "Безперебійник 10400 mAh",
  tagline: "",
  description: "<p>Технічні характеристики: потужність 10400 mAh.</p><p>Тримає роутер під час відключення світла.</p>",
  price_uah: 1500,
  badge: null,
  image_url: "https://example.com/a.jpg",
  images: ["https://example.com/a.jpg", "/products/b.jpg"],
  category: "tech",
  colors: [],
  article: "UPS-10",
  variant_label: null,
  specs: [],
};
const base = "https://assorte.com.ua";

describe("productJsonLd", () => {
  const parsed = JSON.parse(
    jsonLdString(productJsonLd({ product, category: getCategory("tech"), base, description: "Опис" })),
  );
  const product_ = parsed.find((b: { "@type": string }) => b["@type"] === "Product");
  const crumbs = parsed.find((b: { "@type": string }) => b["@type"] === "BreadcrumbList");

  it("has Product with Offer in hryvnias", () => {
    expect(product_.offers["@type"]).toBe("Offer");
    expect(product_.offers).toMatchObject({ price: 1500, priceCurrency: "UAH", url: `${base}/products/${product.slug}` });
    expect(product_.sku).toBe("UPS-10");
    expect(product_.image).toEqual(["https://example.com/a.jpg", `${base}/products/b.jpg`]);
  });

  it("has Home > Category > Product breadcrumbs", () => {
    expect(crumbs.itemListElement.map((i: { name: string }) => i.name)).toEqual([
      "Головна",
      getCategory("tech")!.name,
      product.name,
    ]);
  });

  it("claims no rating, reviews or stock", () => {
    const text = JSON.stringify(parsed);
    expect(text).not.toContain("AggregateRating");
    expect(text).not.toContain("Review");
    expect(text).not.toContain("availability");
  });

  it("omits sku and image when the product has none", () => {
    const bare = productJsonLd({ product: { ...product, article: null, images: [], image_url: null }, base, description: "" })[0];
    expect(bare).not.toHaveProperty("sku");
    expect(bare).not.toHaveProperty("image");
    expect(bare).not.toHaveProperty("description");
  });
});

describe("jsonLdString", () => {
  it("cannot be closed early by </script> in a product name", () => {
    expect(jsonLdString({ name: "</script><b>" })).not.toContain("<");
  });
});

describe("organizationJsonLd", () => {
  it("lists only the social links that are filled in", () => {
    expect(organizationJsonLd({ base, instagram: "https://instagram.com/x" }).sameAs).toEqual(["https://instagram.com/x"]);
    expect(organizationJsonLd({ base })).not.toHaveProperty("sameAs");
  });
});

describe("descriptionSnippet", () => {
  it("drops markup and the specs lead-in", () => {
    expect(descriptionSnippet(product.description)).toBe(
      "потужність 10400 mAh. Тримає роутер під час відключення світла.",
    );
  });
  it("cuts long text near 155 characters at a word", () => {
    const out = descriptionSnippet("слово ".repeat(100));
    expect(out.length).toBeLessThanOrEqual(156);
    expect(out.endsWith("…")).toBe(true);
  });
  it("is empty for no description", () => {
    expect(descriptionSnippet(null)).toBe("");
  });
});

describe("productAlt", () => {
  it("numbers photos from 1", () => {
    expect(productAlt("Лампа", 0)).toBe("Лампа — фото 1");
    expect(productAlt("Лампа", 2)).toBe("Лампа — фото 3");
  });
});
