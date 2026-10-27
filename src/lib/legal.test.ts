import { describe, expect, it } from "vitest";
import { deliveryPaymentText, offerText, returnsText, sellerLines } from "./legal";
import { parseSettingsForm } from "./settings-schema";

describe("seller details", () => {
  it("shows only what was filled in", () => {
    const lines = sellerLines({ seller_name: "ФОП Тест Тестович", contact_email: "a@b.ua" });
    expect(lines).toEqual(["Продавець: ФОП Тест Тестович", "Email: a@b.ua"]);
  });
  it("says details will be published when nothing is filled in; no invented requisites", () => {
    const text = offerText({});
    expect(text).toContain("Реквізити продавця будуть опубліковані до початку продажів.");
    expect(text).not.toMatch(/ФОП|РНОКПП: \d|вул\./);
  });
  it("puts the seller block into the offer when available", () => {
    const text = offerText({ seller_name: "ФОП Тест", seller_tax_id: "1234567890", seller_address: "м. Київ, вул. Тестова, 1" });
    expect(text).toContain("- Продавець: ФОП Тест");
    expect(text).toContain("- РНОКПП / ЄДРПОУ: 1234567890");
    expect(text).toContain("- Адреса: м. Київ, вул. Тестова, 1");
  });
});

describe("page texts promise nothing invented", () => {
  const all = [deliveryPaymentText({ onlineEnabled: true }), deliveryPaymentText({ onlineEnabled: false }), returnsText({}), offerText({})].join("\n");
  it("has no delivery price, no delivery time in days or hours, no warranty period", () => {
    expect(all).not.toMatch(/\d+\s*(грн|₴)/);
    expect(all).not.toMatch(/протягом\s+\d+\s*(годин|діб|робочих)/i);
    expect(all).not.toMatch(/гаранті[яї]\s+(термін\w*\s+)?\d+\s*(міс|рок|днів|дн)/i);
    expect(all).not.toMatch(/безкоштовн/i);
  });
  it("states the legal 14 days and the 5% card discount", () => {
    expect(returnsText({})).toContain("**14 днів**");
    expect(deliveryPaymentText({ onlineEnabled: true })).toContain("додаткова знижка 5%");
    expect(deliveryPaymentText({ onlineEnabled: false })).toContain("зʼявиться найближчим часом");
  });
  it("uses the contacts in the text only when they exist", () => {
    expect(returnsText({ contact_phone: "+380501112233" })).toContain("за телефоном +380501112233");
    expect(returnsText({})).toContain("через сторінку «Контакти»");
  });
});

describe("settings form validation", () => {
  const fd = (v: Record<string, string>) => {
    const f = new FormData();
    for (const [k, val] of Object.entries(v)) f.set(k, val);
    return f;
  };
  it("accepts empty and valid values", () => {
    expect(parseSettingsForm(fd({})).ok).toBe(true);
    expect(parseSettingsForm(fd({ contact_email: "shop@assorte.com.ua", social_instagram: "https://instagram.com/assorte" })).ok).toBe(true);
  });
  it("rejects a broken email and non-https links", () => {
    expect(parseSettingsForm(fd({ contact_email: "not-an-email" })).ok).toBe(false);
    expect(parseSettingsForm(fd({ social_telegram: "javascript:alert(1)" })).ok).toBe(false);
    expect(parseSettingsForm(fd({ social_facebook: "http://insecure.test" })).ok).toBe(false);
  });
});
