-- Test product for the Tech & Gadgets category. Safe to re-run.
insert into public.products
  (slug, name, tagline, description, price_uah, badge, category, image_url, images, colors,
   is_featured, is_published, sort_order)
values (
  'baseus-picogo-45w-10000',
  'Повербанк Baseus PicoGo 45W 10 000 мАг',
  '45 Вт · Вбудований кабель USB-C',
  'Компактний повербанк на 10 000 мАг із вбудованим кабелем USB-C: не потрібно возити окремий провід. Потужність до 45 Вт підходить для швидкої зарядки смартфонів, планшетів і ноутбуків із USB-C. Виходи: USB-A, USB-C і вбудований кабель. Захист від перезаряджання, перевантаження за струмом і короткого замикання. Розміри 88×60×26 мм, вага 213 г, колір білий.',
  2500,
  null,
  'tech',
  '/products/baseus-picogo-45w-10000/1.webp',
  array[
    '/products/baseus-picogo-45w-10000/1.webp',
    '/products/baseus-picogo-45w-10000/2.webp',
    '/products/baseus-picogo-45w-10000/3.webp'
  ],
  array['#ffffff'],
  false,
  true,
  11
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
