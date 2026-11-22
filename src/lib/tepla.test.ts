import { describe, expect, it } from "vitest";
import { isTeplaOn } from "./tepla";

describe("«Тепла п'ятниця» on / off", () => {
  it("is on while at least one product has a sale price", () => {
    expect(isTeplaOn([{ price_uah: 20300, old_price_uah: 23100 }, { price_uah: 17600, old_price_uah: null }])).toBe(true);
  });
  it("is off when the sale prices are removed or the products are hidden", () => {
    expect(isTeplaOn([{ price_uah: 23100, old_price_uah: null }, { price_uah: 17600 }])).toBe(false);
    expect(isTeplaOn([])).toBe(false);
  });
});
