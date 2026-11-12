import { formatUah } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";
import { setOrderStatus } from "@/app/admin/actions";
import { OrderMessage } from "@/components/admin/OrderMessage";
import { CONTACT_CHANNELS, parseContact } from "@/lib/order-message";
import { firstTouchLabel } from "@/lib/analytics";

const statuses: Record<string, string> = {
  new: "Нове",
  confirmed: "Підтверджено",
  shipped: "Відправлено",
  done: "Виконано",
  cancelled: "Скасовано",
};

export default async function AdminOrders() {
  const { supabase } = await requireAdmin();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, number, customer_name, phone, email, city, delivery_address, comment, total_uah, status, delivery_method, discount_uah, payment_method, payment_status, created_at, order_items(id, name, qty, price_uah, line_total)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  // The order source lives in a separate column added later (supabase/migration-first-touch.sql).
  // It is read on its own, so the order list keeps working before that SQL is run.
  const sources = new Map<string, string>();
  if (orders?.length) {
    const { data: ft } = await supabase
      .from("orders")
      .select("id, first_touch")
      .in("id", orders.map((o) => o.id));
    for (const row of (ft ?? []) as { id: string; first_touch: unknown }[]) {
      const label = firstTouchLabel(row.first_touch);
      if (label) sources.set(row.id, label);
    }
  }

  return (
    <>
      <h1 className="text-[28px]">Замовлення</h1>
      {!orders?.length ? (
        <p className="mt-8 text-muted">Замовлень ще немає.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => {
            const contact = parseContact(o.comment);
            return (
            <li key={o.id} className="rounded-[6px] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[16px] font-medium">
                  №{o.number}{" "}
                  <span className="ml-2 text-[13px] font-normal text-muted">
                    {new Date(o.created_at).toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </p>
                <p className="text-[16px] font-medium">{formatUah(o.total_uah)}</p>
              </div>
              <p className="mt-2 text-[14px]">
                {o.customer_name} ·{" "}
                <a href={`tel:${o.phone}`} className="text-red">{o.phone}</a>
                {o.email && <> · {o.email}</>}
              </p>
              <p className="text-[13px] text-muted">
                {o.delivery_method === "ukrposhta" ? "Укрпошта" : "Нова пошта"}: {o.city}, {o.delivery_address}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                Джерело: {sources.get(o.id) ?? "невідомо"}
              </p>
              <p className="mt-1 text-[13px]">
                {o.payment_method === "mono"
                  ? "Оплата карткою (monobank): "
                  : o.payment_method === "liqpay"
                    ? "Онлайн-оплата (LiqPay): "
                    : "Оплата при отриманні"}
                {o.payment_method !== "cod" && (
                  <span className={o.payment_status === "paid" ? "font-medium text-[#1f6b34]" : "font-medium text-red"}>
                    {o.payment_status === "paid" ? "оплачено" : o.payment_status === "failed" ? "помилка оплати" : "очікує оплати"}
                  </span>
                )}
              </p>
              {contact.channel && (
                <p className="mt-1 text-[13px]">
                  Клієнт обрав: <span className="font-medium">{CONTACT_CHANNELS.find((c) => c.id === contact.channel)?.label}</span>
                </p>
              )}
              {contact.rest && <p className="mt-1 whitespace-pre-line text-[13px]">Коментар: {contact.rest}</p>}
              <ul className="mt-3 space-y-1 border-t border-line pt-3 text-[13px]">
                {o.order_items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-4">
                    <span>{it.name} × {it.qty}</span>
                    <span>{formatUah(it.line_total)}</span>
                  </li>
                ))}
              </ul>
              <OrderMessage order={o} preferred={contact.channel} />
              <form action={setOrderStatus} className="mt-4 flex items-center gap-3">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="h-10 rounded-[4px] border border-line bg-white px-3 text-[13px]">
                  {Object.entries(statuses).map(([value, text]) => (
                    <option key={value} value={value}>{text}</option>
                  ))}
                </select>
                <button type="submit" className="rounded-[4px] bg-graphite px-4 py-2.5 text-[13px] text-white">
                  Зберегти статус
                </button>
              </form>
            </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
