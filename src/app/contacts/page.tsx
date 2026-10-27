import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { getSettings, type Settings } from "@/lib/settings";
import { sellerLines } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Контакти — ASSORTE",
  description: "Контакти інтернет-магазину ASSORTE та реквізити продавця.",
  alternates: { canonical: "/contacts" },
};

const socials: { key: keyof Settings; name: string }[] = [
  { key: "social_instagram", name: "Instagram" },
  { key: "social_telegram", name: "Telegram" },
  { key: "social_facebook", name: "Facebook" },
  { key: "social_tiktok", name: "TikTok" },
];

export default async function ContactsPage() {
  const s = await getSettings();
  const links = socials.filter((x) => s[x.key]);
  const hasAnything = sellerLines(s).length > 0 || links.length > 0;

  return (
    <SiteShell>
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-[760px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-red">ASSORTE</p>
          <h1 className="mt-3 text-[32px] leading-tight md:text-[44px]">Контакти</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#3A3A3A]">
            Допоможемо з вибором, замовленням і поверненням. Напишіть або зателефонуйте нам.
          </p>

          {!hasAnything ? (
            <p className="mt-8 rounded-[6px] bg-white p-5 text-[15px] text-muted">
              Контакти та реквізити будуть опубліковані найближчим часом.
            </p>
          ) : (
            <dl className="mt-8 divide-y divide-line rounded-[6px] bg-white">
              {s.contact_phone && (
                <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                  <dt className="text-[13px] text-muted">Телефон</dt>
                  <dd className="text-[16px]">
                    <a href={`tel:${s.contact_phone.replace(/[^\d+]/g, "")}`} className="hover:text-red">{s.contact_phone}</a>
                  </dd>
                </div>
              )}
              {s.contact_email && (
                <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                  <dt className="text-[13px] text-muted">Email</dt>
                  <dd className="text-[16px]">
                    <a href={`mailto:${s.contact_email}`} className="hover:text-red">{s.contact_email}</a>
                  </dd>
                </div>
              )}
              {s.work_hours && (
                <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                  <dt className="text-[13px] text-muted">Графік роботи</dt>
                  <dd className="text-[16px]">{s.work_hours}</dd>
                </div>
              )}
              {links.length > 0 && (
                <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                  <dt className="text-[13px] text-muted">Ми в соцмережах</dt>
                  <dd className="flex flex-wrap gap-x-5 gap-y-1 text-[16px]">
                    {links.map((x) => (
                      <a key={x.key} href={s[x.key]} target="_blank" rel="noopener noreferrer" className="hover:text-red">
                        {x.name}
                      </a>
                    ))}
                  </dd>
                </div>
              )}
              {(s.seller_name || s.seller_tax_id || s.seller_address) && (
                <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
                  <dt className="text-[13px] text-muted">Продавець</dt>
                  <dd className="space-y-1 text-[15px]">
                    {s.seller_name && <p>{s.seller_name}</p>}
                    {s.seller_tax_id && <p className="text-muted">РНОКПП / ЄДРПОУ: {s.seller_tax_id}</p>}
                    {s.seller_address && <p className="text-muted">{s.seller_address}</p>}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
