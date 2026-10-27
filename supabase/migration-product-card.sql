-- Product card update: specifications, Ukrposhta delivery, 5% discount for paying by card on the site.
-- No data is deleted or changed. Safe to run more than once.

-- 1) Specifications table on a product page
alter table public.products
  add column if not exists specs jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_specs_is_array') then
    alter table public.products add constraint products_specs_is_array
      check (jsonb_typeof(specs) = 'array');
  end if;
end $$;

-- 2) Orders: a discount column, and Ukrposhta as a second delivery method.
--    The old delivery check only allowed 'nova_poshta', so it is replaced by a longer one.
alter table public.orders
  add column if not exists discount_uah integer not null default 0;

alter table public.orders drop constraint if exists orders_delivery_method_check;
alter table public.orders add constraint orders_delivery_method_check
  check (delivery_method in ('nova_poshta', 'ukrposhta'));

-- 3) create_order: accepts Ukrposhta; paying by card on the site (liqpay) takes 5% off the total.
--    The total and the discount are calculated here from the products table, never by the browser.
--    Also moved to search_path = '' with fully qualified names (same rule as the blog functions).
--    The function keeps the same signature and still returns jsonb.
create or replace function public.create_order(
  p_name text,
  p_phone text,
  p_email text,
  p_city text,
  p_delivery text,
  p_address text,
  p_comment text,
  p_payment text,
  p_items jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_number bigint;
  v_total integer := 0;
  v_discount integer := 0;
  v_qty integer;
  v_item record;
  v_product record;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = ''
     or coalesce(trim(p_city), '') = '' or coalesce(trim(p_address), '') = '' then
    raise exception 'Missing required customer fields';
  end if;

  if p_delivery not in ('nova_poshta', 'ukrposhta') or p_payment not in ('cod', 'liqpay') then
    raise exception 'Unsupported delivery or payment method';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'Invalid items';
  end if;

  insert into public.orders (customer_name, phone, email, city, delivery_method,
                             delivery_address, comment, payment_method)
  values (left(trim(p_name), 200), left(trim(p_phone), 40), nullif(left(trim(coalesce(p_email, '')), 200), ''),
          left(trim(p_city), 200), p_delivery, left(trim(p_address), 400),
          nullif(left(trim(coalesce(p_comment, '')), 1000), ''), p_payment)
  returning id, number into v_order_id, v_number;

  for v_item in
    select * from jsonb_to_recordset(p_items) as x(slug text, qty integer)
  loop
    v_qty := least(greatest(coalesce(v_item.qty, 1), 1), 20);

    select id, name, variant_label, price_uah into v_product
    from public.products
    where slug = v_item.slug and is_published;

    if not found then
      raise exception 'Product not available: %', v_item.slug;
    end if;

    insert into public.order_items (order_id, product_id, slug, name, price_uah, qty, line_total)
    values (v_order_id, v_product.id, v_item.slug,
            v_product.name || coalesce(' — ' || v_product.variant_label, ''),
            v_product.price_uah, v_qty, v_product.price_uah * v_qty);

    v_total := v_total + v_product.price_uah * v_qty;
  end loop;

  -- 5% off for paying by card on the site (src/lib/pricing.ts must use the same number)
  if p_payment = 'liqpay' then
    v_discount := round(v_total * 5 / 100.0)::integer;
  end if;

  update public.orders
     set total_uah = v_total - v_discount,
         discount_uah = v_discount
   where id = v_order_id;

  return jsonb_build_object('number', v_number, 'total', v_total - v_discount, 'discount', v_discount);
end;
$$;

revoke all on function public.create_order(text, text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, text, text, text, text, jsonb) to anon, authenticated;
