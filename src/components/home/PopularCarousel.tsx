"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export function PopularCarousel({ children }: { children: React.ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setOverflows(el.scrollWidth > el.clientWidth + 4);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    el.scrollBy({ left: dir * (first.offsetWidth + 20), behavior: "smooth" });
  };

  // The red header arrow moves one product; at the end it returns to the first.
  const next = () => {
    const el = track.current;
    if (!el) return;
    if (!canNext) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    step(1);
  };

  const edge =
    "absolute top-[135px] z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-red text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] ring-2 ring-white transition-colors hover:bg-[#8f0011] md:grid";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Популярні товари"
      className="mx-auto max-w-[1280px] px-5 py-10 md:px-8"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-red">
        Вибір Assorte
      </p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h2 className="text-[28px] md:text-[36px]">Популярні товари</h2>
        {overflows && (
          <button
            type="button"
            onClick={next}
            aria-label="Наступний товар"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-red text-white"
          >
            <ArrowRight size={18} />
          </button>
        )}
      </div>
      <div className="relative">
        <ul
          ref={track}
          onScroll={measure}
          className="-mx-5 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 md:scroll-px-0 [&::-webkit-scrollbar]:hidden"
        >
          {Children.map(children, (child) => (
            <li className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
              {child}
            </li>
          ))}
        </ul>
        {canPrev && (
          <button type="button" aria-label="Попередній товар" onClick={() => step(-1)} className={`${edge} -left-5`}>
            <ChevronLeft size={20} />
          </button>
        )}
        {canNext && (
          <button type="button" aria-label="Наступний товар" onClick={() => step(1)} className={`${edge} -right-5`}>
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
