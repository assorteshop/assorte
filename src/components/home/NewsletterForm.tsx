"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { subscribe, type SubscribeState } from "@/app/actions/subscribe";

const initial: SubscribeState = { status: "idle", message: "" };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, initial);
  return (
    <form action={action} className="mt-5">
      <div className="flex">
        <label htmlFor="email" className="sr-only">
          Ваш email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Ваш email"
          className="h-12 min-w-0 flex-1 rounded-l-[4px] border border-line bg-white px-4 text-[13px]"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Підписатися"
          className="grid h-12 w-12 place-items-center rounded-r-[4px] bg-red text-white disabled:opacity-60"
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <p role="status" className={`mt-2 text-[12px] ${state.status === "error" ? "text-red" : "text-muted"}`}>
        {state.message}
      </p>
    </form>
  );
}
