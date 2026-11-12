import { describe, expect, it } from "vitest";
import { zhereb } from "@/content/zhereb";
import {
  canAddToCart,
  drawSteps,
  emptyHints,
  findVariant,
  formatHints,
  hintsFilled,
  isZherebArticle,
  isZherebOn,
  minPrice,
  parseVariantLabel,
  pickRandom,
  resultLine,
  visibleHints,
  type ZherebVariant,
} from "./zhereb";

const moods = zhereb.moods.items.map((m) => m.name);
const tiers = zhereb.tiers.items.map((t) => t.id);
const gift = zhereb.hints.forWhom.gift;
const labels = zhereb.hints.lines;
const variant = (label: string | null, price = 1000, slug = "zhereb-x"): ZherebVariant => ({
  slug,
  name: "Жереб",
  variant_label: label,
  price_uah: price,
  image_url: null,
});

describe("variant names «Рівень · Настрій»", () => {
  it("reads the level and the mood", () => {
    expect(parseVariantLabel("Знахідка · Дощова неділя")).toEqual({ tier: "знахідка", mood: "дощова неділя" });
    expect(parseVariantLabel("  нова  ·  СВОЄ ")).toEqual({ tier: "нова", mood: "своє" });
    expect(parseVariantLabel("Дощова неділя")).toBeNull();
    expect(parseVariantLabel(null)).toBeNull();
  });
  it("finds the variant for a level and a mood", () => {
    const list = [variant("Знахідка · Своє", 900, "a"), variant("Нова · Своє", 1400, "b")];
    expect(findVariant(list, "Нова", "Своє")?.slug).toBe("b");
    expect(findVariant(list, "Знахідка", "Перемотка")).toBeNull();
  });
});

describe("on / off", () => {
  it("is off (404) without published «Жереб» variants", () => {
    expect(isZherebOn(tiers, moods, [])).toBe(false);
    expect(isZherebOn(tiers, moods, [variant("Інше · Щось"), variant(null)])).toBe(false);
  });
  it("is on as soon as one level × mood is published", () => {
    expect(isZherebOn(tiers, moods, [variant("Нова · Перемотка")])).toBe(true);
  });
  it("knows the lowest price", () => {
    expect(minPrice(tiers, moods, [variant("Нова · Своє", 1400), variant("Знахідка · Своє", 900)])).toBe(900);
    expect(minPrice(tiers, moods, [])).toBeNull();
  });
  it("recognises the article in any case", () => {
    expect(isZherebArticle(" zhereb ")).toBe(true);
    expect(isZherebArticle("Г-1")).toBe(false);
  });
});

describe("«Додати в кошик»", () => {
  const v = variant("Нова · Своє");
  it("is off until a level is chosen", () => {
    expect(canAddToCart("Своє", null, null)).toBe(false);
    expect(canAddToCart(null, "Нова", v)).toBe(false);
    expect(canAddToCart("Своє", "Нова", null)).toBe(false);
  });
  it("is on with a mood, a level and a variant on sale", () => {
    expect(canAddToCart("Своє", "Нова", v)).toBe(true);
  });
});

describe("«Тягнути жереб»", () => {
  const all = [0, 1, 2, 3, 4, 5];
  it("always lands on one of the six moods", () => {
    for (let i = 0; i < 2000; i++) expect(all).toContain(pickRandom(all));
    expect(pickRandom(all, () => 0)).toBe(0);
    expect(pickRandom(all, () => 0.9999999)).toBe(5);
    expect(new Set(Array.from({ length: 600 }, () => pickRandom(all))).size).toBe(6);
  });
  it("the light stops on the drawn tile, slows down and lasts about 1.5 s", () => {
    for (const result of all) {
      const steps = drawSteps(all, result);
      expect(steps.at(-1)![0]).toBe(result);
      const waits = steps.map(([, ms]) => ms);
      expect(waits.at(-1)!).toBeGreaterThan(waits[0]);
      const total = waits.reduce((a, b) => a + b, 0);
      expect(total).toBeGreaterThan(1400);
      expect(total).toBeLessThan(1600);
    }
  });
  it("the panel line differs for a draw and a click", () => {
    expect(resultLine("Нічна дорога", "draw", zhereb.ui)).toBe("Вам випало: Нічна дорога.");
    expect(resultLine("Своє", "click", zhereb.ui)).toBe("Ваш настрій: Своє.");
  });
});

describe("«Підказки для долі»", () => {
  it("«У подарунок» shows two more fields", () => {
    const self = visibleHints("Своє", "Для себе", gift);
    const present = visibleHints("Своє", gift, gift);
    expect(self).not.toContain("about");
    expect(self).not.toContain("cardWords");
    expect(present).toContain("about");
    expect(present).toContain("cardWords");
    expect(present.length - self.length).toBe(2);
  });
  it("«Чистий жереб» hides three questions", () => {
    const pure = visibleHints("Чистий жереб", "", gift);
    const other = visibleHints("Своє", "", gift);
    for (const f of ["onRepeat", "familiar", "language"] as const) {
      expect(pure).not.toContain(f);
      expect(other).toContain(f);
    }
    expect(other.length - pure.length).toBe(3);
  });
  it("writes readable lines and skips empty ones", () => {
    const h = {
      ...emptyHints(),
      forWhom: gift,
      onRepeat: "  Земфіра,   Kalush ",
      avoid: ["Джаз", "Хіп-хоп"],
      avoidOther: "шансон",
      cardWords: "З днем народження!",
    };
    expect(formatHints(h, "Своє", labels, gift)).toBe(
      "Для кого: У подарунок\nНа повторі: Земфіра, Kalush\nНе надсилати: Джаз, Хіп-хоп, шансон\nСлова на листівці: З днем народження!",
    );
  });
  it("leaves out answers to hidden questions", () => {
    const h = { ...emptyHints(), forWhom: "Для себе", onRepeat: "Queen", language: "Українська", about: "любить гори" };
    expect(formatHints(h, "Чистий жереб", labels, gift)).toBe("Для кого: Для себе");
  });
  it("is empty when nothing is answered, and long answers are cut to 200 characters", () => {
    expect(formatHints(emptyHints(), "Своє", labels, gift)).toBe("");
    expect(hintsFilled(emptyHints())).toBe(false);
    const long = formatHints({ ...emptyHints(), have: "а".repeat(500) }, "Своє", labels, gift);
    expect(long).toBe(`Вже є: ${"а".repeat(200)}`);
    expect(hintsFilled({ ...emptyHints(), avoid: ["Джаз"] })).toBe(true);
  });
});
