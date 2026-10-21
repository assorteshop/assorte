import { CreditCard, HeartHandshake, ShieldCheck, Truck } from "lucide-react";

const items = [
  { icon: Truck, text: "Швидка доставка по Україні" },
  { icon: CreditCard, text: "Зручні способи оплати" },
  { icon: ShieldCheck, text: "Перевірена якість і надійні постачальники" },
  { icon: HeartHandshake, text: "Підтримка, яка завжди поруч" },
];

export function TrustBar() {
  return (
    <section aria-label="Переваги" className="bg-ivory">
      <ul className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-4 gap-y-6 px-5 py-8 md:grid-cols-4 md:px-8">
        {items.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 text-[13px] leading-snug">
            <Icon size={28} strokeWidth={1.25} className="shrink-0" />
            <span className="max-w-[160px]">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
