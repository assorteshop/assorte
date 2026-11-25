"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { reorderProducts } from "@/app/admin/actions";
import type { AdminProduct } from "@/lib/admin-products";
import { moveInOrder } from "@/lib/featured-order";

// «Змінити порядок» mode of the «Товари» list: drag a product by ⋮⋮ (computer) or use the arrows
// (phone), then «Зберегти порядок». The order here is the order on the site in this category.
export function ReorderList({
  title,
  products,
  onSaved,
  onCancel,
}: {
  title: string;
  products: AdminProduct[];
  onSaved: (orders: { id: string; sort_order: number }[]) => void;
  onCancel: () => void;
}) {
  const [ids, setIds] = useState(() => products.map((p) => p.id));
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const byId = new Map(products.map((p) => [p.id, p]));
  const changed = ids.some((id, i) => id !== products[i]?.id);

  const save = () =>
    start(async () => {
      setError(null);
      const res = await reorderProducts(ids);
      if ("error" in res) return setError(res.error);
      onSaved(res.orders ?? []);
    });

  const arrow = "grid size-9 place-items-center rounded-[4px] border border-line bg-white text-muted hover:text-graphite disabled:opacity-30";

  return (
    <div className="mt-6">
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center gap-3 bg-ivory px-1 py-3">
        <div className="min-w-0 flex-1 basis-full sm:basis-auto">
          <p className="text-[17px] font-medium">Порядок: {title}</p>
          <p className="text-[13px] text-muted">
            Перетягніть товар за <GripVertical size={13} className="inline" aria-label="ручку" /> або натискайте стрілки. Так товари стоятимуть на сайті.
          </p>
        </div>
        <button type="button" onClick={onCancel} className="rounded-[4px] border border-line bg-white px-4 py-2.5 text-[13px] hover:border-graphite">
          Скасувати
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!changed || pending}
          className="rounded-[4px] bg-red px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-40"
        >
          {pending ? "Зберігаю…" : "Зберегти порядок"}
        </button>
      </div>
      {error && <p className="mt-1 text-[13px] text-red">{error}</p>}

      <ol className="mt-2 divide-y divide-line rounded-[6px] bg-white">
        {ids.map((id, i) => {
          const p = byId.get(id)!;
          const photo = p.image_url ?? p.images?.find(Boolean) ?? null;
          return (
            <li
              key={id}
              draggable
              onDragStart={(e) => {
                setDragId(id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragId && dragId !== id) {
                  setIds((list) => {
                    const next = list.filter((x) => x !== dragId);
                    next.splice(list.indexOf(id), 0, dragId);
                    return next;
                  });
                }
              }}
              onDragEnd={() => setDragId(null)}
              className={`flex items-center gap-3 px-3 py-2.5 ${dragId === id ? "bg-ivory opacity-60" : ""}`}
            >
              <span className="hidden cursor-grab text-muted active:cursor-grabbing sm:block" aria-hidden>
                <GripVertical size={18} />
              </span>
              <span className="w-7 shrink-0 text-right text-[13px] tabular-nums text-muted">{i + 1}</span>
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                <img src={photo} alt="" draggable={false} className="size-11 shrink-0 rounded-[4px] bg-ivory object-contain" />
              ) : (
                <span className="size-11 shrink-0 rounded-[4px] bg-ivory" />
              )}
              <span className="min-w-0 flex-1 select-none">
                <span className="block truncate text-[14px]">
                  {p.name}
                  {p.variant_label && <span className="text-muted"> — {p.variant_label}</span>}
                </span>
                {!p.is_published && <span className="text-[12px] text-red">Чернетка</span>}
              </span>
              <button type="button" disabled={i === 0} onClick={() => setIds((l) => moveInOrder(l, id, "up"))} aria-label="Вище" className={arrow}>
                <ArrowUp size={16} />
              </button>
              <button type="button" disabled={i === ids.length - 1} onClick={() => setIds((l) => moveInOrder(l, id, "down"))} aria-label="Нижче" className={arrow}>
                <ArrowDown size={16} />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
