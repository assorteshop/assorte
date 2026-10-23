"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Кошик, товарів: ${count}` : "Кошик"}
      className="relative p-1"
    >
      <ShoppingBag size={20} strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1 grid min-w-[18px] place-items-center rounded-full bg-red px-1 text-[11px] font-medium leading-[18px] text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
