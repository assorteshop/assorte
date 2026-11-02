import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY_UPDATED, privacyText } from "@/lib/legal";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Політика конфіденційності — ASSORTE",
  description: "Які персональні дані збирає інтернет-магазин ASSORTE, навіщо вони потрібні та які в вас права.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const settings = await getSettings();
  return <LegalPage eyebrow="Документ" title="Політика конфіденційності" updated={PRIVACY_UPDATED} body={privacyText(settings)} />;
}
