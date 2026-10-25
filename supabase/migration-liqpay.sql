-- Online payment (LiqPay). Run once, safe to re-run.
alter table public.orders
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists paid_at timestamptz,
  add column if not exists liqpay_payment_id text;

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('unpaid', 'paid', 'failed'));

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('cod', 'liqpay'));

-- Now returns the order number and the total (computed from the products table).
drop function if exists public.create_order(text, text, text, text, text, text, text, text, jsonb);

create function public.create_order(
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
set search_path = public
as $$
declare
  v_order_id uuid;
  v_number bigint;
  v_total integer := 0;
  v_qty integer;
  v_item record;
  v_product record;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = ''
     or coalesce(trim(p_city), '') = '' or coalesce(trim(p_address), '') = '' then
    raise exception 'Missing required customer fields';
  end if;

  if p_delivery <> 'nova_poshta' or p_payment not in ('cod', 'liqpay') then
    raise exception 'Unsupported delivery or payment method';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'Invalid items';
  end if;

  insert into orders (customer_name, phone, email, city, delivery_method,
                      delivery_address, comment, payment_method)
  values (left(trim(p_name), 200), left(trim(p_phone), 40), nullif(left(trim(coalesce(p_email, '')), 200), ''),
          left(trim(p_city), 200), p_delivery, left(trim(p_address), 400),
          nullif(left(trim(coalesce(p_comment, '')), 1000), ''), p_payment)
  returning id, number into v_order_id, v_number;

  for v_item in
    select * from jsonb_to_recordset(p_items) as x(slug text, qty integer)
  loop
    v_qty := least(greatest(coalesce(v_item.qty, 1), 1), 20);

    select id, name, price_uah into v_product
    from products
    where slug = v_item.slug and is_published;

    if not found then
      raise exception 'Product not available: %', v_item.slug;
    end if;

    insert into order_items (order_id, product_id, slug, name, price_uah, qty, line_total)
    values (v_order_id, v_product.id, v_item.slug, v_product.name, v_product.price_uah,
            v_qty, v_product.price_uah * v_qty);

    v_total := v_total + v_product.price_uah * v_qty;
  end loop;

  update orders set total_uah = v_total where id = v_order_id;
  return jsonb_build_object('number', v_number, 'total', v_total);
end;
$$;

revoke all on function public.create_order(text, text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, text, text, text, text, jsonb) to anon, authenticated;
