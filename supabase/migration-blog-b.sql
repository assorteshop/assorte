-- Blog sprint, stage B: a homepage block can show an article.
-- Additive only. Safe to run more than once.
alter table public.home_banners
  add column if not exists article_id uuid references public.articles (id) on delete set null;
