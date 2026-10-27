"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

type Item = { href: string; label: string };

export function MobileMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);

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

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Закрити меню" : "Відкрити меню"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
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
            className="absolute inset-x-0 top-16 border-t border-line bg-white px-5 pb-6 pt-2"
          >
            <ul>
              {items.map((item) => (
                <li key={item.href} className="border-b border-line">
                  <Link href={item.href} onClick={close} className="block py-4 text-base">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/checkout"
              onClick={close}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[4px] bg-red px-5 py-3 text-[14px] font-medium text-white"
            >
              Оформити замовлення <ArrowRight size={14} />
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}
