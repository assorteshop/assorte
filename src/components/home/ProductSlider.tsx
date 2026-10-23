"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductSlider({ children }: { children: React.ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const arrow =
    "absolute top-[92px] z-10 hidden size-11 place-items-center rounded-full bg-white text-graphite shadow-sm ring-1 ring-line hover:text-red md:grid";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Популярні товари"
      className="relative"
    >
      <ul
        ref={track}
        onScroll={update}
        className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 md:scroll-px-0 [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <li className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
            {child}
          </li>
        ))}
      </ul>
      {canPrev && (
        <button type="button" aria-label="Попередні товари" onClick={() => scrollBy(-1)} className={`${arrow} -left-5`}>
          <ChevronLeft size={20} />
        </button>
      )}
      {canNext && (
        <button type="button" aria-label="Наступні товари" onClick={() => scrollBy(1)} className={`${arrow} -right-5`}>
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
