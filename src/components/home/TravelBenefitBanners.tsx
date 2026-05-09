"use client";

import { useState } from "react";

import type { HomeBenefitBanner } from "@/src/data/homeBanners";
import { ArrowRightIcon } from "@/src/components/home/icons";

type TravelBenefitBannersProps = {
  items: HomeBenefitBanner[];
};

export function TravelBenefitBanners({ items }: TravelBenefitBannersProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];

  if (!active) return null;

  return (
    <section className="px-5">
      <div className="mb-3">
        <h2 className="text-[18px] font-black tracking-[-0.05em] text-[#2c211d]">
          여행 준비 혜택
        </h2>
      </div>

      <a
        href={active.href}
        className="relative block overflow-hidden rounded-[24px] border border-[#f1dcd3] bg-[linear-gradient(135deg,#fff2ed_0%,#ffe4dc_58%,#fff8f4_100%)] px-4 py-4 shadow-[0_14px_24px_rgba(118,67,55,0.06)]"
      >
        <div
          aria-hidden="true"
          className="absolute -right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-[#ffb9aa]/35"
        />
        <div
          aria-hidden="true"
          className="absolute right-7 top-5 rotate-[-8deg] rounded-[16px] bg-white/70 px-4 py-3 text-[30px] font-black text-[#f05f5b] shadow-[0_14px_24px_rgba(146,70,53,0.08)]"
        >
          %
        </div>

        <div className="relative z-10 max-w-[68%]">
          <p className="text-[17px] font-black leading-6 tracking-[-0.05em] text-[#2c211d]">
            {active.title}
          </p>
          <p className="mt-1.5 text-[12px] font-semibold leading-5 tracking-[-0.03em] text-[#7d675f]">
            {active.description}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#f05f5b] px-4 py-2 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(244,89,85,0.18)]">
            {active.ctaLabel}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      </a>

      <div className="mt-3 flex justify-center gap-1.5">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`${index + 1}번째 혜택 보기`}
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition ${
              index === activeIndex ? "w-5 bg-[#f05f5b]" : "w-1.5 bg-[#dccbc3]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
