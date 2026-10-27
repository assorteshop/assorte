"use server";

import { after } from "next/server";
import { notifyNewReview } from "@/lib/notify";
import { parseReviewForm } from "@/lib/review-schema";
import { supabase } from "@/lib/supabase";

export type ReviewState = { status: "idle" } | { status: "error"; message: string } | { status: "ok" };

export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  // Hidden field that people never fill but simple spam bots do.
  if (String(formData.get("website") ?? "").trim() !== "") return { status: "ok" };

  const parsed = parseReviewForm(formData);
  if (!parsed.ok) return { status: "error", message: parsed.error };
  if (!supabase) return { status: "error", message: "Відгуки тимчасово недоступні." };

  const { slug, name, rating, body } = parsed.data;
  const { error } = await supabase.rpc("submit_review", {
    p_product_slug: slug,
    p_name: name,
    p_rating: rating,
    p_body: body,
  });
  if (error) {
    console.error("[assorte] submit_review failed:", error.message);
    return { status: "error", message: "Не вдалося надіслати відгук. Спробуйте пізніше." };
  }

  after(() => notifyNewReview({ slug, name, rating, body }).catch((e) => console.error("[assorte] review notice failed:", e)));
  return { status: "ok" };
}
