import { describe, expect, it } from "vitest";
import { fromPriceRow, oldPriceOf, toPriceRow } from "./sale-price";

describe("sale price", () => {
  it("without a sale price the regular one is charged and nothing is crossed out", () => {
    expect(toPriceRow(4790, null)).toEqual({ price_uah: 4790, old_price_uah: null });
    expect(oldPriceOf({ price_uah: 4790, old_price_uah: null })).toBeNull();
  });
  it("with a sale price the customer pays it and the regular one is crossed out", () => {
    expect(toPriceRow(4790, 3990)).toEqual({ price_uah: 3990, old_price_uah: 4790 });
    expect(oldPriceOf({ price_uah: 3990, old_price_uah: 4790 })).toBe(4790);
  });
  it("refuses a sale price that is not lower", () => {
    expect(toPriceRow(4790, 4790)).toHaveProperty("error");
    expect(toPriceRow(4790, 5000)).toHaveProperty("error");
  });
  it("fills the admin form back from the row", () => {
    expect(fromPriceRow({ price_uah: 3990, old_price_uah: 4790 })).toEqual({ regular: 4790, sale: 3990 });
    expect(fromPriceRow({ price_uah: 4790, old_price_uah: null })).toEqual({ regular: 4790, sale: null });
    expect(fromPriceRow({ price_uah: 4790 })).toEqual({ regular: 4790, sale: null });
  });
});
