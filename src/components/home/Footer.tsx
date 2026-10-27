import Link from "next/link";
import { ArrowRight, Gem, Gift, Leaf, Star } from "lucide-react";
import { Wordmark } from "./Wordmark";
import { NewsletterForm } from "./NewsletterForm";
import { getSettings } from "@/lib/settings";

const points = [
  { icon: Gem, text: "Ретельний відбір товарів" },
  { icon: Leaf, text: "Практичний дизайн" },
  { icon: Gift, text: "Ідеї, які надихають" },
  { icon: Star, text: "Чесні описи та реальні фото" },
];

const info = [
  { href: "/delivery-and-payment", label: "Доставка і оплата" },
  { href: "/returns", label: "Повернення" },
  { href: "/terms", label: "Публічна оферта" },
  { href: "/contacts", label: "Контакти" },
];

export async function Footer() {
  const settings = await getSettings();
  // Only the social networks typed into the admin are shown, no dead links.
  const socials = [
    { name: "Instagram", href: settings.social_instagram },
    { name: "Telegram", href: settings.social_telegram },
    { name: "Facebook", href: settings.social_facebook },
    { name: "TikTok", href: settings.social_tiktok },
  ].filter((x): x is { name: string; href: string } => Boolean(x.href));

  return (
    <footer className="bg-ivory">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-10 md:grid-cols-3 md:px-8">
        <div>
          <Wordmark className="text-2xl" />
          <p className="mt-4 max-w-[300px] text-[13px] leading-relaxed text-muted">
            Ми відбираємо незвичайні, корисні та естетичні речі, які роблять щоденні
            моменти особливими.
          </p>
          <Link href="/about" className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-red">
            Більше про нас <ArrowRight size={14} />
          </Link>
        </div>
        <ul className="space-y-4">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-4 text-[13px]">
              <Icon size={22} strokeWidth={1.25} />
              {text}
            </li>
          ))}
        </ul>
        <div>
          <h2 className="text-[16px]">Будь у курсі новинок</h2>
          <p className="mt-2 text-[13px] text-muted">
            Підпишись, щоб першим дізнаватися про нові колекції та спеціальні пропозиції.
          </p>
          <NewsletterForm />
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] border-t border-line px-5 py-6 md:px-8">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
          {info.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-red">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-3 text-[11px] text-muted md:flex-row md:items-center md:justify-between">
          <p>© 2026 ASSORTE. Всі права захищені.</p>
          {socials.length > 0 && (
            <ul className="flex gap-4 text-graphite">
              {socials.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="text-[12px] hover:text-red">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
