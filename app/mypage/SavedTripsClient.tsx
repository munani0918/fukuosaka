"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

import {
  MAX_SAVED_ITEMS,
  SAVED_ITEMS_STORAGE_KEY,
  SAVED_TRIPS_STORAGE_KEY,
  type SavedItem,
  type SavedItemSource,
  type SavedItemType,
  type SavedTrip,
} from "@/src/types/savedTrip";

type BoardKey = "all" | "unassigned" | string;
type CategoryKey = "all" | "trips" | "hotels" | "tours";

type ListEntry =
  | { id: string; kind: "trip"; savedAt: string; trip: SavedTrip }
  | { id: string; kind: "item"; savedAt: string; item: SavedItem };

const TOUR_ITEM_TYPES: SavedItemType[] = ["tour", "ticket", "transport", "esim"];

function safeTime(value?: string) {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function formatDate(value?: string) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "저장일 확인 중";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shortDate(value?: string) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatBudget(value: number | null) {
  if (!value || value <= 0) return "예산 정보 없음";
  return `총 ${Math.round(value).toLocaleString("ko-KR")}원`;
}

function styleText(styles: string[]) {
  return styles.length ? styles.join(" · ") : "대표 코스";
}

function savedTripResultHref(id: string) {
  return `/planner-result.html?mode=saved&savedTripId=${encodeURIComponent(id)}`;
}

function tripLabel(trip: SavedTrip, withDate = false) {
  const base = `${trip.cityName} ${trip.nights}박${trip.days}일`;
  const dateLabel = shortDate(trip.savedAt);
  return withDate && dateLabel ? `${base} · ${dateLabel}` : base;
}

function normalizeItemType(value: unknown): SavedItemType {
  if (value === "hotel") return "hotel";
  if (value === "ticket") return "ticket";
  if (value === "transport") return "transport";
  if (value === "esim") return "esim";
  return "tour";
}

function normalizeSource(value: unknown): SavedItemSource {
  if (value === "agoda") return "agoda";
  if (value === "myrealtrip") return "myrealtrip";
  if (value === "manual") return "manual";
  return "unknown";
}

function normalizeSavedTrips(value: unknown): SavedTrip[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is SavedTrip => {
      return Boolean(item && typeof item === "object" && "id" in item && "cityName" in item);
    })
    .map((trip) => ({
      ...trip,
      savedAt: typeof trip.savedAt === "string" ? trip.savedAt : "",
      styles: Array.isArray(trip.styles) ? trip.styles : [],
      itineraryOutline: Array.isArray(trip.itineraryOutline) ? trip.itineraryOutline : [],
    }))
    .sort((a, b) => safeTime(b.savedAt) - safeTime(a.savedAt));
}

function normalizeSavedItems(value: unknown): SavedItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is SavedItem => {
      return Boolean(item && typeof item === "object" && "id" in item);
    })
    .map((item) => ({
      ...item,
      itemType: normalizeItemType(item.itemType),
      source: normalizeSource(item.source),
      title: typeof item.title === "string" && item.title.trim() ? item.title : "저장한 상품",
      savedAt: typeof item.savedAt === "string" ? item.savedAt : "",
    }))
    .sort((a, b) => safeTime(b.savedAt) - safeTime(a.savedAt));
}

function sourceLabel(source: SavedItem["source"]) {
  if (source === "agoda") return "아고다";
  if (source === "myrealtrip") return "마이리얼트립";
  if (source === "manual") return "저장한 상품";
  return "출처 확인";
}

function itemTypeLabel(type: SavedItemType) {
  if (type === "hotel") return "숙소";
  if (type === "ticket") return "티켓";
  if (type === "transport") return "교통";
  if (type === "esim") return "eSIM";
  return "투어";
}

