"use client";

import { Stars } from "./Stars";
import { formatRating, reviewsWord } from "@/lib/review-schema";

// Stars and the number of reviews under the price. A click opens the "Відгуки" tab.
export function ReviewsSummaryLink({ count, average }: { count: number; average: number }) {
  const open = () => {
    window.dispatchEvent(new CustomEvent("product-tab", { detail: "reviews" }));
    document.getElementById("product-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      onClick={open}
      className="mt-4 inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-left text-[14px] hover:text-red"
    >
      <Stars rating={count > 0 ? average : 0} />
      {count > 0 ? (
        <span>
          <strong className="font-medium">{formatRating(average)}</strong>{" "}
          <span className="text-muted underline underline-offset-4">
            {count} {reviewsWord(count)}
          </span>
        </span>
      ) : (
        <span className="text-muted underline underline-offset-4">Поки немає відгуків: залишити перший</span>
      )}
    </button>
  );
}
