import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = { title: "Каталог — ASSORTE" };

export default function CatalogPage() {
  return (
    <SiteShell>
      <CatalogView />
    </SiteShell>
  );
}
