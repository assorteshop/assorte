import { notifyPayment } from "@/lib/notify";
import { createSupabaseService } from "@/lib/supabase-admin";
import { getInvoiceStatus, outcome, toKop, verifyWebhook } from "@/lib/mono";

// monobank calls this address when a payment changes state.
// Nothing is trusted until the signature matches monobank's key; then the current state is asked
// from monobank itself, so webhooks that arrive late or out of order cannot undo a payment.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-sign") ?? "";

  let valid = false;
  try {
    valid = await verifyWebhook(body, signature);
  } catch (e) {
    console.error("[assorte] mono pubkey failed:", e);
    return new Response("try later", { status: 503 }); // monobank retries
  }
  if (!valid) return new Response("bad signature", { status: 400 });

  let invoiceId: string;
  try {
    invoiceId = String((JSON.parse(body) as { invoiceId?: unknown }).invoiceId ?? "");
  } catch {
    return new Response("bad data", { status: 400 });
  }
  if (!invoiceId) return new Response("bad data", { status: 400 });

  let invoice;
  try {
    invoice = await getInvoiceStatus(invoiceId);
  } catch (e) {
    console.error("[assorte] mono status failed:", e);
    return new Response("try later", { status: 503 });
  }

  const result = outcome(invoice.status);
  if (result === "wait") return new Response("ok");

  const number = Number(invoice.reference);
  if (!Number.isInteger(number)) return new Response("bad order", { status: 400 });

  const supabase = createSupabaseService();
  const { data: order } = await supabase
    .from("orders")
    .select("id, total_uah, payment_method, payment_status")
    .eq("number", number)
    .maybeSingle();

  if (!order || order.payment_method !== "mono") return new Response("unknown order", { status: 404 });
  if (order.payment_status === "paid") return new Response("ok");

  if (result === "paid") {
    // The amount and currency must match what the shop calculated for this order.
    if (invoice.ccy !== 980 || invoice.amount !== toKop(order.total_uah)) {
      console.error("[assorte] mono amount mismatch", number, invoice.amount, invoice.ccy);
      return new Response("amount mismatch", { status: 400 });
    }
    await supabase
      .from("orders")
      .update({ payment_status: "paid", paid_at: new Date().toISOString() })
      .eq("id", order.id);
    await notifyPayment(number, order.total_uah).catch((e) =>
      console.error("[assorte] payment notification failed:", e),
    );
  } else {
    await supabase.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
  }
  return new Response("ok");
}
