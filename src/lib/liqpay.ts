import { createHash, timingSafeEqual } from "node:crypto";

const CHECKOUT_URL = "https://www.liqpay.ua/api/3/checkout";

export const liqpayConfigured = () =>
  Boolean(
    process.env.LIQPAY_PUBLIC_KEY &&
      process.env.LIQPAY_PRIVATE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

export const isSandbox = () => process.env.LIQPAY_SANDBOX === "1";

// LiqPay signature: base64( sha1( private_key + data + private_key ) ).
export function sign(data: string, privateKey: string) {
  return createHash("sha1").update(privateKey + data + privateKey).digest("base64");
}

export function buildCheckout(opts: { orderNumber: number; amount: number; siteUrl: string }) {
  const publicKey = process.env.LIQPAY_PUBLIC_KEY!;
  const privateKey = process.env.LIQPAY_PRIVATE_KEY!;

  const params: Record<string, string | number> = {
    version: 3,
    public_key: publicKey,
    action: "pay",
    amount: opts.amount,
    currency: "UAH",
    description: `Замовлення №${opts.orderNumber} ASSORTE`,
    order_id: String(opts.orderNumber),
    language: "uk",
    result_url: `${opts.siteUrl}/checkout/result`,
    server_url: `${opts.siteUrl}/api/liqpay/callback`,
  };
  if (isSandbox()) params.sandbox = 1;

  const data = Buffer.from(JSON.stringify(params)).toString("base64");
  return { url: CHECKOUT_URL, data, signature: sign(data, privateKey) };
}

export function verifyCallback(data: string, signature: string) {
  const privateKey = process.env.LIQPAY_PRIVATE_KEY;
  if (!privateKey || !data || !signature) return false;
  const expected = Buffer.from(sign(data, privateKey));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export type LiqpayCallback = {
  status?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  payment_id?: number | string;
};

export const decodeCallback = (data: string): LiqpayCallback =>
  JSON.parse(Buffer.from(data, "base64").toString("utf8"));

export const siteUrl = () =>
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "assorte.vercel.app"}`;
