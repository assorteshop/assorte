"use client";

import { useState } from "react";
import { subtypes, type Subtype } from "@/lib/categories";
import type { ProductCardData } from "@/lib/products";
import { ShowcaseCard } from "./ShowcaseCard";

// The product grid of a catalogue page. For watches a row of switches above it
// («Усі · Наручні · Смарт · Аксесуари») filters the products on the spot.
export function CatalogGrid({ products, withTypes = false }: { products: ProductCardData[]; withTypes?: boolean }) {
  const [type, setType] = useState<Subtype | null>(null);
  const shown = type ? products.filter((p) => p.subtype === type) : products;

  const chip = (on: boolean) =>
    `whitespace-nowrap rounded-full border px-5 py-2.5 text-[14px] transition-colors ${
      on ? "border-graphite bg-graphite text-white" : "border-line bg-white hover:border-graphite"
    }`;

  return (
    <>
      {withTypes && (
        <div className="-mx-5 mb-8 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-2" aria-label="Тип">
            <li>
              <button type="button" onClick={() => setType(null)} aria-pressed={type === null} className={chip(type === null)}>
                Усі
              </button>
            </li>
            {subtypes.map((t) => (
              <li key={t.slug}>
                <button type="button" onClick={() => setType(t.slug)} aria-pressed={type === t.slug} className={chip(type === t.slug)}>
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {shown.length === 0 ? (
        <p className="py-16 text-muted">Тут скоро з’являться товари.</p>
      ) : (
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p, i) => (
            <ShowcaseCard key={p.id} product={p} priority={i < 3} />
          ))}
        </div>
      )}
    </>
  );
}
