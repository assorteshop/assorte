-- Order source (first touch): where the customer first came from — utm tags, the referring
-- site (google, instagram, t.me…) or "direct", plus the first page they opened.
-- Additive only: one new column and one new function. Safe to re-run.

alter table public.orders
  add column if not exists first_touch jsonb;

-- The site cannot write to orders directly (no public policies), so the source is saved
-- through this function. It only fills an empty source, only on an order made in the last
-- 15 minutes, and only a small JSON object — so it cannot be used to rewrite old orders.
create or replace function public.set_order_first_touch(p_number bigint, p_first_touch jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_first_touch is null
     or jsonb_typeof(p_first_touch) <> 'object'
     or length(p_first_touch::text) > 2000 then
    return;
  end if;

  update public.orders
     set first_touch = p_first_touch
   where number = p_number
     and first_touch is null
     and created_at > now() - interval '15 minutes';
end;
$$;

revoke all on function public.set_order_first_touch(bigint, jsonb) from public;
grant execute on function public.set_order_first_touch(bigint, jsonb) to anon, authenticated;
