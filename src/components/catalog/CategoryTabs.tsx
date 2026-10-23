import Link from "next/link";
import { categories, type CategorySlug } from "@/lib/categories";

export function CategoryTabs({ active }: { active?: CategorySlug }) {
  const tab = (isActive: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-[13px] ${
      isActive
        ? "border-graphite bg-graphite text-white"
        : "border-line bg-white hover:border-graphite"
    }`;

  return (
    <nav aria-label="Категорії" className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <ul className="flex gap-2">
        <li>
          <Link href="/catalog" className={tab(!active)} aria-current={!active ? "page" : undefined}>
            Усі товари
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/catalog/${c.slug}`}
              className={tab(active === c.slug)}
              aria-current={active === c.slug ? "page" : undefined}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
