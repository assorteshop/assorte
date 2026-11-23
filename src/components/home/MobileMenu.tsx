"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { audiences, categories, hasSubsections } from "@/lib/categories";

type Item = { href: string; label: string };

export function MobileMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  // Like iPhone settings: «Каталог» slides to the categories, «Годинники» to «Для кого».
  const [level, setLevel] = useState<"main" | "catalog" | string>("main");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setLevel("main");
  };
  const row = "flex w-full items-center justify-between py-4 text-left text-base";
  const sub = level !== "main" && level !== "catalog" ? categories.find((c) => c.slug === level) : undefined;

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Закрити меню" : "Відкрити меню"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => (open ? close() : setOpen(true))}
        className="p-1"
      >
        {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Закрити меню"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-x-0 bottom-0 top-16 bg-graphite/40"
          />
          <nav
            id="mobile-menu"
            aria-label="Мобільна навігація"
            className="absolute inset-x-0 top-16 max-h-[calc(100dvh-64px)] overflow-y-auto border-t border-line bg-white px-5 pb-6 pt-2 text-graphite"
          >
            {level === "main" && (
              <ul>
                {items.map((item) =>
                  item.href === "/catalog" ? (
                    <li key={item.href} className="border-b border-line">
                      <button type="button" onClick={() => setLevel("catalog")} className={row}>
                        {item.label} <ChevronRight size={18} strokeWidth={1.5} className="text-muted" />
                      </button>
                    </li>
                  ) : (
                    <li key={item.href} className="border-b border-line">
                      <Link href={item.href} onClick={close} className="block py-4 text-base">
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            )}
            {level === "catalog" && (
              <div className="animate-[menu-in_.25s_ease-out]">
                <button type="button" onClick={() => setLevel("main")} className="flex items-center gap-1 py-3 text-[14px] text-muted">
                  <ChevronLeft size={16} /> Меню
                </button>
                <ul>
                  <li className="border-b border-line">
                    <Link href="/catalog" onClick={close} className="block py-4 text-base">Усі товари</Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.slug} className="border-b border-line">
                      {hasSubsections(c.slug) ? (
                        <button type="button" onClick={() => setLevel(c.slug)} className={row}>
                          {c.name} <ChevronRight size={18} strokeWidth={1.5} className="text-muted" />
                        </button>
                      ) : (
                        <Link href={`/catalog/${c.slug}`} onClick={close} className="block py-4 text-base">
                          {c.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sub && (
              <div className="animate-[menu-in_.25s_ease-out]">
                <button type="button" onClick={() => setLevel("catalog")} className="flex items-center gap-1 py-3 text-[14px] text-muted">
                  <ChevronLeft size={16} /> Каталог
                </button>
                <p className="pb-2 pt-1 font-heading text-[26px] font-bold">{sub.name}</p>
                <ul>
                  <li className="border-b border-line">
                    <Link href={`/catalog/${sub.slug}`} onClick={close} className="block py-4 text-base">Усі</Link>
                  </li>
                  {audiences.map((a) => (
                    <li key={a.slug} className="border-b border-line">
                      <Link href={`/catalog/${sub.slug}/${a.slug}`} onClick={close} className="block py-4 text-base">
                        {a.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              href="/checkout"
              onClick={close}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red px-5 py-3 text-[14px] font-medium text-white"
            >
              Оформити замовлення <ArrowRight size={14} />
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}
