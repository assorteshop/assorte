-- Put the real test products on the homepage and retire the mockup placeholders. Safe to re-run.
update public.products set is_featured = false
  where slug in ('powerbank-20000', 'muff-bag', 'wooden-puzzle-box');

update public.products set is_published = false
  where slug in ('powerbank-20000', 'wooden-puzzle-box');

update public.products set is_featured = true, sort_order = 1 where slug = 'yunmai-smart-skipping-rope';
update public.products set is_featured = true, sort_order = 2 where slug = 'baseus-picogo-45w-10000';
update public.products set is_featured = true, sort_order = 3 where slug = 'wooden-city-tesseracts-secret';
