import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { SiteShell } from "@/components/SiteShell";
import { LEGAL_UPDATED } from "@/lib/legal";

export function LegalPage({
  eyebrow,
  title,
  intro,
  body,
  showDate = true,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  body: string;
  showDate?: boolean;
}) {
  return (
    <SiteShell>
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
        <nav aria-label="Навігація" className="text-[12px] text-muted">
          <Link href="/" className="hover:text-red">Головна</Link> / <span className="text-graphite">{title}</span>
        </nav>
        <div className="mx-auto mt-8 max-w-[760px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-red">{eyebrow}</p>
          <h1 className="mt-3 text-[32px] leading-tight md:text-[44px]">{title}</h1>
          {intro && <p className="mt-4 text-[17px] leading-relaxed text-[#3A3A3A]">{intro}</p>}
          {showDate && <p className="mt-3 text-[13px] text-muted">Редакція від {LEGAL_UPDATED}</p>}
          <div className="mt-4">
            <Markdown>{body}</Markdown>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
