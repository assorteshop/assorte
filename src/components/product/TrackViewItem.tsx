"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Sends GA4 view_item once when a product page opens. Renders nothing. */
export function TrackViewItem({ slug, name, price }: { slug: string; name: string; price: number }) {
  useEffect(() => {
    // gtag may still be loading; a short delay lets the queue catch the event.
    const t = setTimeout(() => {
      track("view_item", {
        currency: "UAH",
        value: price,
        items: [{ item_id: slug, item_name: name, price, quantity: 1 }],
      });
    }, 800);
    return () => clearTimeout(t);
  }, [slug, name, price]);
  return null;
}
