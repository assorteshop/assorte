-- Test product for the Gifts & Discoveries category. Safe to re-run.
insert into public.products
  (slug, name, tagline, description, price_uah, badge, category, image_url, images, colors,
   is_featured, is_published, sort_order)
values (
  'wooden-city-tesseracts-secret',
  'Механічний 3D-пазл Tesseract''s Secret',
  'Скринька-головоломка · Збірка з дерева',
  'Дерев''яна скринька-головоломка у формі тесеракта від WOODEN.CITY: спочатку її цікаво зібрати, а потім розгадати. Збирається приблизно за 3 години без клею та інструментів, деталі виготовлені лазерним різанням. Готову модель треба «відкрити»: знайти правильну послідовність рухів, щоб дістатися прихованої камери. Розвиває логіку, уважність і терпіння, а після збірки стає стильним об''єктом для інтер''єру. Рекомендований вік: від 14 років.',
  1500,
  null,
  'gifts',
  '/products/wooden-city-tesseracts-secret/1.webp',
  array[
    '/products/wooden-city-tesseracts-secret/1.webp',
    '/products/wooden-city-tesseracts-secret/2.webp',
    '/products/wooden-city-tesseracts-secret/3.webp',
    '/products/wooden-city-tesseracts-secret/4.webp'
  ],
  array['#c98a3c'],
  false,
  true,
  12
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