function savedItemHref(item: SavedItem) {
  return item.detailPath || item.bookingUrl || item.affiliateUrl || item.originalUrl || "";
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function isHotelItem(item: SavedItem) {
  return item.itemType === "hotel";
}

function isTourItem(item: SavedItem) {
  return TOUR_ITEM_TYPES.includes(item.itemType);
}

function countItems(items: SavedItem[]) {
  return {
    hotels: items.filter(isHotelItem).length,
    tours: items.filter(isTourItem).length,
  };
}

function countText({ trips, hotels, tours }: { trips?: number; hotels: number; tours: number }) {
  const parts = [];
  if (typeof trips === "number") parts.push(`일정 ${trips}`);
  if (hotels > 0) parts.push(`숙소 ${hotels}`);
  if (tours > 0) parts.push(`투어 ${tours}`);
  return parts.length ? parts.join(" · ") : "저장 항목 없음";
}

function tripAssociationFromTrip(trip: SavedTrip) {
  return {
    tripId: trip.id,
    tripLabel: tripLabel(trip),
    tripCityCode: trip.cityCode,
    tripCityName: trip.cityName,
    tripNights: trip.nights,
    tripDays: trip.days,
  };
}

function EmptyState({
  title,
  description,
  showPlannerButton = false,
}: {
  title: string;
  description: string;
  showPlannerButton?: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#ebcfc4] bg-white/70 p-6 text-center">
      <p className="text-[15px] font-black tracking-[-0.04em] text-[#3a2a24]">{title}</p>
      <p className="mt-2 text-[12.5px] font-semibold leading-relaxed text-[#8a7a72]">
        {description}
      </p>
      {showPlannerButton ? (
        <a
          href="/planner-wizard.html"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[#f26b61] px-5 py-3 text-[13px] font-black text-white shadow-[0_14px_28px_rgba(219,85,75,0.18)]"
        >
          예산 플래너 시작하기
        </a>
      ) : null}
    </div>
  );
}

export function SavedTripsClient() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<BoardKey>("all");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [attachDrafts, setAttachDrafts] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_TRIPS_STORAGE_KEY);
      setTrips(normalizeSavedTrips(raw ? JSON.parse(raw) : []));

      const itemRaw = window.localStorage.getItem(SAVED_ITEMS_STORAGE_KEY);
      setItems(normalizeSavedItems(itemRaw ? JSON.parse(itemRaw) : []));
    } catch {
      setStorageError("저장한 여행을 불러오지 못했어요.");
    } finally {
      setLoaded(true);
    }
  }, []);

  function writeItems(nextItems: SavedItem[]) {
    window.localStorage.setItem(
      SAVED_ITEMS_STORAGE_KEY,
      JSON.stringify(nextItems.slice(0, MAX_SAVED_ITEMS)),
    );
    setItems(nextItems);
  }

  function deleteTrip(id: string) {
    if (!window.confirm("저장한 여행을 삭제할까요?")) return;

    const nextTrips = trips.filter((trip) => trip.id !== id);
    try {
      window.localStorage.setItem(SAVED_TRIPS_STORAGE_KEY, JSON.stringify(nextTrips));
      setTrips(nextTrips);
      if (selectedBoard === id) {
        setSelectedBoard("all");
        setSelectedCategory("all");
      }
    } catch {
      setStorageError("이 브라우저에서는 저장 변경을 사용할 수 없어요.");
    }
  }

  function deleteItem(id: string) {
    const nextItems = items.filter((item) => item.id !== id);
    try {
      writeItems(nextItems);
    } catch {
      setStorageError("이 브라우저에서는 저장 변경을 사용할 수 없어요.");
    }
  }

  function assignItemToTrip(itemId: string, tripId: string) {
    const trip = trips.find((candidate) => candidate.id === tripId);
    if (!trip) return;

    const association = tripAssociationFromTrip(trip);
    const nextItems = items.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        ...association,
      };
    });

    try {
      writeItems(nextItems);
      setAttachDrafts((previous) => {
        const next = { ...previous };
        delete next[itemId];
        return next;
      });
    } catch {
      setStorageError("이 브라우저에서는 저장 변경을 사용할 수 없어요.");
    }
  }

  const unassignedItems = items.filter((item) => !item.tripId);
  const hasUnassignedItems = unassignedItems.length > 0;

  const boardItems =
    selectedBoard === "all"
      ? items
      : selectedBoard === "unassigned"
        ? unassignedItems
        : items.filter((item) => item.tripId === selectedBoard);

  const boardTrips =
    selectedBoard === "all"
      ? trips
      : selectedBoard === "unassigned"
        ? []
        : trips.filter((trip) => trip.id === selectedBoard);

  const boardHotelItems = boardItems.filter(isHotelItem);
  const boardTourItems = boardItems.filter(isTourItem);
  const boardCounts = {
    trips: boardTrips.length,
    hotels: boardHotelItems.length,
    tours: boardTourItems.length,
  };

  const listEntries: ListEntry[] = [
    ...(selectedCategory === "all" || selectedCategory === "trips"
      ? boardTrips.map((trip) => ({
          id: `trip-${trip.id}`,
          kind: "trip" as const,
          savedAt: trip.savedAt,
          trip,
        }))
      : []),
    ...(selectedCategory === "all" || selectedCategory === "hotels"
      ? boardHotelItems.map((item) => ({
          id: `item-${item.id}`,
          kind: "item" as const,
          savedAt: item.savedAt,
          item,
        }))
      : []),
    ...(selectedCategory === "all" || selectedCategory === "tours"
      ? boardTourItems.map((item) => ({
          id: `item-${item.id}`,
          kind: "item" as const,
          savedAt: item.savedAt,
          item,
        }))
      : []),
  ].sort((a, b) => safeTime(b.savedAt) - safeTime(a.savedAt));

  const totalCounts = {
    trips: trips.length,
    ...countItems(items),
  };
  const unassignedCounts = countItems(unassignedItems);
  const activeBoardLabel =
    selectedBoard === "all"
      ? "전체 보기"
      : selectedBoard === "unassigned"
        ? "여행 미지정"
        : tripLabel(trips.find((trip) => trip.id === selectedBoard) || trips[0] || {
            cityName: "저장한 여행",
            nights: 0,
            days: 0,
            savedAt: "",
          } as SavedTrip);

  function emptyCopy() {
    if (selectedBoard === "unassigned") {
      if (selectedCategory === "hotels") {
        return {
          title: "여행에 연결되지 않은 숙소가 없어요.",
          description: "여행에 담기 전 마음에 드는 숙소를 별표로 저장해보세요.",
        };
      }
      if (selectedCategory === "tours") {
        return {
          title: "여행에 연결되지 않은 투어·티켓이 없어요.",
          description: "입장권, 교통패스, 현지투어를 먼저 별표로 담아둘 수 있어요.",
        };
      }
      return {
        title: "임시보관함이 비어 있어요.",
        description: "여행에 담기 전 마음에 드는 상품을 별표로 저장해보세요.",
      };
    }

    if (selectedBoard !== "all") {
      if (selectedCategory === "hotels") {
        return {
          title: "이 여행에 저장한 숙소가 아직 없어요.",
          description: "마음에 드는 숙소를 발견하면 별표를 눌러 저장해보세요.",
        };
      }
      if (selectedCategory === "tours") {
        return {
          title: "이 여행에 저장한 투어·티켓이 아직 없어요.",
          description: "입장권, 교통패스, 현지투어를 저장해두고 비교해보세요.",
        };
      }
      if (selectedCategory === "trips") {
        return {
          title: "저장한 여행 일정을 찾지 못했어요.",
          description: "전체 보기에서 저장한 여행을 다시 확인해보세요.",
        };
      }
      return {
        title: "이 여행에 저장한 항목이 아직 없어요.",
        description: "숙소와 투어·티켓을 별표로 담아 여행별로 모아볼 수 있어요.",
      };
    }

    if (selectedCategory === "trips") {
      return {
        title: "저장한 여행 일정이 없어요.",
        description: "예산 플래너로 첫 여행을 만들어보세요.",
        showPlannerButton: true,
      };
    }

    if (selectedCategory === "hotels") {
      return {
        title: "아직 찜한 숙소가 없어요.",
        description: "결과 화면에서 마음에 드는 숙소의 별표를 눌러 저장해보세요.",
      };
    }

    if (selectedCategory === "tours") {
      return {
        title: "아직 찜한 투어·티켓이 없어요.",
        description: "입장권, 교통패스, 현지투어를 저장해두고 비교해보세요.",
      };
    }

    return {
      title: "아직 저장한 항목이 없어요.",
      description: "예산 플래너로 첫 여행을 만들어보세요.",
      showPlannerButton: true,
    };
  }

  const emptyState = emptyCopy();

  if (!loaded) {
    return (
      <div className="rounded-[28px] border border-[#f2ded4] bg-white/80 p-6 text-center text-[13px] font-bold text-[#897970]">
        저장한 여행을 불러오고 있어요.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {storageError ? (
        <div className="rounded-3xl border border-[#f1c9bf] bg-[#fff4ef] p-4 text-[12px] font-bold text-[#b4564f]">
          {storageError}
        </div>
      ) : null}

      <section className="rounded-[30px] border border-[#f2ded4] bg-white/88 p-4 shadow-[0_18px_42px_rgba(111,63,48,0.08)]">
        <div className="mb-3">
          <h2 className="text-[18px] font-black tracking-[-0.05em]">내 여행 보드</h2>
          <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-[#8a7a72]">
            여행을 선택하면 저장한 일정과 찜한 상품을 함께 볼 수 있어요.
          </p>
        </div>

        <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => {
              setSelectedBoard("all");
              setSelectedCategory("all");
            }}
            className={`min-w-[158px] rounded-[24px] border p-4 text-left transition ${
              selectedBoard === "all"
                ? "border-[#f26b61] bg-[#fff0eb] shadow-[0_14px_30px_rgba(219,85,75,0.14)]"
                : "border-[#f0dfd7] bg-[#fffdfb]"
            }`}
          >
            <span className="text-[18px]" aria-hidden="true">
              ◇
            </span>
            <strong className="mt-2 block text-[14px] font-black tracking-[-0.04em]">
              전체 보기
            </strong>
            <span className="mt-1 block text-[11.5px] font-bold leading-snug text-[#8a7a72]">
              저장한 일정과 찜한 상품 전체
            </span>
            <span className="mt-3 block text-[11px] font-black text-[#c85c52]">
              {countText(totalCounts)}
            </span>
          </button>

          {trips.map((trip) => {
            const linkedItems = items.filter((item) => item.tripId === trip.id);
            const linkedCounts = countItems(linkedItems);
            const selected = selectedBoard === trip.id;

            return (
              <button
                key={trip.id}
                type="button"
                onClick={() => {
                  setSelectedBoard(trip.id);
                  setSelectedCategory("all");
                }}
                className={`min-w-[170px] rounded-[24px] border p-4 text-left transition ${
                  selected
                    ? "border-[#f26b61] bg-[#fff0eb] shadow-[0_14px_30px_rgba(219,85,75,0.14)]"
                    : "border-[#f0dfd7] bg-[#fffdfb]"
                }`}
              >
                <span className="text-[18px]" aria-hidden="true">
                  ▣
                </span>
                <strong className="mt-2 line-clamp-2 block text-[14px] font-black leading-tight tracking-[-0.04em]">
                  {tripLabel(trip, true)}
                </strong>
                <span className="mt-1 block text-[11.5px] font-bold leading-snug text-[#8a7a72]">
                  {formatBudget(trip.budgetTotal)}
                </span>
                <span className="mt-3 block text-[11px] font-black text-[#c85c52]">
                  {countText({ trips: 1, ...linkedCounts })}
                </span>
              </button>
            );
          })}

          {hasUnassignedItems ? (
            <button
              type="button"
              onClick={() => {
                setSelectedBoard("unassigned");
                setSelectedCategory("all");
              }}
              className={`min-w-[158px] rounded-[24px] border p-4 text-left transition ${
                selectedBoard === "unassigned"
                  ? "border-[#f26b61] bg-[#fff0eb] shadow-[0_14px_30px_rgba(219,85,75,0.14)]"
                  : "border-[#f0dfd7] bg-[#fffdfb]"
              }`}
            >
              <span className="text-[18px]" aria-hidden="true">
                □
              </span>
              <strong className="mt-2 block text-[14px] font-black tracking-[-0.04em]">
                여행 미지정
              </strong>
              <span className="mt-1 block text-[11.5px] font-bold leading-snug text-[#8a7a72]">
                아직 여행에 담지 않은 찜 항목
              </span>
              <span className="mt-3 block text-[11px] font-black text-[#c85c52]">
                {countText({ hotels: unassignedCounts.hotels, tours: unassignedCounts.tours })}
              </span>
            </button>
          ) : null}
        </div>
      </section>

      <section className="sticky top-2 z-10 rounded-[26px] border border-[#f2ded4] bg-[#fffdfb]/95 p-2 shadow-[0_12px_30px_rgba(111,63,48,0.08)] backdrop-blur">
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "all" as const, label: "전체", count: boardCounts.trips + boardCounts.hotels + boardCounts.tours },
            { id: "trips" as const, label: "일정", count: boardCounts.trips },
            { id: "hotels" as const, label: "숙소", count: boardCounts.hotels },
            { id: "tours" as const, label: "투어·티켓", count: boardCounts.tours },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[12px] font-black transition ${
                selectedCategory === tab.id
                  ? "bg-[#f26b61] text-white shadow-[0_10px_22px_rgba(219,85,75,0.18)]"
                  : "bg-[#f7f1ec] text-[#7d6e66]"
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-80">{tab.count}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="px-1">
          <p className="text-[12px] font-black text-[#c85c52]">{activeBoardLabel}</p>
          <h2 className="mt-1 text-[20px] font-black tracking-[-0.06em]">저장 목록</h2>
          <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-[#8a7a72]">
            {listEntries.length > 0
              ? `선택한 보드에 ${listEntries.length}개 항목이 있어요.`
              : "선택한 조건에 맞는 항목이 아직 없어요."}
          </p>
        </div>

        {listEntries.length === 0 ? (
          <EmptyState {...emptyState} />
        ) : (
          <div className="space-y-3">
            {listEntries.map((entry) => {
              if (entry.kind === "trip") {
                const trip = entry.trip;
                return (
                  <article
                    key={entry.id}
                    className="rounded-[28px] border border-[#f0dfd7] bg-white/90 p-4 shadow-[0_14px_34px_rgba(92,55,43,0.07)]"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span className="rounded-full bg-[#fff1ec] px-2.5 py-1 text-[10.5px] font-black text-[#c85c52]">
                        일정
                      </span>
                      <span className="shrink-0 text-[10.5px] font-bold text-[#b0998e]">
                        저장일 {formatDate(trip.savedAt)}
                      </span>
                    </div>

                    <h3 className="text-[18px] font-black tracking-[-0.06em] text-[#2c211d]">
                      {tripLabel(trip)}
                    </h3>
                    <p className="mt-1 text-[12px] font-bold leading-relaxed text-[#8a7a72]">
                      {formatBudget(trip.budgetTotal)} · {styleText(trip.styles)}
                    </p>
                    <p className="mt-3 text-[14px] font-black leading-snug tracking-[-0.04em]">
                      {trip.title || `${trip.cityName} ${trip.nights}박${trip.days}일 여행 계획`}
                    </p>
                    {trip.summary ? (
                      <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-[#7f7069]">
                        {trip.summary}
                      </p>
                    ) : null}

                    {trip.itineraryOutline.length ? (
                      <div className="mt-3 space-y-1.5 rounded-[22px] bg-[#fff8f5] p-3">
                        {trip.itineraryOutline.slice(0, 5).map((day) => (
                          <p
                            key={`${trip.id}-${day.day}`}
                            className="text-[12px] font-bold leading-relaxed text-[#5e4c45]"
                          >
                            <span className="font-black text-[#c85c52]">{day.day}일차</span>{" "}
                            {day.title}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={savedTripResultHref(trip.id)}
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-[#f26b61] px-4 py-2.5 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(219,85,75,0.18)]"
                      >
                        일정 다시 보기
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteTrip(trip.id)}
                        className="inline-flex items-center justify-center rounded-full border border-[#efd6cf] bg-white px-4 py-2.5 text-[12px] font-black text-[#9d6a5e]"
                      >
                        삭제
                      </button>
                    </div>
                  </article>
                );
              }

              const item = entry.item;
              const href = savedItemHref(item);
              const isExternal = isExternalHref(href);
              const isHotel = isHotelItem(item);
              const selectedAttachTrip = attachDrafts[item.id] || trips[0]?.id || "";
              const itemMeta =
                [
                  item.cityName || item.tripCityName || item.area || item.category,
                  item.priceText,
                  sourceLabel(item.source),
                ]
                  .filter(Boolean)
                  .join(" · ") || "저장한 상품";

              return (
                <article
                  key={entry.id}
                  className="rounded-[28px] border border-[#f0dfd7] bg-white/90 p-3.5 shadow-[0_14px_34px_rgba(92,55,43,0.07)]"
                >
                  <div className="flex gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-24 w-24 shrink-0 rounded-[22px] object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-[#fff1ec] px-2.5 py-1 text-[10.5px] font-black text-[#c85c52]">
                          {itemTypeLabel(item.itemType)}
                        </span>
                        {item.tripLabel ? (
                          <span className="rounded-full bg-[#f7f1ec] px-2.5 py-1 text-[10.5px] font-black text-[#7d6e66]">
                            {item.tripLabel}
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#f7f1ec] px-2.5 py-1 text-[10.5px] font-black text-[#7d6e66]">
                            여행 미지정
                          </span>
                        )}
                      </div>
                      <h3 className="line-clamp-2 text-[15px] font-black leading-snug tracking-[-0.04em] text-[#2c211d]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[11.5px] font-bold leading-relaxed text-[#8a7a72]">
                        {itemMeta}
                      </p>
                      <p className="mt-1 text-[10.5px] font-semibold text-[#b0998e]">
                        저장일 {formatDate(item.savedAt)}
                      </p>
                    </div>
                  </div>

                  {!item.tripId ? (
                    <div className="mt-3 rounded-[22px] bg-[#fff8f5] p-3">
                      {trips.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor={`attach-trip-${item.id}`}
                            className="text-[11.5px] font-black text-[#7d6e66]"
                          >
                            이 상품을 여행에 담기
                          </label>
                          <div className="flex gap-2">
                            <select
                              id={`attach-trip-${item.id}`}
                              value={selectedAttachTrip}
                              onChange={(event) =>
                                setAttachDrafts((previous) => ({
                                  ...previous,
                                  [item.id]: event.target.value,
                                }))
                              }
                              className="min-w-0 flex-1 rounded-full border border-[#ead7cf] bg-white px-3 py-2 text-[12px] font-bold text-[#4a382f]"
                            >
                              {trips.map((trip) => (
                                <option key={trip.id} value={trip.id}>
                                  {tripLabel(trip, true)}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => assignItemToTrip(item.id, selectedAttachTrip)}
                              className="shrink-0 rounded-full bg-[#f26b61] px-3.5 py-2 text-[12px] font-black text-white"
                            >
                              담기
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11.5px] font-bold text-[#8a7a72]">
                          먼저 여행 일정을 저장해 주세요.
                        </p>
                      )}
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {href ? (
                      <a
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-[#f26b61] px-4 py-2.5 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(219,85,75,0.18)]"
                      >
                        {isHotel ? "숙소 다시 보기" : "상품 다시 보기"}
                      </a>
                    ) : (
                      <p className="min-w-0 flex-1 self-center text-[11.5px] font-bold text-[#b0998e]">
                        다시 보기 링크가 없는 항목이에요.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="inline-flex items-center justify-center rounded-full border border-[#efd6cf] bg-white px-4 py-2.5 text-[12px] font-black text-[#9d6a5e]"
                    >
                      삭제
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
