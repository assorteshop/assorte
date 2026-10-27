import { describe, expect, it } from "vitest";
import { getSiteUrl, isIndexingEnabled } from "./site";

describe("isIndexingEnabled", () => {
  it("is closed when NEXT_PUBLIC_SITE_URL is not set", () => {
    expect(isIndexingEnabled(undefined, "production")).toBe(false);
  });
  it("is closed on *.vercel.app, even in production", () => {
    expect(isIndexingEnabled("https://assorte.vercel.app", "production")).toBe(false);
  });
  it("is closed on localhost and for plain http", () => {
    expect(isIndexingEnabled("https://localhost", "production")).toBe(false);
    expect(isIndexingEnabled("http://assorte.com.ua", "production")).toBe(false);
  });
  it("is closed on preview deployments even with the real domain set", () => {
    expect(isIndexingEnabled("https://assorte.com.ua", "preview")).toBe(false);
  });
  it("is open only for the real https domain in production", () => {
    expect(isIndexingEnabled("https://assorte.com.ua", "production")).toBe(true);
  });
  it("rejects garbage values", () => {
    expect(isIndexingEnabled("not a url", "production")).toBe(false);
  });
});

describe("getSiteUrl", () => {
  it("uses the configured origin without a trailing slash or path", () => {
    expect(getSiteUrl("https://assorte.com.ua/some/path/")).toBe("https://assorte.com.ua");
  });
  it("falls back to the development address", () => {
    expect(getSiteUrl(undefined)).toBe("https://assorte.vercel.app");
    expect(getSiteUrl("oops")).toBe("https://assorte.vercel.app");
  });
});
