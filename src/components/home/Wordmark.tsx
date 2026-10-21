import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="ASSORTE — на головну"
      className={`font-heading font-medium uppercase tracking-[0.28em] ${className}`}
    >
      Assorte
    </Link>
  );
}
