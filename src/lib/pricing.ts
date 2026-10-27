// Paying by card on the site gets an extra discount. The database applies the same rule
// when it creates the order (see supabase/migration-product-card.sql); keep the numbers equal.
export const ONLINE_DISCOUNT_PERCENT = 5;

export const onlineDiscount = (total: number) => Math.round((total * ONLINE_DISCOUNT_PERCENT) / 100);
