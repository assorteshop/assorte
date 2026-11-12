import { generateKeyPairSync, createSign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { invoiceBody, outcome, toKop, verifySignature } from "./mono";

describe("monobank", () => {
  it("sends the amount in kopiykas with the order number and our addresses", () => {
    const b = invoiceBody({ orderNumber: 1013, amount: 1790, siteUrl: "https://assorte.com.ua" });
    expect(b.amount).toBe(179000);
    expect(b.ccy).toBe(980);
    expect(b.merchantPaymInfo.reference).toBe("1013");
    expect(b.redirectUrl).toBe("https://assorte.com.ua/checkout/result");
    expect(b.webHookUrl).toBe("https://assorte.com.ua/api/mono/webhook");
    expect(toKop(19.99)).toBe(1999);
  });

  it("accepts only monobank's signature of the exact body", () => {
    const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
    const pem = publicKey.export({ type: "spki", format: "pem" }).toString();
    const key = Buffer.from(pem).toString("base64"); // monobank gives the PEM in base64
    const body = JSON.stringify({ invoiceId: "abc", status: "success" });
    const sign = createSign("SHA256");
    sign.update(body);
    const sig = sign.sign(privateKey).toString("base64");

    expect(verifySignature(body, sig, key)).toBe(true);
    expect(verifySignature(body.replace("success", "failure"), sig, key)).toBe(false);
    expect(verifySignature(body, "", key)).toBe(false);
    expect(verifySignature(body, "bm90IGEgc2lnbmF0dXJl", key)).toBe(false);
  });

  it("turns payment states into what happens to the order", () => {
    expect(outcome("success")).toBe("paid");
    expect(outcome("failure")).toBe("failed");
    expect(outcome("expired")).toBe("failed");
    for (const s of ["created", "processing", "hold", "reversed"]) expect(outcome(s)).toBe("wait");
  });
});
