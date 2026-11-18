import { createHmac, timingSafeEqual } from "node:crypto";

// «Покупка частинами» monobank: the customer pays in 3–25 parts from a monobank card.
// No payment page: the request goes to the customer's monobank app, the customer confirms it there,
// monobank calls our callback, and the shop confirms the order (that starts the installment).
// Docs: https://monobank.ua/api-docs/chast

const PROD = "https://u2.monobank.com.ua";
const SANDBOX = "https://u2-demo-ext.mono.st4g3.com";

/** How many parts the customer may choose. Each number must be 3–25; agreed with monobank. */
export const PARTS_COUNT = [3, 4, 6];

export const partsConfigured = () =>
  Boolean(process.env.MONO_PARTS_STORE_ID && process.env.MONO_PARTS_SECRET && process.env.SUPABASE_SERVICE_ROLE_KEY);

const base = () => (process.env.MONO_PARTS_SANDBOX === "1" ? SANDBOX : PROD);

/** monobank's signature: Base64(HMAC-SHA256(body, store secret)). */
export const signBody = (body: string, secret: string) =>
  createHmac("sha256", Buffer.from(secret, "utf8")).update(Buffer.from(body, "utf8")).digest("base64");

/** True when the callback's `signature` header matches the body signed with our store secret. */
export function verifyBody(body: string, signature: string, secret: string): boolean {
  if (!body || !signature || !secret) return false;
  const expected = Buffer.from(signBody(body, secret));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** A Ukrainian phone as monobank wants it: +380XXXXXXXXX, or null when it is not one. */
export function toMonoPhone(phone: string): string | null {
  const d = phone.replace(/\D/g, "");
  const full = d.length === 9 ? `380${d}` : d.length === 10 && d.startsWith("0") ? `38${d}` : d;
  return /^380\d{9}$/.test(full) ? `+${full}` : null;
}

async function call<T>(path: string, payload: unknown): Promise<{ status: number; json: T }> {
  const body = JSON.stringify(payload);
  const res = await fetch(`${base()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "store-id": process.env.MONO_PARTS_STORE_ID!,
      signature: signBody(body, process.env.MONO_PARTS_SECRET!),
    },
    body,
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  const text = await res.text();
  let json: T;
  try {
    json = JSON.parse(text) as T;
  } catch {
    throw new Error(`monobank parts ${path} ${res.status}: ${text.slice(0, 200)}`);
  }
  if (res.status >= 400) throw new Error(`monobank parts ${path} ${res.status}: ${text.slice(0, 200)}`);
  return { status: res.status, json };
}

/** Is this phone a monobank customer (only they can buy in parts)? */
export async function isMonoClient(phone: string): Promise<boolean> {
  const { json } = await call<{ found?: boolean }>("/api/v2/client/validate", { phone });
  return json.found === true;
}

/** Today in Kyiv as YYYY-MM-DD. */
const kyivDate = (d = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Kyiv", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

export type PartsLine = { name: string; qty: number; price: number };

/** The request that sends the installment application to the customer's monobank app. */
export function orderBody(opts: { orderNumber: number; phone: string; total: number; lines: PartsLine[]; siteUrl: string; date?: Date }) {
  return {
    store_order_id: String(opts.orderNumber),
    client_phone: opts.phone,
    total_sum: opts.total,
    invoice: { date: kyivDate(opts.date), number: String(opts.orderNumber), source: "INTERNET" },
    // `type` is marked deprecated in the docs, but monobank still rejects an order without it.
    available_programs: [{ available_parts_count: PARTS_COUNT, type: "payment_installments" }],
    products: opts.lines.map((l) => ({ name: l.name.slice(0, 500), count: l.qty, sum: l.price })),
    result_callback: `${opts.siteUrl}/api/mono-parts/callback`,
  };
}

/** Sends the application; returns monobank's id of it. */
export async function createPartsOrder(opts: Parameters<typeof orderBody>[0]): Promise<string> {
  const { json } = await call<{ order_id?: string }>("/api/order/create", orderBody(opts));
  if (!json.order_id) throw new Error("monobank parts: no order_id");
  return json.order_id;
}

export type PartsState = { order_id: string; state: string; order_sub_state: string; message?: string };

export const getPartsState = async (orderId: string) =>
  (await call<PartsState>("/api/order/state", { order_id: orderId })).json;

/** Confirms the order: the installment starts and the shop gets the money. */
export const confirmPartsOrder = async (orderId: string) =>
  (await call<PartsState>("/api/order/confirm", { order_id: orderId })).json;

/** What a state means for our order. */
export function partsOutcome(s: { state: string; order_sub_state: string }): "paid" | "confirm" | "failed" | "wait" {
  if (s.state === "SUCCESS") return "paid";
  if (s.state === "FAIL") return "failed";
  if (s.state === "IN_PROCESS" && s.order_sub_state === "WAITING_FOR_STORE_CONFIRM") return "confirm";
  return "wait";
}
