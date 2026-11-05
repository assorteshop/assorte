import Link from "next/link";
import { Heart } from "@/components/brand/Heart";

// Logo: the hand-drawn heart and ASSORTE. The heart is red unless the header asks for white (over a photo).
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="ASSORTE — на головну"
      className={`inline-flex items-center gap-2.5 font-heading font-medium uppercase tracking-[0.28em] ${className}`}
    >
      <Heart className="h-[1.45em] w-auto shrink-0 text-[var(--logo-heart,#b60016)] transition-colors" />
      <span>Assorte</span>
    </Link>
  );
}
