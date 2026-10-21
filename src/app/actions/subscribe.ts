"use server";

import { supabase } from "@/lib/supabase";

export type SubscribeState = { status: "idle" | "ok" | "error"; message: string };

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Перевірте адресу email." };
  }
  if (!supabase) {
    return { status: "error", message: "Підписка тимчасово недоступна." };
  }
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });
  // 23505 = already subscribed; treat as success
  if (error && error.code !== "23505") {
    return { status: "error", message: "Не вдалося підписатися. Спробуйте пізніше." };
  }
  return { status: "ok", message: "Дякуємо! Ви підписані." };
}
