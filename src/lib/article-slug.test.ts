import { describe, expect, it } from "vitest";
import { readArticle } from "./article-html";
import { cleanSlugInput, slugFromUrl } from "./article-slug";

describe("slugFromUrl", () => {
  it.each([
    ["/blog/abc-def", "abc-def"],
    ["https://assorte.com.ua/blog/abc-def/", "abc-def"],
    ["abc-def.", "abc-def"],
    ["/articles/abc-def", "abc-def"],
    ["assorte.com.ua/blog/abc-def", "abc-def"],
    ["  /blog/abc-def  ", "abc-def"],
    ["/blog/abc-def?utm_source=x#top", "abc-def"],
    ["/blog/ABC-Def", "abc-def"],
    ["/blog/abc-def (адреса статті)", "abc-def"],
    ["`/blog/abc-def`", "abc-def"],
    ["\\blog\\abc-def", "abc-def"],
    ["／blog／abc-def", "abc-def"],
    ["&#47;blog&#47;abc-def", "abc-def"],
    ["&sol;blog&sol;abc-def", "abc-def"],
  ])("%s -> %s", (raw, expected) => {
    expect(slugFromUrl(raw)).toBe(expected);
  });

  it("gives an empty slug when nothing usable is left", () => {
    expect(slugFromUrl("")).toBe("");
    expect(slugFromUrl("/blog/")).toBe("blog");
    expect(slugFromUrl("/")).toBe("");
  });

  it("never returns anything but latin letters, digits and hyphens", () => {
    expect(slugFromUrl("/blog/a_b c")).toMatch(/^[a-z0-9-]*$/);
    expect(slugFromUrl("https://assorte.com.ua/blog/abc--def")).toBe("abc-def");
  });
});

describe("cleanSlugInput (address field)", () => {
  it("cleans a pasted link or path", () => {
    expect(cleanSlugInput("/blog/abc-def")).toBe("abc-def");
    expect(cleanSlugInput("https://assorte.com.ua/articles/abc-def/")).toBe("abc-def");
  });
  it("does not get in the way of typing a hyphen or a word with spaces", () => {
    expect(cleanSlugInput("abc-")).toBe("abc-");
    expect(cleanSlugInput("abc def")).toBe("abc-def");
  });
  it("drops a trailing dot", () => {
    expect(cleanSlugInput("abc-def.")).toBe("abc-def");
  });
});

describe("URL line in the SEO comment of a pasted article", () => {
  const withUrl = (url: string) => `<h1>T</h1>\n<!--\n  SEO\n  URL:   ${url}\n  Title: x\n-->\n<p>x</p>`;
  it.each([
    ["/blog/abc-def", "abc-def"],
    ["https://assorte.com.ua/blog/abc-def/", "abc-def"],
    ["abc-def.", "abc-def"],
    ["/articles/abc-def", "abc-def"],
    ["\\blog\\abc-def", "abc-def"],
    ["／blog／abc-def", "abc-def"],
  ])("%s -> %s", (url, expected) => {
    expect(readArticle(withUrl(url)).seo.slug).toBe(expected);
  });
});
