"use client";

import { useState } from "react";
import {
  type ChannelId,
  cleanTracking,
  messageLinks,
  processedMessage,
  shippedMessage,
  type MessageLink,
} from "@/lib/order-message";

type Order = {
  number: number;
  customer_name: string;
  delivery_method: string;
  phone: string;
  email: string | null;
};

// The channel the customer chose goes first and is highlighted; the rest stay as a fallback.
const withPreferredFirst = (links: MessageLink[], preferred: ChannelId | null) =>
  preferred ? [...links].sort((a, b) => Number(b.id === preferred) - Number(a.id === preferred)) : links;

function Send({ text, links, preferred }: { text: string; links: MessageLink[]; preferred: ChannelId | null }) {
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
    <>
      <p className="mt-3 break-words rounded-[4px] bg-ivory p-3 text-[13px] leading-relaxed">{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {withPreferredFirst(links, preferred).map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className={`rounded-[4px] border px-4 py-2 text-[13px] ${
              l.id === preferred ? "border-red bg-red text-white" : "border-line hover:border-graphite"
            }`}
          >
            {l.label}
          </a>
        ))}
        <button type="button" onClick={copy} className="rounded-[4px] bg-graphite px-4 py-2 text-[13px] text-white">
          {copied ? "Скопійовано" : "Копіювати текст"}
        </button>
      </div>
    </>
  );
}

export function OrderMessage({ order, preferred }: { order: Order; preferred: ChannelId | null }) {
  const [tracking, setTracking] = useState("");
  const number = cleanTracking(tracking);
  const expectedDigits = order.delivery_method === "ukrposhta" ? 13 : 14;
  const looksOff = number.length > 0 && !(number.length === expectedDigits && /^\d+$/.test(number));

  const processed = processedMessage(order);
  const shipped = number ? shippedMessage(order, number) : "";
  const contact = { phone: order.phone, email: order.email };

  return (
    <details className="mt-4 border-t border-line pt-3">
      <summary className="cursor-pointer text-[13px] font-medium">Написати клієнту</summary>

      <div className="mt-3">
        <p className="text-[13px] font-medium">1. Замовлення оброблено</p>
        <Send
          preferred={preferred}
          text={processed}
          links={messageLinks({ ...contact, subject: `Замовлення №${order.number} в ASSORTE оброблено`, text: processed })}
        />
      </div>

      <div className="mt-5 border-t border-line pt-3">
        <p className="text-[13px] font-medium">2. Замовлення відправлено: надіслати накладну</p>
        <label className="mt-2 block text-[13px]">
          Номер накладної ({order.delivery_method === "ukrposhta" ? "Укрпошта" : "Нова пошта"})
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            inputMode="numeric"
            placeholder="Вставте номер від постачальника"
            className="mt-1.5 h-10 w-full max-w-[360px] rounded-[4px] border border-line bg-white px-3 text-[14px]"
          />
        </label>
        {looksOff && (
          <p className="mt-1 text-[12px] text-red">
            Зазвичай це {expectedDigits} цифр без літер. Перевірте номер перед відправкою.
          </p>
        )}
        {number ? (
          <Send
            preferred={preferred}
            text={shipped}
            links={messageLinks({ ...contact, subject: `Замовлення №${order.number} в ASSORTE відправлено`, text: shipped })}
          />
        ) : (
          <p className="mt-2 text-[12px] text-muted">Вставте номер, і зʼявиться готове повідомлення з посиланням для відстеження.</p>
        )}
      </div>

      <p className="mt-4 text-[12px] text-muted">
        Кнопка відкриває чат із клієнтом із готовим текстом. Надіслати потрібно самому. У Viber і Telegram тексту у
        відкритому чаті не буде: натисніть «Копіювати текст» і вставте. Номер накладної ніде не зберігається.
      </p>
    </details>
  );
}
