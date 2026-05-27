"use client";

import { useMemo } from "react";
import Link from "next/link";

import { SavedItemStarButton } from "@/src/components/SavedItemStarButton";
import { Artwork } from "@/src/components/home/Artwork";
import { StarIcon } from "@/src/components/home/icons";
import type { AgodaStayCardItem } from "@/src/lib/agoda-stays";
import type { AccommodationSearchItem } from "@/src/lib/myrealtrip";
import {
  buildAgodaStayBridgeHref,
  buildStayDetailHref,
  formatStayPriceLabel,
  type StayPriceFilterOption,
  type StaySearchState,
} from "@/src/lib/stays";
import type { SavedItem } from "@/src/types/savedTrip";

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

const MAX_VISIBLE_STAYS = 20;
const AGODA_TARGET_RATIO = 0.4;

type StayResultsClientProps = {
  state: StaySearchState;
  stays: AccommodationSearchItem[];
  agodaStays: AgodaStayCardItem[];
  resultOk: boolean;
  totalCount: number;
};

type UnifiedStayCardItem = {
  id: string;
  key: string;
  source: "myrealtrip" | "agoda";
  sourceLabel: "마이리얼트립" | "아고다";
  name: string;
  imageUrl: string | null;
  rating: string | number | null;
  ratingScale: 5 | 10;
  reviewCount: number | null;
  pricePerNight: number | null;
  href: string;
  isExternal: boolean;
  bookingUrl: string;
  affiliateUrl: string;
  originalUrl: string;
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

function matchesFilter(stay: UnifiedStayCardItem, filter: StayPriceFilterOption) {
  if (filter.id === "all") return true;

  const price = stay.pricePerNight ?? 0;
  if (price <= 0) return false;
  if (filter.min !== null && price < filter.min) return false;
  if (filter.max !== null && price > filter.max) return false;
  return true;
}

function normalizeStayName(name: string) {
  return name.toLowerCase().replace(/[\s()[\]{}·.,'"-]/g, "");
}

function mapMyRealTripStay(
  stay: AccommodationSearchItem,
  state: StaySearchState,
): UnifiedStayCardItem {
  return {
    id: stay.itemId,
    key: `myrealtrip-${stay.itemId}`,
    source: "myrealtrip",
    sourceLabel: "마이리얼트립",
    name: stay.itemName,
    imageUrl: stay.imageUrl ?? null,
    rating: stay.reviewScore,
    ratingScale: 5,
    reviewCount: stay.reviewCount,
    pricePerNight: stay.salePrice,
    href: buildStayDetailHref(stay, state),
    isExternal: false,
    bookingUrl: stay.bookUrl,
    affiliateUrl: "",
    originalUrl: stay.bookUrl,
  };
}

function mapAgodaStay(
  stay: AgodaStayCardItem,
  state: StaySearchState,
): UnifiedStayCardItem {
  return {
    id: stay.id,
    key: `agoda-${stay.id}`,
    source: "agoda",
    sourceLabel: "아고다",
    name: stay.name,
    imageUrl: stay.imageUrl,
    rating: stay.rating,
    ratingScale: 10,
    reviewCount: stay.reviewCount,
    pricePerNight: stay.pricePerNight,
    href: buildAgodaStayBridgeHref(stay, state),
    isExternal: false,
    bookingUrl: stay.bookingUrl,
    affiliateUrl: stay.bookingUrl,
    originalUrl: stay.bookingUrl,
  };
}

function toRatingNumber(rating: UnifiedStayCardItem["rating"]) {
  if (typeof rating === "number" && Number.isFinite(rating)) return rating;
  if (typeof rating === "string") {
    const parsed = Number(rating.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function qualityScore(stay: UnifiedStayCardItem) {
  const rating = toRatingNumber(stay.rating);
  const normalizedRating =
    rating !== null ? Math.max(0, Math.min(1, rating / stay.ratingScale)) : 0.68;
  const reviews = stay.reviewCount ?? 0;
  const reviewScore = Math.min(16, Math.log10(reviews + 1) * 4);
  const ratingBonus =
    normalizedRating >= 0.85 ? 10 : normalizedRating < 0.75 ? -18 : 0;
  const reviewPenalty = reviews > 0 && reviews < 50 ? -6 : 0;

  return normalizedRating * 58 + reviewScore + ratingBonus + reviewPenalty;
}

function recommendationScore(
  stay: UnifiedStayCardItem,
  filter: StayPriceFilterOption,
) {
  const price = stay.pricePerNight;
  const quality = qualityScore(stay);

  // 예산 앱의 1차 추천순: 예산 안에서는 저렴함을 보되, 품질이 낮은 숙소는 뒤로 보낸다.
  if (!price || price <= 0) return quality - 120;

  if (filter.id === "over-300k") {
    const premiumFit = price >= 300000 ? 18 : -80;
    const notTooExpensive = Math.max(0, 1 - Math.max(0, price - 300000) / 500000) * 8;
    return quality * 1.25 + premiumFit + notTooExpensive;
  }

  if (filter.max !== null) {
    const affordability = Math.max(0, (filter.max - price) / filter.max) * 42;
    return quality + affordability;
  }

  const balancedPrice = Math.max(0, 1 - Math.max(0, price - 90000) / 260000) * 22;
  return quality + balancedPrice;
}

function sortByRecommendation(
  stays: UnifiedStayCardItem[],
  filter: StayPriceFilterOption,
) {
  return [...stays].sort((a, b) => {
    const scoreGap =
      recommendationScore(b, filter) - recommendationScore(a, filter);
    if (Math.abs(scoreGap) > 0.01) return scoreGap;

    const priceA = a.pricePerNight ?? Number.MAX_SAFE_INTEGER;
    const priceB = b.pricePerNight ?? Number.MAX_SAFE_INTEGER;
    return priceA - priceB;
  });
}

function mergeStayCards(
  myrealtripCards: UnifiedStayCardItem[],
  agodaCards: UnifiedStayCardItem[],
  filter: StayPriceFilterOption,
) {
  const myrealtripNames = new Set(
    myrealtripCards.map((stay) => normalizeStayName(stay.name)),
  );
  const sortedMyRealTrip = sortByRecommendation(myrealtripCards, filter);
  const sortedAgoda = sortByRecommendation(
    agodaCards
    .filter((stay) => stay.href)
      .filter((stay) => !myrealtripNames.has(normalizeStayName(stay.name))),
    filter,
  );

  const totalAvailable = sortedMyRealTrip.length + sortedAgoda.length;
  const targetCount = Math.min(MAX_VISIBLE_STAYS, totalAvailable);
  const targetAgoda = Math.min(
    sortedAgoda.length,
    Math.round(targetCount * AGODA_TARGET_RATIO),
  );
  const targetMyRealTrip = Math.min(
    sortedMyRealTrip.length,
    targetCount - targetAgoda,
  );
  const extraSlots = targetCount - targetAgoda - targetMyRealTrip;
  const myrealtripLimit = targetMyRealTrip + Math.min(extraSlots, sortedMyRealTrip.length - targetMyRealTrip);
  const agodaLimit =
    targetAgoda +
    Math.max(0, extraSlots - Math.max(0, sortedMyRealTrip.length - targetMyRealTrip));
  const myrealtripPool = sortedMyRealTrip.slice(0, myrealtripLimit);
  const agodaPool = sortedAgoda.slice(0, agodaLimit);

  if (myrealtripPool.length === 0) return agodaPool;
  if (agodaPool.length === 0) return myrealtripPool;

  const merged: UnifiedStayCardItem[] = [];
  let myrealtripIndex = 0;
  let agodaIndex = 0;
  const sourcePattern: Array<UnifiedStayCardItem["source"]> = [
    "myrealtrip",
    "myrealtrip",
    "agoda",
    "myrealtrip",
    "agoda",
  ];

  while (merged.length < targetCount && (myrealtripIndex < myrealtripPool.length || agodaIndex < agodaPool.length)) {
    const preferredSource = sourcePattern[merged.length % sourcePattern.length];
    if (preferredSource === "agoda" && agodaIndex < agodaPool.length) {
      merged.push(agodaPool[agodaIndex]);
      agodaIndex += 1;
      continue;
    }
    if (preferredSource === "myrealtrip" && myrealtripIndex < myrealtripPool.length) {
      merged.push(myrealtripPool[myrealtripIndex]);
      myrealtripIndex += 1;
      continue;
    }
    if (myrealtripIndex < myrealtripPool.length) {
      merged.push(myrealtripPool[myrealtripIndex]);
      myrealtripIndex += 1;
      continue;
    }
    if (agodaIndex < agodaPool.length) {
      merged.push(agodaPool[agodaIndex]);
      agodaIndex += 1;
    }
  }

  return merged;
}

function stayRatingLabel(stay: UnifiedStayCardItem) {
  if (stay.rating === null || stay.rating === undefined || stay.rating === "") {
    return null;
  }

  return `${stay.rating}/${stay.ratingScale}`;
}

function stayCityName(state: StaySearchState) {
  return state.keyword.includes("후쿠오카") || state.keyword.includes("하카타")
    ? "후쿠오카"
    : "오사카";
}

function stayCityCode(state: StaySearchState) {
  return stayCityName(state) === "후쿠오카" ? "FUK" : "KIX";
}

function staySavedItemPayload(
  stay: UnifiedStayCardItem,
  state: StaySearchState,
): SavedItem {
  const isInternalDetail = stay.href.startsWith("/");
  const priceText = formatStayPriceLabel(stay.pricePerNight);
  const ratingLabel = stayRatingLabel(stay);

  return {
    id: "",
    itemType: "hotel",
    source: stay.source,
    cityCode: stayCityCode(state),
    cityName: stayCityName(state),
    title: stay.name,
    subtitle: stay.sourceLabel,
    area: stayCityName(state),
    category: "숙소",
    priceText,
    ...(stay.imageUrl ? { imageUrl: stay.imageUrl } : {}),
    ...(ratingLabel ? { ratingText: ratingLabel } : {}),
    badgeText: stay.sourceLabel,
    ...(isInternalDetail ? { detailPath: stay.href } : {}),
    bookingUrl: stay.bookingUrl || (!isInternalDetail ? stay.href : ""),
    ...(stay.affiliateUrl ? { affiliateUrl: stay.affiliateUrl } : {}),
    ...(stay.originalUrl || stay.bookingUrl
      ? { originalUrl: stay.originalUrl || stay.bookingUrl }
      : {}),
    savedAt: "",
  };
}

function StayCard({
  stay,
  state,
  fallbackVariant,
}: {
  stay: UnifiedStayCardItem;
  state: StaySearchState;
  fallbackVariant: "stay-fukuoka" | "stay-osaka";
}) {
  const ratingLabel = stayRatingLabel(stay);
  const savedItem = staySavedItemPayload(stay, state);
  const content = (
    <>
      <div className="relative h-[144px] w-[138px] shrink-0 overflow-hidden bg-[#f5e8df]">
        {stay.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stay.imageUrl}
            alt={stay.name}
            className="h-full w-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        ) : (
          <Artwork variant={fallbackVariant} className="h-full w-full" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(50,26,18,0.12)_100%)]" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3 pr-9">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex rounded-full bg-[#fff4f0] px-2 py-0.5 text-[10px] font-black text-[#cb4b42] ring-1 ring-[#f1d7cf]">
                {stay.sourceLabel}
              </span>
            </div>
            <h3 className="mt-1 text-[16px] font-black leading-[1.35] tracking-[-0.04em] text-[#221a17] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
              {stay.name}
            </h3>
          </div>
          <svg className="mt-1 h-4 w-4 shrink-0 text-[#b19c94]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7.5 4.5 13 10l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#7a6862]">
          <StarIcon className="h-3.5 w-3.5 text-[#ffb627]" />
          {ratingLabel ? (
            <span className="text-[#d45c3b]">{ratingLabel}</span>
          ) : (
            <span className="text-[#9b847b]">평점 확인</span>
          )}
          <span>리뷰 {stay.reviewCount?.toLocaleString("ko-KR") ?? 0}개</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#f3e7df] pt-3">
          <p className="min-w-0 truncate whitespace-nowrap text-[16px] font-black tracking-[-0.04em] text-[#201b19]">
            {formatStayPriceLabel(stay.pricePerNight)}
          </p>
          <span className="shrink-0 text-[11px] font-black text-[#cb4b42]">
            보기
          </span>
        </div>
      </div>
    </>
  );

  const className =
    "flex overflow-hidden rounded-[24px] bg-white shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db] transition active:scale-[0.99]";
  const starButton = (
    <SavedItemStarButton
      item={savedItem}
      className="absolute right-3 top-3 z-10 bg-white/95"
    />
  );

  const shouldOpenExternally = stay.isExternal && stay.source !== "agoda";

  if (shouldOpenExternally) {
    return (
      <article className="relative">
        {starButton}
        <a
          href={stay.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {content}
        </a>
      </article>
    );
  }

  return (
    <article className="relative">
      {starButton}
      <Link href={stay.href} className={className}>
        {content}
      </Link>
    </article>
  );
}

export function StayResultsClient({
  state,
  stays,
  agodaStays,
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
  const visibleStays = useMemo(() => {
    const myrealtripCards = stays.map((stay) =>
      mapMyRealTripStay(stay, currentState),
    );
    const agodaCards = agodaStays.map((stay) =>
      mapAgodaStay(stay, currentState),
    );
    return mergeStayCards(
      myrealtripCards.filter((stay) => matchesFilter(stay, activeFilter)),
      agodaCards.filter((stay) => matchesFilter(stay, activeFilter)),
      activeFilter,
    );
  }, [activeFilter, agodaStays, currentState, stays]);
  const filterLabel =
    activeFilter.id === "all" ? "" : ` · ${activeFilter.label}`;
  const hasAnyResult = resultOk || agodaStays.length > 0;
  const resultMessage = hasAnyResult
    ? `예산 조건 숙소 ${visibleStays.length.toLocaleString("ko-KR")}개${filterLabel}`
    : "지금은 숙소 결과를 불러오지 못했어요";
  const fallbackVariant = state.keyword.includes("후쿠오카")
    ? "stay-fukuoka"
    : "stay-osaka";

  return (
    <>
      <section className="px-5 pb-2 pt-3">
        <p className="text-[13px] font-black tracking-[-0.03em] text-[#3a2b25]">
          {resultMessage}
        </p>
        <p className="mt-1 text-[11px] font-semibold text-[#8f776f]">
          요금은 예약 시점과 인원 조건에 따라 달라질 수 있어요.
        </p>
      </section>

      <section className="space-y-3 px-5">
        {visibleStays.length > 0 ? (
          visibleStays.map((stay) => (
            <StayCard
              key={stay.key}
              stay={stay}
              state={state}
              fallbackVariant={fallbackVariant}
            />
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
