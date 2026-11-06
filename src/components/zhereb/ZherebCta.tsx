"use client";

import { ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";
import type { ZherebState } from "@/lib/zhereb";

export const MOODS_ID = "nastroi";

const pill =
  "inline-flex items-center gap-2 rounded-full bg-red px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-graphite";

export function scrollToMoods() {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(MOODS_ID)?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
}

// Main button of the page. «ЖИВИЙ»: «Обрати настрій» scrolls to the mood tiles.
// «СКОРО»: «Хочу перший «Жереб»» opens the Telegram channel in a new tab.
export function ZherebCta({ state, label, waitlistUrl }: { state: ZherebState; label: string; waitlistUrl: string }) {
  if (state === "live") {
    return (
      <button type="button" onClick={scrollToMoods} className={pill}>
        {label} <ArrowRight size={16} aria-hidden />
      </button>
    );
  }
  return (
    <a
      href={waitlistUrl}
      target="_blank"
      rel="noopener"
      onClick={() => track("zhereb_waitlist_click", { link_url: waitlistUrl })}
      className={pill}
    >
      {label} <ArrowRight size={16} aria-hidden />
    </a>
  );
}
