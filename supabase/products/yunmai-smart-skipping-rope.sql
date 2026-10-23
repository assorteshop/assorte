-- Test product for the Sport & Active category. Run once; safe to re-run.
alter table public.products
  add column if not exists images text[] not null default '{}';

insert into public.products
  (slug, name, tagline, description, price_uah, badge, category, image_url, images, colors,
   is_featured, is_published, sort_order)
values (
  'yunmai-smart-skipping-rope',
  'Смарт-скакалка YUNMAI Smart Skipping Rope',
  'Лічильник стрибків і калорій · Регульований шнур',
  'Скакалка з вбудованим світлодіодним дисплеєм рахує стрибки, час тренування і спалені калорії. Підключається до мобільного застосунку: можна тренуватися за кількістю стрибків, за часом або приймати виклики. Спеціальний підшипник забезпечує плавне обертання, а довжина шнура (до 3 м) регулюється під будь-який зріст. У комплекті: чохол, шнур, дві ручки, кабель живлення та інструкція.',
  1500,
  null,
  'sport',
  '/products/yunmai-smart-skipping-rope/1.jpg',
  array[
    '/products/yunmai-smart-skipping-rope/1.jpg',
    '/products/yunmai-smart-skipping-rope/2.jpg',
    '/products/yunmai-smart-skipping-rope/3.jpg',
    '/products/yunmai-smart-skipping-rope/4.jpg',
    '/products/yunmai-smart-skipping-rope/5.jpg'
  ],
  array['#171717'],
  false,
  true,
  10
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
