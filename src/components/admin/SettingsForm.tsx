"use client";

import { useActionState, useState } from "react";
import { saveSettings, type FormState } from "@/app/admin/actions";
import type { Settings } from "@/lib/settings";

const initial: FormState = { error: null };
const field = "mt-1.5 h-12 w-full rounded-[4px] border border-line bg-white px-4 text-[14px]";
const label = "block text-[13px]";

export function SettingsForm({ values }: { values: Settings }) {
  const [state, action, pending] = useActionState(saveSettings, initial);
  const [submitted, setSubmitted] = useState(false);
  const v = (k: keyof Settings) => values[k] ?? "";

  return (
    <form action={action} onSubmit={() => setSubmitted(true)} className="mt-6 space-y-8">
      <fieldset className="space-y-4 rounded-[6px] bg-white p-5">
        <legend className="px-1 text-[16px]">Продавець (для оферти та контактів)</legend>
        <label className={label}>
          Продавець: повна назва (наприклад, ФОП Прізвище Імʼя По батькові)
          <input name="seller_name" defaultValue={v("seller_name")} maxLength={200} className={field} />
        </label>
        <label className={label}>
          РНОКПП або ЄДРПОУ
          <input name="seller_tax_id" defaultValue={v("seller_tax_id")} maxLength={40} className={field} />
        </label>
        <label className={label}>
          Адреса (місцезнаходження продавця)
          <input name="seller_address" defaultValue={v("seller_address")} maxLength={300} className={field} />
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-[6px] bg-white p-5">
        <legend className="px-1 text-[16px]">Контакти для покупців</legend>
        <label className={label}>
          Телефон
          <input name="contact_phone" type="tel" defaultValue={v("contact_phone")} maxLength={40} placeholder="+380…" className={field} />
        </label>
        <label className={label}>
          Email
          <input name="contact_email" type="email" defaultValue={v("contact_email")} maxLength={120} className={field} />
        </label>
        <label className={label}>
          Графік роботи
          <input name="work_hours" defaultValue={v("work_hours")} maxLength={200} placeholder="Пн–Пт, 10:00–18:00" className={field} />
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-[6px] bg-white p-5">
        <legend className="px-1 text-[16px]">Соцмережі (необовʼязково, повне посилання з https://)</legend>
        {(
          [
            ["social_instagram", "Instagram"],
            ["social_telegram", "Telegram"],
            ["social_facebook", "Facebook"],
            ["social_tiktok", "TikTok"],
          ] as const
        ).map(([key, name]) => (
          <label key={key} className={label}>
            {name}
            <input name={key} defaultValue={v(key)} maxLength={300} placeholder="https://…" className={field} />
          </label>
        ))}
      </fieldset>

      <div>
        <p role="alert" className="min-h-5 text-[13px] text-red">{state.error}</p>
        <div className="mt-2 flex items-center gap-4">
          <button type="submit" disabled={pending} className="rounded-[4px] bg-red px-8 py-4 text-[15px] font-medium text-white disabled:opacity-60">
            {pending ? "Зберігаємо…" : "Зберегти"}
          </button>
          {submitted && !pending && !state.error && <span className="text-[13px] text-[#1f6b34]">Збережено ✓</span>}
        </div>
      </div>
    </form>
  );
}
