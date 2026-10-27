import { formatRating, reviewsWord } from "@/lib/review-schema";
import type { ProductReviews } from "@/lib/reviews";
import { ReviewForm } from "./ReviewForm";
import { Stars } from "./Stars";

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });

export function ReviewsPanel({ slug, reviews }: { slug: string; reviews: ProductReviews }) {
  return (
    <div className="space-y-8">
      {reviews.count > 0 ? (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-heading text-[40px] leading-none">{formatRating(reviews.average)}</p>
            <div>
              <Stars rating={reviews.average} className="text-[22px]" />
              <p className="mt-1 text-[13px] text-muted">
                {reviews.count} {reviewsWord(reviews.count)}
              </p>
            </div>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {reviews.items.map((r) => (
              <li key={r.id} className="py-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars rating={r.rating} className="text-[16px]" />
                  <span className="text-[14px] font-medium">{r.author_name}</span>
                  <span className="text-[12px] text-muted">{date(r.created_at)}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-[15px] leading-[1.7]">{r.body}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-[15px] text-muted">Відгуків поки немає. Станьте першим, хто поділиться враженнями.</p>
      )}
      <ReviewForm slug={slug} />
    </div>
  );
}
