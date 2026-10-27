import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Gem,
  Gift,
  Heart,
  Leaf,
  MessageCircle,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  TrendingUp,
  Truck,
} from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { categories, type CategorySlug } from "@/lib/categories";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Про нас — ASSORTE",
  description:
    "ASSORTE — добірка корисних, естетичних і незвичайних речей. Як ми обираємо товари і хто такий Сорті, головний інспектор якості.",
  alternates: { canonical: "/about" },
};

const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.3em] text-red";
const rule = "my-5 block h-[2px] w-10 bg-red";

const values = [
  { icon: Gem, title: "Якість", text: "Відбираємо тільки перевірені та надійні товари" },
  { icon: Heart, title: "Стиль", text: "Поєднуємо користь, красу та сучасний дизайн" },
  { icon: Gift, title: "Емоції", text: "Допомагаємо створювати особливі моменти" },
  { icon: Leaf, title: "Продуманість", text: "Кожна річ має свою причину бути в нашому асортименті" },
];

const process = [
  { icon: Search, title: "Пошук і відбір", text: "Аналізуємо ринок, тренди та перевірених постачальників в Україні та світі." },
  { icon: ShieldCheck, title: "Перевірка якості", text: "Оцінюємо матеріали, функціональність і реальні відгуки клієнтів." },
  { icon: TrendingUp, title: "Актуальний асортимент", text: "Регулярно оновлюємо каталог, щоб пропонувати найкращі новинки." },
];

const principles = [
  "Тільки якісні та перевірені товари",
  "Надійні постачальники",
  "Чесні описи та реальні фото",
  "Підтримка клієнтів на всіх етапах",
  "Постійний розвиток асортименту",
];

const service = [
  { icon: Truck, title: "Доставка Новою поштою", text: "Відправляємо по всій Україні" },
  { icon: Package, title: "Доставка Укрпоштою", text: "Доступна доставка у зручні відділення" },
  { icon: RotateCcw, title: "Повернення протягом 14 днів", text: "Якщо товар не підійшов (згідно із законодавством України)" },
  { icon: MessageCircle, title: "Підтримка клієнтів", text: "Допоможемо з вибором, замовленням і поверненням" },
];

const categoryTagline: Record<CategorySlug, string> = {
  sport: "Спорт, активність і енергія",
  tech: "Корисні технології",
  gifts: "Незвичайні подарунки",
  style: "Стиль і комфорт",
  climate: "Комфортний клімат",
  auto: "Для авто та мото",
};

