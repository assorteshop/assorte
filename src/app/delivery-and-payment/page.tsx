import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { deliveryPaymentText } from "@/lib/legal";
import { liqpayConfigured } from "@/lib/liqpay";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Доставка і оплата — ASSORTE",
  description: "Доставка Новою поштою та Укрпоштою по Україні. Оплата після отримання або карткою на сайті.",
  alternates: { canonical: "/delivery-and-payment" },
};

export default async function DeliveryAndPaymentPage() {
  const settings = await getSettings();
  return (
    <LegalPage
      eyebrow="Умови"
      title="Доставка і оплата"
      intro="Нова пошта та Укрпошта по всій Україні. Оплата після отримання або карткою на сайті."
      body={deliveryPaymentText({ onlineEnabled: liqpayConfigured(), settings })}
    />
  );
}
