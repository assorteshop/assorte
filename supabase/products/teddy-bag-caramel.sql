-- Test product for the Style & Comfort category. Safe to re-run.
insert into public.products
  (slug, name, tagline, description, price_uah, badge, category, image_url, images, colors,
   is_featured, is_published, sort_order)
values (
  'teddy-bag-caramel',
  'Плюшева сумка Teddy з текстильним ремінцем',
  'М''яка тканина тедді · Карамельний колір',
  'Компактна сумка з м''якої плюшевої тканини тедді теплого карамельного кольору. Застібка-змійка, акуратна шкіряна нашивка та яскравий текстильний ремінець з орнаментом, який можна носити через плече. Вміщує базові речі: телефон, гаманець, ключі. Тепла фактура робить образ затишнішим у холодну пору.',
  2200,
  null,
  'style',
  '/products/teddy-bag-caramel/1.jpg',
  array['/products/teddy-bag-caramel/1.jpg'],
  array['#a9692f'],
  false,
  true,
  13
)
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  price_uah = excluded.price_uah,
  category = excluded.category,
  image_url = excluded.image_url,
  images = excluded.images,
  colors = excluded.colors,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;
