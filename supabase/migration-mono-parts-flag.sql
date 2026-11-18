-- «З розтермінуванням від monobank»: a product flag that shows monobank's «Покупка частинами»
-- label on the product card. One new column, products.mono_parts (off by default).
-- It is switched on for every product that already costs more than 3000 грн.
-- Run this BEFORE the site update goes live: the site reads this column. Safe to re-run.
alter table public.products add column if not exists mono_parts boolean not null default false;

-- «Жереб» has no product card, so it is left out.
update public.products set mono_parts = true
 where price_uah > 3000 and mono_parts = false and upper(coalesce(article, '')) <> 'ZHEREB';

-- Check: the products that now show the label.
select name, variant_label, price_uah, is_published from public.products where mono_parts order by price_uah desc;
