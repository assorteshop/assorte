import { describe, expect, it } from "vitest";
import { formatRating, parseReviewForm, reviewsWord } from "./review-schema";

const form = (v: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, val] of Object.entries({ slug: "p", name: "Олена", rating: "5", body: "Дуже задоволена покупкою.", ...v })) fd.set(k, val);
  return fd;
};

describe("parseReviewForm", () => {
  it("accepts a normal review", () => {
    const r = parseReviewForm(form({}));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.rating).toBe(5);
  });
  it("rejects short names and short text", () => {
    expect(parseReviewForm(form({ name: "О" })).ok).toBe(false);
    expect(parseReviewForm(form({ body: "ок" })).ok).toBe(false);
  });
  it("rejects ratings outside 1-5 or not whole", () => {
    for (const rating of ["0", "6", "4.5", "abc", ""]) expect(parseReviewForm(form({ rating })).ok).toBe(false);
  });
  it("rejects too long text", () => {
    expect(parseReviewForm(form({ body: "а".repeat(2001) })).ok).toBe(false);
  });
});

describe("helpers", () => {
  it("formats the average with a comma", () => {
    expect(formatRating(4.5)).toBe("4,5");
    expect(formatRating(5)).toBe("5,0");
  });
  it("uses the right Ukrainian word", () => {
    expect([1, 2, 4, 5, 11, 12, 21, 22, 25].map(reviewsWord)).toEqual([
      "відгук", "відгуки", "відгуки", "відгуків", "відгуків", "відгуків", "відгук", "відгуки", "відгуків",
    ]);
  });
});
