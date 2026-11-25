import { describe, expect, it } from "vitest";
import {
  type AdminProduct,
  countByCategory,
  filterFromParams,
  filterProducts,
  filterToQuery,
  listPath,
  newSortOrders,
  canReorder,
  parseQuickPrice,
  normalize,
} from "./admin-products";

const base: AdminProduct = {
  id: "1",
  name: "Годинник Casio",
  slug: "casio",
  price_uah: 1000,
  old_price_uah: null,
  category: "watches",
  audience: "men",
  is_published: true,
  is_featured: false,
  image_url: "/a.jpg",
  images: null,
  article: "A-17",
  variant_label: "чорний",
  sort_order: 100,
};
const p = (o: Partial<AdminProduct>): AdminProduct => ({ ...base, article: null, variant_label: null, ...o });

const list = [
  base,
  p({ id: "2", name: "Тепла п’ятниця плед", slug: "pled", category: "gifts", audience: null, is_published: false, article: null, variant_label: null }),
  p({ id: "3", name: "Кондиціонер Aerostar", slug: "aero", category: "climate", audience: null, old_price_uah: 1500, image_url: null }),
  p({ id: "4", name: "Без категорії", slug: "x", category: null, audience: null }),
  p({ id: "5", name: "Смарт годинник", slug: "smart", audience: "women" }),
];
const all = { q: "", cat: "", aud: "", show: "all" as const };
const ids = (f: Parameters<typeof filterProducts>[1]) => filterProducts(list, f).map((x) => x.id);

describe("admin product list", () => {
  it("normalize drops case and apostrophes", () => {
    expect(normalize("  П’ятниця  ПЛЕД ")).toBe("пятниця плед");
  });

  it("search finds by any word in name, variant or article, in any order", () => {
    expect(ids({ ...all, q: "casio годинник" })).toEqual(["1"]);
    expect(ids({ ...all, q: "чорний" })).toEqual(["1"]);
    expect(ids({ ...all, q: "a-17" })).toEqual(["1"]);
    expect(ids({ ...all, q: "пятниця" })).toEqual(["2"]);
    expect(ids({ ...all, q: "годинник" })).toEqual(["1", "5"]);
  });

  it("shows published, drafts, sale and without photo", () => {
    expect(ids({ ...all, show: "draft" })).toEqual(["2"]);
    expect(ids({ ...all, show: "published" })).toEqual(["1", "3", "4", "5"]);
    expect(ids({ ...all, show: "sale" })).toEqual(["3"]);
    expect(ids({ ...all, show: "nophoto" })).toEqual(["3"]);
  });

  it("filters by category, audience and no category", () => {
    expect(ids({ ...all, cat: "watches" })).toEqual(["1", "5"]);
    expect(ids({ ...all, cat: "watches", aud: "women" })).toEqual(["5"]);
    expect(ids({ ...all, cat: "none" })).toEqual(["4"]);
  });

  it("counts tabs with the current search", () => {
    const c = countByCategory(list, { q: "годинник", show: "all" });
    expect(c[""]).toBe(2);
    expect(c.watches).toBe(2);
    expect(c["watches/men"]).toBe(1);
    expect(c.gifts).toBeUndefined();
  });

  it("keeps the filter in the address and reads it back", () => {
    const f = { q: " casio ", cat: "watches", aud: "men", show: "sale" as const };
    expect(filterToQuery(f)).toBe("?q=casio&cat=watches&for=men&show=sale");
    expect(filterToQuery(all)).toBe("");
    expect(filterFromParams({ q: "casio", cat: "watches", for: "men", show: "sale" })).toEqual({ ...f, q: "casio" });
    expect(filterFromParams({ show: "nonsense" }).show).toBe("all");
  });
});

describe("listPath", () => {
  it("returns to the list with the same filter, and nothing else", () => {
    expect(listPath("?q=casio&cat=watches")).toBe("/admin/products?q=casio&cat=watches");
    expect(listPath("?evil=1&show=draft")).toBe("/admin/products?show=draft");
    expect(listPath("//evil.com")).toBe("/admin/products");
    expect(listPath(null)).toBe("/admin/products");
  });
});

describe("parseQuickPrice", () => {
  it("reads prices with spaces and «грн»", () => {
    expect(parseQuickPrice("15 999", "")).toEqual({ price_uah: 15999, old_price_uah: null });
    expect(parseQuickPrice("18 999 грн", "15999")).toEqual({ price_uah: 15999, old_price_uah: 18999 });
  });
  it("refuses bad prices", () => {
    expect(parseQuickPrice("", "")).toHaveProperty("error");
    expect(parseQuickPrice("12,5", "")).toHaveProperty("error");
    expect(parseQuickPrice("1000", "1200")).toHaveProperty("error");
    expect(parseQuickPrice("1000", "abc")).toHaveProperty("error");
  });
});

describe("newSortOrders", () => {
  const cur = [
    { id: "a", sort_order: 10 },
    { id: "b", sort_order: 30 },
    { id: "c", sort_order: 50 },
  ];
  it("swaps the existing numbers when they are all different", () => {
    expect(newSortOrders(cur, ["c", "a", "b"])).toEqual([
      { id: "c", sort_order: 10 },
      { id: "a", sort_order: 30 },
      { id: "b", sort_order: 50 },
    ]);
  });
  it("returns only what changed", () => {
    expect(newSortOrders(cur, ["b", "a", "c"])).toEqual([
      { id: "b", sort_order: 10 },
      { id: "a", sort_order: 30 },
    ]);
    expect(newSortOrders(cur, ["a", "b", "c"])).toEqual([]);
  });
  it("numbers 10, 20, 30 when old numbers repeat", () => {
    const same = cur.map((p) => ({ ...p, sort_order: 100 }));
    expect(newSortOrders(same, ["b", "a", "c"])).toEqual([
      { id: "b", sort_order: 10 },
      { id: "a", sort_order: 20 },
      { id: "c", sort_order: 30 },
    ]);
  });
  it("refuses a list that does not match", () => {
    expect(() => newSortOrders(cur, ["a", "b"])).toThrow();
    expect(() => newSortOrders(cur, ["a", "b", "x"])).toThrow();
    expect(() => newSortOrders(cur, ["a", "a", "b"])).toThrow();
  });
  it("allows reordering only inside one category without search", () => {
    expect(canReorder({ q: "", cat: "gifts", aud: "", show: "all" })).toBe(true);
    expect(canReorder({ q: "", cat: "", aud: "", show: "all" })).toBe(false);
    expect(canReorder({ q: "x", cat: "gifts", aud: "", show: "all" })).toBe(false);
    expect(canReorder({ q: "", cat: "gifts", aud: "", show: "draft" })).toBe(false);
  });
});
