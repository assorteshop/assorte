"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { HeartFrame } from "@/components/brand/HeartFrame";
import { addToCart, useCart } from "@/lib/cart";
import { cartSource, track } from "@/lib/analytics";

type Props = {
  product: {
    slug: string;
    name: string;
    price_uah: number;
    image_url: string | null;
    variant_label?: string | null;
  };
  variant: "icon" | "full" | "inline" | "pill";
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
    track("add_to_cart", {
      currency: "UAH",
      value: product.price_uah,
      source: cartSource(window.location.pathname),
      items: [{ item_id: product.slug, item_name: product.name, price: product.price_uah, quantity: 1 }],
    });
    setAdded(true);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={add}
        aria-label={added ? "Додано в кошик" : `Додати в кошик: ${product.name}`}
        className="group block text-red"
      >
        <HeartFrame className="size-12">
          {added ? <Check size={17} strokeWidth={2.2} /> : <ShoppingCart size={17} strokeWidth={1.9} />}
        </HeartFrame>
      </button>
    );
  }

  if (variant === "pill") {
    // The Apple-style catalogue card: one small centred pill; once in the cart it leads there.
    const pill = "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-colors";
    if (inCart && !added) {
      return (
        <Link href="/cart" className={`${pill} border border-graphite text-graphite hover:bg-graphite hover:text-white`}>
          <Check size={16} /> У кошику
        </Link>
      );
    }
    return (
      <button type="button" onClick={add} className={`${pill} bg-red text-white hover:bg-graphite`}>
        {added ? <Check size={16} /> : <ShoppingCart size={16} strokeWidth={1.75} />}
        {added ? "Додано" : "Додати в кошик"}
      </button>
    );
  }

  if (variant === "inline") {
    // Next to the price on the product page.
    return (
      <div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center justify-center gap-2.5 rounded-full bg-red px-5 py-4 text-[15px] font-medium text-white sm:gap-3 sm:px-7"
        >
          {added ? <Check size={18} /> : <ShoppingCart size={18} strokeWidth={1.75} />}
          {added ? "Додано в кошик" : "Додати в кошик"}
        </button>
        <p role="status" className="mt-2 min-h-5 text-[13px]">
          {inCart && (
            <Link href="/cart" className="text-red underline underline-offset-4">
              Перейти до кошика
            </Link>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={add}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-red px-7 py-4 text-[15px] font-medium text-white md:w-auto"
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
