"use client";

import { ArrowRight } from "lucide-react";

export const MOODS_ID = "nastroi";

/** Smooth scroll to the mood tiles (instant for people who turned animation off). */
export function scrollToMoods() {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(MOODS_ID)?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
}

// «Обрати настрій» in the hero and in the final block: scrolls to the mood tiles.
export function ZherebCta({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={scrollToMoods}
      className="inline-flex items-center gap-2 rounded-full bg-red px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-graphite"
    >
      {label} <ArrowRight size={16} aria-hidden />
    </button>
  );
}
