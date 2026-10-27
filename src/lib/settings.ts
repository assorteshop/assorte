import { cacheLife, cacheTag } from "next/cache";
import { supabase } from "./supabase";

export const SETTING_KEYS = [
  "seller_name",
  "seller_tax_id",
  "seller_address",
  "contact_phone",
  "contact_email",
  "work_hours",
  "social_instagram",
  "social_telegram",
  "social_facebook",
  "social_tiktok",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];
export type Settings = Partial<Record<SettingKey, string>>;

// Public contact and seller details typed in the admin. Missing values are simply not shown.
export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag("settings");
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  if (!supabase) return {};
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error || !data) return {};
  const out: Settings = {};
  for (const row of data) {
    const key = row.key as SettingKey;
    if ((SETTING_KEYS as readonly string[]).includes(key) && row.value.trim()) out[key] = row.value.trim();
  }
  return out;
}
