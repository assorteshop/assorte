"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { placeOrder, type OrderState } from "@/app/actions/order";
import { clearCart, useCart } from "@/lib/cart";
import { formatUah } from "@/lib/format";

const initial: OrderState = { status: "idle" };

const field =
  "mt-1.5 h-12 w-full rounded-[4px] border border-line bg-white px-4 text-[14px]";
const label = "block text-[13px]";

export function CheckoutForm() {
  const { items, total } = useCart();
  const [state, action, pending] = useActionState(placeOrder, initial);

  useEffect(() => {
    if (state.status === "ok") clearCart();
  }, [state]);

  if (state.status === "ok") {
    return (
      <div className="max-w-[560px] py-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-red">Дякуємо</p>
        <h1 className="mt-2 text-[32px] md:text-[40px]">Замовлення №{state.number} прийнято</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Ми зв’яжемося з вами за вказаним номером, щоб підтвердити замовлення та доставку.
        </p>
        <Link
          href="/catalog"
          className="mt-8 inline-flex rounded-[4px] bg-red px-7 py-4 text-[15px] font-medium text-white"
        >
          Повернутися до каталогу
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16">
        <p className="text-[17px]">Кошик порожній, нічого оформлювати.</p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex rounded-[4px] bg-red px-7 py-4 text-[15px] font-medium text-white"
        >
          До каталогу
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(items.map((i) => ({ slug: i.slug, qty: i.qty })))}
      />

      <div className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="text-[18px]">Контакти</legend>
          <label className={label}>
            Імʼя та прізвище
            <input name="name" required autoComplete="name" className={field} />
          </label>
          <label className={label}>
            Телефон
            <input name="phone" type="tel" required autoComplete="tel" placeholder="+380" className={field} />
          </label>
          <label className={label}>
            Email (необовʼязково)
            <input name="email" type="email" autoComplete="email" className={field} />
          </label>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-[18px]">Доставка</legend>
          <p className="rounded-[4px] bg-white px-4 py-3 text-[14px]">Нова пошта: відділення або поштомат</p>
          <label className={label}>
            Місто
            <input name="city" required autoComplete="address-level2" className={field} />
          </label>
          <label className={label}>
            Відділення або поштомат
            <input name="address" required placeholder="Наприклад: відділення №12" className={field} />
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-[18px]">Оплата</legend>
          <label className="flex items-center gap-3 rounded-[4px] bg-white px-4 py-3 text-[14px]">
            <input type="radio" name="payment" value="cod" defaultChecked className="accent-[#b60016]" />
            Оплата при отриманні
          </label>
          <p className="px-1 text-[12px] text-muted">Оплата карткою онлайн буде додана найближчим часом.</p>
        </fieldset>

        <label className={label}>
          Коментар до замовлення (необовʼязково)
          <textarea name="comment" rows={3} className={`${field} h-auto py-3`} />
        </label>
      </div>

      <aside className="h-fit rounded-[6px] bg-white p-6">
        <h2 className="text-[18px]">Ваше замовлення</h2>
        <ul className="mt-4 space-y-3 text-[14px]">
          {items.map((i) => (
            <li key={i.slug} className="flex justify-between gap-4">
              <span>
                {i.name} <span className="text-muted">× {i.qty}</span>
              </span>
              <span className="shrink-0">{formatUah(i.price_uah * i.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-line pt-4 text-[18px] font-medium">
          <span>До сплати</span>
          <span>{formatUah(total)}</span>
        </p>
        <p className="mt-1 text-[12px] text-muted">Вартість доставки за тарифами перевізника.</p>
        <p role="alert" className="mt-4 min-h-5 text-[13px] text-red">
          {state.status === "error" ? state.message : ""}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-[4px] bg-red px-7 py-4 text-[15px] font-medium text-white disabled:opacity-60"
        >
          {pending ? "Оформлюємо…" : "Підтвердити замовлення"}
        </button>
      </aside>
    </form>
  );
}
