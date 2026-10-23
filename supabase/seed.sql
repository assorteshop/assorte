-- Demo products from the approved homepage mockup. Prices and names are design placeholders.
insert into public.products
  (slug, name, tagline, price_uah, badge, category, colors, is_featured, is_published, sort_order)
values
  ('powerbank-20000', 'Повербанк 20 000 мАг', 'Швидка зарядка · Компактний дизайн', 1490, 'Хіт', 'tech',
    '{#171717,#e9e1d6,#5d7260,#e9a0a0}', true, true, 1),
  ('muff-bag', 'Сумка-муфта Muff Bag', 'Тепло для рук · Стильний аксесуар', 1990, 'Новинка', 'style',
    '{#5a2e1f,#171717,#d9c2a7}', true, true, 2),
  ('wooden-puzzle-box', 'Скринька-головоломка', 'Незвичайний подарунок · Натуральне дерево', 1790, 'Хіт подарунків', 'gifts',
    '{#8a5a35,#e6c9a8,#6e5a3a}', true, true, 3)
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  price_uah = excluded.price_uah,
  badge = excluded.badge,
  category = excluded.category,
  colors = excluded.colors,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;
