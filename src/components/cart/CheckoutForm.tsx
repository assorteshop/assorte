"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { placeOrder, type OrderState } from "@/app/actions/order";
import { clearCart, useCart } from "@/lib/cart";
import { formatUah } from "@/lib/format";
import { ONLINE_DISCOUNT_PERCENT, onlineDiscount } from "@/lib/pricing";

const initial: OrderState = { status: "idle" };

const field =
  "mt-1.5 h-12 w-full rounded-[4px] border border-line bg-white px-4 text-[14px]";
const label = "block text-[13px]";

export function CheckoutForm({ onlineEnabled }: { onlineEnabled: boolean }) {
  const { items, total } = useCart();
  const [state, action, pending] = useActionState(placeOrder, initial);

  const payForm = useRef<HTMLFormElement>(null);
  const [delivery, setDelivery] = useState<"nova_poshta" | "ukrposhta">("nova_poshta");
  const [payment, setPayment] = useState<"cod" | "liqpay">("cod");
  const discount = payment === "liqpay" ? onlineDiscount(total) : 0;

  useEffect(() => {
    if (state.status === "ok" || state.status === "pay") clearCart();
    if (state.status === "pay") payForm.current?.submit();
  }, [state]);

  if (state.status === "pay") {
    return (
      <div className="max-w-[560px] py-10">
        <p className="text-[17px]">Переходимо до оплати…</p>
        <form ref={payForm} action={state.url} method="POST" className="mt-4">
          <input type="hidden" name="data" value={state.data} />
          <input type="hidden" name="signature" value={state.signature} />
          <noscript>
            <button type="submit" className="rounded-[4px] bg-red px-7 py-4 text-white">Перейти до оплати</button>
          </noscript>
        </form>
      </div>
    );
  }

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
          <label className="flex items-center gap-3 rounded-[4px] bg-white px-4 py-3 text-[14px]">
            <input type="radio" name="delivery" value="nova_poshta" checked={delivery === "nova_poshta"} onChange={() => setDelivery("nova_poshta")} className="accent-[#b60016]" />
            Нова пошта: відділення або поштомат
          </label>
          <label className="flex items-center gap-3 rounded-[4px] bg-white px-4 py-3 text-[14px]">
            <input type="radio" name="delivery" value="ukrposhta" checked={delivery === "ukrposhta"} onChange={() => setDelivery("ukrposhta")} className="accent-[#b60016]" />
            Укрпошта: відділення
          </label>
          <label className={label}>
            Місто
            <input name="city" required autoComplete="address-level2" className={field} />
          </label>
          <label className={label}>
            {delivery === "ukrposhta" ? "Відділення Укрпошти (або поштовий індекс)" : "Відділення або поштомат"}
            <input
              name="address"
              required
              placeholder={delivery === "ukrposhta" ? "Наприклад: відділення 49000" : "Наприклад: відділення №12"}
              className={field}
            />
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-[18px]">Оплата</legend>
          <label className="flex items-center gap-3 rounded-[4px] bg-white px-4 py-3 text-[14px]">
            <input type="radio" name="payment" value="cod" checked={payment === "cod"} onChange={() => setPayment("cod")} className="accent-[#b60016]" />
            Оплата при отриманні
          </label>
          {onlineEnabled ? (
            <label className="flex items-center gap-3 rounded-[4px] bg-white px-4 py-3 text-[14px]">
              <input type="radio" name="payment" value="liqpay" checked={payment === "liqpay"} onChange={() => setPayment("liqpay")} className="accent-[#b60016]" />
              <span>
                Оплата карткою на сайті{" "}
                <strong className="font-medium text-red">додаткова знижка {ONLINE_DISCOUNT_PERCENT}%</strong>
              </span>
            </label>
          ) : (
            <p className="px-1 text-[12px] text-muted">Оплата карткою онлайн буде додана найближчим часом.</p>
          )}
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
        {discount > 0 && (
          <p className="mt-4 flex justify-between text-[14px] text-red">
            <span>Знижка за оплату карткою ({ONLINE_DISCOUNT_PERCENT}%)</span>
            <span>−{formatUah(discount)}</span>
          </p>
        )}
        <p className={`flex justify-between border-t border-line pt-4 text-[18px] font-medium ${discount > 0 ? "mt-2" : "mt-4"}`}>
          <span>До сплати</span>
          <span>{formatUah(total - discount)}</span>
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
