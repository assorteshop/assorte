"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/admin/actions";

const initial: FormState = { error: null };
const field = "mt-1.5 h-12 w-full rounded-[4px] border border-line bg-white px-4 text-[14px]";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-[13px]">
        Email
        <input name="email" type="email" required autoComplete="username" className={field} />
      </label>
      <label className="block text-[13px]">
        Пароль
        <input name="password" type="password" required autoComplete="current-password" className={field} />
      </label>
      <p role="alert" className="min-h-5 text-[13px] text-red">{state.error}</p>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[4px] bg-red px-7 py-4 text-[15px] font-medium text-white disabled:opacity-60"
      >
        {pending ? "Входимо…" : "Увійти"}
      </button>
    </form>
  );
}
