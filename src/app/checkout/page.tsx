import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { SiteShell } from "@/components/SiteShell";
import { currentPaymentOptions } from "@/lib/payments-server";

export const metadata: Metadata = { title: "Оформлення замовлення — ASSORTE", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
        <h1 className="text-[32px] md:text-[44px]">Оформлення замовлення</h1>
        <div className="mt-8">
          <CheckoutForm pay={currentPaymentOptions()} />
        </div>
      </section>
    </SiteShell>
  );
}
