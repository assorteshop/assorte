import { describe, expect, it } from "vitest";
import { zhereb } from "@/content/zhereb";
import { drawSteps, isZherebArticle, matchMoods, pickRandom, resultLine, zherebState, type ZherebVariant } from "./zhereb";

const moods = zhereb.moods.items.map((m) => m.name);
const variant = (label: string | null, slug = "zhereb-x"): ZherebVariant => ({
  slug,
  name: "Жереб",
  variant_label: label,
  price_uah: 1000,
  image_url: null,
});

describe("zherebState", () => {
  it("is «СКОРО» when there is no published «Жереб» product", () => {
    expect(zherebState(moods, [])).toBe("soon");
  });
  it("is «СКОРО» when no variant name matches a mood", () => {
    expect(zherebState(moods, [variant("Інше"), variant(null)])).toBe("soon");
  });
  it("is «ЖИВИЙ» as soon as one variant matches a mood", () => {
    expect(zherebState(moods, [variant("Дощова неділя")])).toBe("live");
  });
  it("matches names regardless of case, spaces and apostrophe style", () => {
    const matched = matchMoods(moods, [variant("  гучно   на кухні ", "a"), variant("ЧИСТИЙ ЖЕРЕБ", "b")]);
    expect(matched[2]?.slug).toBe("a");
    expect(matched[5]?.slug).toBe("b");
    expect(matched.filter(Boolean)).toHaveLength(2);
  });
});

describe("isZherebArticle", () => {
  it("recognises the article in any case", () => {
    expect(isZherebArticle("ZHEREB")).toBe(true);
    expect(isZherebArticle(" zhereb ")).toBe(true);
    expect(isZherebArticle("Г-1")).toBe(false);
    expect(isZherebArticle(null)).toBe(false);
  });
});

describe("«Тягнути жереб»", () => {
  const all = [0, 1, 2, 3, 4, 5];
  it("always lands on one of the six moods", () => {
    for (let i = 0; i < 2000; i++) {
      const r = pickRandom(all);
      expect(all).toContain(r);
    }
  });
  it("covers every mood, including the edges of the random range", () => {
    expect(pickRandom(all, () => 0)).toBe(0);
    expect(pickRandom(all, () => 0.9999999)).toBe(5);
    const seen = new Set(Array.from({ length: 600 }, () => pickRandom(all)));
    expect(seen.size).toBe(6);
  });
  it("only draws from the moods that can be bought", () => {
    for (let i = 0; i < 200; i++) expect([1, 4]).toContain(pickRandom([1, 4]));
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
      steps.forEach(([tile]) => expect(all).toContain(tile));
    }
  });
});

describe("result panel line", () => {
  it("says «Вам випало» after the draw", () => {
    expect(resultLine("Нічна дорога", "draw", zhereb.ui)).toBe("Вам випало: Нічна дорога.");
  });
  it("says «Ваш настрій» after a click", () => {
    expect(resultLine("Своє", "click", zhereb.ui)).toBe("Ваш настрій: Своє.");
  });
  it("works for every mood", () => {
    for (const m of moods) {
      expect(resultLine(m, "draw", zhereb.ui)).toBe(`Вам випало: ${m}.`);
      expect(resultLine(m, "click", zhereb.ui)).toBe(`Ваш настрій: ${m}.`);
    }
  });
});
