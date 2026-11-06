"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { zhereb as t } from "@/content/zhereb";
import { track } from "@/lib/analytics";
import { addToCart, useCart } from "@/lib/cart";
import { formatUah } from "@/lib/format";
import { drawSteps, pickRandom, type ZherebState, type ZherebVariant } from "@/lib/zhereb";
import { MOODS_ID, scrollToMoods } from "./ZherebCta";

type Mood = (typeof t.moods.items)[number];

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

const gaItem = (v: ZherebVariant, mood: string) => ({
  item_id: v.slug,
  item_name: v.name,
  item_variant: mood,
  price: v.price_uah,
  quantity: 1,
});

/**
 * The six moods as a choice (radio group). «ЖИВИЙ»: price, «Додати в кошик» and the phone bar.
 * «СКОРО»: tiles and «Тягнути жереб» still work, just without price and cart.
 * `variants[i]` is the shop variant of mood i, or null when that mood is not on sale.
 */
export function MoodPicker({ state, variants }: { state: ZherebState; variants: (ZherebVariant | null)[] }) {
  const router = useRouter();
  const live = state === "live";
  const moods = t.moods.items;
  // Moods that can be chosen: every mood in «СКОРО», only the ones on sale in «ЖИВИЙ».
  const allowed = moods.map((_, i) => i).filter((i) => !live || variants[i]);

  const [selected, setSelected] = useState<number | null>(null);
  const [lit, setLit] = useState<number | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawn, setDrawn] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const { items } = useCart();
  const showBar = useSyncExternalStore(subscribe, pastHero, () => false);

  const chosen = selected !== null ? variants[selected] : null;
  const prices = variants.filter((v): v is ZherebVariant => !!v).map((v) => v.price_uah);
  // Before a choice the price shows only when every mood costs the same.
  const price = chosen ? chosen.price_uah : prices.length && prices.every((p) => p === prices[0]) ? prices[0] : null;
  const inCart = live && items.some((i) => variants.some((v) => v?.slug === i.slug));

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!live) return;
    const list = variants.flatMap((v, i) => (v ? [gaItem(v, moods[i].name)] : []));
    track("view_item", { currency: "UAH", value: list[0]?.price ?? 0, items: list });
    // Once per page view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [added]);

  const choose = (i: number, fromDraw = false) => {
    if (!allowed.includes(i)) return;
    setSelected(i);
    if (!fromDraw) setDrawn(null);
    const v = variants[i];
    track("select_item", {
      item_list_name: "Жереб",
      items: [v ? gaItem(v, moods[i].name) : { item_id: "zhereb", item_name: "Жереб", item_variant: moods[i].name }],
    });
  };

  const draw = () => {
    if (drawing || allowed.length === 0) return;
    const result = pickRandom(allowed);
    track("zhereb_draw", { item_variant: moods[result].name, state });
    setDrawn(null);
    const finish = () => {
      setLit(null);
      setDrawing(false);
      choose(result, true);
      setDrawn(result);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return finish();

    setDrawing(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    let at = 0;
    for (const [tile, wait] of drawSteps(allowed, result)) {
      timers.current.push(setTimeout(() => setLit(tile), at));
      at += wait;
    }
    timers.current.push(setTimeout(finish, at));
  };

  const add = (thenCart = false) => {
    if (!chosen || selected === null) return;
    addToCart({
      slug: chosen.slug,
      name: chosen.variant_label ? `${chosen.name} — ${chosen.variant_label}` : chosen.name,
      price_uah: chosen.price_uah,
      image: chosen.image_url,
    });
    track("add_to_cart", {
      currency: "UAH",
      value: chosen.price_uah,
      source: "zhereb",
      items: [gaItem(chosen, moods[selected].name)],
    });
    setAdded(true);
    if (thenCart) router.push("/cart");
  };

  // Arrow keys move the choice between tiles, like ordinary radio buttons.
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const at = allowed.indexOf(i);
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = allowed[(at + 1) % allowed.length];
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = allowed[(at - 1 + allowed.length) % allowed.length];
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      choose(i);
      return;
    }
    if (next !== null) {
      e.preventDefault();
      choose(next);
      tiles.current[next]?.focus();
    }
  };
  const focusable = selected ?? allowed[0];

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

      <div
        role="radiogroup"
        aria-labelledby={`${MOODS_ID}-title`}
        className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {moods.map((m: Mood, i) => {
          const can = allowed.includes(i);
          const on = selected === i;
          const glow = lit === i;
          return (
            <div
              key={m.name}
              ref={(el) => {
                tiles.current[i] = el;
              }}
              role="radio"
              aria-checked={on}
              aria-disabled={!can || undefined}
              tabIndex={can && i === focusable ? 0 : -1}
              onClick={() => !drawing && choose(i)}
              onKeyDown={(e) => !drawing && onKey(e, i)}
              className={`flex flex-col rounded-[36px] bg-[#f0eae3] p-7 outline-none transition-[box-shadow,background-color] duration-150 focus-visible:ring-2 focus-visible:ring-graphite focus-visible:ring-offset-2 focus-visible:ring-offset-ivory md:p-8 ${
                can ? "cursor-pointer hover:bg-[#ebe3da]" : "cursor-not-allowed opacity-50"
              } ${on || glow ? "shadow-[inset_0_0_0_2px_#b60016]" : ""} ${glow ? "bg-[#ebe3da]" : ""}`}
            >
              <h3 className="font-heading text-[24px] font-bold leading-tight">{m.name}</h3>
              <p className="mt-2 font-script text-[24px] leading-snug text-red">{m.slogan}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-graphite/80">{m.text}</p>
            </div>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-6 min-h-[36px] font-script text-[30px] leading-tight">
        {drawn !== null && t.ui.drawResult(moods[drawn].name)}
      </p>

      {live && (
        <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4">
          {price !== null && <p className="font-heading text-[30px] font-bold leading-none">{formatUah(price)}</p>}
          <div>
            <button
              type="button"
              onClick={() => add()}
              disabled={!chosen}
              aria-describedby={!chosen ? "zhereb-pick-first" : undefined}
              className="inline-flex items-center gap-2 rounded-full bg-red px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:bg-red/40"
            >
              {added ? <Check size={16} aria-hidden /> : null}
              {added ? "Додано в кошик" : t.ui.addToCart} {!added && <ArrowRight size={16} aria-hidden />}
            </button>
            <p id="zhereb-pick-first" role="status" className="mt-2 min-h-5 text-[13px] text-muted">
              {!chosen ? (
                t.ui.pickFirst
              ) : inCart ? (
                <Link href="/cart" className="text-red underline underline-offset-4">
                  Перейти до кошика
                </Link>
              ) : null}
            </p>
          </div>
        </div>
      )}

      {/* Phone bar («ЖИВИЙ», under 768px, after the photo). The page leaves room for it at the bottom. */}
      {live && (
        <div
          aria-hidden={!showBar}
          className={`fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white px-5 py-3 transition-transform duration-300 md:hidden ${
            showBar ? "translate-y-0" : "pointer-events-none translate-y-full"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-[14px]">
              <span className="font-medium">{selected !== null ? moods[selected].name : t.ui.choose}</span>
              {price !== null && <span className="font-heading font-bold"> · {formatUah(price)}</span>}
            </p>
            <button
              type="button"
              tabIndex={showBar ? 0 : -1}
              onClick={() => (chosen ? add(true) : scrollToMoods())}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red px-5 py-2.5 text-[14px] font-medium text-white"
            >
              {t.ui.order} <ArrowRight size={15} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
