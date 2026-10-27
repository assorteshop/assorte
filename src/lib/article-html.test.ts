import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  cleanArticleHtml,
  fillPhotoSlot,
  isHtmlArticle,
  listPhotoSlots,
  readArticle,
  rewriteHref,
  splitProductMarkers,
} from "./article-html";

const reference = readFileSync("docs/reference/blog-article-reference.html", "utf8");

describe("reference article from Claude chat", () => {
  it("is recognised as HTML", () => {
    expect(isHtmlArticle(reference)).toBe(true);
    expect(isHtmlArticle("## Заголовок\n\nТекст")).toBe(false);
  });

  it("gives SEO fields, title, accent, eyebrow and lead", () => {
    const m = readArticle(reference);
    expect(m.seo.slug).toBe("yak-vybraty-paverbank");
    expect(m.seo.title).toBe("Як вибрати павербанк: огляд Baseus PicoGo 45W | ASSORTE");
    expect(m.seo.description?.startsWith("Baseus PicoGo 45W на 10 000 мАг")).toBe(true);
    expect(m.h1).toBe("Як вибрати павербанк у 2026 році: огляд Baseus PicoGo 45W на 10 000 мАг");
    expect(m.accent).toBe("огляд Baseus PicoGo 45W");
    expect(m.eyebrow).toBe("Гід ASSORTE · Техніка та гаджети");
    expect(m.lead?.startsWith("Хороший павербанк")).toBe(true);
    expect(m.hasSignature).toBe(true);
  });

  it("extracts all 7 FAQ questions for Google", () => {
    const m = readArticle(reference);
    expect(m.faq).toHaveLength(7);
    expect(m.faq[0].q).toBe("Скільки разів Baseus PicoGo 45W зарядить смартфон?");
    expect(m.faq[6].a.startsWith("10 000 мАг")).toBe(true);
  });

  it("finds the 4 photo placeholders and fills one of them", () => {
    const slots = listPhotoSlots(reference);
    expect(slots).toHaveLength(4);
    expect(slots[0].label.startsWith("ФОТО 1")).toBe(true);
    expect(slots[0].alt).toContain("Baseus PicoGo 45W");
    const filled = fillPhotoSlot(reference, 1, "https://cdn.test/photo2.webp");
    expect(listPhotoSlots(filled)).toHaveLength(3);
    expect(filled).toContain('src="https://cdn.test/photo2.webp"');
    expect(readArticle(filled).firstImage).toBe("https://cdn.test/photo2.webp");
  });

  it("is cleaned for visitors: placeholders gone, fonts mapped, category link fixed", () => {
    const out = cleanArticleHtml(reference);
    expect(out).not.toContain("ФОТО 1");
    expect(out).not.toContain("<!--");
    expect(out).toContain("var(--font-manrope)");
    expect(out).not.toMatch(/'Manrope'|Caveat/);
    expect(out).toContain('href="/catalog/tech"');
    expect(out).toContain('rel="nofollow noopener noreferrer"');
    expect(out).toContain("<table");
    expect(out).toContain("Більше, ніж просто речі");
  });

  it("keeps the placeholders visible in the admin preview", () => {
    expect(cleanArticleHtml(reference, { keepPlaceholders: true })).toContain("ФОТО 1");
  });
});

describe("cleanArticleHtml removes anything dangerous", () => {
  const dirty = `
    <p style="color:#B60016;position:fixed;background:url(https://evil.test/x.png)" onclick="steal()">Текст</p>
    <script>alert(1)</script>
    <iframe src="https://evil.test"></iframe>
    <a href="javascript:alert(1)">клік</a>
    <img src="http://insecure.test/a.jpg" onerror="alert(1)">
    <style>body{display:none}</style>`;
  const out = cleanArticleHtml(dirty);

  it("drops scripts, iframes, style tags and event handlers", () => {
    expect(out).not.toMatch(/<script|<iframe|<style|onclick|onerror|alert/);
  });
  it("drops dangerous CSS but keeps safe CSS", () => {
    expect(out).toContain("color:#B60016");
    expect(out).not.toContain("position");
    expect(out).not.toContain("url(");
  });
  it("drops javascript: links and non-https images", () => {
    expect(out).not.toContain("javascript:");
    expect(out).not.toContain("insecure.test");
  });
});

describe("helpers", () => {
  it("maps old category addresses", () => {
    expect(rewriteHref("/category/tech-gadgets")).toBe("/catalog/tech");
    expect(rewriteHref("/category/climate")).toBe("/catalog/climate");
    expect(rewriteHref("/products/x")).toBe("/products/x");
  });

  it("splits product markers, also when wrapped in <p>", () => {
    const parts = splitProductMarkers('<p>До</p>\n<p>[[product:baseus-picogo-45w-10000]]</p>\n<p>Після</p>');
    expect(parts.map((p) => p.type)).toEqual(["content", "product", "content"]);
    expect(parts[1]).toEqual({ type: "product", slug: "baseus-picogo-45w-10000" });
    expect(splitProductMarkers("Текст без товарів")).toEqual([{ type: "content", value: "Текст без товарів" }]);
  });

  it("estimates reading time", () => {
    expect(readArticle(reference).readingMinutes).toBeGreaterThanOrEqual(5);
  });
});
