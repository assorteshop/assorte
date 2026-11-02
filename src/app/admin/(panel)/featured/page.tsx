import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { moveFeatured } from "@/app/admin/actions";
import { formatUah } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase-server";

const arrow = "grid size-9 place-items-center rounded-[4px] border border-line hover:border-graphite disabled:opacity-30 disabled:hover:border-line";

export default async function AdminFeatured() {
  const { supabase } = await requireAdmin();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_uah, is_published, image_url, variant_label")
    .eq("is_featured", true)
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  return (
    <>
      <h1 className="text-[28px]">Популярні товари</h1>
      <p className="mt-2 max-w-[640px] text-[13px] leading-relaxed text-muted">
        Так товари стоять у слайдері на головній: зверху вниз це зліва направо. Новий товар зʼявляється тут у кінці, коли
        в його картці відмічено «Показувати у слайдері». Щоб прибрати товар зі слайдера, зніміть цю позначку в його картці.
      </p>

      {!products?.length ? (
        <p className="mt-8 text-muted">Поки немає жодного товару. Відмітьте галочку в картці товару.</p>
      ) : (
        <ol className="mt-6 divide-y divide-line rounded-[6px] bg-white">
          {products.map((p, i) => (
            <li key={p.id} className="flex items-center gap-4 px-4 py-3">
              <span className="w-6 text-center text-[14px] text-muted">{i + 1}</span>
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt="" className="size-14 rounded-[4px] bg-ivory object-contain" />
              ) : (
                <span className="size-14 rounded-[4px] bg-ivory" />
              )}
              <Link href={`/admin/products/${p.id}`} className="min-w-0 flex-1 hover:text-red">
                <span className="block truncate text-[15px]">
                  {p.name}
                  {p.variant_label && <span className="text-muted"> — {p.variant_label}</span>}
                </span>
                <span className="block text-[12px] text-muted">
                  {formatUah(p.price_uah)}
                  {!p.is_published && <span className="text-red"> · Чернетка, на сайті не видно</span>}
                </span>
              </Link>
              <form action={moveFeatured} className="flex gap-2">
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" name="dir" value="up" disabled={i === 0} aria-label={`Підняти: ${p.name}`} className={arrow}>
                  <ArrowUp size={16} />
                </button>
                <button type="submit" name="dir" value="down" disabled={i === products.length - 1} aria-label={`Опустити: ${p.name}`} className={arrow}>
                  <ArrowDown size={16} />
                </button>
              </form>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
