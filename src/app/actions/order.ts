"use server";

import { after } from "next/server";
import { buildCheckout, liqpayConfigured, siteUrl } from "@/lib/liqpay";
import { createInvoice, monoConfigured } from "@/lib/mono";
import { notifyNewOrder } from "@/lib/notify";
import { encodeContact } from "@/lib/order-message";
import { supabase } from "@/lib/supabase";
import { parseFirstTouchField } from "@/lib/analytics";
import { isZherebArticle } from "@/lib/zhereb";

export type OrderState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; number: number; total: number | null }
  | { status: "pay"; url: string; data: string; signature: string }
  | { status: "redirect"; url: string };

export async function placeOrder(_prev: OrderState, formData: FormData): Promise<OrderState> {
  const text = (name: string) => String(formData.get(name) ?? "").trim();

  const name = text("name");
  const phone = text("phone");
  const email = text("email");
  const city = text("city");
  const address = text("address");
  // The preferred way to reach the customer goes in front of the comment, so it shows in the admin and in Telegram.
  // Item notes («Підказки для долі» of a «Жереб») follow the customer's own comment.
  const comment = [encodeContact(text("messenger"), text("comment").slice(0, 1000)), text("notes").slice(0, 1800)]
    .filter(Boolean)
    .join("\n\n");
  // cod: on delivery; mono: card on the site (monobank); liqpay: «Миттєва розстрочка ПриватБанку» (or card when mono is off).
  const chosen = text("payment");
  const payment = chosen === "mono" || chosen === "liqpay" ? chosen : "cod";
  const delivery = text("delivery") === "ukrposhta" ? "ukrposhta" : "nova_poshta";

  if (!name || !city || !address) {
    return { status: "error", message: "Заповніть імʼя, місто та відділення (адресу доставки)." };
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
  if ((payment === "liqpay" && !liqpayConfigured()) || (payment === "mono" && !monoConfigured())) {
    return { status: "error", message: "Цей спосіб оплати зараз недоступний. Оберіть інший." };
  }

  // «Жереб» is sent only after payment, so it cannot be ordered with payment on delivery.
  if (payment === "cod") {
    const { data: rows } = await supabase
      .from("products")
      .select("article")
      .in("slug", items.map((i) => i.slug));
    if ((rows ?? []).some((r) => isZherebArticle(r.article))) {
      return { status: "error", message: "«Жереб» можна оплатити лише карткою онлайн." };
    }
  }

  const { data, error } = await supabase.rpc("create_order", {
    p_name: name,
    p_phone: phone,
    p_email: email,
    p_city: city,
    p_delivery: delivery,
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
  const total = typeof created.total === "number" ? created.total : null;

  // Where the customer first came from. Validated here; saving it must never break the order.
  const firstTouch = parseFirstTouchField(text("first_touch"));
  if (firstTouch) {
    const db = supabase;
    after(async () => {
      const { error: ftError } = await db.rpc("set_order_first_touch", {
        p_number: number,
        p_first_touch: firstTouch,
      });
      if (ftError) console.error("[assorte] set_order_first_touch failed:", ftError.message);
    });
  }

  // Telling the shop owner must never delay or break the customer's order.
  after(() =>
    notifyNewOrder({ number, name, phone, email, city, address, comment, items, payment, delivery }).catch((e) =>
      console.error("[assorte] notifyNewOrder crashed:", e),
    ),
  );

  if (payment !== "cod") {
    const payError = {
      status: "error" as const,
      message: `Замовлення №${number} збережено, але не вдалося відкрити сторінку оплати. Ми зв’яжемося з вами.`,
    };
    if (typeof created.total !== "number") return payError;
    if (payment === "liqpay") {
      return { status: "pay", ...buildCheckout({ orderNumber: number, amount: created.total, siteUrl: siteUrl() }) };
    }
    try {
      const { pageUrl } = await createInvoice({ orderNumber: number, amount: created.total, siteUrl: siteUrl() });
      return { status: "redirect", url: pageUrl };
    } catch (e) {
      console.error("[assorte] mono invoice failed:", e);
      return payError;
    }
  }
  return { status: "ok", number, total };
}
