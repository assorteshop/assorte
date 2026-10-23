import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { formatUah, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.slug}`;
  return (
    <article className="overflow-hidden rounded-[6px] bg-white">
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
          className="absolute right-3 top-3 p-1 text-graphite"
        >
          <Heart size={20} strokeWidth={1.5} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-[15px]">
          <Link href={href} className="hover:text-red">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-[12px] text-muted">{product.tagline}</p>
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
        <div className="mt-2 flex items-end justify-between">
          <p className="text-[17px] font-medium">{formatUah(product.price_uah)}</p>
          <Link
            href={href}
            aria-label={`Купити: ${product.name}`}
            className="grid size-11 place-items-center rounded-full bg-red text-white"
          >
            <ShoppingCart size={18} strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </article>
  );
}