// Each tile shows a real product photo from that category (no stock pictures).
async function CategoryTiles() {
  const tiles = await Promise.all(
    categories.map(async (c) => {
      const products = await getProducts(c.slug);
      return { category: c, image: products.find((p) => p.image_url)?.image_url ?? null };
    }),
  );
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
      {tiles.map(({ category, image }) => (
        <Link
          key={category.slug}
          href={`/catalog/${category.slug}`}
          className="group overflow-hidden rounded-[10px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]"
        >
          <div className="relative aspect-[16/9] bg-[#ece8e2]">
            {image && (
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
              />
            )}
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.04em]">{category.eyebrow}</p>
              <p className="mt-0.5 truncate text-[12px] text-muted">{categoryTagline[category.slug]}</p>
            </div>
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-graphite group-hover:border-red group-hover:text-red">
              <ArrowRight size={15} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <SiteShell>
      {/* 1. Hero */}
      <section className="overflow-hidden bg-[#f3ece4]">
        <div className="mx-auto grid max-w-[1280px] items-center gap-6 px-5 md:grid-cols-[1.1fr_0.9fr_0.95fr] md:gap-4 md:px-8">
          <div className="pt-10 md:py-16">
            <p className={eyebrow}>Про нас</p>
            <h1 className="mt-4 font-heading text-[56px] font-medium leading-none tracking-[0.01em] sm:text-[72px] lg:text-[88px]">
              AS<span className="text-red">SORTE</span>
            </h1>
            <p className="mt-3 text-[18px] md:text-[20px]">The art of thoughtful selection</p>
            <span className={rule} />
            <p className="text-[19px] leading-snug md:text-[22px]">
              Продумані деталі
              <br />
              для кращих моментів.
            </p>
            <p className="mt-6 -rotate-6 font-script text-[28px] leading-[1.15] text-graphite/80">
              Більше, ніж просто речі <span aria-hidden>♡</span>
            </p>
          </div>

          <div className="relative mx-auto aspect-[507/720] w-full max-w-[380px] md:max-w-none">
            <Image
              src="/images/about/sorti-hero.jpg"
              alt="Сорті — сірий британський кіт з мідними очима та червоним шарфом"
              fill
              priority
              sizes="(min-width: 768px) 30vw, 80vw"
              className="object-cover object-top"
            />
          </div>

          <div className="pb-10 md:py-16">
            <h2 className="font-heading text-[36px] font-medium leading-none tracking-[0.02em] md:text-[44px]">SORTI</h2>
            <p className="mt-3 text-[18px] leading-snug md:text-[20px]">
              The one who makes
              <br />
              the selection.
            </p>
            <span className={rule} />
            <p className="max-w-[360px] text-[15px] leading-relaxed text-graphite/85">
              Сорті уважно перевіряє кожен товар, щоб у ASSORTE були тільки справді якісні, корисні та особливі речі.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-[8px] bg-red px-5 py-3.5 text-white">
              <Check size={22} strokeWidth={2} aria-hidden />
              <div>
                <p className="text-[15px] font-medium leading-tight">Схвалено Сорті</p>
                <p className="mt-0.5 text-[12px] opacity-90">Не все проходить відбір.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mission */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1280px] md:grid-cols-[0.8fr_1fr_1fr]">
          <div className="relative aspect-[384/368] md:aspect-auto">
            <Image
              src="/images/about/sorti-approved.jpg"
              alt="Сорті схвалює товар у фірмовій коробці ASSORTE"
              fill
              sizes="(min-width: 768px) 28vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="px-5 py-10 md:px-10 md:py-14">
            <p className={eyebrow}>Наша місія</p>
            <h2 className="mt-3 text-[28px] leading-tight md:text-[32px]">
              Робити ваше життя зручнішим, красивішим і яскравішим
            </h2>
            <span className={rule} />
            <p className="text-[15px] leading-relaxed text-muted">
              Ми створили ASSORTE, щоб ви могли легко знаходити продумані товари, які приносять реальну користь і емоції:
              у спорті, технологіях, подарунках і повсякденному комфорті.
            </p>
          </div>
          <ul className="space-y-5 bg-ivory px-6 py-8 md:my-8 md:mr-8 md:rounded-[10px] md:px-8">
            {values.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <Icon size={26} strokeWidth={1.25} className="mt-0.5 shrink-0 text-red" aria-hidden />
                <div>
                  <p className="text-[15px] font-medium">{title}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Expertise */}
      <section className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 md:grid-cols-[0.9fr_1.4fr] md:gap-14 md:px-8 md:py-16">
        <div>
          <p className={eyebrow}>Досвід і експертиза</p>
          <h2 className="mt-3 text-[28px] leading-tight md:text-[32px]">Наші категорійні менеджери</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            За кожною категорією ASSORTE стоять категорійні менеджери, які працюють із постачальниками, аналізують тренди,
            перевіряють якість і відбирають тільки найкращі товари.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-flex items-center gap-2 rounded-[4px] bg-red px-6 py-3.5 text-[14px] font-medium text-white"
          >
            Дізнатися більше <ArrowRight size={15} />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {process.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-[10px] bg-white p-5">
              <Icon size={28} strokeWidth={1.25} className="text-red" aria-hidden />
              <p className="mt-4 text-[15px] font-medium">{title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Principles */}
      <section className="bg-[#f3ece4]">
        <div className="mx-auto grid max-w-[1280px] items-center md:grid-cols-[0.75fr_1.1fr_1fr]">
          <div className="relative aspect-[384/344] md:h-full md:aspect-auto">
            <Image
              src="/images/about/sorti-powerbank.jpg"
              alt="Сорті уважно оглядає повербанк"
              fill
              sizes="(min-width: 768px) 25vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="px-5 py-10 md:px-10 md:py-14">
            <p className={eyebrow}>Наші принципи</p>
            <h2 className="mt-3 text-[30px] leading-tight md:text-[36px]">
              Сорті перевірив.
              <br />
              ASSORTE обрав.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-graphite/80">
              Сорті: наш головний інспектор якості. Він символізує ретельний відбір, уважність до деталей і нашу
              відповідальність перед вами.
            </p>
          </div>
          <ul className="mx-5 mb-10 space-y-3.5 rounded-[10px] bg-white px-6 py-6 md:m-8">
            {principles.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[14px]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-red text-red">
                  <Check size={14} strokeWidth={2.25} aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Service */}
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-12">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {service.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <Icon size={34} strokeWidth={1.25} className="shrink-0 text-red" aria-hidden />
              <div>
                <p className="text-[14px] font-medium leading-snug">{title}</p>
                <p className="mt-1 text-[12px] leading-snug text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[760px] text-[12px] leading-relaxed text-muted">
          Строки та вартість доставки залежать від перевізника, адреси й конкретного замовлення. Право на повернення має
          винятки для окремих категорій товарів.
        </p>
      </section>

      {/* 6. Categories */}
      <section className="mx-auto max-w-[1280px] px-5 pb-14 md:px-8 md:pb-20">
        <p className={eyebrow}>Наші категорії</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h2 className="text-[28px] leading-tight md:text-[34px]">Світи продуманих рішень</h2>
          <Link href="/catalog" className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[13px] font-medium text-red">
            Перейти в каталог <ArrowUpRight size={15} />
          </Link>
        </div>
        <Suspense fallback={<div className="mt-6 h-[300px]" aria-hidden />}>
          <CategoryTiles />
        </Suspense>
      </section>
    </SiteShell>
  );
}
