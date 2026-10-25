import { notifyPayment } from "@/lib/notify";
import { createSupabaseService } from "@/lib/supabase-admin";
import { decodeCallback, isSandbox, verifyCallback } from "@/lib/liqpay";

// LiqPay calls this address after every payment attempt.
// Nothing is trusted until the signature matches our private key.
export async function POST(request: Request) {
  const form = await request.formData();
  const data = String(form.get("data") ?? "");
  const signature = String(form.get("signature") ?? "");

  if (!verifyCallback(data, signature)) {
    return new Response("bad signature", { status: 400 });
  }

  let payload;
  try {
    payload = decodeCallback(data);
  } catch {
    return new Response("bad data", { status: 400 });
  }

  const number = Number(payload.order_id);
  if (!Number.isInteger(number)) return new Response("bad order", { status: 400 });

  const paid =
    payload.status === "success" || (isSandbox() && payload.status === "sandbox");
  const failed = payload.status === "failure" || payload.status === "error";
  if (!paid && !failed) return new Response("ok"); // still processing

  const supabase = createSupabaseService();
  const { data: order } = await supabase
    .from("orders")
    .select("id, total_uah, payment_method, payment_status")
    .eq("number", number)
    .maybeSingle();

  if (!order || order.payment_method !== "liqpay") return new Response("unknown order", { status: 404 });
  if (order.payment_status === "paid") return new Response("ok");

  if (paid) {
    // The amount and currency must match what the shop calculated for this order.
    if (payload.currency !== "UAH" || Number(payload.amount) !== order.total_uah) {
      console.error("[assorte] liqpay amount mismatch", number, payload.amount, payload.currency);
      return new Response("amount mismatch", { status: 400 });
    }
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        liqpay_payment_id: payload.payment_id ? String(payload.payment_id) : null,
      })
      .eq("id", order.id);
    await notifyPayment(number, order.total_uah).catch((e) =>
      console.error("[assorte] payment notification failed:", e),
    );
  } else {
    await supabase.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
  }
  return new Response("ok");
}
