import { z } from "zod";

export const reviewSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  name: z.string().trim().min(2, "Вкажіть імʼя (від 2 символів).").max(60, "Імʼя: до 60 символів."),
  rating: z.coerce
    .number()
    .int("Оберіть оцінку від 1 до 5.")
    .min(1, "Оберіть оцінку від 1 до 5.")
    .max(5, "Оберіть оцінку від 1 до 5."),
  body: z.string().trim().min(10, "Відгук: від 10 символів.").max(2000, "Відгук: до 2000 символів."),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export function parseReviewForm(
  formData: FormData,
): { ok: true; data: ReviewInput } | { ok: false; error: string } {
  const r = reviewSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    rating: formData.get("rating"),
    body: formData.get("body"),
  });
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? "Перевірте поля форми." };
  return { ok: true, data: r.data };
}

// "4,5" style number for the average rating
export const formatRating = (value: number) => value.toFixed(1).replace(".", ",");

// 1 відгук, 2 відгуки, 5 відгуків
export function reviewsWord(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "відгук";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "відгуки";
  return "відгуків";
}
