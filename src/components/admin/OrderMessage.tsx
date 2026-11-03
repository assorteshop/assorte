"use client";

import { useState } from "react";
import type { MessageLink } from "@/lib/order-message";

export function OrderMessage({ text, links }: { text: string; links: MessageLink[] }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the text is still visible and can be selected by hand.
    }
  };

  return (
    <details className="mt-4 border-t border-line pt-3">
      <summary className="cursor-pointer text-[13px] font-medium">Написати клієнту: «замовлення оброблено»</summary>
      <p className="mt-3 rounded-[4px] bg-ivory p-3 text-[13px] leading-relaxed">{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="rounded-[4px] border border-line px-4 py-2 text-[13px] hover:border-graphite"
          >
            {l.label}
          </a>
        ))}
        <button type="button" onClick={copy} className="rounded-[4px] bg-graphite px-4 py-2 text-[13px] text-white">
          {copied ? "Скопійовано" : "Копіювати текст"}
        </button>
      </div>
      <p className="mt-2 text-[12px] text-muted">
        Кнопка відкриває чат із клієнтом із готовим текстом. Надіслати потрібно самому. У Telegram тексту у відкритому чаті
        не буде: натисніть «Копіювати текст» і вставте.
      </p>
    </details>
  );
}
