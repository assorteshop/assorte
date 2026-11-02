-- Order of the "Популярні товари" slider, set on the admin page "Популярні".
-- Adds one column and fills it for products that are already featured, in today's order. Safe to re-run.
alter table public.products add column if not exists featured_order integer;

with ranked as (
  select id, row_number() over (order by sort_order, created_at) as rn
  from public.products
  where is_featured
)
update public.products p
set featured_order = ranked.rn * 10
from ranked
where p.id = ranked.id and p.featured_order is null;
