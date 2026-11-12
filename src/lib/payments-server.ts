import { liqpayConfigured } from "./liqpay";
import { monoConfigured } from "./mono";
import { paymentOptions } from "./payments";

/** The online payments that are set up on this deployment (reads the server's keys). */
export const currentPaymentOptions = () => paymentOptions(monoConfigured(), liqpayConfigured());
