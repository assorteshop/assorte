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
  const carrier = order.delivery_method === "ukrposhta" ? "Укрпоштою" : "Новою поштою";
  return `Вітаємо, ${order.customer_name}! Ваше замовлення №${order.number} в ASSORTE оброблено. Очікуйте доставку ${carrier}: після відправлення ми надішлемо номер накладної. Дякуємо, що обрали нас!`;
}

export type MessageLink = { label: string; href: string };

export function messageLinks(args: { phone: string; email: string | null; number: number; text: string }): MessageLink[] {
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
    const subject = encodeURIComponent(`Замовлення №${args.number} в ASSORTE оброблено`);
    links.push({ label: "Email", href: `mailto:${args.email}?subject=${subject}&body=${text}` });
  }
  return links;
}
