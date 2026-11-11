"use client";

import { ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";

// «Наш Instagram» in «Поділіться моментом»: opens Instagram in a new tab and tells GA4 about the click.
export function InstagramButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => track("zhereb_ugc_instagram_click", { link_url: href })}
      className="inline-flex items-center gap-2 rounded-full bg-red px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-graphite"
    >
      {label} <ArrowRight size={16} aria-hidden />
    </a>
  );
}
