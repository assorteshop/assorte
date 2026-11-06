"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { productAlt } from "@/lib/seo";

// All photos sit in one horizontal strip with scroll snapping, so on a phone you swipe
// between them with a finger; thumbnails, arrows (desktop) and dots follow the strip.
export function ProductGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: string | null;
}) {
  const [active, setActive] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const many = images.length > 1;

  const show = (i: number) => {
    const el = strip.current;
    if (!el) return;
    const next = Math.min(Math.max(i, 0), images.length - 1);
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setActive(next);
  };

  const onScroll = () => {
    const el = strip.current;
    if (!el || !el.clientWidth) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const arrow =
    "absolute top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-graphite shadow-sm transition hover:bg-red hover:text-white disabled:pointer-events-none disabled:opacity-0 md:grid";

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[6px] bg-[#ece8e2]">
        <div
          ref={strip}
          onScroll={onScroll}
          className="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Фото товару, гортайте вліво або вправо"
        >
          {images.map((src, i) => (
            <div key={src} className="relative size-full shrink-0 snap-center snap-always">
              <Image
                src={src}
                alt={productAlt(alt, i)}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {badge && (
          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-red px-3 py-1 text-[11px] font-medium text-white">
            {badge}
          </span>
        )}
        {many && (
          <>
            <button type="button" onClick={() => show(active - 1)} disabled={active === 0} aria-label="Попереднє фото" className={`${arrow} left-3`}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => show(active + 1)} disabled={active === images.length - 1} aria-label="Наступне фото" className={`${arrow} right-3`}>
              <ChevronRight size={20} />
            </button>
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((src, i) => (
                <span key={src} className={`h-1.5 rounded-full bg-white shadow-sm transition-all ${i === active ? "w-5" : "w-1.5 opacity-60"}`} />
              ))}
            </div>
          </>
        )}
      </div>
      {many && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="Мініатюри фото">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => show(i)}
                aria-label={`Фото ${i + 1}`}
                aria-current={i === active}
                className={`relative block aspect-square w-full overflow-hidden rounded-[4px] bg-[#ece8e2] ring-offset-2 ${
                  i === active ? "ring-2 ring-graphite" : "ring-1 ring-line"
                }`}
              >
                <Image src={src} alt={productAlt(alt, i)} fill sizes="100px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
