"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { HeartFrame } from "@/components/brand/HeartFrame";
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
          className="h-12 min-w-0 flex-1 rounded-[4px] border border-line bg-white px-4 text-[13px]"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Підписатися"
          className="group ml-2 shrink-0 text-red disabled:opacity-60"
        >
          <HeartFrame className="size-12">
            <ArrowRight size={16} strokeWidth={2} />
          </HeartFrame>
        </button>
      </div>
      <p role="status" className={`mt-2 text-[12px] ${state.status === "error" ? "text-red" : "text-muted"}`}>
        {state.message}
      </p>
    </form>
  );
}
