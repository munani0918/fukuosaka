"use client";

import { useEffect, useState, type FormEvent } from "react";

import type { SearchTabData } from "@/src/data/home";
import {
  STAY_PRICE_FILTERS,
  buildStayDetailHref,
  buildStayResultsHref,
  getDefaultStaySearchState,
} from "@/src/lib/stays";
import {
  buildTourDetailHref,
  buildTourResultsHref,
  inferTourCity,
  type TourSnapshot,
} from "@/src/lib/tours";
import { BedIcon, SearchIcon, TicketIcon } from "@/src/components/home/icons";

type SearchSectionProps = {
  tabs: SearchTabData[];
  placeholder: string;
  hideTitle?: boolean;
};

type StaySuggestion = {
  itemId: string;
  itemName: string;
  salePrice: number | null;
  reviewScore: string | null;
  reviewCount: number | null;
  imageUrl?: string;
  bookUrl: string;
};

type TourSuggestion = {
  gid: string;
  itemName?: string;
  name?: string;
  salePrice?: number;
  priceDisplay?: string;
  price?: string;
  reviewScore?: number;
  reviewCount?: number;
  category?: string;
  productUrl?: string;
  bookUrl?: string;
  deepLink?: string;
  imageUrl?: string;
  tags?: string[];
};

function tabIcon(icon: SearchTabData["icon"]) {
  if (icon === "stay") return <BedIcon className="h-4 w-4" />;
  return <TicketIcon className="h-4 w-4" />;
}

function futureDate(days: number) {
  const target = new Date();
  target.setDate(target.getDate() + days);
  return target.toISOString().slice(0, 10);
}

function searchPlaceholder(tabId: string, fallback: string) {
  if (tabId === "stay") return "지역, 숙소명 또는 키워드로 검색해보세요";
  if (tabId === "tour") return "투어, 장소 또는 키워드로 검색해보세요";
  return fallback;
}

