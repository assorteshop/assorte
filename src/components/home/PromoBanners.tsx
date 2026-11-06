import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBanners } from "@/lib/articles";

// Article banners as soft rounded cards, matching the product cards (design v2, variant B).
export async function PromoBanners() {
  const banners = await getBanners();

  return (
    <section className="mx-auto grid max-w-[1280px] gap-5 px-5 pb-14 pt-4 md:grid-cols-[1.2fr_1fr_1fr] md:gap-6 md:px-8">
      {banners.map((b) => (
        <div
          key={b.slot}
          className={`group/banner relative min-h-[320px] overflow-hidden rounded-[36px] p-8 md:min-h-[340px] ${
            b.tone === "red"
              ? "bg-red text-white"
              : b.image_url
                ? "bg-graphite text-white"
                : "bg-[#ebe6e0] text-graphite"
          }`}
        >
          {b.image_url && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image_url} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover/banner:scale-[1.04]" />
              <div
                aria-hidden
                className={`absolute inset-0 ${b.tone === "red" ? "bg-red/70" : "bg-graphite/60"}`}
              />
            </>
          )}
          <div className="relative flex h-full max-w-[260px] flex-col items-start">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em]">{b.eyebrow}</p>
            <h2 className="mt-4 text-[26px] leading-[1.15]">{b.title}</h2>
            {b.body && <p className="mt-4 line-clamp-3 text-[13px]">{b.body}</p>}
            {b.href && (
            <Link
              href={b.href}
              className={`mt-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium ${
                b.tone === "red" ? "bg-white text-red" : "bg-red text-white"
              }`}
            >
              {b.button_label} <ArrowRight size={14} />
            </Link>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
