/** A red line drawn across a word as if by hand (slightly rising, uneven). Put it inside a `relative` box. */
export function HandStrike({ width = 2.2, className = "" }: { width?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute -left-[4%] top-[30%] h-[45%] w-[108%] overflow-visible ${className}`}
    >
      <path
        d="M2 15 C 14 14.5, 22 12, 34 11.6 S 55 9.5, 66 8.4 S 86 5.2, 98 4.6"
        fill="none"
        stroke="#B60016"
        strokeWidth={width}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
