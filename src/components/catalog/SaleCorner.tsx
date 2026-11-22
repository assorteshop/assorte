/**
 * «АКЦІЯ» in the top-left corner of a product photo when the product has a sale price.
 * It sits flush in the corner; the photo's own rounded, clipped corner gives it its shape.
 */
export function SaleCorner({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute left-0 top-0 z-[1] rounded-br-[22px] bg-red font-heading font-bold uppercase tracking-[0.14em] text-white ${
        large ? "pb-3 pl-6 pr-6 pt-4 text-[15px]" : "pb-2.5 pl-6 pr-5 pt-4 text-[13px]"
      }`}
    >
      Акція
    </span>
  );
}
