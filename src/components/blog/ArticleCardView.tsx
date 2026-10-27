import Image from "next/image";
import Link from "next/link";
import type { ArticleCard } from "@/lib/articles";

export const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" }) : "";

export function ArticleCardView({ article }: { article: ArticleCard }) {
  return (
    <article className="relative overflow-hidden rounded-[16px] bg-white">
      <div className="relative aspect-[16/10] bg-[#ece8e2]">
        {article.image && (
          <Image src={article.image} alt={article.imageAlt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        )}
      </div>
      <div className="p-5">
        {article.eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red">{article.eyebrow}</p>
        )}
        <h2 className="mt-2 font-heading text-[20px] leading-snug">
          <Link href={`/blog/${article.slug}`} className="hover:text-red after:absolute after:inset-0 after:content-['']">
            {article.title}
          </Link>
        </h2>
        {article.excerpt && <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted">{article.excerpt}</p>}
        <p className="mt-3 text-[12px] text-muted">
          {formatDate(article.published_at)} · {article.readingMinutes} хв читання
        </p>
      </div>
    </article>
  );
}
