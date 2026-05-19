"use client";

import { useMemo } from "react";
import Link from "next/link";

import { Artwork } from "@/src/components/home/Artwork";
import { StarIcon } from "@/src/components/home/icons";
import type { AccommodationSearchItem } from "@/src/lib/myrealtrip";
import {
  buildStayDetailHref,
  formatStayPriceLabel,
  type StayPriceFilterOption,
  type StaySearchState,
} from "@/src/lib/stays";

const ALL_PRICE_FILTER: StayPriceFilterOption = {
  id: "all",
  label: "전체",
  min: null,
  max: null,
};

const RESULT_PRICE_FILTERS: StayPriceFilterOption[] = [
  ALL_PRICE_FILTER,
  { id: "under-100k", label: "10만원 이하", min: null, max: 100000 },
  { id: "under-200k", label: "20만원 이하", min: null, max: 200000 },
  { id: "under-300k", label: "30만원 이하", min: null, max: 300000 },
  { id: "over-300k", label: "30만원+", min: 300000, max: null },
];

type StayResultsClientProps = {
  state: StaySearchState;
  stays: AccommodationSearchItem[];
  resultOk: boolean;
  totalCount: number;
};

function initialFilterId(state: StaySearchState) {
  const matched = RESULT_PRICE_FILTERS.find(
    (filter) =>
      filter.min === state.hotelPriceMin && filter.max === state.hotelPriceMax,
  );
  if (!matched && state.hotelPriceMax === 200000) return "under-200k";
  if (!matched && state.hotelPriceMax === 300000) return "under-300k";
  return matched?.id ?? "all";
}

function matchesFilter(stay: AccommodationSearchItem, filter: StayPriceFilterOption) {
  if (filter.id === "all") return true;

  const price = stay.salePrice ?? 0;
  if (price <= 0) return false;
  if (filter.min !== null && price < filter.min) return false;
  if (filter.max !== null && price > filter.max) return false;
  return true;
}

export function StayResultsClient({
  state,
  stays,
  resultOk,
}: StayResultsClientProps) {
  const activeFilterId = initialFilterId(state);
  const activeFilter =
    RESULT_PRICE_FILTERS.find((filter) => filter.id === activeFilterId) ??
    ALL_PRICE_FILTER;
  const currentState = useMemo<StaySearchState>(
    () => ({
      ...state,
      hotelPriceMin: activeFilter.min,
      hotelPriceMax: activeFilter.max,
      page: 0,
    }),
    [activeFilter.max, activeFilter.min, state],
  );
  const visibleStays = useMemo(
    () => stays.filter((stay) => matchesFilter(stay, activeFilter)),
    [activeFilter, stays],
  );
  const filterLabel =
    activeFilter.id === "all" ? "" : ` · ${activeFilter.label}`;
  const resultMessage = resultOk
    ? `예산 조건 숙소 ${visibleStays.length.toLocaleString("ko-KR")}개${filterLabel}`
    : "지금은 숙소 결과를 불러오지 못했어요";

  return (
    <>
      <section className="px-5 pb-2 pt-3">
        <p className="text-[13px] font-black tracking-[-0.03em] text-[#3a2b25]">
          {resultMessage}
        </p>
        <p className="mt-1 text-[11px] font-semibold text-[#8f776f]">
          요금은 예약 시점에 따라 달라질 수 있어요.
        </p>
      </section>

      <section className="space-y-3 px-5">
        {visibleStays.length > 0 ? (
          visibleStays.map((stay) => (
            <Link
              key={stay.itemId}
              href={buildStayDetailHref(stay, currentState)}
              className="flex overflow-hidden rounded-[24px] bg-white shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db] transition active:scale-[0.99]"
            >
              <div className="relative h-[144px] w-[138px] shrink-0 overflow-hidden bg-[#f5e8df]">
                {stay.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={stay.imageUrl}
                    alt={stay.itemName}
                    className="h-full w-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Artwork
                    variant={
                      state.keyword.includes("후쿠오카")
                        ? "stay-fukuoka"
                        : "stay-osaka"
                    }
                    className="h-full w-full"
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(50,26,18,0.12)_100%)]" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex rounded-full bg-[#fff4f0] px-2 py-0.5 text-[10px] font-black text-[#cb4b42] ring-1 ring-[#f1d7cf]">
                        마이리얼트립
                      </span>
                    </div>
                    <h3 className="mt-1 text-[16px] font-black leading-[1.35] tracking-[-0.04em] text-[#221a17] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                      {stay.itemName}
                    </h3>
                  </div>
                  <svg className="mt-1 h-4 w-4 shrink-0 text-[#b19c94]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M7.5 4.5 13 10l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#7a6862]">
                  <StarIcon className="h-3.5 w-3.5 text-[#ffb627]" />
                  <span className="text-[#d45c3b]">{stay.reviewScore ?? "-"}</span>
                  <span>리뷰 {stay.reviewCount?.toLocaleString("ko-KR") ?? 0}개</span>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#f3e7df] pt-3">
                  <p className="min-w-0 truncate whitespace-nowrap text-[16px] font-black tracking-[-0.04em] text-[#201b19]">
                    {formatStayPriceLabel(stay.salePrice)}
                  </p>
                  <span className="shrink-0 text-[11px] font-black text-[#cb4b42]">
                    보기
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[24px] bg-white p-5 text-center shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]">
            <p className="text-[17px] font-black tracking-[-0.04em] text-[#271d18]">
              예산에 맞는 숙소를 찾지 못했어요
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#7f6f69]">
              날짜나 1박 예산을 바꿔 다시 검색해보세요.
            </p>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new Event("open-stay-search-panel"))
              }
              className="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-[#fff4f0] px-4 text-[12px] font-black text-[#cb4b42] ring-1 ring-[#f1d7cf]"
            >
              조건 변경하기
            </button>
          </div>
        )}
      </section>
    </>
  );
}
