"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { addToCart, useCart } from "@/lib/cart";

type Props = {
  product: {
    slug: string;
    name: string;
    price_uah: number;
    image_url: string | null;
    variant_label?: string | null;
  };
  variant: "icon" | "full";
};

export function AddToCartButton({ product, variant }: Props) {
  const [added, setAdded] = useState(false);
  const { items } = useCart();
  const inCart = items.some((i) => i.slug === product.slug);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  const add = () => {
    addToCart({
      slug: product.slug,
      name: product.variant_label ? `${product.name} — ${product.variant_label}` : product.name,
      price_uah: product.price_uah,
      image: product.image_url,
    });
    setAdded(true);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={add}
        aria-label={added ? "Додано в кошик" : `Додати в кошик: ${product.name}`}
        className="grid size-11 place-items-center rounded-full bg-red text-white"
      >
        {added ? <Check size={18} strokeWidth={2} /> : <ShoppingCart size={18} strokeWidth={1.75} />}
      </button>
    );
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={add}
        className="inline-flex w-full items-center justify-center gap-3 rounded-[4px] bg-red px-7 py-4 text-[15px] font-medium text-white md:w-auto"
      >
        {added ? <Check size={18} /> : <ShoppingCart size={18} strokeWidth={1.75} />}
        {added ? "Додано в кошик" : "Додати в кошик"}
      </button>
      <p role="status" className="mt-3 min-h-5 text-[13px]">
        {inCart && (
          <Link href="/cart" className="text-red underline underline-offset-4">
            Перейти до кошика
          </Link>
        )}
      </p>
    </div>
  );
}
