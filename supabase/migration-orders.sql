-- Orders. Run once in the Supabase SQL editor (safe to re-run).
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001),
  customer_name text not null,
  phone text not null,
  email text,
  city text not null,
  delivery_method text not null check (delivery_method in ('nova_poshta')),
  delivery_address text not null,
  comment text,
  payment_method text not null check (payment_method in ('cod')),
  total_uah integer not null default 0,
  status text not null default 'new' check (status in ('new', 'confirmed', 'shipped', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  slug text not null,
  name text not null,
  price_uah integer not null,
  qty integer not null check (qty between 1 and 20),
  line_total integer not null
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- No public policies: the site cannot read or write orders directly.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- The only way in is this function. It takes prices from the products table,
-- so a visitor cannot choose their own price.
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
) returns bigint
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

  if p_delivery <> 'nova_poshta' or p_payment <> 'cod' then
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
  return v_number;
end;
$$;

revoke all on function public.create_order(text, text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, text, text, text, text, jsonb) to anon, authenticated;
