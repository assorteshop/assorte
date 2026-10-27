-- Blog sprint, stage A: new article fields.
-- Additive only: no data is changed or removed, nothing existing is renamed.
-- Safe to run more than once.

-- 1) New fields on articles
alter table public.articles
  add column if not exists seo_title text,
  add column if not exists meta_description text,
  add column if not exists title_accent text,
  add column if not exists eyebrow text,
  add column if not exists category_slug text,
  add column if not exists cover_alt text,
  add column if not exists faq jsonb not null default '[]'::jsonb,
  add column if not exists sources jsonb not null default '[]'::jsonb,
  add column if not exists primary_product_id uuid references public.products (id) on delete set null;

-- Categories live in code (src/lib/categories.ts), there is no categories table, so this stays a CHECK.
-- When a new category is added, update ALL THREE places:
--   1) src/lib/categories.ts
--   2) this constraint: articles_category_slug_check
--   3) products_category_check on public.products
-- (drop the constraint and add it again with the longer list, in a new migration).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'articles_category_slug_check') then
    alter table public.articles add constraint articles_category_slug_check
      check (category_slug is null
             or category_slug in ('sport', 'tech', 'gifts', 'style', 'climate', 'auto'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'articles_faq_is_array') then
    alter table public.articles add constraint articles_faq_is_array
      check (jsonb_typeof(faq) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'articles_sources_is_array') then
    alter table public.articles add constraint articles_sources_is_array
      check (jsonb_typeof(sources) = 'array');
  end if;
end $$;

create index if not exists articles_category_idx
  on public.articles (category_slug) where is_published;
create index if not exists articles_primary_product_idx
  on public.articles (primary_product_id);

-- 2) Founder-only notes. A separate table, because row security cannot hide a single
--    column: anything in public.articles is readable through the public API.
create table if not exists public.article_private (
  article_id uuid primary key references public.articles (id) on delete cascade,
  target_query text
);
alter table public.article_private enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'article_private' and policyname = 'Admin read article notes') then
    create policy "Admin read article notes" on public.article_private
      for select using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'article_private' and policyname = 'Admin insert article notes') then
    create policy "Admin insert article notes" on public.article_private
      for insert with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'article_private' and policyname = 'Admin update article notes') then
    create policy "Admin update article notes" on public.article_private
      for update using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'article_private' and policyname = 'Admin delete article notes') then
    create policy "Admin delete article notes" on public.article_private
      for delete using (public.is_admin());
  end if;
end $$;

-- 3) updated_at is refreshed on every change, also for edits made directly in Supabase
create or replace function public.articles_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace trigger articles_touch_updated
  before update on public.articles
  for each row execute function public.articles_touch();

-- 4) Slug history, so an old address of a published article can redirect (301)
create table if not exists public.article_slug_history (
  old_slug text primary key,
  article_id uuid not null references public.articles (id) on delete cascade,
  changed_at timestamptz not null default now()
);
alter table public.article_slug_history enable row level security; -- no policies: not readable directly

create or replace function public.articles_remember_slug()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.slug is distinct from new.slug and old.is_published then
    insert into public.article_slug_history (old_slug, article_id)
    values (old.slug, old.id)
    on conflict (old_slug) do update set article_id = excluded.article_id, changed_at = now();
  end if;
  return new;
end;
$$;

create or replace trigger articles_slug_history
  before update of slug on public.articles
  for each row execute function public.articles_remember_slug();

-- The only public way to use the history: old slug -> current slug of a published article
create or replace function public.resolve_article_slug(p_slug text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select a.slug
  from public.article_slug_history h
  join public.articles a on a.id = h.article_id
  where h.old_slug = p_slug and a.is_published
  limit 1;
$$;
revoke all on function public.resolve_article_slug(text) from public;
grant execute on function public.resolve_article_slug(text) to anon, authenticated;
