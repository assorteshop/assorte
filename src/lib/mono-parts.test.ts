import { describe, expect, it } from "vitest";
import { orderBody, partsOutcome, signBody, toMonoPhone, verifyBody } from "./mono-parts";

describe("«Покупка частинами» monobank", () => {
  it("signs like monobank's example: Base64(HMAC-SHA256(body, secret))", () => {
    // Reference value computed independently: echo -n '{"a":1}' | openssl dgst -sha256 -hmac secret -binary | base64
    expect(signBody('{"a":1}', "secret")).toBe("qp4uNXX11wmLbKzNeQiIw21f22M0KnO62i1qUXR6hJQ=");
  });

  it("accepts only callbacks signed with our secret", () => {
    const body = '{"order_id":"x","state":"IN_PROCESS","order_sub_state":"WAITING_FOR_STORE_CONFIRM"}';
    const sig = signBody(body, "s3cret");
    expect(verifyBody(body, sig, "s3cret")).toBe(true);
    expect(verifyBody(body, sig, "other")).toBe(false);
    expect(verifyBody(body.replace("IN_PROCESS", "SUCCESS"), sig, "s3cret")).toBe(false);
    expect(verifyBody(body, "", "s3cret")).toBe(false);
  });

  it("writes Ukrainian phones as +380XXXXXXXXX", () => {
    expect(toMonoPhone("+38 (098) 304-73-34")).toBe("+380983047334");
    expect(toMonoPhone("0983047334")).toBe("+380983047334");
    expect(toMonoPhone("983047334")).toBe("+380983047334");
    expect(toMonoPhone("+48 501 234 567")).toBeNull();
  });

  it("sends the order with its lines, parts and our callback", () => {
    const b = orderBody({
      orderNumber: 1020,
      phone: "+380983047334",
      total: 3290,
      lines: [{ name: "Жереб — Нова · Своє", qty: 1, price: 3290 }],
      siteUrl: "https://assorte.com.ua",
      date: new Date("2026-11-18T23:30:00Z"),
    });
    expect(b.store_order_id).toBe("1020");
    expect(b.total_sum).toBe(3290);
    expect(b.invoice).toEqual({ date: "2026-11-19", number: "1020", source: "INTERNET" }); // Kyiv date
    expect(b.products).toEqual([{ name: "Жереб — Нова · Своє", count: 1, sum: 3290 }]);
    expect(b.available_programs[0].available_parts_count.every((n) => n >= 3 && n <= 25)).toBe(true);
    expect(b.result_callback).toBe("https://assorte.com.ua/api/mono-parts/callback");
  });

  it("turns states into what happens to the order", () => {
    expect(partsOutcome({ state: "IN_PROCESS", order_sub_state: "WAITING_FOR_STORE_CONFIRM" })).toBe("confirm");
    expect(partsOutcome({ state: "IN_PROCESS", order_sub_state: "WAITING_FOR_CLIENT" })).toBe("wait");
    expect(partsOutcome({ state: "SUCCESS", order_sub_state: "ACTIVE" })).toBe("paid");
    expect(partsOutcome({ state: "FAIL", order_sub_state: "REJECTED_BY_CLIENT" })).toBe("failed");
  });
});
