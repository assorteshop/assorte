import { afterEach, describe, expect, it, vi } from "vitest";
import {
  activeGaId,
  cartSource,
  detectFirstTouch,
  firstTouchLabel,
  gaSourceMedium,
  getGaId,
  parseFirstTouchField,
  parseStoredFirstTouch,
  trackPurchaseOnce,
} from "./analytics";

const now = new Date("2026-11-04T10:00:00.000Z");

describe("GA loads only on the real domain", () => {
  it("accepts only a real measurement id", () => {
    expect(getGaId("G-XFBSSFM33N")).toBe("G-XFBSSFM33N");
    expect(getGaId(undefined)).toBeNull();
    expect(getGaId("UA-123")).toBeNull();
    expect(getGaId("G-<script>")).toBeNull();
  });
  it("is on in production on assorte.com.ua", () => {
    expect(activeGaId("G-XFBSSFM33N", "https://assorte.com.ua", "production")).toBe("G-XFBSSFM33N");
  });
  it("is off on *.vercel.app, preview, localhost and without the site address", () => {
    expect(activeGaId("G-XFBSSFM33N", "https://assorte.vercel.app", "production")).toBeNull();
    expect(activeGaId("G-XFBSSFM33N", "https://assorte.com.ua", "preview")).toBeNull();
    expect(activeGaId("G-XFBSSFM33N", "https://localhost", "production")).toBeNull();
    expect(activeGaId("G-XFBSSFM33N", undefined, "production")).toBeNull();
  });
});

describe("detectFirstTouch", () => {
  it("uses utm tags first", () => {
    const ft = detectFirstTouch({
      href: "https://assorte.com.ua/products/x?utm_source=Instagram&utm_medium=Social&utm_campaign=mykolai",
      referrer: "https://www.google.com/",
      now,
    });
    expect(ft).toEqual({
      source: "instagram",
      medium: "social",
      campaign: "mykolai",
      landing: "/products/x",
      at: now.toISOString(),
    });
  });
  it("names search engines like Google Analytics: google / organic", () => {
    const from = (referrer: string) =>
      detectFirstTouch({ href: "https://assorte.com.ua/blog/dbzh", referrer, now });
    expect(from("https://www.google.com/")).toMatchObject({ source: "google", medium: "organic", landing: "/blog/dbzh" });
    expect(from("https://www.google.com.ua/")).toMatchObject({ source: "google", medium: "organic" });
    expect(from("https://www.bing.com/")).toMatchObject({ source: "bing", medium: "organic" });
    expect(from("https://duckduckgo.com/")).toMatchObject({ source: "duckduckgo", medium: "organic" });
  });
  it("falls back to the referring domain as a referral", () => {
    const ft = detectFirstTouch({ href: "https://assorte.com.ua/", referrer: "https://t.me/assorteshop", now });
    expect(ft).toMatchObject({ source: "t.me", medium: "referral" });
    // Not a search page: mail.google.com is a normal referral.
    expect(
      detectFirstTouch({ href: "https://assorte.com.ua/", referrer: "https://mail.google.com/", now }),
    ).toMatchObject({ source: "mail.google.com", medium: "referral" });
  });
  it("is direct without utm and referrer, and ignores our own domain", () => {
    expect(detectFirstTouch({ href: "https://assorte.com.ua/", referrer: "", now }).source).toBe("direct");
    expect(
      detectFirstTouch({ href: "https://assorte.com.ua/cart", referrer: "https://www.assorte.com.ua/", now }).source,
    ).toBe("direct");
  });
  it("never keeps the query string (no personal data in the landing page)", () => {
    const ft = detectFirstTouch({ href: "https://assorte.com.ua/search?q=ivan@mail.com", referrer: "", now });
    expect(ft.landing).toBe("/search");
  });
});

describe("stored and submitted first touch", () => {
  const ft = detectFirstTouch({ href: "https://assorte.com.ua/", referrer: "https://t.me/", now });
  it("is used for 30 days, then dropped", () => {
    const raw = JSON.stringify(ft);
    expect(parseStoredFirstTouch(raw, new Date("2026-11-20T10:00:00Z"))?.source).toBe("t.me");
    expect(parseStoredFirstTouch(raw, new Date("2026-12-10T10:00:00Z"))).toBeNull();
    expect(parseStoredFirstTouch("not json", now)).toBeNull();
  });
  it("server rejects junk and overlong values", () => {
    expect(parseFirstTouchField(JSON.stringify(ft))?.source).toBe("t.me");
    expect(parseFirstTouchField("")).toBeNull();
    expect(parseFirstTouchField('{"source":""}')).toBeNull();
    expect(parseFirstTouchField(JSON.stringify({ ...ft, source: "x".repeat(500) }))).toBeNull();
    expect(parseFirstTouchField("x".repeat(3000))).toBeNull();
  });
  it("makes a short admin label named like Google Analytics", () => {
    expect(firstTouchLabel(ft)).toBe("t.me / referral · /");
    expect(firstTouchLabel(null)).toBeNull();
    const label = (source: string, medium?: string, campaign?: string) =>
      firstTouchLabel({ source, medium, campaign, landing: "/", at: now.toISOString() });
    expect(label("direct")).toBe("(direct) / (none) · /");
    expect(label("newsletter")).toBe("newsletter / (not set) · /");
    expect(label("instagram", "social", "mykolai")).toBe("instagram / social · mykolai · /");
    expect(label("google", "organic")).toBe("google / organic · /");
  });
  it("renames orders saved before search engines were recognised", () => {
    expect(firstTouchLabel({ source: "google.com", medium: "referral", landing: "/", at: now.toISOString() })).toBe(
      "google / organic · /",
    );
    expect(gaSourceMedium("mail.google.com", "referral")).toEqual({ source: "mail.google.com", medium: "referral" });
  });
});

describe("cartSource", () => {
  it("names the article, product page or section", () => {
    expect(cartSource("/blog/dbzh-dlia-routera")).toBe("article:dbzh-dlia-routera");
    expect(cartSource("/products/x")).toBe("product");
    expect(cartSource("/")).toBe("home");
    expect(cartSource("/catalog/tech")).toBe("catalog");
  });
});

describe("purchase is sent once per order", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("does not repeat on a second render or reload", () => {
    const store = new Map<string, string>();
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      gtag,
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
      },
    });
    trackPurchaseOnce(1042, 1780, [{ item_id: "x", item_name: "X", price: 1780, quantity: 1 }]);
    trackPurchaseOnce(1042, 1780, [{ item_id: "x", item_name: "X", price: 1780, quantity: 1 }]);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag.mock.calls[0][1]).toBe("purchase");
    expect(gtag.mock.calls[0][2]).toMatchObject({ transaction_id: "1042", currency: "UAH", value: 1780 });
  });
});
