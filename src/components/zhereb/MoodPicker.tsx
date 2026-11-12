"use client";

import Link from "next/link";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { zhereb as t } from "@/content/zhereb";
import { track } from "@/lib/analytics";
import { addToCart, useCart } from "@/lib/cart";
import { formatUah } from "@/lib/format";
import {
  canAddToCart,
  drawSteps,
  emptyHints,
  findVariant,
  formatHints,
  hintsFilled,
  minPrice,
  pickRandom,
  resultLine,
  type Hints,
  type ZherebVariant,
} from "@/lib/zhereb";
import { HintsForm } from "./HintsForm";
import { MOODS_ID, scrollToMoods } from "./ZherebCta";

type Mood = (typeof t.moods.items)[number];
const moods = t.moods.items;
const tiers = t.tiers.items;
const moodNames = moods.map((m) => m.name);
const tierIds = tiers.map((x) => x.id);

// The sticky bar on phones appears once the visitor has scrolled past the photo.
const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
};
const pastHero = () => window.scrollY > window.innerHeight * 0.8;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const HEADER = 72; // the white header covers the top of the screen

/** Smoothly brings an element into view and resolves when the scrolling has finished. */
function scrollIntoViewAndWait(el: HTMLElement | null, block: "start" | "center"): Promise<void> {
  if (!el) return Promise.resolve();
  const r = el.getBoundingClientRect();
  const fits = r.height <= window.innerHeight - HEADER;
  if (r.top >= HEADER && r.bottom <= window.innerHeight) return Promise.resolve();
  const still = reducedMotion();
  // A block taller than the screen (six tiles or the open panel on a phone) starts just under the header.
  const top =
    block === "center" && fits
      ? window.scrollY + r.top - (window.innerHeight - r.height) / 2
      : window.scrollY + r.top - HEADER - 8;
  window.scrollTo({ top, behavior: still ? "auto" : "smooth" });
  if (still) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      window.removeEventListener("scrollend", done);
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(done, 900);
    window.addEventListener("scrollend", done, { once: true });
  });
}
const afterPaint = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));

const gaItem = (v: ZherebVariant, mood: string, tier?: string) => ({
  item_id: v.slug,
  item_name: v.name,
  item_variant: mood,
  ...(tier ? { item_category: tier } : {}),
  price: v.price_uah,
  quantity: 1,
});

/**
 * The six moods (radio group) and, after a choice, the order panel: level (Знахідка / Нова) with the price
 * from the database, the optional «Підказки для долі» and «Додати в кошик». On phones there is an order bar.
 * `variants` are the published «Жереб» products; a mood or a level without a variant cannot be chosen.
 */
