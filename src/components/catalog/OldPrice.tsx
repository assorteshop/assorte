import { formatUah } from "@/lib/format";

/**
 * The earlier price, crossed out by a red stroke that looks drawn by hand (a slightly rising,
 * uneven line instead of a straight strikethrough).
 */
export function OldPrice({ value, className = "" }: { value: number; className?: string }) {
  return (
    <del className={`relative inline-block whitespace-nowrap text-muted no-underline ${className}`}>
      <span className="sr-only">Стара ціна: </span>
      {formatUah(value)}
      <svg
        aria-hidden
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -left-[6%] top-[18%] h-[70%] w-[112%] overflow-visible"
      >
        <path
          d="M2 15 C 14 14.5, 22 12, 34 11.6 S 55 9.5, 66 8.4 S 86 5.2, 98 4.6"
          fill="none"
          stroke="#B60016"
          strokeWidth="2.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </del>
  );
}
