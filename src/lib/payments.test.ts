import { describe, expect, it } from "vitest";
import { paymentOptions } from "./payments";

describe("online payment options", () => {
  it("monobank takes the card and LiqPay stays for the installment", () => {
    expect(paymentOptions(true, true)).toEqual({ card: "mono", installment: true, installmentSeparate: true });
  });
  it("only LiqPay: card and installment on the same LiqPay page", () => {
    expect(paymentOptions(false, true)).toEqual({ card: "liqpay", installment: true, installmentSeparate: false });
  });
  it("only monobank: card, no installment", () => {
    expect(paymentOptions(true, false)).toEqual({ card: "mono", installment: false, installmentSeparate: false });
  });
  it("nothing set up: no online payment", () => {
    expect(paymentOptions(false, false)).toEqual({ card: null, installment: false, installmentSeparate: false });
  });
});
