import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// First tile of the popular-products row: Alex, the face of ASSORTE, carrying on the look of the first screen.
export function PicksTile() {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-[36px] bg-[#ebe5e1] text-white">
      <Image
        src="/images/home/alex-picks.webp"
        alt="Алекс усміхається у світлій сукні з квітковим принтом"
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 78vw"
        className="object-cover object-top"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/85">ASSORTE</p>
        <p className="mt-2 font-heading text-[30px] font-bold leading-[1.05]">
          Обрані
          <br />
          речі
        </p>
        <Link
          href="/catalog"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-medium text-graphite transition-colors hover:bg-red hover:text-white"
        >
          Весь каталог <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
