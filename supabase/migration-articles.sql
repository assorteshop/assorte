-- Articles and editable homepage banners. Run once, safe to re-run.
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_url text,
  related_slugs text[] not null default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.home_banners (
  slot integer primary key check (slot between 1 and 3),
  eyebrow text not null default '',
  title text not null default '',
  body text,
  button_label text not null default 'Детальніше',
  href text not null default '/catalog',
  image_url text,
  tone text not null default 'light' check (tone in ('light', 'red')),
  is_active boolean not null default true
);

alter table public.articles enable row level security;
alter table public.home_banners enable row level security;

drop policy if exists "Read published articles or admin" on public.articles;
create policy "Read published articles or admin" on public.articles
  for select using (is_published or public.is_admin());
drop policy if exists "Admin insert articles" on public.articles;
create policy "Admin insert articles" on public.articles
  for insert with check (public.is_admin());
drop policy if exists "Admin update articles" on public.articles;
create policy "Admin update articles" on public.articles
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admin delete articles" on public.articles;
create policy "Admin delete articles" on public.articles
  for delete using (public.is_admin());

drop policy if exists "Read active banners or admin" on public.home_banners;
create policy "Read active banners or admin" on public.home_banners
  for select using (is_active or public.is_admin());
drop policy if exists "Admin insert banners" on public.home_banners;
create policy "Admin insert banners" on public.home_banners
  for insert with check (public.is_admin());
drop policy if exists "Admin update banners" on public.home_banners;
create policy "Admin update banners" on public.home_banners
  for update using (public.is_admin()) with check (public.is_admin());

-- The three banners currently on the homepage.
insert into public.home_banners (slot, eyebrow, title, body, button_label, href, tone) values
  (1, 'Заряд енергії скрізь, де ти', 'Надійний павербанк для активного життя', null, 'Дізнатися більше', '/catalog/tech', 'light'),
  (2, 'Подарунки з характером', 'Скриньки, які дивують', 'Більше, ніж подарунок — це емоція.', 'До колекції', '/catalog/gifts', 'red'),
  (3, 'Теплі аксесуари на кожен день', 'Стиль, комфорт і турбота', null, 'Переглянути', '/catalog/style', 'light')
on conflict (slot) do nothing;

-- A starter article, saved as a draft so you can edit and publish it.
insert into public.articles (slug, title, excerpt, body, related_slugs, is_published)
values (
  'yak-vybraty-powerbank',
  'Як вибрати повербанк: на що звернути увагу',
  'Ємність, потужність, порти та вбудований кабель: коротко про те, що справді важливо.',
  E'Повербанк стає в пригоді в дорозі, на тренуванні та вдома, коли розетка далеко. Ось на що варто дивитися перед покупкою.\n\n## Ємність (мАг)\n\nЧим більша ємність, тим більше разів можна зарядити пристрій. Для смартфона зазвичай вистачає 10 000 мАг. Для планшета чи ноутбука потрібна більша ємність і висока потужність.\n\n## Потужність (Вт)\n\nПотужність визначає швидкість зарядки. Для смартфона достатньо 20–30 Вт, для ноутбука з USB-C потрібно 45 Вт і більше.\n\n## Порти та кабель\n\n- USB-C підходить для сучасних смартфонів і ноутбуків.\n- USB-A потрібен для старіших пристроїв.\n- Вбудований кабель означає, що не потрібно возити окремий провід.\n\n## Розмір і вага\n\nКомпактний повербанк зручно носити в кишені чи сумці, а ємніший буде важчим. Обирайте баланс під свої звички.',
  array['baseus-picogo-45w-10000'],
  false
)
on conflict (slug) do nothing;
