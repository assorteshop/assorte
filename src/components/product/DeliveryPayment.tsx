import { Banknote, CreditCard, Mail, Truck } from "lucide-react";
import { INSTALLMENT_LOGO, INSTALLMENT_NAME, PARTS_NAME, type PaymentOptions } from "@/lib/payments";

// Delivery and payment under the price. The carrier chips use our own simple icons
// (not the carriers' logos).
export function DeliveryPayment({ pay }: { pay: PaymentOptions }) {
  const onlineEnabled = pay.card !== null;
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
              Оплата карткою на сайті
              {!onlineEnabled && <span className="text-muted"> (скоро)</span>}
            </span>
            {pay.card === "mono" && (
              // monobank's official «plata by mono» logo (from the monobank business cabinet).
              // eslint-disable-next-line @next/next/no-img-element -- a small SVG, nothing to optimise
              <img src="/payments/plata-by-mono.svg" alt="plata by mono" width={78} height={16} className="h-4 w-auto shrink-0" />
            )}
          </li>
          {pay.installment && (
            <li className="flex items-center gap-3 pl-9">
              {/* PrivatBank's official «Миттєва розстрочка» logo (from their merchant branding kit). */}
              {/* eslint-disable-next-line @next/next/no-img-element -- a tiny SVG, nothing to optimise */}
              <img src={INSTALLMENT_LOGO} alt="" width={28} height={28} className="size-7 shrink-0" />
              {INSTALLMENT_NAME}
            </li>
          )}
          {/* Shown always: monobank asked for «Покупка частинами» to be visible on the site. */}
          <li className="flex items-center gap-3 pl-9">
            {/* monobank's official «Покупка частинами» label (from the bank). */}
            {/* eslint-disable-next-line @next/next/no-img-element -- a tiny image, nothing to optimise */}
            <img src="/payments/pokupka-chastynamy.png" alt="" width={28} height={28} className="size-7 shrink-0" />
            <span>
              {PARTS_NAME} <span className="text-muted">(без переплат і комісій)</span>
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
