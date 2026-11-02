-- Clears placeholder variant labels (".", "-", "—" and similar) left from when the field was required.
-- A label with no letter or digit is not a real variant. Safe to re-run. Shows the rows it cleared.
with cleared as (
  select id, slug, article, variant_label
  from public.products
  where variant_label is not null
    and variant_label !~ '[0-9A-Za-zА-Яа-яІіЇїЄєҐґ]'
),
upd as (
  update public.products
  set variant_label = null
  where id in (select id from cleared)
)
select slug, article, variant_label as old_label from cleared order by slug;
