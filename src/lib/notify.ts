import { formatUah } from "./format";
import { onlineDiscount } from "./pricing";
import { supabase } from "./supabase";

export type NewOrder = {
  number: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  comment: string;
  items: { slug: string; qty: number }[];
  payment: "cod" | "liqpay";
  delivery: "nova_poshta" | "ukrposhta";
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const adminUrl = () =>
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "assorte.vercel.app"}/admin/orders`;

// Names and prices come from the products table, the same source the order itself uses.
async function describeItems(items: NewOrder["items"]) {
  const { data } = supabase
    ? await supabase
        .from("products")
        .select("slug, name, price_uah, variant_label")
        .in("slug", items.map((i) => i.slug))
    : { data: null };
  const bySlug = new Map((data ?? []).map((p) => [p.slug, p]));

  let total = 0;
  const lines = items.map((i) => {
    const qty = Math.min(Math.max(Math.trunc(i.qty) || 1, 1), 20);
    const p = bySlug.get(i.slug);
    const sum = (p?.price_uah ?? 0) * qty;
    total += sum;
    return { name: p ? p.name + (p.variant_label ? ` — ${p.variant_label}` : "") : i.slug, qty, sum };
  });
  return { lines, total };
}

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  // One or more chat IDs, separated by commas (each person who should get orders).
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!token || chatIds.length === 0) return;

  const results = await Promise.allSettled(
    chatIds.map(async (chatId) => {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Telegram ${chatId} ${res.status}: ${await res.text()}`);
    }),
  );
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length === results.length) throw (failed[0] as PromiseRejectedResult).reason;
  failed.forEach((r) => console.error("[assorte] telegram partial failure:", (r as PromiseRejectedResult).reason));
}

async function sendEmail(subject: string, html: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!key || !to) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ORDER_EMAIL_FROM ?? "ASSORTE <onboarding@resend.dev>",
      to: to.split(",").map((s) => s.trim()),
      subject,
      html,
      text,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export async function notifyPayment(number: number, amount: number) {
  const link = adminUrl();
  const text = `✅ <b>Замовлення №${number} оплачено онлайн</b>\nСума: ${formatUah(amount)}\n<a href="${link}">Відкрити в адмінці</a>`;
  const plain = `Замовлення №${number} оплачено онлайн. Сума: ${formatUah(amount)}\n${link}`;
  const results = await Promise.allSettled([
    sendTelegram(text),
    sendEmail(`Оплачено замовлення №${number} — ASSORTE`, `<p>${plain.replace(/\n/g, "<br>")}</p>`, plain),
  ]);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("[assorte] payment notification failed:", r.reason);
  });
}

export async function notifyNewOrder(order: NewOrder) {
  const { lines, total: subtotal } = await describeItems(order.items);
  const discount = order.payment === "liqpay" ? onlineDiscount(subtotal) : 0;
  const total = subtotal - discount;
  const carrier = order.delivery === "ukrposhta" ? "Укрпошта" : "Нова пошта";
  const link = adminUrl();
  const paymentLabel =
    order.payment === "liqpay" ? "онлайн-оплата LiqPay (очікує оплати)" : "оплата при отриманні";

  const itemsText = lines.map((l) => `• ${l.name} × ${l.qty} — ${formatUah(l.sum)}`).join("\n");
  const plain = [
    `Нове замовлення №${order.number}`,
    `${order.name}, ${order.phone}${order.email ? `, ${order.email}` : ""}`,
    `${carrier}: ${order.city}, ${order.address}`,
    "",
    itemsText,
    "",
    discount ? `Знижка за оплату карткою: −${formatUah(discount)}` : "",
    `Разом: ${formatUah(total)} (${paymentLabel})`,
    order.comment ? `Коментар: ${order.comment}` : "",
    "",
    link,
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");

  const telegram = [
    `🛒 <b>Нове замовлення №${order.number}</b>`,
    `👤 ${escapeHtml(order.name)}`,
    `📞 ${escapeHtml(order.phone)}${order.email ? `\n✉️ ${escapeHtml(order.email)}` : ""}`,
    `📍 ${carrier}: ${escapeHtml(order.city)}, ${escapeHtml(order.address)}`,
    "",
    lines.map((l) => `• ${escapeHtml(l.name)} × ${l.qty} — ${formatUah(l.sum)}`).join("\n"),
    "",
    discount ? `Знижка за оплату карткою: −${formatUah(discount)}` : "",
    `<b>Разом: ${formatUah(total)}</b> (${paymentLabel})`,
    order.comment ? `💬 ${escapeHtml(order.comment)}` : "",
    "",
    `<a href="${link}">Відкрити в адмінці</a>`,
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");

  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#171717">
<h2 style="margin:0 0 12px">Нове замовлення №${order.number}</h2>
<p style="margin:0 0 4px"><b>${escapeHtml(order.name)}</b> · ${escapeHtml(order.phone)}${order.email ? ` · ${escapeHtml(order.email)}` : ""}</p>
<p style="margin:0 0 16px">${carrier}: ${escapeHtml(order.city)}, ${escapeHtml(order.address)}</p>
<table style="border-collapse:collapse;width:100%">${lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${escapeHtml(l.name)} × ${l.qty}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${formatUah(l.sum)}</td></tr>`,
    )
    .join("")}</table>
${discount ? `<p>Знижка за оплату карткою: −${formatUah(discount)}</p>` : ""}
<p style="font-size:17px"><b>Разом: ${formatUah(total)}</b> (${paymentLabel})</p>
${order.comment ? `<p>Коментар: ${escapeHtml(order.comment)}</p>` : ""}
<p><a href="${link}" style="color:#b60016">Відкрити в адмінці</a></p></div>`;

  const results = await Promise.allSettled([
    sendTelegram(telegram),
    sendEmail(`Нове замовлення №${order.number} — ASSORTE`, html, plain),
  ]);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("[assorte] order notification failed:", r.reason);
  });
}

export async function notifyNewReview(r: { slug: string; name: string; rating: number; body: string }) {
  const link = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "assorte.vercel.app"}/admin/reviews`;
  const snippet = r.body.length > 300 ? `${r.body.slice(0, 300)}…` : r.body;
  const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
  const text = `⭐ <b>Новий відгук на модерації</b>\nТовар: ${escapeHtml(r.slug)}\n${stars} · ${escapeHtml(r.name)}\n${escapeHtml(snippet)}\n\n<a href="${link}">Переглянути й опублікувати</a>`;
  const plain = `Новий відгук на модерації\nТовар: ${r.slug}\n${stars} ${r.name}\n${snippet}\n${link}`;
  const results = await Promise.allSettled([
    sendTelegram(text),
    sendEmail("Новий відгук на модерації — ASSORTE", `<p>${escapeHtml(plain).replace(/\n/g, "<br>")}</p>`, plain),
  ]);
  results.forEach((x) => {
    if (x.status === "rejected") console.error("[assorte] review notification failed:", x.reason);
  });
}
