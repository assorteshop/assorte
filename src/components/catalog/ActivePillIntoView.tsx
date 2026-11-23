"use client";

import { useEffect, useRef } from "react";

/** A row of pills you swipe: on load it scrolls so the current one (aria-current) is in view. */
export function ActivePillIntoView({ className, label, children }: { className: string; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const row = ref.current;
    const pill = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (row && pill) row.scrollLeft = pill.offsetLeft - row.clientWidth / 2 + pill.offsetWidth / 2;
  }, []);
  return (
    <nav ref={ref} aria-label={label} className={className}>
      {children}
    </nav>
  );
}
