import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { getArticles } from "@/lib/articles";

export const metadata: Metadata = { title: "Статті — ASSORTE" };

const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" }) : "";

export default async function ArticlesPage() {
  const articles = await getArticles();
  return (
    <SiteShell>
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-red">Assorte</p>
        <h1 className="mt-2 text-[32px] md:text-[44px]">Статті</h1>
        {articles.length === 0 ? (
          <p className="mt-8 text-muted">Статті скоро з’являться.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <article key={a.id} className="relative overflow-hidden rounded-[6px] bg-white">
                <div className="relative aspect-[16/10] bg-[#ece8e2]">
                  {a.cover_url && (
                    <Image src={a.cover_url} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[12px] text-muted">{date(a.published_at)}</p>
                  <h2 className="mt-1 text-[19px] leading-snug">
                    <Link href={`/articles/${a.slug}`} className="hover:text-red after:absolute after:inset-0 after:content-['']">
                      {a.title}
                    </Link>
                  </h2>
                  {a.excerpt && <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted">{a.excerpt}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
