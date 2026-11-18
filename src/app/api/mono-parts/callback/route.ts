import { notifyPayment } from "@/lib/notify";
import { createSupabaseService } from "@/lib/supabase-admin";
import { confirmPartsOrder, getPartsState, partsOutcome, verifyBody } from "@/lib/mono-parts";

// monobank «Покупка частинами» calls this address when the customer confirms the application in
// the app (then we confirm it, which starts the installment) or when it fails.
// Nothing is trusted until the signature matches our store secret; the state is then asked from
// monobank itself.
export async function POST(request: Request) {
  const body = await request.text();
  if (!verifyBody(body, request.headers.get("signature") ?? "", process.env.MONO_PARTS_SECRET ?? "")) {
    return new Response("bad signature", { status: 400 });
  }

  let monoId: string;
  try {
    monoId = String((JSON.parse(body) as { order_id?: unknown }).order_id ?? "");
  } catch {
    return new Response("bad data", { status: 400 });
  }
  if (!monoId) return new Response("bad data", { status: 400 });

  const supabase = createSupabaseService();
  const { data: order } = await supabase
    .from("orders")
    .select("id, number, total_uah, payment_method, payment_status")
    .eq("payment_ref", monoId)
    .maybeSingle();
  if (!order || order.payment_method !== "mono_parts") return new Response("unknown order", { status: 404 });
  if (order.payment_status === "paid") return new Response("ok");

  try {
    let state = await getPartsState(monoId);
    // The customer agreed in the app: confirm, which starts the installment and pays the shop.
    if (partsOutcome(state) === "confirm") state = await confirmPartsOrder(monoId);
    const result = partsOutcome(state);

    if (result === "paid") {
      await supabase
        .from("orders")
        .update({ payment_status: "paid", paid_at: new Date().toISOString() })
        .eq("id", order.id);
      await notifyPayment(order.number, order.total_uah).catch((e) =>
        console.error("[assorte] payment notification failed:", e),
      );
    } else if (result === "failed") {
      console.error("[assorte] mono parts failed", order.number, state.order_sub_state);
      await supabase.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
    }
  } catch (e) {
    console.error("[assorte] mono parts callback:", e);
    return new Response("try later", { status: 503 });
  }
  return new Response("ok");
}
