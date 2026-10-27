import { formatRating } from "@/lib/review-schema";

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z";

function Row({ color }: { color: string }) {
  return (
    <span className="flex shrink-0">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="size-[1em] shrink-0" fill={color} aria-hidden>
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}

// Shows a rating from 0 to 5 as stars (partial stars are drawn partly). Only real, approved
// reviews are ever passed in here.
export function Stars({ rating, className = "text-[18px]" }: { rating: number; className?: string }) {
  const pct = Math.max(0, Math.min(5, rating)) * 20;
  return (
    <span
      role="img"
      aria-label={rating > 0 ? `Рейтинг ${formatRating(rating)} з 5` : "Ще без оцінок"}
      className={`relative inline-flex leading-none ${className}`}
    >
      <Row color="#D9D3CB" />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <Row color="#B60016" />
      </span>
    </span>
  );
}
