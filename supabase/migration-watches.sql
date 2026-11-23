-- «Годинники»: a new category with sub-sections. Run once, safe to re-run.
-- Run this BEFORE the site update goes live: the site reads the two new columns.
--
-- 1) Products and blog articles may now have the category 'watches'.
alter table public.products drop constraint if exists products_category_check;
alter table public.products add constraint products_category_check
  check (category in ('sport', 'tech', 'gifts', 'style', 'climate', 'auto', 'watches'));

alter table public.articles drop constraint if exists articles_category_slug_check;
alter table public.articles add constraint articles_category_slug_check
  check (category_slug is null
         or category_slug in ('sport', 'tech', 'gifts', 'style', 'climate', 'auto', 'watches'));

-- 2) Two new columns, filled only for watches (empty for every other product):
--    audience — «Для кого»: men = Чоловікам, women = Жінкам, kids = Дитячі
--    subtype  — «Тип»:      wrist = Наручні, smart = Смарт, accessories = Аксесуари
alter table public.products add column if not exists audience text
  check (audience is null or audience in ('men', 'women', 'kids'));
alter table public.products add column if not exists subtype text
  check (subtype is null or subtype in ('wrist', 'smart', 'accessories'));
