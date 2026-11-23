"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, ShoppingCart } from "lucide-react";
import { addToCart, useCart } from "@/lib/cart";
import { cartSource, track } from "@/lib/analytics";
import { formatUah } from "@/lib/format";

/** The id of the price + «Додати в кошик» row; the bar shows while that row is off the screen. */
export const BUY_ROW_ID = "kupyty";

/**
 * Phones only: a bar stuck to the bottom of the product page with the price and «Додати в кошик»,
 * so the customer does not have to scroll back up to find the button. Once the product is in the
 * cart, the button becomes «До кошика».
 */
export function StickyBuyBar({
  product,
  oldPrice,
}: {
  product: { slug: string; name: string; price_uah: number; image_url: string | null; variant_label?: string | null };
  oldPrice: number | null;
}) {
  const { items } = useCart();
  const inCart = items.some((i) => i.slug === product.slug);
  const [show, setShow] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const row = document.getElementById(BUY_ROW_ID);
    if (!row) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0 });
    io.observe(row);
    return () => io.disconnect();
  }, []);

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
      placement: "sticky_bar",
      items: [{ item_id: product.slug, item_name: product.name, price: product.price_uah, quantity: 1 }],
    });
    setAdded(true);
  };

  const button = "inline-flex shrink-0 items-center gap-2 rounded-full bg-red px-5 py-3 text-[15px] font-medium text-white";

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-6px_20px_rgba(0,0,0,0.06)] transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 leading-tight">
          {oldPrice !== null && (
            <span className="block text-[13px] text-muted line-through decoration-red decoration-2">{formatUah(oldPrice)}</span>
          )}
          <span className={`font-heading text-[20px] font-bold ${oldPrice !== null ? "text-red" : ""}`}>
            {formatUah(product.price_uah)}
          </span>
        </p>
        {inCart && !added ? (
          <Link href="/cart" tabIndex={show ? 0 : -1} className={button}>
            До кошика <ArrowRight size={16} aria-hidden />
          </Link>
        ) : (
          <button type="button" onClick={add} tabIndex={show ? 0 : -1} className={button}>
            {added ? <Check size={18} aria-hidden /> : <ShoppingCart size={18} strokeWidth={1.75} aria-hidden />}
            {added ? "Додано" : "Додати в кошик"}
          </button>
        )}
      </div>
    </div>
  );
}
