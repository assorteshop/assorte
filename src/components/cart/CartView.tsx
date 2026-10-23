"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { removeFromCart, setQty, useCart } from "@/lib/cart";
import { formatUah } from "@/lib/format";

export function CartView() {
  const { items, total, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-16">
        <p className="text-[17px]">Ваш кошик порожній.</p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex items-center gap-3 rounded-[4px] bg-red px-7 py-4 text-[15px] font-medium text-white"
        >
          До каталогу <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.slug} className="flex gap-4 py-5">
            <Link
              href={`/products/${item.slug}`}
              className="relative size-24 shrink-0 overflow-hidden rounded-[6px] bg-white md:size-28"
            >
              {item.image && (
                <Image src={item.image} alt="" fill sizes="112px" className="object-contain" />
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/products/${item.slug}`}
                  className="text-[15px] leading-snug hover:text-red"
                >
                  {item.name}
                </Link>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.slug)}
                  aria-label={`Видалити: ${item.name}`}
                  className="p-1 text-muted hover:text-red"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="mt-1 text-[13px] text-muted">{formatUah(item.price_uah)}</p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="inline-flex items-center rounded-full border border-line bg-white">
                  <button
                    type="button"
                    onClick={() => setQty(item.slug, item.qty - 1)}
                    aria-label="Менше"
                    className="grid size-9 place-items-center"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="min-w-6 text-center text-[14px]" aria-live="polite">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(item.slug, item.qty + 1)}
                    aria-label="Більше"
                    className="grid size-9 place-items-center"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="text-[16px] font-medium">{formatUah(item.price_uah * item.qty)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-[6px] bg-white p-6">
        <h2 className="text-[18px]">Разом</h2>
        <dl className="mt-4 space-y-2 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-muted">Товарів: {count}</dt>
            <dd>{formatUah(total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Доставка</dt>
            <dd className="text-muted">за тарифами перевізника</dd>
          </div>
        </dl>
        <p className="mt-4 flex justify-between border-t border-line pt-4 text-[18px] font-medium">
          <span>До сплати</span>
          <span>{formatUah(total)}</span>
        </p>
        <Link
          href="/checkout"
          className="mt-6 flex items-center justify-center gap-3 rounded-[4px] bg-red px-7 py-4 text-[15px] font-medium text-white"
        >
          Оформити замовлення <ArrowRight size={16} />
        </Link>
        <Link href="/catalog" className="mt-4 block text-center text-[13px] hover:text-red">
          Продовжити покупки
        </Link>
      </aside>
    </div>
  );
}
