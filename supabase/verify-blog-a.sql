-- Checks the access rules of migration A as the anonymous visitor ("anon" role).
-- Creates test rows, looks at them as anon, then ALWAYS rolls everything back by raising an
-- error that contains the result. Nothing is saved. The red "ERROR: RESULT ..." message is expected.
do $$
declare
  n_private text;
  n_history text;
  n_draft text;
  n_published text;
  r_draft text;
  r_published text;
begin
  insert into public.articles (id, slug, title, is_published, published_at) values
    ('00000000-0000-4000-8000-0000000000a1', 'zz-rls-test-draft', 'RLS test draft', false, null),
    ('00000000-0000-4000-8000-0000000000a2', 'zz-rls-test-published', 'RLS test published', true, now());
  insert into public.article_private (article_id, target_query)
    values ('00000000-0000-4000-8000-0000000000a1', 'secret note');
  insert into public.article_slug_history (old_slug, article_id) values
    ('zz-old-draft', '00000000-0000-4000-8000-0000000000a1'),
    ('zz-old-published', '00000000-0000-4000-8000-0000000000a2');

  set local role anon;

  begin
    select count(*)::text into n_private from public.article_private;
  exception when others then n_private := 'error: ' || sqlerrm;
  end;
  begin
    select count(*)::text into n_history from public.article_slug_history;
  exception when others then n_history := 'error: ' || sqlerrm;
  end;
  begin
    select count(*)::text into n_draft from public.articles
      where id = '00000000-0000-4000-8000-0000000000a1';
  exception when others then n_draft := 'error: ' || sqlerrm;
  end;
  begin
    select count(*)::text into n_published from public.articles
      where id = '00000000-0000-4000-8000-0000000000a2';
  exception when others then n_published := 'error: ' || sqlerrm;
  end;
  begin
    select coalesce(public.resolve_article_slug('zz-old-draft'), 'NULL') into r_draft;
  exception when others then r_draft := 'error: ' || sqlerrm;
  end;
  begin
    select coalesce(public.resolve_article_slug('zz-old-published'), 'NULL') into r_published;
  exception when others then r_published := 'error: ' || sqlerrm;
  end;

  raise exception E'RESULT (as anon; all test rows are rolled back)\n'
    'article_private rows visible: % (must be 0)\n'
    'article_slug_history rows visible: % (must be 0)\n'
    'unpublished article visible: % (must be 0)\n'
    'published article visible: % (must be 1)\n'
    'resolve_article_slug(old slug of the UNPUBLISHED article) = % (must be NULL)\n'
    'resolve_article_slug(old slug of the PUBLISHED article) = % (must be zz-rls-test-published)',
    n_private, n_history, n_draft, n_published, r_draft, r_published;
end $$;
