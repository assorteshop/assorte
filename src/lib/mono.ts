import { createVerify } from "node:crypto";

// plata by mono (monobank internet acquiring): card payment on the site.
// The customer pays on monobank's own page; monobank then calls our webhook, signed with its key.
// Docs: https://monobank.ua/api-docs/acquiring

const API = "https://api.monobank.ua/api/merchant";

/** Card payment through monobank works only with the merchant token and the key that lets the webhook mark orders paid. */
export const monoConfigured = () => Boolean(process.env.MONO_TOKEN && process.env.SUPABASE_SERVICE_ROLE_KEY);

const headers = () => ({ "X-Token": process.env.MONO_TOKEN!, "Content-Type": "application/json" });

/** Hryvnias → kopiykas (monobank counts in the smallest unit). */
export const toKop = (uah: number) => Math.round(uah * 100);

/** What we send to monobank to create the payment page for an order. */
export function invoiceBody(opts: { orderNumber: number; amount: number; siteUrl: string }) {
  return {
    amount: toKop(opts.amount),
    ccy: 980, // UAH
    merchantPaymInfo: {
      reference: String(opts.orderNumber),
      destination: `Замовлення №${opts.orderNumber} ASSORTE`,
    },
    redirectUrl: `${opts.siteUrl}/checkout/result`,
    webHookUrl: `${opts.siteUrl}/api/mono/webhook`,
    paymentType: "debit",
  };
}

/** Creates the monobank payment page for an order and returns its address. */
export async function createInvoice(opts: { orderNumber: number; amount: number; siteUrl: string }) {
  const res = await fetch(`${API}/invoice/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(invoiceBody(opts)),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`monobank invoice ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { invoiceId?: string; pageUrl?: string };
  if (!json.pageUrl || !json.invoiceId) throw new Error("monobank invoice: no pageUrl");
  return { invoiceId: json.invoiceId, pageUrl: json.pageUrl };
}

export type MonoInvoiceStatus = {
  invoiceId: string;
  status: string; // created | processing | hold | success | failure | reversed | expired
  amount: number; // kopiykas
  ccy: number;
  reference?: string;
};

/** The current state of a payment, asked from monobank itself (the webhook only tells us to look). */
export async function getInvoiceStatus(invoiceId: string): Promise<MonoInvoiceStatus> {
  const res = await fetch(`${API}/invoice/status?invoiceId=${encodeURIComponent(invoiceId)}`, {
    headers: headers(),
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`monobank status ${res.status}: ${await res.text()}`);
  return (await res.json()) as MonoInvoiceStatus;
}

/** True when `signature` (the X-Sign header, base64) is monobank's ECDSA/SHA-256 signature of `body`. */
export function verifySignature(body: string, signature: string, pubKeyBase64: string): boolean {
  if (!body || !signature || !pubKeyBase64) return false;
  try {
    const pem = Buffer.from(pubKeyBase64, "base64").toString("utf8");
    const verify = createVerify("SHA256");
    verify.update(body);
    verify.end();
    return verify.verify(pem, Buffer.from(signature, "base64"));
  } catch {
    return false;
  }
}

// monobank's public key may be cached; it is fetched again once when a signature does not match (key change).
let cachedKey: string | null = null;

async function fetchPubKey(): Promise<string> {
  const res = await fetch(`${API}/pubkey`, { headers: headers(), signal: AbortSignal.timeout(10000), cache: "no-store" });
  if (!res.ok) throw new Error(`monobank pubkey ${res.status}`);
  const json = (await res.json()) as { key?: string };
  if (!json.key) throw new Error("monobank pubkey: empty");
  return json.key;
}

/** Checks the webhook signature against monobank's current public key. */
export async function verifyWebhook(body: string, signature: string): Promise<boolean> {
  if (!signature) return false;
  if (cachedKey && verifySignature(body, signature, cachedKey)) return true;
  cachedKey = await fetchPubKey();
  return verifySignature(body, signature, cachedKey);
}

/** What a payment status means for the order: paid, failed, or nothing to do yet. */
export function outcome(status: string): "paid" | "failed" | "wait" {
  if (status === "success") return "paid";
  if (status === "failure" || status === "expired") return "failed";
  return "wait"; // created, processing, hold; reversed (a refund) is handled by hand in the monobank cabinet
}