export function SearchSection({
  tabs,
  placeholder,
  hideTitle = false,
}: SearchSectionProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "stay");
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staySuggestions, setStaySuggestions] = useState<StaySuggestion[]>([]);
  const [isStayLoading, setIsStayLoading] = useState(false);
  const [tourSuggestions, setTourSuggestions] = useState<TourSuggestion[]>([]);
  const [isTourLoading, setIsTourLoading] = useState(false);
  const [defaultStayState] = useState(() => getDefaultStaySearchState("오사카"));
  const [stayDates, setStayDates] = useState(() => ({
    checkIn: defaultStayState.checkIn,
    checkOut: defaultStayState.checkOut,
  }));
  const [selectedStayPriceFilterId, setSelectedStayPriceFilterId] = useState<
    string | null
  >(null);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]!;
  const selectedStayPriceFilter =
    STAY_PRICE_FILTERS.find(
      (filter) => filter.id === selectedStayPriceFilterId,
    ) ?? null;

  function addStayDays(dateValue: string, days: number) {
    const base = new Date(dateValue);
    if (Number.isNaN(base.getTime())) return futureDate(days);
    base.setDate(base.getDate() + days);
    return base.toISOString().slice(0, 10);
  }

  function formatSuggestionPrice(price: number | null) {
    if (!price || price <= 0) return "가격 확인";
    return `1박 ${price.toLocaleString("ko-KR")}원`;
  }

  function formatSuggestionReview(score: string | null, count: number | null) {
    if (!score && !count) return "리뷰 정보";
    if (!score) return `후기 ${count?.toLocaleString("ko-KR") ?? 0}개`;
    if (!count) return `평점 ${score}`;
    return `평점 ${score} · 후기 ${count.toLocaleString("ko-KR")}개`;
  }

  function tourSuggestionName(suggestion: TourSuggestion) {
    return suggestion.itemName || suggestion.name || "투어&티켓 상품";
  }

  function toTourSnapshot(suggestion: TourSuggestion): TourSnapshot {
    return {
      gid: suggestion.gid,
      itemName: tourSuggestionName(suggestion),
      productUrl:
        suggestion.productUrl ||
        suggestion.bookUrl ||
        `https://experiences.myrealtrip.com/products/${suggestion.gid}`,
      salePrice: suggestion.salePrice ?? 0,
      priceDisplay: suggestion.priceDisplay || suggestion.price || "",
      category: suggestion.category,
      deepLink: suggestion.deepLink,
      description: undefined,
      imageUrl: suggestion.imageUrl,
      reviewCount: suggestion.reviewCount,
      reviewScore: suggestion.reviewScore,
      tags: suggestion.tags,
    };
  }

  function formatTourSuggestionPrice(suggestion: TourSuggestion) {
    if (suggestion.priceDisplay || suggestion.price) {
      return suggestion.priceDisplay || suggestion.price;
    }

    if (suggestion.salePrice && suggestion.salePrice > 0) {
      return `${suggestion.salePrice.toLocaleString("ko-KR")}원`;
    }

    return "요금 확인";
  }

  function formatTourSuggestionMeta(suggestion: TourSuggestion) {
    const score =
      typeof suggestion.reviewScore === "number"
        ? suggestion.reviewScore.toFixed(1).replace(/\.0$/, "")
        : "";
    const reviewCount =
      typeof suggestion.reviewCount === "number"
        ? suggestion.reviewCount.toLocaleString("ko-KR")
        : "";

    if (score && reviewCount) return `평점 ${score} · 후기 ${reviewCount}개`;
    if (score) return `평점 ${score}`;
    if (reviewCount) return `후기 ${reviewCount}개`;
    return suggestion.category || suggestion.tags?.[0] || "투어&티켓";
  }

  function handleStaySuggestionClick(suggestion: StaySuggestion) {
    const href = buildStayDetailHref(
      {
        itemId: suggestion.itemId,
        itemName: suggestion.itemName,
        salePrice: suggestion.salePrice,
        reviewScore: suggestion.reviewScore,
        reviewCount: suggestion.reviewCount,
        imageUrl: suggestion.imageUrl,
        bookUrl: suggestion.bookUrl,
      },
      {
        keyword: query.trim(),
        checkIn: stayDates.checkIn,
        checkOut: stayDates.checkOut,
        adultCount: defaultStayState.adultCount,
        childCount: defaultStayState.childCount,
        isDomestic: defaultStayState.isDomestic,
        hotelPriceMin: selectedStayPriceFilter?.min ?? null,
        hotelPriceMax: selectedStayPriceFilter?.max ?? null,
      },
    );

    window.location.assign(href);
  }

  function handleTourSuggestionClick(suggestion: TourSuggestion) {
    const keyword = query.trim() || tourSuggestionName(suggestion);
    window.location.assign(
      buildTourDetailHref(toTourSnapshot(suggestion), {
        keyword,
        city: inferTourCity(keyword),
        category: "all",
        sort: "selling_count_desc",
        page: 1,
        perPage: 12,
      }),
    );
  }

  useEffect(() => {
    if (activeTab.id !== "stay") {
      setStaySuggestions([]);
      setIsStayLoading(false);
      return;
    }

    const keyword = query.trim();
    if (keyword.length < 2) {
      setStaySuggestions([]);
      setIsStayLoading(false);
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setIsStayLoading(true);

      try {
        const params = new URLSearchParams({
          type: "stays",
          keyword,
          checkIn: stayDates.checkIn,
          checkOut: stayDates.checkOut,
          adultCount: String(defaultStayState.adultCount),
          childCount: String(defaultStayState.childCount),
          isDomestic: String(defaultStayState.isDomestic),
          page: "0",
          size: "3",
        });
        if (selectedStayPriceFilter?.min !== null && selectedStayPriceFilter?.min !== undefined) {
          params.set("hotelPriceMin", String(selectedStayPriceFilter.min));
        }
        if (selectedStayPriceFilter?.max !== null && selectedStayPriceFilter?.max !== undefined) {
          params.set("hotelPriceMax", String(selectedStayPriceFilter.max));
        }

        const response = await fetch(`/api/search?${params.toString()}`);
        const data = (await response.json().catch(() => null)) as
          | { stays?: StaySuggestion[] }
          | null;

        if (!cancelled) {
          setStaySuggestions(
            Array.isArray(data?.stays) ? data.stays.slice(0, 3) : [],
          );
        }
      } catch {
        if (!cancelled) {
          setStaySuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsStayLoading(false);
        }
      }
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    activeTab.id,
    defaultStayState.adultCount,
    defaultStayState.childCount,
    defaultStayState.isDomestic,
    query,
    selectedStayPriceFilter?.max,
    selectedStayPriceFilter?.min,
    stayDates.checkIn,
    stayDates.checkOut,
  ]);

  useEffect(() => {
    if (activeTab.id !== "tour") {
      setTourSuggestions([]);
      setIsTourLoading(false);
      return;
    }

    const keyword = query.trim();
    if (keyword.length < 2) {
      setTourSuggestions([]);
      setIsTourLoading(false);
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setIsTourLoading(true);

      try {
        const params = new URLSearchParams({
          type: "tnas",
          query: keyword,
          city: inferTourCity(keyword),
          category: "all",
          sort: "selling_count_desc",
          page: "1",
          perPage: "3",
        });

        const response = await fetch(`/api/search?${params.toString()}`);
        const data = (await response.json().catch(() => null)) as
          | { tnas?: TourSuggestion[] }
          | null;

        if (!cancelled) {
          setTourSuggestions(
            Array.isArray(data?.tnas) ? data.tnas.slice(0, 3) : [],
          );
        }
      } catch {
        if (!cancelled) {
          setTourSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsTourLoading(false);
        }
      }
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeTab.id, query]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const searchValue =
        query.trim() || activeTab.defaultQuery || activeTab.keywords[0] || "";

      if (!searchValue) {
        window.location.assign(activeTab.href);
        return;
      }

      if (activeTab.id === "stay") {
        window.location.assign(
          buildStayResultsHref({
            keyword: searchValue,
            checkIn: stayDates.checkIn,
            checkOut: stayDates.checkOut,
            adultCount: defaultStayState.adultCount,
            childCount: defaultStayState.childCount,
            isDomestic: defaultStayState.isDomestic,
            hotelPriceMin: selectedStayPriceFilter?.min ?? null,
            hotelPriceMax: selectedStayPriceFilter?.max ?? null,
            page: 0,
            size: 12,
          }),
        );
        return;
      }

      window.location.assign(
        buildTourResultsHref({
          keyword: searchValue,
          city: inferTourCity(searchValue),
          category: "all",
          sort: "selling_count_desc",
          page: 1,
          perPage: 12,
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="px-5">
      {!hideTitle ? (
        <div className="mb-3">
          <h2 className="text-[22px] font-black tracking-[-0.05em] text-[#2c211d]">
            항목별 검색
          </h2>
        </div>
      ) : null}

      <div className="rounded-[26px] border border-[#f2e5de] bg-[linear-gradient(180deg,#fffdfa_0%,#fff7f2_100%)] p-4 shadow-[0_12px_26px_rgba(110,66,52,0.06)]">
        <div className="grid h-[52px] grid-cols-2 gap-1 rounded-[18px] bg-[#fbefea] p-1">
          {tabs.map((tab) => {
            const active = tab.id === activeTab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTabId(tab.id);
                  setQuery("");
                }}
                className={`flex items-center justify-center gap-1.5 rounded-[16px] border text-[15px] font-semibold transition ${
                  active
                    ? "border-[#f3e2da] bg-white text-[#f05f5b] shadow-[0_6px_14px_rgba(94,55,41,0.05)]"
                    : "border-transparent text-[#7a6c67]"
                }`}
              >
                {tabIcon(tab.icon)}
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex h-[52px] items-center gap-2 rounded-[18px] border border-[#f1e3db] bg-white px-3 shadow-[0_6px_14px_rgba(111,66,51,0.03)]">
            <SearchIcon className="h-[18px] w-[18px] text-[#95857e]" />
            <input
              type="search"
              name="q"
              placeholder={
                activeTab.id === "stay"
                  ? "지역, 숙소명으로 검색해보세요"
                  : activeTab.id === "tour"
                    ? "지역, 투어, 티켓으로 검색해보세요"
                    : searchPlaceholder(activeTab.id, placeholder)
              }
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#2c221d] outline-none placeholder:text-[#b39f96]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-9 items-center justify-center leading-[1.2] rounded-full bg-[#ffe6df] px-4 py-2 text-[13px] font-bold text-[#f05f5b]"
            >
              {isSubmitting ? "이동" : "검색"}
            </button>
          </div>
        </form>

        {activeTab.id === "stay" ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="rounded-[18px] border border-[#f1e3db] bg-white px-3.5 py-2.5 shadow-[0_6px_14px_rgba(111,66,51,0.03)]">
              <p className="text-[12px] font-semibold text-[#9a837b]">체크인</p>
              <input
                type="date"
                value={stayDates.checkIn}
                onChange={(event) => {
                  const checkIn = event.target.value;
                  setStayDates((current) => ({
                    checkIn,
                    checkOut:
                      current.checkOut > checkIn
                        ? current.checkOut
                        : addStayDays(checkIn, 1),
                  }));
                }}
                className="mt-1 block w-full bg-transparent text-[15px] font-bold text-[#2f2420] outline-none"
              />
            </label>

            <label className="rounded-[18px] border border-[#f1e3db] bg-white px-3.5 py-2.5 shadow-[0_6px_14px_rgba(111,66,51,0.03)]">
              <p className="text-[12px] font-semibold text-[#9a837b]">체크아웃</p>
              <input
                type="date"
                min={stayDates.checkIn}
                value={stayDates.checkOut}
                onChange={(event) => {
                  const checkOut = event.target.value;
                  setStayDates((current) => ({
                    ...current,
                    checkOut:
                      checkOut > current.checkIn
                        ? checkOut
                        : addStayDays(current.checkIn, 1),
                  }));
                }}
                className="mt-1 block w-full bg-transparent text-[15px] font-bold text-[#2f2420] outline-none"
              />
            </label>
          </div>
        ) : null}

        {activeTab.id === "stay" ? (
          <div className="mt-3 rounded-[18px] border border-[#f1e3db] bg-white/70 px-3.5 py-3.5 shadow-[0_6px_14px_rgba(111,66,51,0.03)]">
            <p className="text-[12px] font-black tracking-[-0.02em] text-[#6c5650]">
              1박 예산
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {STAY_PRICE_FILTERS.map((filter) => {
                const selected = filter.id === selectedStayPriceFilterId;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() =>
                      setSelectedStayPriceFilterId((current) =>
                        current === filter.id ? null : filter.id,
                      )
                    }
                    className={`inline-flex h-[34px] items-center justify-center leading-[1.2] rounded-full px-2.5 text-[12px] font-bold transition ${
                      selected
                        ? "bg-[#f05f5b] text-white shadow-[0_8px_16px_rgba(240,95,91,0.18)]"
                        : "bg-white text-[#8d726b] ring-1 ring-[#f3e4dc]"
                    }`}
                    aria-pressed={selected}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {activeTab.id !== "stay" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeTab.keywords.map((keyword) => (
            <button
              key={`${activeTab.id}-${keyword}`}
              type="button"
              onClick={() => setQuery(keyword)}
              className="inline-flex h-[30px] items-center justify-center leading-[1.2] rounded-full bg-white px-3 text-[12px] font-bold text-[#8d726b] ring-1 ring-[#f3e4dc]"
            >
              {keyword}
            </button>
          ))}
        </div>
        ) : null}

        {activeTab.id === "stay" && query.trim().length >= 2 ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[12px] font-bold text-[#6f5f5a]">추천 숙소</p>
              <p className="text-[11px] font-semibold text-[#a18f87]">상위 3개</p>
            </div>

            {isStayLoading ? (
              <div className="rounded-[18px] border border-[#f1e3db] bg-white px-3 py-3 text-[14px] font-medium text-[#7c6e68]">
                숙소 찾는 중
              </div>
            ) : staySuggestions.length > 0 ? (
              staySuggestions.slice(0, 3).map((suggestion) => (
                <button
                  key={suggestion.itemId}
                  type="button"
                  onClick={() => handleStaySuggestionClick(suggestion)}
                  className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-[#f1e3db] bg-white px-3 py-3 text-left shadow-[0_8px_18px_rgba(96,48,34,0.04)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-[#2c221d]">
                      {suggestion.itemName}
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-[#7e7067]">
                      {formatSuggestionReview(
                        suggestion.reviewScore,
                        suggestion.reviewCount,
                      )}
                    </p>
                  </div>
                  <p className="shrink-0 text-[14px] font-bold text-[#f05f5b]">
                    {formatSuggestionPrice(suggestion.salePrice)}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-[18px] border border-[#f1e3db] bg-white px-3 py-3 text-[14px] font-medium text-[#7c6e68]">
                맞는 숙소를 찾지 못했어요
              </div>
            )}
          </div>
        ) : null}

        {activeTab.id === "tour" && query.trim().length >= 2 ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[12px] font-bold text-[#6f5f5a]">추천 투어</p>
              <p className="text-[11px] font-semibold text-[#a18f87]">상위 3개</p>
            </div>

            {isTourLoading ? (
              <div className="rounded-[18px] border border-[#f1e3db] bg-white px-3 py-3 text-[14px] font-medium text-[#7c6e68]">
                투어 찾는 중
              </div>
            ) : tourSuggestions.length > 0 ? (
              tourSuggestions.slice(0, 3).map((suggestion) => (
                <button
                  key={suggestion.gid}
                  type="button"
                  onClick={() => handleTourSuggestionClick(suggestion)}
                  className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-[#f1e3db] bg-white px-3 py-3 text-left shadow-[0_8px_18px_rgba(96,48,34,0.04)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-[#2c221d]">
                      {tourSuggestionName(suggestion)}
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-[#7e7067]">
                      {formatTourSuggestionMeta(suggestion)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[14px] font-bold text-[#f05f5b]">
                    {formatTourSuggestionPrice(suggestion)}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-[18px] border border-[#f1e3db] bg-white px-3 py-3 text-[14px] font-medium text-[#7c6e68]">
                맞는 투어를 찾지 못했어요
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
