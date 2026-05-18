"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Artwork } from "@/src/components/home/Artwork";
import { StarIcon } from "@/src/components/home/icons";
import type { AccommodationSearchItem } from "@/src/lib/myrealtrip";
import {
  STAY_PRICE_FILTERS,
  buildStayDetailHref,
  buildStayResultsHref,
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

const RESULT_PRICE_FILTERS = [ALL_PRICE_FILTER, ...STAY_PRICE_FILTERS];

type StayResultsClientProps = {
  state: StaySearchState;
  stays: AccommodationSearchItem[];
  resultOk: boolean;
  totalCount: number;
};

function initialFilterId(state: StaySearchState) {
  const matched = STAY_PRICE_FILTERS.find(
    (filter) =>
      filter.min === state.hotelPriceMin && filter.max === state.hotelPriceMax,
  );
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

function compactDateRange(checkIn: string, checkOut: string) {
  const [, inMonth, inDay] = checkIn.split("-");
  const [, outMonth, outDay] = checkOut.split("-");
  if (!inMonth || !inDay || !outMonth || !outDay) {
    return `${checkIn} ~ ${checkOut}`;
  }

  return `${Number(inMonth)}.${Number(inDay)} - ${Number(outMonth)}.${Number(outDay)}`;
}

export function StayResultsClient({
  state,
  stays,
  resultOk,
  totalCount,
}: StayResultsClientProps) {
  const [activeFilterId, setActiveFilterId] = useState(() =>
    initialFilterId(state),
  );
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

  function handleFilterClick(filter: StayPriceFilterOption) {
    setActiveFilterId(filter.id);
    const minInput = document.querySelector<HTMLInputElement>(
      'input[name="hotelPriceMin"]',
    );
    const maxInput = document.querySelector<HTMLInputElement>(
      'input[name="hotelPriceMax"]',
    );
    if (minInput) minInput.value = filter.min !== null ? String(filter.min) : "";
    if (maxInput) maxInput.value = filter.max !== null ? String(filter.max) : "";

    const nextState = {
      ...state,
      hotelPriceMin: filter.min,
      hotelPriceMax: filter.max,
      page: 0,
    };
    window.history.replaceState(null, "", buildStayResultsHref(nextState));
  }

  return (
    <>
      <section className="px-5 pb-3 pt-4">
        <div className="rounded-[22px] bg-white/80 p-3 shadow-[0_12px_22px_rgba(85,42,28,0.05)] ring-1 ring-[#efe3db]">
          <p className="px-1 text-[12px] font-black tracking-[-0.02em] text-[#6c5650]">
            1박 예산
          </p>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {RESULT_PRICE_FILTERS.map((filter) => {
              const selected = filter.id === activeFilter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => handleFilterClick(filter)}
                  className={`h-[32px] shrink-0 rounded-full px-3 text-[12px] font-black transition ${
                    selected
                      ? "bg-[#cb4b42] text-white shadow-[0_8px_16px_rgba(203,75,66,0.16)]"
                      : "bg-[#fbf2ed] text-[#8c746a] ring-1 ring-[#f0dfd6]"
                  }`}
                  aria-pressed={selected}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 pb-6 pt-1">
        <div className="rounded-[24px] bg-white/88 p-4 shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-[#a58f86]">
                {compactDateRange(state.checkIn, state.checkOut)} · 성인 {state.adultCount} · 아동 {state.childCount} · 객실 {state.roomCount}
              </p>
              <h2 className="mt-1 text-[24px] font-black tracking-[-0.05em] text-[#251b17]">
                {state.keyword}
              </h2>
              <p className="mt-1 text-[13px] font-medium text-[#7d6f69]">
                {resultOk
                  ? `${visibleStays.length.toLocaleString("ko-KR")}개 숙소${filterLabel} 결과를 보여드려요`
                  : "지금은 숙소 결과를 불러오지 못했어요"}
              </p>
            </div>
            <span className="rounded-full bg-[#fbf2ed] px-3 py-1.5 text-[11px] font-black text-[#cb4b42]">
              숙소 검색
            </span>
          </div>
          {resultOk && activeFilter.id !== "all" ? (
            <p className="mt-3 rounded-[14px] bg-[#fff8f4] px-3 py-2 text-[12px] font-semibold text-[#9a7469]">
              전체 {Math.max(totalCount, stays.length).toLocaleString("ko-KR")}개
              후보 중 선택한 1박 예산에 맞는 숙소를 우선 보여드려요.
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3 px-5">
        {visibleStays.length > 0 ? (
          visibleStays.map((stay) => (
            <Link
              key={stay.itemId}
              href={buildStayDetailHref(stay, currentState)}
              className="flex overflow-hidden rounded-[24px] bg-white shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]"
            >
              <div className="relative h-[148px] w-[126px] shrink-0 overflow-hidden bg-[#f5e8df]">
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
                      <span className="text-[11px] font-bold text-[#b48577]">
                        {state.keyword} 추천
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
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#8d7c74]">
                        마이리얼트립 실시간 숙소
                      </p>
                      <p className="mt-1 truncate whitespace-nowrap text-[16px] font-black tracking-[-0.04em] text-[#201b19]">
                        {formatStayPriceLabel(stay.salePrice)}
                      </p>
                    </div>
                    <span className="inline-flex h-8 min-w-[66px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#fff4f0] px-2.5 text-[11px] font-black leading-none text-[#cb4b42] ring-1 ring-[#f1d7cf]">
                      자세히보기
                    </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[24px] bg-white p-5 text-center shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]">
            <p className="text-[17px] font-black tracking-[-0.04em] text-[#271d18]">
              아직 보여드릴 숙소가 없어요
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#7f6f69]">
              다른 1박 예산을 선택하거나 지역명을 조금 넓게 바꿔 다시 찾아보세요.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
