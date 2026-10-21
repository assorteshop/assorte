-- ASSORTE catalogue. Run in the Supabase SQL editor.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  price_uah integer not null check (price_uah >= 0),
  badge text,
  image_url text,
  colors text[] not null default '{}',
  is_featured boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "Published products are public"
  on public.products for select
  using (is_published);

create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);
