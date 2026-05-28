"use client";

import type { ProductCardData } from "@/src/data/home";
import { Artwork } from "@/src/components/home/Artwork";
import { StarIcon } from "@/src/components/home/icons";

type ProductCarouselProps = {
  id: string;
  title: string;
  viewAllHref: string;
  items: ProductCardData[];
  metaLabelMode?: "compact" | "city" | "none";
};

export function ProductCarousel({
  id,
  title,
  viewAllHref,
  items,
  metaLabelMode = "compact",
}: ProductCarouselProps) {
  const compactMeta = (label: string) => {
    const normalized = label.trim();
    if (
      normalized.startsWith("마이리얼트립") ||
      normalized.startsWith("아고다")
    ) {
      return normalized;
    }

    return normalized.split("·").at(-1)?.trim() || normalized;
  };

  const cityMeta = (item: ProductCardData) => {
    if (item.cityName) return item.cityName;
    if (item.cityCode === "FUK") return "후쿠오카";
    if (item.cityCode === "KIX") return "오사카";
    if (item.metaLabel.includes("후쿠오카")) return "후쿠오카";
    if (item.metaLabel.includes("오사카")) return "오사카";
    return "";
  };

  const metaLabel = (item: ProductCardData) => {
    if (metaLabelMode === "none") return "";
    if (metaLabelMode === "city") return cityMeta(item);
    return compactMeta(item.metaLabel);
  };

  const reviewText = (value: string) => {
    const count = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
    if (!Number.isFinite(count) || count <= 0) return "";
    return `후기 ${count.toLocaleString("ko-KR")}`;
  };

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
        {items.map((item) => {
          const label = metaLabel(item);
          const reviews = reviewText(item.reviewCount);

          return (
            <div
              key={item.id}
              className="relative h-[210px] w-[184px] shrink-0"
            >
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="group block h-full overflow-hidden rounded-[22px] bg-white shadow-[0_12px_22px_rgba(87,44,31,0.055)] ring-1 ring-[#eadfd8] transition active:scale-[0.99]"
              >
                <div className="flex h-full flex-col">
                  <div className="relative h-[112px] shrink-0 overflow-hidden bg-[#f4eee8]">
                    {item.imageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
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
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(44,34,29,0.12)_100%)]" />
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col px-3 py-2.5">
                    {label ? (
                      <span className="mb-1.5 inline-flex w-fit max-w-full items-center rounded-full bg-[#f4efe9] px-1.5 py-0.5 text-[9px] font-bold tracking-[-0.03em] text-[#74665f]">
                        {label}
                      </span>
                    ) : null}

                    <h3 className="min-h-[39px] overflow-hidden pb-0.5 text-[13.5px] font-black leading-[1.42] tracking-[-0.045em] text-[#2c221d] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                      {item.name}
                    </h3>

                    <div className="mt-1.5 flex min-w-0 items-center gap-1 text-[10.5px] font-semibold text-[#7f726c]">
                      <StarIcon className="h-3 w-3 shrink-0 text-[#d69b2d]" />
                      <span>{item.rating}</span>
                      {reviews ? (
                        <>
                          <span className="text-[#c3b3aa]">·</span>
                          <span className="truncate">{reviews}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
