-- «Ціна зі знижкою»: one new column, products.old_price_uah — the earlier price shown crossed out.
-- price_uah stays what the customer pays (cart, orders and payments use only it), so nothing else
-- changes. Empty for all products: no product shows a discount until it is set in the admin.
-- Run this BEFORE the site update goes live: the site reads this column. Safe to re-run.
alter table public.products add column if not exists old_price_uah integer
  check (old_price_uah is null or old_price_uah > 0);
