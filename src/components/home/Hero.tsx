import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ivory">
      {/* Photography slot: drop the approved image at public/images/hero.jpg */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-[70%_center] md:bg-center"
        style={{ backgroundImage: "url(/images/hero.jpg)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/70 to-transparent md:via-ivory/30"
      />
      <div className="relative mx-auto flex min-h-[560px] max-w-[1280px] flex-col justify-center px-5 py-16 md:min-h-[640px] md:px-8">
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
          Дивитися колекцію <ArrowRight size={16} />
        </Link>

        <p
          aria-label="Більше, ніж просто речі"
          className="absolute right-5 top-8 hidden -rotate-[12deg] text-right font-script text-[28px] leading-[1.15] text-graphite/80 md:right-12 md:top-14 md:block"
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
