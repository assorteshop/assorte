"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type TabId = "description" | "specs" | "reviews";

// Three tabs under the photo: Опис (open by default), Характеристики, Відгуки.
// All three panels are in the page HTML (search engines read them); only one is visible.
export function ProductTabs({
  description,
  specs,
  reviews,
  reviewCount,
}: {
  description: ReactNode;
  specs: ReactNode;
  reviews: ReactNode;
  reviewCount: number;
}) {
  const [active, setActive] = useState<TabId>("description");
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});

  const tabs: { id: TabId; label: string; panel: ReactNode }[] = [
    { id: "description", label: "Опис", panel: description },
    { id: "specs", label: "Характеристики", panel: specs },
    { id: "reviews", label: reviewCount > 0 ? `Відгуки (${reviewCount})` : "Відгуки", panel: reviews },
  ];

  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === "#reviews") setActive("reviews");
    };
    const fromEvent = (e: Event) => {
      const id = (e as CustomEvent<string>).detail as TabId;
      if (id === "description" || id === "specs" || id === "reviews") setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("product-tab", fromEvent);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener("product-tab", fromEvent);
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const move = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!move) return;
    e.preventDefault();
    const next = tabs[(index + move + tabs.length) % tabs.length];
    setActive(next.id);
    buttons.current[next.id]?.focus();
  };

  return (
    <div id="product-tabs" className="scroll-mt-24">
      <div role="tablist" aria-label="Інформація про товар" className="flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              buttons.current[t.id] = el;
            }}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-[15px] md:px-5 ${
              active === t.id ? "border-red font-medium text-graphite" : "border-transparent text-muted hover:text-graphite"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          id={`panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${t.id}`}
          hidden={active !== t.id}
          className="pt-6"
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
