"use client";

import Image from "next/image";
import { useState } from "react";

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

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[6px] bg-[#ece8e2]">
        {images[active] && (
          <Image
            src={images[active]}
            alt={alt}
            fill
            priority={active === 0}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
        {badge && (
          <span className="absolute left-4 top-4 rounded-full bg-red px-3 py-1 text-[11px] font-medium text-white">
            {badge}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="Фото товару">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Фото ${i + 1}`}
                aria-current={i === active}
                className={`relative block aspect-square w-full overflow-hidden rounded-[4px] bg-[#ece8e2] ring-offset-2 ${
                  i === active ? "ring-2 ring-graphite" : "ring-1 ring-line"
                }`}
              >
                <Image src={src} alt="" fill sizes="100px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
