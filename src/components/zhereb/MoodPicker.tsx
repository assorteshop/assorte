"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { zhereb as t } from "@/content/zhereb";
import { track } from "@/lib/analytics";
import { addToCart, useCart } from "@/lib/cart";
import { formatUah } from "@/lib/format";
import { drawSteps, pickRandom, resultLine, type ZherebState, type ZherebVariant } from "@/lib/zhereb";
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

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const HEADER = 72; // the white header covers the top of the screen

/** Smoothly brings an element into view and resolves when the scrolling has finished. */
function scrollIntoViewAndWait(el: HTMLElement | null, block: "start" | "center"): Promise<void> {
  if (!el) return Promise.resolve();
  const r = el.getBoundingClientRect();
  const fits = r.height <= window.innerHeight - HEADER;
  const visible = r.top >= HEADER && r.bottom <= window.innerHeight;
  if (visible) return Promise.resolve();
  const still = reducedMotion();
  // A block taller than the screen (the six tiles on a phone) starts just under the header.
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

const gaItem = (v: ZherebVariant, mood: string) => ({
  item_id: v.slug,
  item_name: v.name,
  item_variant: mood,
  price: v.price_uah,
  quantity: 1,
});

/**
 * The six moods as a choice (radio group) and the result panel under them.
 * «СКОРО»: tiles and «Тягнути жереб» work; the panel invites to the Telegram channel.
 * «ЖИВИЙ»: the panel shows the price and «Додати в кошик»; on phones there is also the order bar.
 * `variants[i]` is the shop variant of mood i, or null when that mood is not on sale.
 */
export function MoodPicker({ state, variants }: { state: ZherebState; variants: (ZherebVariant | null)[] }) {
  const router = useRouter();
  const live = state === "live";
  const moods = t.moods.items;
  // Moods that can be chosen: every mood in «СКОРО», only the ones on sale in «ЖИВИЙ».
  const allowed = moods.map((_, i) => i).filter((i) => !live || variants[i]);

  const [selected, setSelected] = useState<number | null>(null);
  const [how, setHow] = useState<"draw" | "click">("click");
  const [lit, setLit] = useState<number | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [added, setAdded] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const grid = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
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

  const choose = (i: number, via: "draw" | "click") => {
    if (!allowed.includes(i)) return;
    setSelected(i);
    setHow(via);
    const v = variants[i];
    track("select_item", {
      item_list_name: "Жереб",
      items: [v ? gaItem(v, moods[i].name) : { item_id: "zhereb", item_name: "Жереб", item_variant: moods[i].name }],
    });
  };

  const draw = async () => {
    if (drawing || allowed.length === 0) return;
    const result = pickRandom(allowed);
    track("zhereb_draw", { item_variant: moods[result].name, state });
    setDrawing(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // 1) The whole grid on screen (on a phone, from its top), 2) the light runs, 3) to the result panel.
    await scrollIntoViewAndWait(grid.current, "center");
    const finish = () => {
      setLit(null);
      setDrawing(false);
      choose(result, "draw");
      // Wait for the panel to appear, then bring it into view.
      requestAnimationFrame(() => requestAnimationFrame(() => scrollIntoViewAndWait(panel.current, "center")));
    };
    if (reducedMotion()) return finish();

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
      choose(i, "click");
      return;
    }
    if (next !== null) {
      e.preventDefault();
      choose(next, "click");
      tiles.current[next]?.focus();
    }
  };
  const focusable = selected ?? allowed[0];
  // In «СКОРО» the panel appears after a choice; in «ЖИВИЙ» it is always there (price and the button wait for a choice).
  const showPanel = live || (selected !== null && !drawing);

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
        ref={grid}
        role="radiogroup"
        aria-labelledby={`${MOODS_ID}-title`}
        className="mt-8 grid scroll-mt-24 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
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
              onKeyDown={(e) => !drawing && onKey(e, i)}
              className={`relative flex flex-col rounded-[36px] p-7 outline-none transition-[box-shadow,background-color] duration-100 focus-visible:ring-2 focus-visible:ring-graphite focus-visible:ring-offset-2 focus-visible:ring-offset-ivory md:p-8 ${
                on || glow ? "bg-white shadow-[inset_0_0_0_2px_#b60016]" : "bg-[#f0eae3]"
              } ${can ? (on || glow ? "cursor-pointer" : "cursor-pointer hover:bg-[#ebe3da]") : "cursor-not-allowed opacity-50"}`}
            >
              {on && (
                <span
                  aria-hidden
                  className="absolute right-5 top-5 grid size-7 place-items-center rounded-full bg-red text-white"
                >
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

      {/* Result panel: what was chosen and what to do next. */}
      <div ref={panel} aria-live="polite" className="scroll-mt-24">
        {showPanel && (
          <div className="mt-6 rounded-[36px] bg-white p-7 md:p-9">
            {selected !== null && !drawing && (
              <p className="font-script text-[32px] leading-tight md:text-[40px]">
                {resultLine(moods[selected].name, how, t.ui)}
              </p>
            )}

            {!live && selected !== null && !drawing && (
              <>
                <p className="mt-3 max-w-[620px] text-[16px] leading-relaxed">{t.ui.soonPanel}</p>
                <a
                  href={t.waitlistUrl}
                  target="_blank"
                  rel="noopener"
                  onClick={() => track("zhereb_waitlist_click", { link_url: t.waitlistUrl, mood: moods[selected].name })}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-red px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-graphite"
                >
                  {t.hero.buttonSoon} <ArrowRight size={16} aria-hidden />
                </a>
              </>
            )}

            {live && (
              <div className={`flex flex-wrap items-center gap-x-8 gap-y-4 ${selected !== null && !drawing ? "mt-5" : ""}`}>
                {price !== null && <p className="font-heading text-[30px] font-bold leading-none">{formatUah(price)}</p>}
                <div>
                  <button
                    type="button"
                    onClick={() => add()}
                    disabled={!chosen || drawing}
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
          </div>
        )}
      </div>

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
