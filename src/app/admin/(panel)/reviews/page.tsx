import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Stars } from "@/components/product/Stars";
import { requireAdmin } from "@/lib/supabase-server";
import { deleteReview, setReviewStatus } from "@/app/admin/actions";

const tabs = [
  { id: "pending", label: "Очікують" },
  { id: "approved", label: "Опубліковані" },
  { id: "hidden", label: "Приховані" },
];

export default async function AdminReviews(props: PageProps<"/admin/reviews">) {
  const { supabase } = await requireAdmin();
  const { status } = await props.searchParams;
  const current = typeof status === "string" && tabs.some((t) => t.id === status) ? status : "pending";

  const [{ data: reviews }, counts] = await Promise.all([
    supabase
      .from("product_reviews")
      .select("id, author_name, rating, body, status, created_at, product:products(name, slug, variant_label)")
      .eq("status", current)
      .order("created_at", { ascending: false })
      .limit(200),
    Promise.all(
      tabs.map(async (t) => {
        const { count } = await supabase.from("product_reviews").select("id", { count: "exact", head: true }).eq("status", t.id);
        return [t.id, count ?? 0] as const;
      }),
    ),
  ]);
  const countOf = Object.fromEntries(counts);

  return (
    <>
      <h1 className="text-[28px]">Відгуки</h1>
      <p className="mt-2 max-w-[640px] text-[13px] leading-relaxed text-muted">
        Покупці залишають відгуки на сторінці товару. На сайті видно лише опубліковані. Текст і оцінку редагувати не можна:
        їх можна лише опублікувати, приховати або видалити.
      </p>
      <nav className="mt-5 flex flex-wrap gap-2" aria-label="Статус відгуків">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin/reviews?status=${t.id}`}
            aria-current={current === t.id ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-[13px] ${
              current === t.id ? "border-graphite bg-graphite text-white" : "border-line bg-white hover:border-graphite"
            }`}
          >
            {t.label} ({countOf[t.id] ?? 0})
          </Link>
        ))}
      </nav>

      {!reviews?.length ? (
        <p className="mt-8 text-muted">Тут поки порожньо.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reviews.map((r) => {
            const product = Array.isArray(r.product) ? r.product[0] : r.product;
            return (
              <li key={r.id} className="rounded-[6px] bg-white p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars rating={r.rating} className="text-[16px]" />
                  <span className="text-[14px] font-medium">{r.author_name}</span>
                  <span className="text-[12px] text-muted">
                    {new Date(r.created_at).toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
                {product && (
                  <p className="mt-1 text-[13px] text-muted">
                    Товар:{" "}
                    <Link href={`/products/${product.slug}`} className="underline underline-offset-2">
                      {product.name}
                      {product.variant_label ? ` — ${product.variant_label}` : ""}
                    </Link>
                  </p>
                )}
                <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.7]">{r.body}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {r.status !== "approved" && (
                    <form action={setReviewStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button type="submit" className="rounded-[4px] bg-red px-4 py-2.5 text-[13px] font-medium text-white">
                        Опублікувати
                      </button>
                    </form>
                  )}
                  {r.status !== "hidden" && (
                    <form action={setReviewStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="hidden" />
                      <button type="submit" className="rounded-[4px] border border-graphite px-4 py-2.5 text-[13px]">
                        Приховати
                      </button>
                    </form>
                  )}
                  <form action={deleteReview} className="ml-auto">
                    <input type="hidden" name="id" value={r.id} />
                    <DeleteButton label="Видалити" message="Видалити цей відгук назавжди?" />
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
