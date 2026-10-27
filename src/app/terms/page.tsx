import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { offerText } from "@/lib/legal";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Публічна оферта — ASSORTE",
  description: "Публічна оферта інтернет-магазину ASSORTE: умови купівлі-продажу, доставки, оплати та повернення.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const settings = await getSettings();
  return <LegalPage eyebrow="Документ" title="Публічна оферта" body={offerText(settings)} />;
}
