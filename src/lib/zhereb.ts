// «Жереб» logic that does not depend on the screen: is it on sale, which shop variant is which
// level and mood, the random draw, and the «Підказки для долі» rules and text.

/** Article shared by all «Жереб» products. Case does not matter. */
export const ZHEREB_ARTICLE = "ZHEREB";

export const isZherebArticle = (article: string | null | undefined) =>
  !!article && article.trim().toUpperCase() === ZHEREB_ARTICLE;

export type ZherebVariant = {
  slug: string;
  name: string;
  variant_label: string | null;
  price_uah: number;
  image_url: string | null;
};

// «Дощова неділя», «дощова  неділя » and a different apostrophe are the same name.
const norm = (s: string) => s.toLowerCase().replace(/[ʼ’`]/g, "'").replace(/\s+/g, " ").trim();

/** «Знахідка · Дощова неділя» → { tier: "знахідка", mood: "дощова неділя" } (normalised), or null. */
export function parseVariantLabel(label: string | null | undefined): { tier: string; mood: string } | null {
  if (!label) return null;
  const parts = label.split(/\s*[·•|]\s*/);
  if (parts.length !== 2) return null;
  const [tier, mood] = parts.map(norm);
  return tier && mood ? { tier, mood } : null;
}

/** The shop variant for this level and mood, or null when it is not published. */
export function findVariant(
  variants: readonly ZherebVariant[],
  tier: string,
  mood: string,
): ZherebVariant | null {
  return (
    variants.find((v) => {
      const p = parseVariantLabel(v.variant_label);
      return !!p && p.tier === norm(tier) && p.mood === norm(mood);
    }) ?? null
  );
}

/** «Жереб» is on sale (the page exists) when at least one level × mood variant is published. */
export function isZherebOn(
  tiers: readonly string[],
  moods: readonly string[],
  variants: readonly ZherebVariant[],
): boolean {
  return tiers.some((t) => moods.some((m) => findVariant(variants, t, m)));
}

/** The lowest price of all published «Жереб» variants that match a level and a mood. */
export function minPrice(tiers: readonly string[], moods: readonly string[], variants: readonly ZherebVariant[]) {
  const prices = tiers.flatMap((t) => moods.map((m) => findVariant(variants, t, m)?.price_uah ?? Infinity));
  const min = Math.min(...prices);
  return Number.isFinite(min) ? min : null;
}

/** «Додати в кошик» works only when a mood and a level are chosen and that variant is on sale. */
export const canAddToCart = (mood: string | null, tier: string | null, variant: ZherebVariant | null) =>
  !!mood && !!tier && !!variant;

/** One random index from the allowed ones. `rand` returns a number in [0, 1). */
export function pickRandom(allowed: readonly number[], rand: () => number = Math.random): number {
  if (allowed.length === 0) throw new Error("nothing to draw from");
  const i = Math.min(Math.floor(rand() * allowed.length), allowed.length - 1);
  return allowed[Math.max(i, 0)];
}

/**
 * The «Тягнути жереб» run: tiles light up one after another, slowing down, and stop on `result`.
 * Returns the steps as [tile index, pause before the next step in ms]; the pauses add up to about `totalMs`.
 */
export function drawSteps(allowed: readonly number[], result: number, totalMs = 1500, steps = 12): [number, number][] {
  const out: [number, number][] = [];
  const weights = Array.from({ length: steps }, (_, i) => 1 + i * i * 0.15); // later steps wait longer
  const sum = weights.reduce((a, b) => a + b, 0);
  const start = allowed.indexOf(result) - (steps - 1);
  for (let i = 0; i < steps; i++) {
    const pos = (((start + i) % allowed.length) + allowed.length) % allowed.length;
    out.push([allowed[pos], Math.round((weights[i] / sum) * totalMs)]);
  }
  return out;
}

/** The first line of the order panel: «Вам випало» after a draw, «Ваш настрій» after a click. */
export function resultLine(
  mood: string,
  how: "draw" | "click",
  ui: { drawResult: (name: string) => string; pickResult: (name: string) => string },
): string {
  return how === "draw" ? ui.drawResult(mood) : ui.pickResult(mood);
}

// ---------- «Підказки для долі» ----------

export const HINT_MAX = 200;
export const PURE_MOOD = "Чистий жереб";

export type HintField = "forWhom" | "onRepeat" | "familiar" | "language" | "avoid" | "have" | "about" | "cardWords";

export type Hints = {
  forWhom: string;
  onRepeat: string;
  familiar: string;
  language: string;
  avoid: string[];
  avoidOther: string;
  have: string;
  about: string;
  cardWords: string;
};

export const emptyHints = (): Hints => ({
  forWhom: "",
  onRepeat: "",
  familiar: "",
  language: "",
  avoid: [],
  avoidOther: "",
  have: "",
  about: "",
  cardWords: "",
});

/**
 * Which questions are shown: «У подарунок» adds «Про людину» and «Слова на листівці»;
 * «Чистий жереб» hides «На повторі», «Знайоме чи відкриття» and «Мова».
 */
export function visibleHints(mood: string | null, forWhom: string, giftOption: string): HintField[] {
  const pure = !!mood && norm(mood) === norm(PURE_MOOD);
  const gift = forWhom === giftOption;
  const all: HintField[] = ["forWhom", "onRepeat", "familiar", "language", "avoid", "have", "about", "cardWords"];
  return all.filter((f) => {
    if (pure && (f === "onRepeat" || f === "familiar" || f === "language")) return false;
    if (!gift && (f === "about" || f === "cardWords")) return false;
    return true;
  });
}

const clip = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, HINT_MAX);

/** The answers as readable lines for the order comment. Hidden and empty answers are left out. */
export function formatHints(
  hints: Hints,
  mood: string | null,
  labels: Record<HintField, string>,
  giftOption: string,
): string {
  const shown = new Set(visibleHints(mood, hints.forWhom, giftOption));
  const avoid = [...hints.avoid, clip(hints.avoidOther)].filter(Boolean).join(", ");
  const values: Record<HintField, string> = {
    forWhom: hints.forWhom,
    onRepeat: clip(hints.onRepeat),
    familiar: hints.familiar,
    language: hints.language,
    avoid,
    have: clip(hints.have),
    about: clip(hints.about),
    cardWords: clip(hints.cardWords),
  };
  return (Object.keys(labels) as HintField[])
    .filter((f) => shown.has(f) && values[f])
    .map((f) => `${labels[f]}: ${values[f]}`)
    .join("\n");
}

/** True when the visitor answered at least one question (for GA4 «hints_filled»). */
export const hintsFilled = (hints: Hints) =>
  [hints.forWhom, hints.onRepeat, hints.familiar, hints.language, hints.avoidOther, hints.have, hints.about, hints.cardWords]
    .some((v) => v.trim() !== "") || hints.avoid.length > 0;
