import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/CatalogView";
import { SiteShell } from "@/components/SiteShell";
import { categories, getCategory } from "@/lib/categories";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata(
  props: PageProps<"/catalog/[category]">,
): Promise<Metadata> {
  const category = getCategory((await props.params).category);
  return { title: category ? `${category.name} — ASSORTE` : "Каталог — ASSORTE" };
}

async function Content(props: PageProps<"/catalog/[category]">) {
  const category = getCategory((await props.params).category);
  if (!category) notFound();
  return <CatalogView category={category.slug} />;
}

export default function CategoryPage(props: PageProps<"/catalog/[category]">) {
  return (
    <SiteShell>
      <Suspense fallback={<div className="h-[600px]" aria-hidden />}>
        <Content {...props} />
      </Suspense>
    </SiteShell>
  );
}
