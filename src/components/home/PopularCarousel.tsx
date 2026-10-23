"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

export function PopularCarousel({ children }: { children: React.ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const [overflows, setOverflows] = useState(false);

  const measure = useCallback(() => {
    const el = track.current;
    if (el) setOverflows(el.scrollWidth > el.clientWidth + 4);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  // One tap moves the row by one product; at the end it returns to the first.
  const next = () => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: first.offsetWidth + 20, behavior: "smooth" });
  };

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
      <ul
        ref={track}
        className="-mx-5 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 md:scroll-px-0 [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <li className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
            {child}
          </li>
        ))}
      </ul>
    </section>
  );
}
