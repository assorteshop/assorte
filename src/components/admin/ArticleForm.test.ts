import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/admin/actions", () => ({ saveArticle: async () => ({ error: null }) }));
vi.mock("@/lib/upload", () => ({ uploadImage: async () => "https://x.test/a.jpg" }));

import { ArticleForm } from "./ArticleForm";

const products = [{ id: "5e7a09b6-d963-4df7-bf27-050581a670e9", slug: "p", name: "Повербанк", variant_label: null }];

describe("ArticleForm renders", () => {
  it("renders an empty new-article form with all stage A fields", () => {
    const html = renderToString(createElement(ArticleForm, { products }));
    for (const name of ["seo_title", "meta_description", "title_accent", "eyebrow", "category_slug", "cover_alt", "primary_product_id", "target_query"]) {
      expect(html).toContain(`name="${name}"`);
    }
    expect(html).toContain('name="faq"');
    expect(html).toContain('name="sources"');
  });

  it("renders an existing article with FAQ and sources", () => {
    const html = renderToString(
      createElement(ArticleForm, {
        products,
        article: {
          id: "a1", slug: "yak-vybraty", title: "Як вибрати", excerpt: "e", body: "b", cover_url: null,
          related_slugs: [], is_published: true, seo_title: "SEO", meta_description: "M",
          faq: [{ q: "Q1?", a: "A1" }], sources: [{ label: "Doc", url: "https://example.com" }],
          category_slug: "tech", primary_product_id: products[0].id, target_query: "як вибрати",
        },
      }),
    );
    const text = html.replace(/<!-- -->/g, "");
    expect(html).toContain("Q1?");
    expect(html).toContain("https://example.com");
    expect(text).toContain("3 / 60");
  });
});
