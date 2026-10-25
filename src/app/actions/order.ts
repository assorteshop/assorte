"use server";

import { after } from "next/server";
import { buildCheckout, liqpayConfigured, siteUrl } from "@/lib/liqpay";
import { notifyNewOrder } from "@/lib/notify";
import { supabase } from "@/lib/supabase";

export type OrderState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; number: number }
  | { status: "pay"; url: string; data: string; signature: string };

export async function placeOrder(_prev: OrderState, formData: FormData): Promise<OrderState> {
  const text = (name: string) => String(formData.get(name) ?? "").trim();

  const name = text("name");
  const phone = text("phone");
  const email = text("email");
  const city = text("city");
  const address = text("address");
  const comment = text("comment");
  const payment = text("payment") === "liqpay" ? "liqpay" : "cod";

  if (!name || !city || !address) {
    return { status: "error", message: "Заповніть імʼя, місто та відділення." };
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return { status: "error", message: "Перевірте номер телефону." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Перевірте адресу email." };
  }

  let items: { slug: string; qty: number }[];
  try {
    const parsed = JSON.parse(text("items"));
    items = parsed.map((i: { slug: unknown; qty: unknown }) => ({
      slug: String(i.slug),
      qty: Number(i.qty),
    }));
    if (!items.length) throw new Error("empty");
  } catch {
    return { status: "error", message: "Кошик порожній. Додайте товари й спробуйте ще раз." };
  }

  if (!supabase) {
    return { status: "error", message: "Оформлення замовлень тимчасово недоступне." };
  }
  if (payment === "liqpay" && !liqpayConfigured()) {
    return { status: "error", message: "Онлайн-оплата поки недоступна. Оберіть оплату при отриманні." };
  }

  const { data, error } = await supabase.rpc("create_order", {
    p_name: name,
    p_phone: phone,
    p_email: email,
    p_city: city,
    p_delivery: "nova_poshta",
    p_address: address,
    p_comment: comment,
    p_payment: payment,
    p_items: items,
  });

  // The database returns { number, total }; an older function version returned just the number.
  const created =
    typeof data === "number"
      ? { number: data, total: null as number | null }
      : (data as { number?: number; total?: number } | null);

  if (error || !created || typeof created.number !== "number") {
    console.error("[assorte] create_order failed:", error?.message);
    return { status: "error", message: "Не вдалося оформити замовлення. Спробуйте пізніше." };
  }
  const number = created.number;

  // Telling the shop owner must never delay or break the customer's order.
  after(() =>
    notifyNewOrder({ number, name, phone, email, city, address, comment, items, payment }).catch((e) =>
      console.error("[assorte] notifyNewOrder crashed:", e),
    ),
  );

  if (payment === "liqpay") {
    if (typeof created.total !== "number") {
      return { status: "error", message: "Не вдалося підготувати оплату. Оберіть оплату при отриманні." };
    }
    return { status: "pay", ...buildCheckout({ orderNumber: number, amount: created.total, siteUrl: siteUrl() }) };
  }
  return { status: "ok", number };
}
