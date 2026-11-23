import Link from "next/link";
import { ActivePillIntoView } from "./ActivePillIntoView";
import { audiences, categories, hasSubsections, type Audience, type CategorySlug } from "@/lib/categories";

type Props = { active?: CategorySlug; audience?: Audience };

const audienceHref = (category: CategorySlug, a?: Audience) => `/catalog/${category}${a ? `/${a}` : ""}`;

/** Computer: a quiet vertical list on the left; the open category shows its «Для кого» under it. */
export function CatalogSideNav({ active, audience }: Props) {
  const item = (on: boolean) =>
    `block py-2 text-[16px] transition-colors ${on ? "font-medium text-graphite" : "text-muted hover:text-graphite"}`;

  return (
    <nav aria-label="Категорії" className="sticky top-24">
      <ul>
        <li>
          <Link href="/catalog" className={item(!active)} aria-current={!active ? "page" : undefined}>
            Усі товари
          </Link>
        </li>
        {categories.map((c) => {
          const open = active === c.slug;
          return (
            <li key={c.slug}>
              <Link
                href={`/catalog/${c.slug}`}
                className={item(open)}
                aria-current={open && !audience ? "page" : undefined}
              >
                {c.name}
              </Link>
              {open && hasSubsections(c.slug) && (
                <ul className="mb-2 ml-0.5 border-l border-line pl-4">
                  {audiences.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={audienceHref(c.slug, a.slug)}
                        aria-current={audience === a.slug ? "page" : undefined}
                        className={`block py-1.5 text-[15px] transition-colors ${
                          audience === a.slug ? "text-red" : "text-muted hover:text-graphite"
                        }`}
                      >
                        {a.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Phone: the categories as a row of pills you swipe; for watches a second row with «Для кого». */
export function CatalogPills({ active, audience }: Props) {
  const pill = (on: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-[14px] ${
      on ? "border-graphite bg-graphite text-white" : "border-line bg-white"
    }`;
  const row = "-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

  return (
    <div className="space-y-3 md:hidden">
      <ActivePillIntoView label="Категорії" className={`${row} relative`}>
        <ul className="flex gap-2">
          <li>
            <Link href="/catalog" className={pill(!active)} aria-current={!active ? "page" : undefined}>
              Усі товари
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/catalog/${c.slug}`} className={pill(active === c.slug)} aria-current={active === c.slug ? "page" : undefined}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </ActivePillIntoView>
      {active && hasSubsections(active) && (
        <nav aria-label="Для кого" className={row}>
          <ul className="flex gap-5 border-b border-line">
            {[{ slug: undefined, name: "Усі" }, ...audiences].map((a) => {
              const on = audience === a.slug;
              return (
                <li key={a.name}>
                  <Link
                    href={audienceHref(active, a.slug)}
                    aria-current={on ? "page" : undefined}
                    className={`-mb-px block border-b-2 pb-2.5 text-[15px] ${on ? "border-red text-graphite" : "border-transparent text-muted"}`}
                  >
                    {a.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
