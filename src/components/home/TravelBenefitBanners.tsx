"use client";

import { useRef, useState } from "react";

import type { HomeBenefitBanner } from "@/src/data/homeBanners";
import { ArrowRightIcon } from "@/src/components/home/icons";

type TravelBenefitBannersProps = {
  items: HomeBenefitBanner[];
};

export function TravelBenefitBanners({ items }: TravelBenefitBannersProps) {
  const activeItems = items.filter((item) => item.isActive);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const pointerStartX = useRef(0);
  const pointerDeltaX = useRef(0);

  if (!activeItems.length) return null;

  function scrollToIndex(index: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({
      left: scroller.clientWidth * index,
      behavior: "smooth",
    });
    setActiveIndex(index);
  }

  function syncActiveSlide() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const nextIndex = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setActiveIndex(Math.min(activeItems.length - 1, Math.max(0, nextIndex)));
  }

  return (
    <section className="px-5 pt-1">
      <div
        ref={scrollerRef}
        onScroll={syncActiveSlide}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {activeItems.map((item) => (
          <div key={item.id} className="w-full shrink-0 snap-center">
            <a
              href={item.href}
              onPointerDown={(event) => {
                pointerStartX.current = event.clientX;
                pointerDeltaX.current = 0;
              }}
              onPointerMove={(event) => {
                pointerDeltaX.current = Math.abs(event.clientX - pointerStartX.current);
              }}
              onClick={(event) => {
                if (pointerDeltaX.current > 8) event.preventDefault();
              }}
              className="relative block min-h-[136px] overflow-hidden rounded-[24px] border border-[#f1dcd3] bg-[linear-gradient(135deg,#fff2ed_0%,#ffe4dc_58%,#fff8f4_100%)] px-4 py-4 shadow-[0_14px_24px_rgba(118,67,55,0.06)]"
            >
              <div
                aria-hidden="true"
                className="absolute -right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-[#ffb9aa]/35"
              />
              <div
                aria-hidden="true"
                className="absolute right-6 top-1/2 -translate-y-1/2 rotate-[-8deg] rounded-[16px] bg-white/75 px-4 py-3 text-[30px] font-black text-[#f05f5b] shadow-[0_14px_24px_rgba(146,70,53,0.08)]"
              >
                %
              </div>

              <div className="relative z-10 max-w-[68%]">
                <p className="text-[17px] font-black leading-6 tracking-[-0.05em] text-[#2c211d]">
                  {item.title}
                </p>
                <p className="mt-1.5 text-[12px] font-semibold leading-5 tracking-[-0.03em] text-[#7d675f]">
                  {item.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#f05f5b] px-4 py-2 text-[12px] font-black text-white shadow-[0_10px_18px_rgba(244,89,85,0.18)]">
                  {item.ctaText}
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </div>
            </a>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {activeItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`${index + 1}번째 혜택 보기`}
            onClick={() => scrollToIndex(index)}
            className={`h-1.5 rounded-full transition ${
              index === activeIndex ? "w-5 bg-[#f05f5b]" : "w-1.5 bg-[#dccbc3]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
