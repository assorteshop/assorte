import { Banknote, CreditCard, Mail, Truck } from "lucide-react";
import { INSTALLMENT_LOGO, INSTALLMENT_NAME, type PaymentOptions } from "@/lib/payments";

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
          </li>
          {pay.installment && (
            <li className="pl-9">
              {/* PrivatBank's official «Миттєва розстрочка» logo (from their merchant branding kit). The caption shows on hover, and on tap (focus) on phones. */}
              <span
                tabIndex={0}
                role="img"
                aria-label={INSTALLMENT_NAME}
                className="group relative inline-block size-9 cursor-help rounded-full outline-none focus-visible:ring-2 focus-visible:ring-graphite/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a tiny SVG, nothing to optimise */}
                <img src={INSTALLMENT_LOGO} alt="" width={36} height={36} className="size-9" />
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-full left-0 mb-2 whitespace-nowrap rounded-[10px] bg-graphite px-3 py-2 text-[13px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                >
                  {INSTALLMENT_NAME}
                </span>
              </span>
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
