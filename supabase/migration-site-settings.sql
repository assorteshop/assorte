-- Public contact details and seller details shown on the Contacts, Offer and Delivery pages.
-- You type them in the admin (Settings). Nothing secret belongs here: everything is public.
-- Additive only. Safe to run more than once.

create table if not exists public.site_settings (
  key text primary key check (key in (
    'seller_name', 'seller_tax_id', 'seller_address',
    'contact_phone', 'contact_email', 'work_hours',
    'social_instagram', 'social_telegram', 'social_facebook', 'social_tiktok'
  )),
  value text not null default '' check (char_length(value) <= 500),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'site_settings' and policyname = 'Anyone can read site settings') then
    create policy "Anyone can read site settings" on public.site_settings
      for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site_settings' and policyname = 'Admin insert site settings') then
    create policy "Admin insert site settings" on public.site_settings
      for insert with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site_settings' and policyname = 'Admin update site settings') then
    create policy "Admin update site settings" on public.site_settings
      for update using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site_settings' and policyname = 'Admin delete site settings') then
    create policy "Admin delete site settings" on public.site_settings
      for delete using (public.is_admin());
  end if;
end $$;
