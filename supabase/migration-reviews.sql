-- Product reviews: customers write, you moderate, only approved reviews are shown.
-- Additive only. Safe to run more than once.

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 60),
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_idx
  on public.product_reviews (product_id) where status = 'approved';
create index if not exists product_reviews_status_idx
  on public.product_reviews (status, created_at desc);

alter table public.product_reviews enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'product_reviews' and policyname = 'Read approved reviews or admin') then
    create policy "Read approved reviews or admin" on public.product_reviews
      for select using (status = 'approved' or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'product_reviews' and policyname = 'Admin update reviews') then
    create policy "Admin update reviews" on public.product_reviews
      for update using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'product_reviews' and policyname = 'Admin delete reviews') then
    create policy "Admin delete reviews" on public.product_reviews
      for delete using (public.is_admin());
  end if;
end $$;
-- There is deliberately no insert policy: visitors can only add a review through the function below.

-- A visitor's review always starts as "pending" and is invisible until you approve it.
create or replace function public.submit_review(
  p_product_slug text,
  p_name text,
  p_rating integer,
  p_body text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
  v_name text := left(trim(coalesce(p_name, '')), 60);
  v_body text := left(trim(coalesce(p_body, '')), 2000);
begin
  if char_length(v_name) < 2 or char_length(v_body) < 10 or p_rating is null or p_rating not between 1 and 5 then
    raise exception 'Invalid review';
  end if;

  select id into v_product_id
  from public.products
  where slug = p_product_slug and is_published;

  if v_product_id is null then
    raise exception 'Product not available';
  end if;

  -- The same text for the same product is accepted once only (stops double clicks and copies).
  if exists (
    select 1 from public.product_reviews
    where product_id = v_product_id and lower(author_name) = lower(v_name) and body = v_body
  ) then
    return;
  end if;

  -- At most 30 reviews waiting for moderation per product, so nobody can flood the queue.
  if (select count(*) from public.product_reviews
      where product_id = v_product_id and status = 'pending') >= 30 then
    raise exception 'Too many pending reviews';
  end if;

  insert into public.product_reviews (product_id, author_name, rating, body)
  values (v_product_id, v_name, p_rating::smallint, v_body);
end;
$$;

revoke all on function public.submit_review(text, text, integer, text) from public;
grant execute on function public.submit_review(text, text, integer, text) to anon, authenticated;
