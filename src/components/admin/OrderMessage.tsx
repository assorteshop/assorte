"use client";

import { useState } from "react";
import { Check, Copy, Send } from "lucide-react";
import {
  type ChannelId,
  cleanTracking,
  messageForStatus,
  messageLinks,
  ORDER_STATUSES,
  primaryLink,
  type MessageLink,
} from "@/lib/order-message";

type Order = {
  id: string;
  number: number;
  customer_name: string;
  delivery_method: string;
  phone: string;
  email: string | null;
  status: string;
};

const subjects: Record<string, string> = {
  confirmed: "оброблено",
  shipped: "відправлено",
  done: "виконано",
  cancelled: "скасовано",
};

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false; // Clipboard blocked: the text is still visible and can be selected by hand.
  }
};

/** The messenger opens in the app (viber:, sms:) or in a new tab (wa.me, t.me), the admin stays open. */
const linkTarget = (l: MessageLink) => (l.href.startsWith("http") ? "_blank" : undefined);

// Status of the order and the message that goes with it. Pick a status and the text changes at once;
// the big button copies the text and opens the chat with this customer in the messenger they chose.
// The owner presses «Надіслати» in the messenger; «Зберегти статус» saves the status on the site.
export function OrderMessage({
  order,
  preferred,
  saveStatus,
}: {
  order: Order;
  preferred: ChannelId | null;
  saveStatus: (formData: FormData) => Promise<void>;
}) {
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState("");
  const [copied, setCopied] = useState(false);

  const number = cleanTracking(tracking);
  const expectedDigits = order.delivery_method === "ukrposhta" ? 13 : 14;
  const looksOff = number.length > 0 && !(number.length === expectedDigits && /^\d+$/.test(number));

  const text = messageForStatus(status, order, tracking);
  const links = text
    ? messageLinks({
        phone: order.phone,
        email: order.email,
        subject: `Замовлення №${order.number} в ASSORTE ${subjects[status] ?? ""}`.trim(),
        text,
      })
    : [];
  const main = primaryLink(links, preferred);
  const others = links.filter((l) => l !== main);

  const copy = async () => {
    if (!text || !(await copyText(text))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 border-t border-line pt-4">
      <form action={saveStatus} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={order.id} />
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-[4px] border border-line bg-white px-3 text-[13px]"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={status === order.status}
          className="rounded-[4px] bg-graphite px-4 py-2.5 text-[13px] text-white disabled:opacity-40"
        >
          {status === order.status ? "Статус збережено" : "Зберегти статус"}
        </button>
      </form>

      {status === "shipped" && (
        <label className="mt-4 block text-[13px]">
          Номер накладної ({order.delivery_method === "ukrposhta" ? "Укрпошта" : "Нова пошта"})
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            inputMode="numeric"
            placeholder="Вставте номер від постачальника"
            className="mt-1.5 h-10 w-full max-w-[360px] rounded-[4px] border border-line bg-white px-3 text-[14px]"
          />
          {looksOff && (
            <span className="mt-1 block text-[12px] text-red">
              Зазвичай це {expectedDigits} цифр без літер. Перевірте номер перед відправкою.
            </span>
          )}
        </label>
      )}

      {text ? (
        <>
          <p className="mt-4 text-[13px] font-medium">Повідомлення клієнту</p>
          <p className="mt-2 break-words rounded-[4px] bg-ivory p-3 text-[13px] leading-relaxed">{text}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {main && (
              <a
                href={main.href}
                target={linkTarget(main)}
                rel="noreferrer"
                onClick={() => void copy()}
                className="inline-flex items-center gap-2 rounded-[4px] bg-red px-5 py-2.5 text-[14px] font-medium text-white"
              >
                <Send size={15} /> Надіслати {main.id === "sms" ? "SMS" : `у ${main.label}`}
              </a>
            )}
            <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-[4px] border border-line px-4 py-2.5 text-[13px] hover:border-graphite">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Скопійовано" : "Копіювати"}
            </button>
            {others.length > 0 && <span className="ml-1 text-[12px] text-muted">або:</span>}
            {others.map((l) => (
              <a
                key={l.id}
                href={l.href}
                target={linkTarget(l)}
                rel="noreferrer"
                onClick={() => void copy()}
                className="text-[13px] text-muted underline underline-offset-4 hover:text-graphite"
              >
                {l.label}
              </a>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-muted">
            {copied ? "Текст скопійовано: у чаті вставте його (⌘V або «Вставити») і натисніть «Надіслати»." : "Кнопка копіює текст і відкриває чат із клієнтом."}
            {preferred === "call" && " Клієнт просив лише дзвінок."}
          </p>
        </>
      ) : (
        status !== "shipped" && (
          <p className="mt-3 text-[12px] text-muted">Оберіть статус, і тут зʼявиться повідомлення для клієнта.</p>
        )
      )}
    </div>
  );
}