export function MoodPicker({ variants }: { variants: ZherebVariant[] }) {
  const moodOk = (i: number) => tierIds.some((tier) => findVariant(variants, tier, moodNames[i]));
  const allowed = moods.map((_, i) => i).filter(moodOk);

  const [selected, setSelected] = useState<number | null>(null);
  const [how, setHow] = useState<"draw" | "click">("click");
  const [tier, setTier] = useState<string | null>(null);
  const [hints, setHints] = useState<Hints>(emptyHints);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [lit, setLit] = useState<number | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [added, setAdded] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const grid = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { items } = useCart();
  const showBar = useSyncExternalStore(subscribe, pastHero, () => false);

  const mood = selected !== null ? moodNames[selected] : null;
  const variant = mood && tier ? findVariant(variants, tier, mood) : null;
  const ready = canAddToCart(mood, tier, variant);
  const lowest = minPrice(tierIds, moodNames, variants);
  const inCart = items.some((i) => variants.some((v) => v.slug === i.slug));
  const tierName = tier ? tiers.find((x) => x.id === tier)?.name : null;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const list = variants.map((v) => ({ item_id: v.slug, item_name: v.name, item_variant: v.variant_label ?? "", price: v.price_uah }));
    track("view_item", { currency: "UAH", value: lowest ?? 0, items: list });
    // Once per page view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [added]);

  const choose = (i: number, via: "draw" | "click") => {
    if (!allowed.includes(i)) return;
    setSelected(i);
    setHow(via);
    // A level that this mood does not have is cleared.
    if (tier && !findVariant(variants, tier, moodNames[i])) setTier(null);
    const v = tierIds.map((x) => findVariant(variants, x, moodNames[i])).find(Boolean);
    track("select_item", {
      item_list_name: "Жереб",
      items: [v ? gaItem(v, moodNames[i]) : { item_id: "zhereb", item_name: "Жереб", item_variant: moodNames[i] }],
    });
    // The panel opens under the tiles; bring it into view.
    afterPaint(() => scrollIntoViewAndWait(panel.current, "start"));
  };

  const draw = async () => {
    if (drawing || allowed.length === 0) return;
    const result = pickRandom(allowed);
    track("zhereb_draw", { item_variant: moodNames[result] });
    setDrawing(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // 1) the whole grid on screen (on a phone, from its top), 2) the light runs, 3) the panel opens.
    await scrollIntoViewAndWait(grid.current, "center");
    const finish = () => {
      setLit(null);
      setDrawing(false);
      choose(result, "draw");
    };
    if (reducedMotion()) return finish();

    let at = 0;
    for (const [tile, wait] of drawSteps(allowed, result)) {
      timers.current.push(setTimeout(() => setLit(tile), at));
      at += wait;
    }
    timers.current.push(setTimeout(finish, at));
  };

  const pickTier = (id: string) => {
    if (!mood || !findVariant(variants, id, mood)) return;
    setTier(id);
    track("zhereb_tier_select", { tier: id, item_variant: mood });
  };

  const toggleHints = () => {
    if (!hintsOpen) track("zhereb_hints_open", { item_variant: mood ?? "" });
    setHintsOpen(!hintsOpen);
  };

  const add = () => {
    if (!ready || !variant || !mood || !tier) return;
    const text = formatHints(hints, mood, t.hints.lines, t.hints.forWhom.gift);
    addToCart({
      slug: variant.slug,
      name: variant.variant_label ? `${variant.name} — ${variant.variant_label}` : variant.name,
      price_uah: variant.price_uah,
      image: variant.image_url,
      note: text,
      cardOnly: true,
    });
    track("add_to_cart", {
      currency: "UAH",
      value: variant.price_uah,
      source: "zhereb",
      tier,
      hints_filled: hintsFilled(hints),
      items: [gaItem(variant, mood, tier)],
    });
    setAdded(true);
  };

  // Arrow keys move the choice, like ordinary radio buttons.
  const arrows = (e: React.KeyboardEvent, list: number[], at: number, pick: (i: number) => void, focus: (i: number) => void) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = list[(at + 1) % list.length];
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = list[(at - 1 + list.length) % list.length];
    if (next === null) return;
    e.preventDefault();
    pick(next);
    focus(next);
  };
  const tierButtons = useRef<(HTMLDivElement | null)[]>([]);
  const tierAllowed = tiers.map((_, i) => i).filter((i) => !!mood && !!findVariant(variants, tierIds[i], mood));
  const focusable = selected ?? allowed[0];

  const showPanel = selected !== null && !drawing;
  const barPrice = variant ? formatUah(variant.price_uah) : lowest !== null ? t.ui.from(formatUah(lowest)) : "";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id={`${MOODS_ID}-title`} className="font-heading text-[30px] font-bold leading-[1.1] md:text-[40px]">
          {t.moods.title}
        </h2>
        <button
          type="button"
          onClick={draw}
          disabled={drawing}
          className="inline-flex items-center gap-2 rounded-full border-2 border-graphite px-6 py-3 text-[15px] font-medium transition-colors hover:border-red hover:text-red disabled:opacity-60"
        >
          {t.ui.draw} <ArrowRight size={16} aria-hidden />
        </button>
      </div>

      <div ref={grid} role="radiogroup" aria-labelledby={`${MOODS_ID}-title`} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {moods.map((m: Mood, i) => {
          const can = allowed.includes(i);
          const on = selected === i && !drawing;
          const glow = lit === i;
          return (
            <div
              key={m.name}
              ref={(el) => {
                tiles.current[i] = el;
              }}
              role="radio"
              aria-checked={selected === i}
              aria-disabled={!can || undefined}
              tabIndex={can && i === focusable ? 0 : -1}
              onClick={() => !drawing && choose(i, "click")}
              onKeyDown={(e) => {
                if (drawing) return;
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  choose(i, "click");
                  return;
                }
                arrows(e, allowed, allowed.indexOf(i), (n) => choose(n, "click"), (n) => tiles.current[n]?.focus());
              }}
              className={`relative flex flex-col rounded-[36px] p-7 outline-none transition-[box-shadow,background-color] duration-100 focus-visible:ring-2 focus-visible:ring-graphite focus-visible:ring-offset-2 focus-visible:ring-offset-ivory md:p-8 ${
                on || glow ? "bg-white shadow-[inset_0_0_0_2px_#b60016]" : "bg-[#f0eae3]"
              } ${can ? (on || glow ? "cursor-pointer" : "cursor-pointer hover:bg-[#ebe3da]") : "cursor-not-allowed opacity-50"}`}
            >
              {on && (
                <span aria-hidden className="absolute right-5 top-5 grid size-7 place-items-center rounded-full bg-red text-white">
                  <Check size={16} strokeWidth={2.6} />
                </span>
              )}
              <h3 className="pr-8 font-heading text-[24px] font-bold leading-tight">{m.name}</h3>
              <p className="mt-2 font-script text-[24px] leading-snug text-red">{m.slogan}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-graphite/80">{m.text}</p>
            </div>
          );
        })}
      </div>

      {/* Order panel: opens as soon as a mood is chosen. */}
      <div ref={panel} className="scroll-mt-24">
        {showPanel && mood && (
          <div className="mt-6 rounded-[36px] bg-white p-6 md:p-10">
            <p aria-live="polite" className="font-script text-[32px] leading-tight md:text-[40px]">
              {resultLine(mood, how, t.ui)}
            </p>

            <h3 id="zhereb-tier-title" className="mt-6 font-heading text-[20px] font-bold md:text-[22px]">
              {t.tiers.title}
            </h3>
            <div role="radiogroup" aria-labelledby="zhereb-tier-title" className="mt-4 grid gap-4 md:grid-cols-2">
              {tiers.map((x, i) => {
                const v = findVariant(variants, x.id, mood);
                const on = tier === x.id;
                return (
                  <div
                    key={x.id}
                    ref={(el) => {
                      tierButtons.current[i] = el;
                    }}
                    role="radio"
                    aria-checked={on}
                    aria-disabled={!v || undefined}
                    tabIndex={v && (on || (!tier && i === tierAllowed[0])) ? 0 : -1}
                    onClick={() => pickTier(x.id)}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        pickTier(x.id);
                        return;
                      }
                      arrows(e, tierAllowed, tierAllowed.indexOf(i), (n) => pickTier(tierIds[n]), (n) => tierButtons.current[n]?.focus());
                    }}
                    className={`relative flex flex-col rounded-[28px] p-6 outline-none transition-[box-shadow,background-color] focus-visible:ring-2 focus-visible:ring-graphite focus-visible:ring-offset-2 ${
                      on ? "bg-white shadow-[inset_0_0_0_2px_#b60016]" : "bg-[#f0eae3]"
                    } ${v ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                  >
                    {on && (
                      <span aria-hidden className="absolute right-5 top-5 grid size-7 place-items-center rounded-full bg-red text-white">
                        <Check size={16} strokeWidth={2.6} />
                      </span>
                    )}
                    <p className="pr-8 font-heading text-[20px] font-bold">{x.name}</p>
                    <p className="mt-2 text-[14px] leading-relaxed text-graphite/80">{x.text}</p>
                    {v && <p className="mt-4 font-heading text-[24px] font-bold leading-none">{formatUah(v.price_uah)}</p>}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-[28px] border border-line">
              <button
                type="button"
                aria-expanded={hintsOpen}
                aria-controls="zhereb-hints"
                onClick={toggleHints}
                className="flex w-full items-center justify-between gap-4 rounded-[28px] px-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite"
              >
                <span>
                  <span className="block font-heading text-[18px] font-bold">{t.hints.title}</span>
                  <span className="mt-1 block text-[13px] text-muted">{t.hints.note}</span>
                </span>
                <ChevronDown size={20} aria-hidden className={`shrink-0 transition-transform ${hintsOpen ? "rotate-180" : ""}`} />
              </button>
              {hintsOpen && (
                <div id="zhereb-hints" className="border-t border-line px-6 py-6">
                  <HintsForm
                    mood={mood}
                    hints={hints}
                    onPatch={(patch) =>
                      // Updates build on the latest answers, so quick clicks never undo each other.
                      setHints((prev) => {
                        const { toggleAvoid, ...rest } = patch;
                        const next = { ...prev, ...rest };
                        if (toggleAvoid)
                          next.avoid = prev.avoid.includes(toggleAvoid)
                            ? prev.avoid.filter((x) => x !== toggleAvoid)
                            : [...prev.avoid, toggleAvoid];
                        return next;
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={add}
                disabled={!ready}
                aria-describedby={!ready ? "zhereb-pick-tier" : undefined}
                className="inline-flex items-center gap-2 rounded-full bg-red px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:bg-red/40"
              >
                {added ? <Check size={16} aria-hidden /> : null}
                {added ? "Додано в кошик" : t.ui.addToCart} {!added && <ArrowRight size={16} aria-hidden />}
              </button>
              <p id="zhereb-pick-tier" role="status" className="mt-2 min-h-5 text-[13px] text-muted">
                {!ready ? (
                  t.ui.pickTier
                ) : inCart ? (
                  <Link href="/cart" className="text-red underline underline-offset-4">
                    Перейти до кошика
                  </Link>
                ) : null}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Phone bar (under 768px, after the photo). The page leaves room for it at the bottom. */}
      <div
        aria-hidden={!showBar}
        className={`fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white px-5 py-3 transition-transform duration-300 md:hidden ${
          showBar ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[14px]">
            <span className="font-medium">{mood ?? t.ui.choose}</span>
            <span className="font-heading font-bold"> · {tierName ? `${tierName} ${barPrice}` : barPrice}</span>
          </p>
          <button
            type="button"
            tabIndex={showBar ? 0 : -1}
            onClick={() => (mood ? scrollIntoViewAndWait(panel.current, "start") : scrollToMoods())}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red px-5 py-2.5 text-[14px] font-medium text-white"
          >
            {t.ui.order} <ArrowRight size={15} aria-hidden />
          </button>
        </div>
      </div>
    </>
  );
}
