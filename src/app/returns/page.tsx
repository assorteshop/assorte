import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { returnsText } from "@/lib/legal";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Повернення — ASSORTE",
  description: "Повернення товару протягом 14 днів відповідно до законодавства України. Як повернути та коли повертаються кошти.",
  alternates: { canonical: "/returns" },
};

export default async function ReturnsPage() {
  const settings = await getSettings();
  return (
    <LegalPage
      eyebrow="Умови"
      title="Повернення"
      intro="Якщо товар не підійшов, його можна повернути відповідно до законодавства України."
      body={returnsText(settings)}
    />
  );
}
