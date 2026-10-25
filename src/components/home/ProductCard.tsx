import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatUah } from "@/lib/format";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.slug}`;
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-[6px] bg-white">
      <div className={`relative aspect-[4/3] ${product.image_url ? "bg-white" : "bg-[#ece8e2]"}`}>
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-contain"
          />
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-red px-3 py-1 text-[11px] font-medium text-white">
            {product.badge}
          </span>
        )}
        <button
          type="button"
          aria-label="Додати до обраного"
          className="absolute right-3 top-3 z-10 p-1 text-graphite"
        >
          <Heart size={20} strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[15px]">
          <Link href={href} className="hover:text-red after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[12px] text-muted">{product.tagline}</p>
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
        <div className="mt-auto flex items-end justify-between pt-2">
          <p className="text-[17px] font-medium">{formatUah(product.price_uah)}</p>
          <div className="relative z-10">
            <AddToCartButton product={product} variant="icon" />
          </div>
        </div>
      </div>
    </article>
  );
}
