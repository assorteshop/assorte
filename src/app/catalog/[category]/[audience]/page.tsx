import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/CatalogView";
import { SiteShell } from "@/components/SiteShell";
import { audiences, categories, getAudience, getCategory, hasSubsections } from "@/lib/categories";

// «Для кого» pages of a category with sub-sections: /catalog/watches/men, /women, /kids.
export function generateStaticParams() {
  return categories
    .filter((c) => hasSubsections(c.slug))
    .flatMap((c) => audiences.map((a) => ({ category: c.slug, audience: a.slug })));
}

async function resolve(props: PageProps<"/catalog/[category]/[audience]">) {
  const params = await props.params;
  const category = getCategory(params.category);
  const audience = getAudience(params.audience);
  return category && audience && hasSubsections(category.slug) ? { category, audience } : null;
}

export async function generateMetadata(props: PageProps<"/catalog/[category]/[audience]">): Promise<Metadata> {
  const found = await resolve(props);
  return {
    title: found ? `${found.category.name} · ${found.audience.name} — ASSORTE` : "Каталог — ASSORTE",
    alternates: found ? { canonical: `/catalog/${found.category.slug}/${found.audience.slug}` } : undefined,
  };
}

async function Content(props: PageProps<"/catalog/[category]/[audience]">) {
  const found = await resolve(props);
  if (!found) notFound();
  return <CatalogView category={found.category.slug} audience={found.audience.slug} />;
}

export default function AudiencePage(props: PageProps<"/catalog/[category]/[audience]">) {
  return (
    <SiteShell>
      <Suspense fallback={<div className="h-[600px]" aria-hidden />}>
        <Content {...props} />
      </Suspense>
    </SiteShell>
  );
}
