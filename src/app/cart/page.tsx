import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = { title: "Кошик — ASSORTE" };

export default function CartPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-14">
        <h1 className="text-[32px] md:text-[44px]">Кошик</h1>
        <div className="mt-8">
          <CartView />
        </div>
      </section>
    </SiteShell>
  );
}
