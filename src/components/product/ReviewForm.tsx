"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewState } from "@/app/actions/review";

const initial: ReviewState = { status: "idle" };
const field = "mt-1.5 w-full rounded-[4px] border border-line bg-white px-4 text-[14px]";

export function ReviewForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(submitReview, initial);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state.status === "ok") {
    return (
      <p role="status" className="rounded-[6px] bg-[#e3f1e6] px-4 py-4 text-[14px] text-[#1f6b34]">
        Дякуємо! Відгук надіслано. Він зʼявиться на сторінці після перевірки.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-[6px] bg-white p-5">
      <h3 className="text-[18px]">Залишити відгук</h3>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating || ""} />
      {/* Anti-spam trap: real people never see or fill this field. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Сайт
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <p className="text-[13px]">Ваша оцінка</p>
        <div role="radiogroup" aria-label="Оцінка від 1 до 5" className="mt-1.5 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} з 5`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="p-0.5"
            >
              <svg viewBox="0 0 24 24" className="size-8" fill={n <= (hover || rating) ? "#B60016" : "#D9D3CB"} aria-hidden>
                <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <label className="block text-[13px]">
        Імʼя
        <input name="name" required minLength={2} maxLength={60} autoComplete="given-name" className={`${field} h-12`} />
      </label>
      <label className="block text-[13px]">
        Відгук
        <textarea name="body" required minLength={10} maxLength={2000} rows={4} className={`${field} py-3`} />
      </label>

      <p role="alert" className="min-h-5 text-[13px] text-red">
        {state.status === "error" ? state.message : rating === 0 && pending ? "Оберіть оцінку." : ""}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[4px] bg-red px-7 py-3.5 text-[15px] font-medium text-white disabled:opacity-60"
      >
        {pending ? "Надсилаємо…" : "Надіслати відгук"}
      </button>
      <p className="text-[12px] text-muted">Відгуки публікуються після перевірки. Ми не змінюємо оцінки й текст.</p>
    </form>
  );
}
