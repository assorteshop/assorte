"use client";

import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Heart } from "@/components/brand/Heart";
import type { HeroSlide } from "@/lib/hero-slides";

const SLIDE_MS = 6500;

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const mq = window.matchMedia(motionQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const prefersStill = () => window.matchMedia(motionQuery).matches;

// Full-screen photos of Alex that slowly change, with the brand line over them.
// People who turned animation off in their system see the first photo only, without movement.
export function Hero({ slides }: { slides: HeroSlide[] }) {
  const still = useSyncExternalStore(subscribeMotion, prefersStill, () => false);
  const [active, setActive] = useState(0);
  // Photos are added to the page one step ahead of the one on screen, so the first load stays light.
  const [reached, setReached] = useState(1);
  const [paused, setPaused] = useState(false);

  const show = (i: number) => {
    setActive(i);
    setReached((r) => Math.max(r, i + 1));
  };

  useEffect(() => {
    if (still || paused || slides.length < 2) return;
    const t = setInterval(() => {
      setActive((a) => {
        const next = (a + 1) % slides.length;
        setReached((r) => Math.max(r, next + 1));
        return next;
      });
    }, SLIDE_MS);
    return () => clearInterval(t);
  }, [still, paused, slides.length]);

  const hasZhereb = slides.some((s) => s.text === "zhereb");
  const onZhereb = slides[active]?.text === "zhereb";

  return (
    <section
      aria-roledescription={slides.length > 1 ? "carousel" : undefined}
      aria-label="ASSORTE: більше, ніж просто речі"
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-graphite text-white"
    >
      {slides.map((s, i) => {
        if (i > reached && i !== active) return null;
        const on = i === active;
        return (
          <div
            key={s.id}
            aria-hidden={!on}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${on ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundColor: s.bg }}
          >
            <picture>
              {s.desktop && <source media="(min-width: 768px)" srcSet={s.desktop} />}
              <img
                src={s.mobile}
                alt={on ? s.alt : ""}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover ${s.position ?? "object-[50%_22%]"} ${
                  s.position ? "" : s.desktop ? "md:object-center" : "md:inset-auto md:right-[6%] md:top-0 md:w-auto md:object-contain md:[mask-image:linear-gradient(to_right,transparent,#000_18%,#000_82%,transparent)]"
                } ${on && !still ? "animate-[kenburns_9s_ease-out_forwards]" : ""}`}
              />
            </picture>
          </div>
        );
      })}

      {/* Shade so the white words and the header stay readable on any photo. */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/35 to-transparent" />

      <div className="absolute inset-x-0 bottom-0">
        <div className="relative mx-auto max-w-[1280px] px-5 pb-10 md:px-8 md:pb-16">
          {/* Words of every slide sit in one place and fade like the photos; the hidden ones are inert. */}
          <div className="grid">
          <div
            inert={onZhereb}
            className={`[grid-area:1/1] self-end transition-opacity duration-700 ${onZhereb ? "opacity-0" : "opacity-100"}`}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/85">
              Продумані деталі для кращих моментів
            </p>
            <h1 className="mt-4 font-heading text-[42px] font-bold leading-[0.95] tracking-[-0.015em] sm:text-[68px] lg:text-[92px]">
              Більше, ніж
              <br />
              просто речі{" "}
              <Heart className="inline-block h-[0.78em] w-auto -translate-y-[0.06em] align-baseline" />
            </h1>
            <Link
              href="/catalog"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[15px] font-medium text-graphite transition-colors hover:bg-red hover:text-white"
            >
              До каталогу
              <ArrowRight size={16} />
            </Link>
          </div>
          {hasZhereb && (
            <div
              inert={!onZhereb}
              className={`[grid-area:1/1] self-end transition-opacity duration-700 ${onZhereb ? "opacity-100" : "opacity-0"}`}
            >
              <p className="font-heading text-[48px] font-bold leading-none sm:text-[68px] lg:text-[92px]">Жереб</p>
              <p className="mt-2 font-script text-[23px] leading-tight sm:text-[32px] lg:text-[38px]">
                Сліпе побачення з платівкою.
              </p>
              <Link
                href="/zhereb"
                className="group mt-6 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[15px] font-medium text-graphite transition-colors hover:bg-red hover:text-white md:mt-8"
              >
                Дізнатися більше
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
          </div>

          {!still && slides.length > 1 && (
            <div className="absolute bottom-10 right-5 flex items-center gap-2 md:bottom-16 md:right-8">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => show(i)}
                  aria-label={`Показати фото ${i + 1} з ${slides.length}`}
                  aria-current={i === active}
                  className="hidden py-3 sm:block"
                >
                  <span
                    className={`block h-[2px] rounded-full bg-white transition-all duration-500 ${
                      i === active ? "w-8 opacity-100" : "w-4 opacity-50 hover:opacity-80"
                    }`}
                  />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Продовжити показ фото" : "Зупинити показ фото"}
                className="ml-2 grid size-9 place-items-center rounded-full border border-white/60 transition-colors hover:bg-white hover:text-graphite"
              >
                {paused ? <Play size={13} strokeWidth={2.4} /> : <Pause size={13} strokeWidth={2.4} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
