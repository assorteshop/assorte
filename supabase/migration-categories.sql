-- Run once in the Supabase SQL editor (safe to re-run).
alter table public.products
  add column if not exists category text
    check (category in ('sport', 'tech', 'gifts', 'style')),
  add column if not exists description text;

create index if not exists products_category_idx on public.products (category);

update public.products set category = 'tech'   where slug = 'powerbank-20000'   and category is null;
update public.products set category = 'style'  where slug = 'muff-bag'          and category is null;
update public.products set category = 'gifts'  where slug = 'wooden-puzzle-box' and category is null;
