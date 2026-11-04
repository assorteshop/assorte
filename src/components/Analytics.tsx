"use client";

import { useEffect } from "react";
import { FIRST_TOUCH_KEY, detectFirstTouch, parseStoredFirstTouch } from "@/lib/analytics";

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

/**
 * Remembers where the visitor first came from, and loads Google Analytics 4 when gaId is set
 * (only on the real domain, decided on the server). Nothing runs in /admin.
 */
export function Analytics({ gaId }: { gaId: string | null }) {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;

    // 1) First touch: written once, kept for 30 days.
    try {
      const stored = parseStoredFirstTouch(window.localStorage.getItem(FIRST_TOUCH_KEY));
      if (!stored) {
        const ft = detectFirstTouch({ href: window.location.href, referrer: document.referrer });
        window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(ft));
      }
    } catch {
      // Private mode or blocked storage: the order simply has no source.
    }

    // 2) Google Analytics 4, after the page is interactive.
    if (!gaId) return;
    const w = window as GtagWindow;
    if (typeof w.gtag === "function") return;
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      // gtag.js expects the arguments object itself.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag("js", new Date());
    w.gtag("config", gaId);
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(s);
  }, [gaId]);

  return null;
}
