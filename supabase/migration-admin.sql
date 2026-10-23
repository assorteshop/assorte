-- Admin panel: admins, policies, image storage. Run once (safe to re-run).

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- Turns an existing Auth user (by email) into an admin. Run it yourself in the SQL editor.
create or replace function public.make_admin(p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(p_email);
  if v_id is null then
    return 'No Auth user with this email. Create it under Authentication > Users first.';
  end if;
  insert into public.admins (user_id) values (v_id) on conflict do nothing;
  return 'OK: ' || p_email || ' is now an admin';
end;
$$;
revoke all on function public.make_admin(text) from public, anon, authenticated;

drop policy if exists "Admins see themselves" on public.admins;
create policy "Admins see themselves" on public.admins
  for select using (user_id = auth.uid());

-- Products
drop policy if exists "Published products are public" on public.products;
drop policy if exists "Read published or admin" on public.products;
create policy "Read published or admin" on public.products
  for select using (is_published or public.is_admin());

drop policy if exists "Admin insert products" on public.products;
create policy "Admin insert products" on public.products
  for insert with check (public.is_admin());

drop policy if exists "Admin update products" on public.products;
create policy "Admin update products" on public.products
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin delete products" on public.products;
create policy "Admin delete products" on public.products
  for delete using (public.is_admin());

-- Orders
drop policy if exists "Admin read orders" on public.orders;
create policy "Admin read orders" on public.orders
  for select using (public.is_admin());

drop policy if exists "Admin update orders" on public.orders;
create policy "Admin update orders" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin read order items" on public.order_items;
create policy "Admin read order items" on public.order_items
  for select using (public.is_admin());

-- Product images (public bucket, only admins can change it)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "Product images are public" on storage.objects;
create policy "Product images are public" on storage.objects
  for select using (bucket_id = 'products');

drop policy if exists "Admin upload product images" on storage.objects;
create policy "Admin upload product images" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin update product images" on storage.objects;
create policy "Admin update product images" on storage.objects
  for update using (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images" on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());
