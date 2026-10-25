import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = { title: "Дякуємо — ASSORTE" };

export default function CheckoutResult() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
        <div className="max-w-[560px]">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-red">Дякуємо</p>
          <h1 className="mt-2 text-[32px] md:text-[40px]">Ми отримали ваше замовлення</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Якщо оплата пройшла успішно, ми побачимо її за кілька хвилин і зв’яжемося з вами, щоб
            підтвердити доставку. Якщо щось пішло не так, ми також напишемо вам за вказаним номером.
          </p>
          <Link
            href="/catalog"
            className="mt-8 inline-flex rounded-[4px] bg-red px-7 py-4 text-[15px] font-medium text-white"
          >
            Повернутися до каталогу
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
