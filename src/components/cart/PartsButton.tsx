"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart, useCart } from "@/lib/cart";
import { cartSource, track } from "@/lib/analytics";

/** Checkout opened with this query has «Покупка частинами monobank» already chosen. */
export const PARTS_CHECKOUT = "/checkout?pay=mono_parts";

const shield = (
  // monobank's official «КУПУЙТЕ ЧАС-ТИ-НА-МИ» label (monobank «ПЧ Guideline», white, short logo).
  // eslint-disable-next-line @next/next/no-img-element -- a tiny image, nothing to optimise
  <img src="/payments/kupuite-chastynamy.png" alt="" width={233} height={20} className="h-5 w-auto" />
);

const box =
  "flex w-full items-center justify-center rounded-full border border-line bg-white px-4 py-2.5 transition-colors hover:border-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite";

/**
 * «mono | КУПУЙТЕ ЧАС-ТИ-НА-МИ» on a product card: puts the product in the cart and opens the
 * checkout with «Покупка частинами» chosen. A product with variants opens its page first.
 */
export function PartsButton({
  product,
  hasVariants,
}: {
  product: { slug: string; name: string; price_uah: number; image_url: string | null; variant_label?: string | null };
  hasVariants: boolean;
}) {
  const router = useRouter();
  const { items } = useCart();
  const label = `Купити частинами: ${product.name}`;

  if (hasVariants) {
    return (
      <Link href={`/products/${product.slug}`} aria-label={`Обрати варіант і купити частинами: ${product.name}`} className={box}>
        {shield}
      </Link>
    );
  }

  const buy = () => {
    if (!items.some((i) => i.slug === product.slug)) {
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
        payment_type: "mono_parts",
        items: [{ item_id: product.slug, item_name: product.name, price: product.price_uah, quantity: 1 }],
      });
    }
    router.push(PARTS_CHECKOUT);
  };

  return (
    <button type="button" onClick={buy} aria-label={label} className={box}>
      {shield}
    </button>
  );
}
