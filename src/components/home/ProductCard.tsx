import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { HeartFrame } from "@/components/brand/HeartFrame";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatUah } from "@/lib/format";
import type { ProductCardData } from "@/lib/products";

// Editorial card: the photo sits on a warm tile (its white background melts into the tile),
// no white box around the card, bold price in the heading font, the heart cart button.
export function ProductCard({ product }: { product: ProductCardData }) {
  const href = `/products/${product.slug}`;
  return (
    <article className="group/card relative flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-[#f0eae3]">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 78vw"
            className="object-contain p-5 mix-blend-multiply transition-transform duration-500 group-hover/card:scale-[1.04]"
          />
        )}
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-red px-3.5 py-1.5 text-[11px] font-medium text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pt-4">
        <h3 className="line-clamp-2 text-[16px] leading-snug">
          <Link href={href} className="hover:text-red after:absolute after:inset-0 after:content-['']">
            {product.name}
            {product.variantCount === 1 && product.variant_label ? ` — ${product.variant_label}` : ""}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-[13px] text-muted">{product.tagline}</p>
        {product.variantCount > 1 && (
          <p className="mt-1 text-[12px] text-muted">Варіантів: {product.variantCount}</p>
        )}
        {product.colors.length > 0 && (
          <ul className="mt-3 flex gap-2" aria-label="Доступні кольори">
            {product.colors.map((c) => (
              <li
                key={c}
                className="size-3.5 rounded-full border border-line"
                style={{ backgroundColor: c }}
              />
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-end justify-between pt-3">
          <p className="font-heading text-[20px] font-bold leading-none">
            {product.priceFrom && <span className="mr-1 font-sans text-[13px] font-normal text-muted">від</span>}
            {formatUah(product.price_uah)}
          </p>
          <div className="relative z-10">
            {product.variantCount > 1 ? (
              <Link href={href} aria-label={`Обрати варіант: ${product.name}`} className="group block text-red">
                <HeartFrame className="size-12">
                  <ShoppingCart size={17} strokeWidth={1.9} />
                </HeartFrame>
              </Link>
            ) : (
              <AddToCartButton product={product} variant="icon" />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
