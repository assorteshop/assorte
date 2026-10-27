import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "./supabase";

export type Review = {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
};

export type ProductReviews = {
  count: number;
  average: number;
  items: Review[];
};

const EMPTY: ProductReviews = { count: 0, average: 0, items: [] };

// Only approved reviews reach this code (row security hides the rest from visitors).
// If the table does not exist yet, the page simply shows "no reviews".
export async function getProductReviews(productId: string): Promise<ProductReviews> {
  "use cache";
  cacheTag("reviews");
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  if (!supabase) return EMPTY;

  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, author_name, rating, body, created_at")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data?.length) return EMPTY;
  const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
  return { count: data.length, average, items: data.slice(0, 50) as Review[] };
}
