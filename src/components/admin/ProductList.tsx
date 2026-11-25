"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, Search, X } from "lucide-react";
import { audiences, categories, getCategory, hasSubsections } from "@/lib/categories";
import { QuickPrice, QuickPublish } from "./QuickEdit";
import { ReorderList } from "./ReorderList";
import {
  type AdminProduct,
  canReorder,
  countByCategory,
  filterProducts,
  filterToQuery,
  type ListFilter,
  SHOWS,
} from "@/lib/admin-products";

// The admin «Товари» list: search, category tabs (with «Для кого» for watches) and «Показати».
// Everything filters on the spot; the filter is kept in the address, so after editing a product
// «Назад» brings you back to the same place.
export function ProductList({ products: initialProducts, initial }: { products: AdminProduct[]; initial: ListFilter }) {
  const [products, setProducts] = useState(initialProducts);
  const patch = (id: string) => (p: Partial<AdminProduct>) =>
    setProducts((list) => list.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const [f, setF] = useState<ListFilter>(initial);
  const [ordering, setOrdering] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<ListFilter>) => setF((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}${filterToQuery(f)}`);
  }, [f]);

  // «/» jumps to the search box, like on many sites.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const shown = useMemo(() => filterProducts(products, f), [products, f]);
  const counts = useMemo(() => countByCategory(products, f), [products, f]);
  const hasNoCategory = products.some((p) => !p.category);
  const back = filterToQuery(f);
  const filtered = f.q.trim() !== "" || f.cat !== "" || f.show !== "all";

  const tab = (on: boolean) =>
    `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
      on ? "border-graphite bg-graphite text-white" : "border-line bg-white hover:border-graphite"
    }`;
  const count = (n: number | undefined, on: boolean) => (
    <span className={`text-[12px] ${on ? "text-white/70" : "text-muted"}`}>{n ?? 0}</span>
  );

  const catTabs = [
    { slug: "", name: "Усі" },
    ...categories.map((c) => ({ slug: c.slug as string, name: c.name })),
    ...(hasNoCategory ? [{ slug: "none", name: "Без категорії" }] : []),
  ];

  const sectionTitle = [
    getCategory(f.cat)?.name,
    f.aud && audiences.find((a) => a.slug === f.aud)?.name,
  ].filter(Boolean).join(" · ");

  if (ordering) {
    return (
      <ReorderList
        title={sectionTitle}
        products={shown}
        onCancel={() => setOrdering(false)}
        onSaved={(orders) => {
          const next = new Map(orders.map((o) => [o.id, o.sort_order]));
          setProducts((list) =>
            list
              .map((x) => (next.has(x.id) ? { ...x, sort_order: next.get(x.id)! } : x))
              .sort((a, b) => a.sort_order - b.sort_order),
          );
          setOrdering(false);
        }}
      />
    );
  }

  return (
    <div className="mt-6">
      <label className="relative block">
        <span className="sr-only">Пошук товару</span>
        <Search size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          ref={searchRef}
          type="search"
          value={f.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Пошук за назвою або артикулом"
          className="h-12 w-full rounded-[6px] border border-line bg-white pr-12 pl-11 text-[15px] outline-none focus:border-graphite"
        />
        {f.q && (
          <button
            type="button"
            onClick={() => {
              set({ q: "" });
              searchRef.current?.focus();
            }}
            aria-label="Очистити пошук"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-muted hover:text-graphite"
          >
            <X size={16} />
          </button>
        )}
      </label>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Категорія">
        {catTabs.map((c) => {
          const on = f.cat === c.slug;
          return (
            <button key={c.slug || "all"} type="button" aria-pressed={on} onClick={() => set({ cat: c.slug, aud: "" })} className={tab(on)}>
              {c.name} {count(counts[c.slug], on)}
            </button>
          );
        })}
      </div>

      {hasSubsections(f.cat) && (
        <div className="mt-3 flex flex-wrap gap-5 border-b border-line" role="group" aria-label="Для кого">
          {[{ slug: "", name: "Усі" }, ...audiences].map((a) => {
            const on = f.aud === a.slug;
            const n = a.slug ? counts[`${f.cat}/${a.slug}`] : counts[f.cat];
            return (
              <button
                key={a.slug || "all"}
                type="button"
                aria-pressed={on}
                onClick={() => set({ aud: a.slug })}
                className={`-mb-px border-b-2 pb-2 text-[14px] ${on ? "border-red text-graphite" : "border-transparent text-muted hover:text-graphite"}`}
              >
                {a.name} <span className="text-[12px] text-muted">{n ?? 0}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]" role="group" aria-label="Показати">
        <span className="text-muted">Показати:</span>
        {SHOWS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={f.show === s.id}
            onClick={() => set({ show: s.id })}
            className={f.show === s.id ? "font-medium text-red" : "text-muted hover:text-graphite"}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-5 flex items-center gap-3 text-[13px] text-muted">
        Знайдено: {shown.length} з {products.length}
        {filtered && (
          <button type="button" onClick={() => setF({ q: "", cat: "", aud: "", show: "all" })} className="underline underline-offset-4 hover:text-graphite">
            Скинути все
          </button>
        )}
        {!f.cat && <span className="ml-auto text-[12px]">Щоб змінити порядок, оберіть категорію.</span>}
        {canReorder(f) && shown.length > 1 && (
          <button
            type="button"
            onClick={() => setOrdering(true)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-[4px] border border-line bg-white px-3.5 py-2 text-[13px] text-graphite hover:border-graphite"
          >
            <ArrowUpDown size={14} /> Змінити порядок
          </button>
        )}
      </p>

      {!shown.length ? (
        <p className="mt-4 rounded-[6px] bg-white px-4 py-10 text-center text-muted">Нічого не знайдено. Спробуйте інше слово або «Скинути все».</p>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-[6px] bg-white">
          {shown.map((p) => {
            const photo = p.image_url ?? p.images?.find(Boolean) ?? null;
            const audience = audiences.find((a) => a.slug === p.audience);
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap">
                <Link
                  href={`/admin/products/${p.id}${back ? `?back=${encodeURIComponent(back)}` : ""}`}
                  className="group flex min-w-0 flex-1 basis-full items-center gap-4 sm:basis-auto"
                >
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                    <img src={photo} alt="" loading="lazy" className="size-14 shrink-0 rounded-[4px] bg-ivory object-contain" />
                  ) : (
                    <span className="grid size-14 shrink-0 place-items-center rounded-[4px] bg-ivory text-[10px] text-muted">без фото</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] group-hover:text-red">
                      {p.name}
                      {p.variant_label && <span className="text-muted"> — {p.variant_label}</span>}
                    </span>
                    <span className="block text-[12px] text-muted">
                      {(p.category && getCategory(p.category)?.name) ?? "Без категорії"}
                      {audience && ` · ${audience.name}`}
                      {p.article ? ` · арт. ${p.article}` : ""}
                      {p.is_featured && " · На головній"}
                    </span>
                  </span>
                </Link>
                <div className="ml-[72px] flex flex-wrap items-center gap-x-4 gap-y-2 sm:ml-0 sm:flex-nowrap">
                  <QuickPrice product={p} onSaved={patch(p.id)} />
                  <QuickPublish product={p} onSaved={patch(p.id)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
