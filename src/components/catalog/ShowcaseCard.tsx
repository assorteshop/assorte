"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { PartsButton } from "@/components/cart/PartsButton";
import { OldPrice } from "@/components/catalog/OldPrice";
import { SaleCorner } from "@/components/catalog/SaleCorner";
import { formatUah } from "@/lib/format";
import type { ProductCardData } from "@/lib/products";
import { oldPriceOf } from "@/lib/sale-price";
import { productAlt } from "@/lib/seo";

/** Photos of a card: the gallery, or the single main photo for older products. */
export const cardPhotos = (p: { images: string[]; image_url: string | null }) =>
  p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : [];

// The catalogue card in the spirit of apple.com: a tall rounded photo you can swipe through
// (dots under it switch photos), then the name, a short line, the price and one pill button,
// all centred. Used on the catalogue pages; the home page keeps its own card.
export function ShowcaseCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const href = `/products/${product.slug}`;
  const photos = cardPhotos(product);
  const oldPrice = oldPriceOf(product);
  const [active, setActive] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const title = `${product.name}${product.variantCount === 1 && product.variant_label ? ` — ${product.variant_label}` : ""}`;

  const show = (i: number) => {
    const el = strip.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setActive(i);
  };
  const onScroll = () => {
    const el = strip.current;
    if (el?.clientWidth) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <article className="flex h-full flex-col text-center">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-[#ebe4dc]">
        <div
          ref={strip}
          onScroll={onScroll}
          className="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((src, i) => (
            <Link
              key={src}
              href={href}
              tabIndex={i === 0 ? undefined : -1}
              aria-label={i === 0 ? title : undefined}
              className="group/photo relative size-full shrink-0 snap-center snap-always"
            >
              <Image
                src={src}
                alt={productAlt(product.name, i)}
                fill
                priority={priority && i === 0}
                sizes="(min-width: 1280px) 28vw, (min-width: 640px) 40vw, 90vw"
                className="object-cover transition-transform duration-700 group-hover/photo:scale-[1.03]"
              />
            </Link>
          ))}
        </div>
        {oldPrice !== null && <SaleCorner />}
      </div>

      {photos.length > 1 ? (
        <div className="mt-5 flex justify-center gap-2.5" aria-label="Фото товару">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => show(i)}
              aria-label={`Фото ${i + 1} з ${photos.length}`}
              aria-current={i === active}
              className={`size-[11px] rounded-full border transition-colors ${
                i === active ? "border-graphite bg-graphite" : "border-[#c9c2ba] hover:border-graphite"
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 h-[11px]" aria-hidden />
      )}

      <div className="flex flex-1 flex-col items-center px-3 pt-5">
        <p className="min-h-5 text-[14px] font-medium text-red">{product.badge ?? ""}</p>
        <h3 className="mt-1 line-clamp-2 font-heading text-[22px] font-bold leading-tight tracking-[-0.01em] md:text-[24px]">
          <Link href={href} className="hover:text-red">
            {title}
          </Link>
        </h3>
        {product.tagline && <p className="mt-2 line-clamp-2 max-w-[34ch] text-[15px] leading-snug text-muted">{product.tagline}</p>}
        <div className="mt-auto pt-4">
          {oldPrice !== null && <OldPrice value={oldPrice} className="mx-auto mb-1.5 block w-fit text-[15px]" />}
          <p className={`text-[17px] font-medium ${oldPrice !== null ? "text-red" : ""}`}>
            {product.priceFrom && <span className="mr-1 font-normal text-muted">від</span>}
            {formatUah(product.price_uah)}
          </p>
          <div className="mt-4 flex justify-center">
            {product.variantCount > 1 ? (
              <Link
                href={href}
                className="inline-flex items-center rounded-full bg-red px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-graphite"
              >
                Обрати варіант
              </Link>
            ) : (
              <AddToCartButton product={product} variant="pill" />
            )}
          </div>
          {product.mono_parts && (
            <div className="mx-auto mt-4 w-full max-w-[300px]">
              <PartsButton product={product} hasVariants={product.variantCount > 1} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
