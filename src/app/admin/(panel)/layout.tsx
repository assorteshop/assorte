import Link from "next/link";
import { Suspense } from "react";
import { Wordmark } from "@/components/home/Wordmark";
import { logout } from "@/app/admin/actions";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-6 px-5">
          <Wordmark className="text-[18px]" />
          <span className="text-[12px] uppercase tracking-[0.2em] text-muted">Адмінка</span>
          <nav className="ml-4 flex gap-5 text-[14px]">
            <Link href="/admin/products" className="hover:text-red">Товари</Link>
            <Link href="/admin/articles" className="hover:text-red">Статті</Link>
            <Link href="/admin/banners" className="hover:text-red">Блоки на головній</Link>
            <Link href="/admin/orders" className="hover:text-red">Замовлення</Link>
          </nav>
          <form action={logout} className="ml-auto">
            <button type="submit" className="text-[13px] text-muted hover:text-red">
              Вийти
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-5 py-8">
        <Suspense fallback={<p className="text-muted">Завантаження…</p>}>{children}</Suspense>
      </main>
    </>
  );
}
