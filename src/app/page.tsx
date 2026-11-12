import { Suspense } from "react";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { OrganizationJsonLd } from "@/components/home/OrganizationJsonLd";
import { PopularProducts } from "@/components/home/PopularProducts";
import { PromoBanners } from "@/components/home/PromoBanners";
import { TrustBar } from "@/components/home/TrustBar";
import { ZherebPromo } from "@/components/home/ZherebPromo";
import { zhereb } from "@/content/zhereb";
import { shownHeroSlides } from "@/lib/hero-slides";
import { getZherebVariants } from "@/lib/products";
import { isZherebOn } from "@/lib/zhereb";

export default async function Home() {
  // «Жереб» appears on the home page (slide and block) only while it is on sale; otherwise /zhereb is a 404.
  const zherebOn = isZherebOn(
    zhereb.tiers.items.map((t) => t.id),
    zhereb.moods.items.map((m) => m.name),
    await getZherebVariants(),
  );

  return (
    <>
      <Header overlay />
      <main>
        <Hero slides={shownHeroSlides(zherebOn)} />
        <TrustBar />
        <Suspense fallback={<div className="mx-auto h-[520px] max-w-[1280px]" aria-hidden />}>
          <PopularProducts />
        </Suspense>
        {zherebOn && <ZherebPromo />}
        <PromoBanners />
        <Suspense fallback={null}>
          <OrganizationJsonLd />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
