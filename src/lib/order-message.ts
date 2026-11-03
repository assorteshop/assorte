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

export type MessageLink = { label: string; href: string };

export function messageLinks(args: { phone: string; email: string | null; subject: string; text: string }): MessageLink[] {
  const digits = normalizeUaPhone(args.phone);
  const text = encodeURIComponent(args.text);
  const links: MessageLink[] = [];
  if (digits) {
    links.push(
      { label: "Viber", href: `viber://chat?number=%2B${digits}` },
      { label: "WhatsApp", href: `https://wa.me/${digits}?text=${text}` },
      { label: "Telegram", href: `https://t.me/+${digits}` },
      { label: "SMS", href: `sms:+${digits}?body=${text}` },
    );
  }
  if (args.email) {
    links.push({ label: "Email", href: `mailto:${args.email}?subject=${encodeURIComponent(args.subject)}&body=${text}` });
  }
  return links;
}
