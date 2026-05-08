import type { PromoData } from "@/src/data/home";
import { Artwork } from "@/src/components/home/Artwork";
import { ArrowRightIcon } from "@/src/components/home/icons";

type PromoBannerProps = {
  promo: PromoData;
};

export function PromoBanner({ promo }: PromoBannerProps) {
  return (
    <section className="px-5">
      <a
        href={promo.href}
        target="_blank"
        rel="noreferrer"
        className="relative block overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#fff0ea_0%,#ffe4dc_52%,#fff7f3_100%)] px-4 py-4 shadow-[0_14px_24px_rgba(118,67,55,0.06)] ring-1 ring-[#f3ddd2]"
      >
        <div className="absolute right-0 top-0 h-full w-[36%] opacity-80">
          <Artwork variant="promo" className="h-full w-full" />
        </div>

        <div className="relative z-10 max-w-[63%]">
          <p className="text-[17px] font-black tracking-[-0.05em] text-[#f05f5b]">
            {promo.title}
          </p>
          <p className="mt-1 text-[12.5px] font-medium leading-5 text-[#73574f]">
            {promo.description}
          </p>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(180deg,#ff6f65_0%,#f4514f_100%)] px-4 py-2 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(244,89,85,0.18)]">
            {promo.buttonLabel}
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </a>
    </section>
  );
}
