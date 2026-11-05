import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { CartLink } from "@/components/cart/CartLink";
import { MobileMenu } from "./MobileMenu";
import { HeaderFrame } from "./HeaderFrame";
import { Wordmark } from "./Wordmark";

const nav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/catalog/gifts", label: "Подарунки" },
  { href: "/new", label: "Новинки" },
  { href: "/blog", label: "Блог" },
  { href: "/about", label: "Про нас" },
];

// overlay: on the home page the header lies over the full-screen photo.
export function Header({ overlay = false }: { overlay?: boolean }) {
  return (
    <HeaderFrame overlay={overlay}>
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-5 md:h-[54px] md:px-8">
        <Wordmark className="text-xl md:text-[22px]" />
        <nav aria-label="Головна навігація" className="ml-6 hidden gap-8 text-[13px] md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-red">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <MobileMenu items={nav} />
          <Link href="/search" aria-label="Пошук" className="p-1">
            <Search size={20} strokeWidth={1.5} />
          </Link>
          <CartLink />
          <Link
            href="/checkout"
            className="hidden items-center gap-2 rounded-full bg-red px-5 py-2.5 text-[13px] font-medium text-white md:inline-flex"
          >
            Оформити замовлення <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </HeaderFrame>
  );
}
