import { Suspense } from "react";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { OrganizationJsonLd } from "@/components/home/OrganizationJsonLd";
import { PopularProducts } from "@/components/home/PopularProducts";
import { PromoBanners } from "@/components/home/PromoBanners";
import { TrustBar } from "@/components/home/TrustBar";
import { ZherebPromo } from "@/components/home/ZherebPromo";

export default function Home() {
  return (
    <>
      <Header overlay />
      <main>
        <Hero />
        <TrustBar />
        <Suspense fallback={<div className="mx-auto h-[520px] max-w-[1280px]" aria-hidden />}>
          <PopularProducts />
        </Suspense>
        <ZherebPromo />
        <PromoBanners />
        <Suspense fallback={null}>
          <OrganizationJsonLd />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
