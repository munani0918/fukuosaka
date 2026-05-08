"use client";

import type { ProductCardData } from "@/src/data/home";
import { Artwork } from "@/src/components/home/Artwork";
import {
  ChevronRightIcon,
  HeartIcon,
  StarIcon,
} from "@/src/components/home/icons";

type ProductCarouselProps = {
  id: string;
  title: string;
  viewAllHref: string;
  items: ProductCardData[];
};

export function ProductCarousel({
  id,
  title,
  viewAllHref,
  items,
}: ProductCarouselProps) {
  return (
    <section id={id} className="px-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[18px] font-black tracking-[-0.05em] text-[#2c211d]">
          {title}
        </h2>
        <a href={viewAllHref} className="text-[13px] font-bold text-[#8a7871]">
          더보기
        </a>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noreferrer" : undefined}
            className="group block h-[138px] w-[282px] shrink-0 overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#ffffff_0%,#fff8f4_100%)] shadow-[0_12px_22px_rgba(87,44,31,0.06)] ring-1 ring-[#f1e3db]"
          >
            <div className="flex h-full">
              <div className="relative w-[124px] shrink-0 overflow-hidden bg-[#f8ede4]">
                {item.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        const fallback = event.currentTarget
                          .nextElementSibling;
                        if (fallback instanceof HTMLElement) {
                          fallback.style.display = "block";
                        }
                      }}
                    />
                    <Artwork
                      variant={item.artVariant}
                      className="hidden h-full w-full"
                    />
                  </>
                ) : (
                  <Artwork variant={item.artVariant} className="h-full w-full" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(44,34,29,0.12)_100%)]" />
              </div>

              <div className="relative flex min-w-0 flex-1 flex-col p-3">
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#f0e1d9] bg-white/96 text-[#98877f] shadow-[0_4px_8px_rgba(76,42,29,0.04)]">
                  <HeartIcon className="h-[13px] w-[13px]" />
                </span>

                <h3 className="overflow-hidden pr-8 text-[14px] font-black leading-5 tracking-[-0.04em] text-[#2c221d] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {item.name}
                </h3>

                <div className="mt-1.5 flex items-center gap-1 text-[10.5px] font-semibold text-[#7f726c]">
                  <StarIcon className="h-3 w-3 text-[#efb43c]" />
                  <span>{item.rating}</span>
                  <span>· 후기 {item.reviewCount}개</span>
                </div>

                <p className="mt-1 truncate text-[10.5px] font-medium text-[#97857e]">
                  {item.metaLabel}
                </p>

                <div className="mt-auto flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-[#a7968d]">
                      1박 최저
                    </p>
                    <p className="truncate text-[16px] font-black tracking-[-0.04em] text-[#2c221d]">
                      {item.priceLabel}
                    </p>
                  </div>

                  <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-[#ffd4cb] bg-white px-3 text-[11px] font-black text-[#f05f5b]">
                    {item.ctaLabel}
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
