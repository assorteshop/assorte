import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ivory md:min-h-[640px]">
      <div className="relative aspect-[5/4] md:absolute md:inset-y-0 md:right-0 md:aspect-auto md:w-[62%]">
        <Image
          src="/images/hero.jpg"
          alt="Дівчина з теплим шарфом тримає термокухоль"
          fill
          priority
          sizes="(min-width: 768px) 62vw, 100vw"
          className="object-cover object-[65%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ivory via-transparent to-transparent md:bg-gradient-to-r md:from-ivory md:via-ivory/10 md:to-transparent"
        />
      </div>

      <div className="relative mx-auto flex max-w-[1280px] flex-col px-5 pb-12 pt-4 md:min-h-[640px] md:justify-center md:px-8 md:py-16">
        <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.3em]">
          Незвичайні речі для твого стилю
        </p>
        <h1 className="max-w-[560px] text-[44px] leading-[1.05] md:text-[64px]">
          Продумані
          <br />
          деталі для
          <br />
          <span className="text-red">кращих моментів</span>
        </h1>
        <p className="mt-6 max-w-[400px] text-[15px] leading-relaxed text-graphite/85">
          Аксесуари, гаджети та стильні знахідки, які поєднують користь, естетику
          і турботу про щоденний комфорт.
        </p>
        <Link
          href="/catalog"
          className="mt-8 inline-flex w-fit items-center gap-3 rounded-[4px] bg-red px-7 py-4 text-[15px] font-medium text-white"
        >
          Каталог <ArrowRight size={16} />
        </Link>

        <p
          aria-label="Більше, ніж просто речі"
          className="absolute right-12 top-14 hidden -rotate-[12deg] text-right font-script text-[28px] leading-[1.15] text-graphite/80 md:block"
        >
          Більше,
          <br />
          ніж просто
          <br />
          речі <span aria-hidden>♡</span>
        </p>
      </div>
    </section>
  );
}
