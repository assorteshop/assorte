import { describe, expect, it } from "vitest";
import { parseArticleForm } from "./article-schema";

function form(values: Record<string, string>) {
  const fd = new FormData();
  const base: Record<string, string> = {
    title: "Як вибрати павербанк",
    slug: "yak-vybraty-powerbank",
    excerpt: "Коротко про головне.",
    body: "## Привіт",
  };
  for (const [k, v] of Object.entries({ ...base, ...values })) fd.set(k, v);
  return fd;
}

describe("parseArticleForm", () => {
  it("accepts a minimal valid article and turns empty optional fields into null", () => {
    const r = parseArticleForm(form({}));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.seo_title).toBeNull();
      expect(r.data.category_slug).toBeNull();
      expect(r.data.faq).toEqual([]);
      expect(r.data.is_published).toBe(false);
    }
  });

  it("rejects a slug with Cyrillic letters or spaces", () => {
    expect(parseArticleForm(form({ slug: "як-вибрати" })).ok).toBe(false);
    expect(parseArticleForm(form({ slug: "two words" })).ok).toBe(false);
  });

  it("enforces SEO limits: title 60, description 160", () => {
    expect(parseArticleForm(form({ seo_title: "a".repeat(61) })).ok).toBe(false);
    expect(parseArticleForm(form({ seo_title: "a".repeat(60) })).ok).toBe(true);
    expect(parseArticleForm(form({ meta_description: "a".repeat(161) })).ok).toBe(false);
  });

  it("requires the red part of the title to be inside the title", () => {
    expect(parseArticleForm(form({ title_accent: "у 2026 році" })).ok).toBe(false);
    expect(parseArticleForm(form({ title_accent: "павербанк" })).ok).toBe(true);
  });

  it("requires alt text when there is a cover", () => {
    expect(parseArticleForm(form({ cover_url: "https://x.test/a.jpg" })).ok).toBe(false);
    expect(parseArticleForm(form({ cover_url: "https://x.test/a.jpg", cover_alt: "Павербанк на столі" })).ok).toBe(true);
  });

  it("only accepts the real categories", () => {
    expect(parseArticleForm(form({ category_slug: "tech" })).ok).toBe(true);
    expect(parseArticleForm(form({ category_slug: "tech-gadgets" })).ok).toBe(false);
  });

  it("validates FAQ items and limits them to 12", () => {
    const ok = JSON.stringify([{ q: "Скільки?", a: "Багато." }]);
    expect(parseArticleForm(form({ faq: ok })).ok).toBe(true);
    expect(parseArticleForm(form({ faq: JSON.stringify([{ q: "", a: "x" }]) })).ok).toBe(false);
    const many = JSON.stringify(Array.from({ length: 13 }, () => ({ q: "q", a: "a" })));
    expect(parseArticleForm(form({ faq: many })).ok).toBe(false);
  });

  it("requires a valid absolute URL in sources", () => {
    expect(parseArticleForm(form({ sources: JSON.stringify([{ label: "Doc", url: "https://example.com/a" }]) })).ok).toBe(true);
    expect(parseArticleForm(form({ sources: JSON.stringify([{ label: "Doc", url: "javascript:alert(1)" }]) })).ok).toBe(false);
    expect(parseArticleForm(form({ sources: JSON.stringify([{ label: "Doc", url: "example.com" }]) })).ok).toBe(false);
  });

  it("rejects a main product that is not a UUID", () => {
    expect(parseArticleForm(form({ primary_product_id: "not-a-uuid" })).ok).toBe(false);
    expect(parseArticleForm(form({ primary_product_id: "5e7a09b6-d963-4df7-bf27-050581a670e9" })).ok).toBe(true);
  });

  it("reports broken JSON instead of crashing", () => {
    expect(parseArticleForm(form({ faq: "{oops" })).ok).toBe(false);
  });
});
