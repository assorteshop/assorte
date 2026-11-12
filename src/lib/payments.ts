// Which online payments the shop offers. Card goes through monobank when it is set up (lower fee),
// otherwise through LiqPay. LiqPay also carries «Миттєва розстрочка ПриватБанку».

export type PaymentOptions = {
  /** Who takes card payments on the site, or null when online payment is off. */
  card: "mono" | "liqpay" | null;
  /** «Миттєва розстрочка ПриватБанку» is available (it comes with LiqPay). */
  installment: boolean;
  /** Installment is a separate choice at checkout (when the card itself goes through monobank). */
  installmentSeparate: boolean;
};

export function paymentOptions(mono: boolean, liqpay: boolean): PaymentOptions {
  return {
    card: mono ? "mono" : liqpay ? "liqpay" : null,
    installment: liqpay,
    installmentSeparate: mono && liqpay,
  };
}

export const INSTALLMENT_NAME = "Миттєва розстрочка ПриватБанку";
export const INSTALLMENT_LOGO = "/payments/miteva-rozstrochka.svg";
