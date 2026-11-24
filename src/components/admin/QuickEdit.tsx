"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { quickSetPrice, quickSetPublished } from "@/app/admin/actions";
import type { AdminProduct } from "@/lib/admin-products";
import { formatUah } from "@/lib/format";
import { fromPriceRow } from "@/lib/sale-price";

type Patch = Partial<Pick<AdminProduct, "price_uah" | "old_price_uah" | "is_published">>;

const field =
  "h-9 w-[76px] sm:w-[104px] rounded-[4px] border border-line bg-white px-2 text-right text-[14px] tabular-nums outline-none focus:border-graphite";

/** The price in a list row. Click it, type the new price (and the sale price if any), Enter saves. */
export function QuickPrice({ product, onSaved }: { product: AdminProduct; onSaved: (p: Patch) => void }) {
  const [editing, setEditing] = useState(false);
  const [regular, setRegular] = useState("");
  const [sale, setSale] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) firstRef.current?.select();
  }, [editing]);
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(t);
  }, [saved]);

  const open = () => {
    const v = fromPriceRow(product);
    setRegular(String(v.regular));
    setSale(v.sale === null ? "" : String(v.sale));
    setError(null);
    setEditing(true);
  };

  const save = () =>
    start(async () => {
      const res = await quickSetPrice(product.id, regular, sale);
      if ("error" in res) return setError(res.error);
      onSaved({ price_uah: res.price_uah, old_price_uah: res.old_price_uah });
      setEditing(false);
      setSaved(true);
    });

  const onSale = product.old_price_uah != null && product.old_price_uah > product.price_uah;

  if (!editing) {
    return (
      <button
        type="button"
        onClick={open}
        title="Змінити ціну"
        className="group shrink-0 rounded-[4px] px-2 py-1 text-right text-[14px] tabular-nums hover:bg-ivory"
      >
        {onSale && <span className="block text-[12px] text-muted line-through">{formatUah(product.old_price_uah!)}</span>}
        <span className={`border-b border-dashed border-muted/60 group-hover:border-graphite ${onSale ? "text-red" : ""}`}>
          {saved ? <Check size={13} className="mr-1 inline text-[#1f6b34]" aria-label="Збережено" /> : null}
          {formatUah(product.price_uah)}
        </span>
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
      className="shrink-0"
    >
      <div className="flex items-end gap-2">
        <label className="text-[11px] text-muted">
          Ціна
          <input ref={firstRef} value={regular} onChange={(e) => setRegular(e.target.value)} inputMode="numeric" className={`mt-0.5 block ${field}`} />
        </label>
        <label className="text-[11px] text-muted">
          Зі знижкою
          <input value={sale} onChange={(e) => setSale(e.target.value)} inputMode="numeric" placeholder="—" className={`mt-0.5 block ${field}`} />
        </label>
        <button type="submit" disabled={pending} aria-label="Зберегти ціну" className="grid size-9 place-items-center rounded-[4px] bg-graphite text-white disabled:opacity-50">
          <Check size={16} />
        </button>
        <button type="button" onClick={() => setEditing(false)} aria-label="Скасувати" className="grid size-9 place-items-center rounded-[4px] border border-line text-muted hover:text-graphite">
          <X size={16} />
        </button>
      </div>
      {error && <p className="mt-1 max-w-[300px] text-[12px] text-red">{error}</p>}
    </form>
  );
}

/** «Опубліковано / Чернетка» switch in a list row; saves at once. */
export function QuickPublish({ product, onSaved }: { product: AdminProduct; onSaved: (p: Patch) => void }) {
  const [pending, start] = useTransition();
  const on = product.is_published;

  const toggle = () =>
    start(async () => {
      onSaved({ is_published: !on });
      const res = await quickSetPublished(product.id, !on);
      if ("error" in res) {
        onSaved({ is_published: on });
        window.alert(res.error);
      }
    });

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      disabled={pending}
      title={on ? "Сховати з сайту (зробити чернеткою)" : "Показати на сайті"}
      className="inline-flex w-[132px] shrink-0 items-center gap-2 text-[12px] disabled:opacity-60"
    >
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-[#2f8a4a]" : "bg-[#d9d4ce]"}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left] ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
      <span className={on ? "text-[#1f6b34]" : "text-red"}>{on ? "Опубліковано" : "Чернетка"}</span>
    </button>
  );
}
