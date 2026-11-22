import { tepla } from "@/content/tepla";
import { getProductsBySlugs, type ProductCardData } from "./products";
import { oldPriceOf } from "./sale-price";

/** «Тепла п'ятниця» is on while at least one of its products is published with a sale price. */
export const isTeplaOn = (products: readonly { price_uah: number; old_price_uah?: number | null }[]) =>
  products.some((p) => oldPriceOf(p) !== null);

/** The page's products as they are in the admin, in the post's order. */
export async function getTeplaProducts(): Promise<ProductCardData[]> {
  return getProductsBySlugs(tepla.products.map((p) => p.slug));
}
