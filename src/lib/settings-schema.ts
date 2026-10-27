import { z } from "zod";
import { SETTING_KEYS, type SettingKey } from "./settings";

const text = (max: number, label: string) => z.string().trim().max(max, `${label}: до ${max} символів.`);
const link = (label: string) =>
  text(300, label).refine((v) => v === "" || /^https:\/\/\S+$/.test(v), `${label}: повне посилання, що починається з https://`);

export const settingsSchema = z.object({
  seller_name: text(200, "Продавець"),
  seller_tax_id: text(40, "РНОКПП / ЄДРПОУ"),
  seller_address: text(300, "Адреса"),
  contact_phone: text(40, "Телефон"),
  contact_email: text(120, "Email").refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email: перевірте адресу."),
  work_hours: text(200, "Графік роботи"),
  social_instagram: link("Instagram"),
  social_telegram: link("Telegram"),
  social_facebook: link("Facebook"),
  social_tiktok: link("TikTok"),
});

export function parseSettingsForm(
  formData: FormData,
): { ok: true; data: Record<SettingKey, string> } | { ok: false; error: string } {
  const raw: Record<string, string> = {};
  for (const k of SETTING_KEYS) raw[k] = String(formData.get(k) ?? "");
  const r = settingsSchema.safeParse(raw);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? "Перевірте поля." };
  return { ok: true, data: r.data as Record<SettingKey, string> };
}
