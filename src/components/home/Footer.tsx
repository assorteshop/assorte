import Link from "next/link";
import { ArrowRight, Gem, Gift, Leaf, Star } from "lucide-react";
import { Wordmark } from "./Wordmark";
import { NewsletterForm } from "./NewsletterForm";

const points = [
  { icon: Gem, text: "Ретельний відбір товарів" },
  { icon: Leaf, text: "Практичний дизайн" },
  { icon: Gift, text: "Ідеї, які надихають" },
  { icon: Star, text: "Чесні описи та реальні фото" },
];

const socials = ["Instagram", "Facebook", "YouTube", "TikTok"];

export function Footer() {
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
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 pb-8 text-[11px] text-muted md:flex-row md:items-center md:justify-between md:px-8">
        <p>© 2026 ASSORTE. Всі права захищені.</p>
        <ul className="flex gap-4 text-graphite">
          {socials.map((s) => (
            <li key={s}>
              <a href="#" aria-label={s} className="text-[12px] hover:text-red">
                {s}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
