// «Жереб» logic that does not depend on the screen: which state the page is in,
// which mood tile belongs to which shop variant, and the random draw.

/** Article shared by the six «Жереб» products (one per mood). Case does not matter. */
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

export type ZherebState = "soon" | "live";

/** «ЖИВИЙ» as soon as at least one published «Жереб» product matches a mood; otherwise «СКОРО». */
export function zherebState(moodNames: readonly string[], variants: readonly ZherebVariant[]): ZherebState {
  return matchMoods(moodNames, variants).some(Boolean) ? "live" : "soon";
}

// «Дощова неділя», «дощова  неділя » and «Дощова неділя» with a different apostrophe are the same name.
const norm = (s: string) => s.toLowerCase().replace(/[ʼ’`]/g, "'").replace(/\s+/g, " ").trim();

/** For each mood (in page order) the shop variant with the same name, or null. */
export function matchMoods(moodNames: readonly string[], variants: readonly ZherebVariant[]): (ZherebVariant | null)[] {
  return moodNames.map((m) => variants.find((v) => v.variant_label && norm(v.variant_label) === norm(m)) ?? null);
}

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
