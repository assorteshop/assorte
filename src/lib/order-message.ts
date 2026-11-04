// Ready-made message to the customer, plus links that open it in a messenger with the text filled in.
// The shop owner presses "send" himself: no messaging service or key is involved.

// Ukrainian numbers in any common form -> digits with country code (380XXXXXXXXX), or null.
export function normalizeUaPhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("380")) return d;
  if (d.length === 11 && d.startsWith("80")) return `3${d}`;
  if (d.length === 10 && d.startsWith("0")) return `38${d}`;
  return null;
}

export function processedMessage(order: {
  number: number;
  customer_name: string;
  delivery_method: string;
}): string {
  return `Вітаємо, ${order.customer_name}! Ваше замовлення №${order.number} в ASSORTE оброблено. Очікуйте доставку ${carrierName(order.delivery_method)}: після відправлення ми надішлемо номер накладної. Дякуємо, що обрали нас!`;
}

const carrierName = (method: string) => (method === "ukrposhta" ? "Укрпоштою" : "Новою поштою");

// Waybill number as typed or pasted: spaces and line breaks removed.
export const cleanTracking = (raw: string) => raw.replace(/\s+/g, "");

export function trackingUrl(deliveryMethod: string, tracking: string): string {
  const n = encodeURIComponent(cleanTracking(tracking));
  return deliveryMethod === "ukrposhta"
    ? `https://track.ukrposhta.ua/tracking_UA.html?barcode=${n}`
    : `https://novaposhta.ua/tracking/?cargo_number=${n}`;
}

export function shippedMessage(
  order: { number: number; customer_name: string; delivery_method: string },
  tracking: string,
): string {
  const n = cleanTracking(tracking);
  return `Вітаємо, ${order.customer_name}! Ваше замовлення №${order.number} в ASSORTE відправлено ${carrierName(order.delivery_method)}. Номер накладної: ${n}. Відстежити посилку: ${trackingUrl(order.delivery_method, n)}. Дякуємо, що обрали нас!`;
}

export type ChannelId = "sms" | "viber" | "telegram" | "whatsapp" | "call";

// How the customer wants to hear from us. Chosen at checkout and saved as the first line of the order comment.
export const CONTACT_CHANNELS: { id: ChannelId; label: string }[] = [
  { id: "sms", label: "SMS" },
  { id: "viber", label: "Viber" },
  { id: "telegram", label: "Telegram" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "call", label: "Лише дзвінок" },
];

const CONTACT_PREFIX = "Зв’язок: ";
const channelLabel = (id: ChannelId) => CONTACT_CHANNELS.find((c) => c.id === id)!.label;
const isChannel = (v: string): v is ChannelId => CONTACT_CHANNELS.some((c) => c.id === v);

export function encodeContact(channel: string, comment: string): string {
  if (!isChannel(channel)) return comment;
  return `${CONTACT_PREFIX}${channelLabel(channel)}${comment ? `\n${comment}` : ""}`;
}

export function parseContact(comment: string | null): { channel: ChannelId | null; rest: string } {
  const text = comment ?? "";
  const first = text.split("\n", 1)[0];
  const found = CONTACT_CHANNELS.find((c) => first === `${CONTACT_PREFIX}${c.label}`);
  if (!found) return { channel: null, rest: text };
  return { channel: found.id, rest: text.slice(first.length).replace(/^\n/, "") };
}

export type MessageLink = { id: ChannelId | "email"; label: string; href: string };

export function messageLinks(args: { phone: string; email: string | null; subject: string; text: string }): MessageLink[] {
  const digits = normalizeUaPhone(args.phone);
  const text = encodeURIComponent(args.text);
  const links: MessageLink[] = [];
  if (digits) {
    links.push(
      { id: "viber", label: "Viber", href: `viber://chat?number=%2B${digits}` },
      { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/${digits}?text=${text}` },
      { id: "telegram", label: "Telegram", href: `https://t.me/+${digits}` },
      { id: "sms", label: "SMS", href: `sms:+${digits}?body=${text}` },
      { id: "call", label: "Подзвонити", href: `tel:+${digits}` },
    );
  }
  if (args.email) {
    links.push({ id: "email", label: "Email", href: `mailto:${args.email}?subject=${encodeURIComponent(args.subject)}&body=${text}` });
  }
  return links;
}
