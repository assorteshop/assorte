import { describe, expect, it } from "vitest";
import { cleanTracking, messageLinks, normalizeUaPhone, processedMessage, shippedMessage, trackingUrl } from "./order-message";

describe("normalizeUaPhone", () => {
  it.each([
    ["+380689392121", "380689392121"],
    ["380689392121", "380689392121"],
    ["0689392121", "380689392121"],
    ["068 939 21 21", "380689392121"],
    ["+38 (068) 939-21-21", "380689392121"],
    ["80689392121", "380689392121"],
  ])("%s -> %s", (raw, expected) => {
    expect(normalizeUaPhone(raw)).toBe(expected);
  });
  it("returns null for numbers it cannot place", () => {
    expect(normalizeUaPhone("12345")).toBeNull();
    expect(normalizeUaPhone("+4915112345678")).toBeNull();
  });
});

describe("processedMessage", () => {
  const base = { number: 1001, customer_name: "Іван Петренко" };
  it("names the order, the carrier and promises no delivery time", () => {
    const t = processedMessage({ ...base, delivery_method: "nova_poshta" });
    expect(t).toContain("№1001");
    expect(t).toContain("Іван Петренко");
    expect(t).toContain("Новою поштою");
    expect(t).not.toMatch(/\d+\s*(дн|год|діб)/i);
    expect(processedMessage({ ...base, delivery_method: "ukrposhta" })).toContain("Укрпоштою");
  });
});

describe("messageLinks", () => {
  const args = { phone: "0689392121", email: "a@b.ua", subject: "Тема №1", text: "Привіт & дякуємо" };
  it("opens each channel with the text filled in where the channel allows", () => {
    const links = Object.fromEntries(messageLinks(args).map((l) => [l.label, l.href]));
    expect(links.Viber).toBe("viber://chat?number=%2B380689392121");
    expect(links.WhatsApp).toBe(`https://wa.me/380689392121?text=${encodeURIComponent(args.text)}`);
    expect(links.SMS).toContain("sms:+380689392121?body=");
    expect(links.Email).toContain("mailto:a@b.ua?subject=");
    expect(links.Email).toContain(encodeURIComponent(args.text));
  });
  it("skips phone channels for an unreadable number and email when there is none", () => {
    expect(messageLinks({ ...args, phone: "123", email: null })).toEqual([]);
  });
});

describe("shipped message with the waybill", () => {
  const order = { number: 1001, customer_name: "Іван Петренко", delivery_method: "nova_poshta" };
  it("cleans the number and builds a Nova Poshta tracking link", () => {
    expect(cleanTracking(" 5945 0012 3456 78\n")).toBe("59450012345678");
    expect(trackingUrl("nova_poshta", "59450012345678")).toBe("https://novaposhta.ua/tracking/?cargo_number=59450012345678");
  });
  it("builds an Ukrposhta tracking link", () => {
    expect(trackingUrl("ukrposhta", "0501234567890")).toBe("https://track.ukrposhta.ua/tracking_UA.html?barcode=0501234567890");
  });
  it("puts order, carrier, number and link into the text, with no delivery time promised", () => {
    const t = shippedMessage(order, "5945 0012 3456 78");
    expect(t).toContain("№1001");
    expect(t).toContain("відправлено Новою поштою");
    expect(t).toContain("Номер накладної: 59450012345678");
    expect(t).toContain("https://novaposhta.ua/tracking/?cargo_number=59450012345678");
    expect(t).not.toMatch(/\d+\s*(дн|год|діб)/i);
  });
});
