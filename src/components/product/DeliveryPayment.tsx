import { Banknote, CreditCard, Mail, Truck } from "lucide-react";
import { ONLINE_DISCOUNT_PERCENT } from "@/lib/pricing";

// Delivery and payment under the price. The carrier chips use our own simple icons
// (not the carriers' logos).
export function DeliveryPayment({ onlineEnabled }: { onlineEnabled: boolean }) {
  return (
    <div className="mt-8 space-y-6 border-t border-line pt-6">
      <div>
        <p className="text-[13px] text-muted">Доставка</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          <li className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[14px]">
            <Truck size={18} strokeWidth={1.5} className="text-red" />
            Нова пошта
          </li>
          <li className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[14px]">
            <Mail size={18} strokeWidth={1.5} className="text-red" />
            Укрпошта
          </li>
        </ul>
      </div>

      <div>
        <p className="text-[13px] text-muted">Оплата</p>
        <ol className="mt-2 space-y-2.5 text-[14px]">
          <li className="flex items-center gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-graphite text-[12px] text-white">1</span>
            <Banknote size={18} strokeWidth={1.5} className="shrink-0 text-red" />
            Оплата після отримання
          </li>
          <li className="flex items-center gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-graphite text-[12px] text-white">2</span>
            <CreditCard size={18} strokeWidth={1.5} className="shrink-0 text-red" />
            <span>
              Оплата карткою на сайті:{" "}
              <strong className="font-medium text-red">додаткова знижка {ONLINE_DISCOUNT_PERCENT}%</strong>
              {!onlineEnabled && <span className="text-muted"> (скоро)</span>}
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
