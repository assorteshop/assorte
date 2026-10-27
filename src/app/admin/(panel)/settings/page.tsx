import { SettingsForm } from "@/components/admin/SettingsForm";
import { SETTING_KEYS, type Settings } from "@/lib/settings";
import { requireAdmin } from "@/lib/supabase-server";

export default async function AdminSettings() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("key, value");
  const values: Settings = {};
  for (const row of data ?? []) {
    if ((SETTING_KEYS as readonly string[]).includes(row.key)) values[row.key as keyof Settings] = row.value;
  }

  return (
    <>
      <h1 className="text-[28px]">Контакти та реквізити</h1>
      <p className="mt-2 max-w-[640px] text-[13px] leading-relaxed text-muted">
        Ці дані показуються на сторінках «Контакти», «Публічна оферта» та «Доставка і оплата». Що не заповнено, того на сайті не
        буде видно. Перед початком продажів заповніть дані продавця: вони обовʼязкові для оферти.
      </p>
      <SettingsForm values={values} />
    </>
  );
}
