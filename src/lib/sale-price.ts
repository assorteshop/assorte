// Sale price. In the database `price_uah` is always what the customer pays (the cart, orders and
// payments use only it); `old_price_uah` is the earlier price shown crossed out, or null.
// The admin form shows «Ціна» (the regular price) and «Ціна зі знижкою» (optional).

export type PriceRow = { price_uah: number; old_price_uah: number | null };

/** Form values → database row. Returns an error text when the sale price is not lower. */
export function toPriceRow(regular: number, sale: number | null): PriceRow | { error: string } {
  if (sale === null) return { price_uah: regular, old_price_uah: null };
  if (sale >= regular) return { error: "Ціна зі знижкою має бути меншою за звичайну ціну." };
  return { price_uah: sale, old_price_uah: regular };
}

/** Database row → form values. */
export function fromPriceRow(row: { price_uah: number; old_price_uah?: number | null }) {
  const old = row.old_price_uah ?? null;
  return old !== null && old > row.price_uah
    ? { regular: old, sale: row.price_uah as number | null }
    : { regular: row.price_uah, sale: null as number | null };
}

/** The crossed-out price to show, or null when there is no real discount. */
export const oldPriceOf = (p: { price_uah: number; old_price_uah?: number | null }) =>
  p.old_price_uah != null && p.old_price_uah > p.price_uah ? p.old_price_uah : null;
