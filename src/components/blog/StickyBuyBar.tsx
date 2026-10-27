"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

// Mobile only: after 30% of the article, a slim bar with the main product and "Купити".
export function StickyBuyBar({ name, price, href }: { name: string; price: string; href: string }) {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(max > 0 && window.scrollY / max > 0.3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (closed || !visible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 py-3 md:hidden" role="region" aria-label="Купити товар зі статті">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium">{name}</p>
          <p className="text-[13px] text-muted">{price}</p>
        </div>
        <Link href={href} className="shrink-0 rounded-[4px] bg-red px-5 py-2.5 text-[14px] font-medium text-white">
          Купити
        </Link>
        <button type="button" aria-label="Закрити" onClick={() => setClosed(true)} className="p-1 text-muted">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
