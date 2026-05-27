"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

import {
  MAX_SAVED_ITEMS,
  SAVED_ITEMS_STORAGE_KEY,
  SAVED_TRIPS_STORAGE_KEY,
  type SavedItem,
  type SavedTrip,
} from "@/src/types/savedTrip";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "저장일 확인 중";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
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

function tripFilterLabel(trip: SavedTrip) {
  const savedDate = new Date(trip.savedAt);
  const dateLabel = Number.isNaN(savedDate.getTime())
    ? ""
    : new Intl.DateTimeFormat("ko-KR", {
        month: "2-digit",
        day: "2-digit",
      }).format(savedDate);
  return `${trip.cityName} ${trip.nights}박${trip.days}일${dateLabel ? ` · ${dateLabel}` : ""}`;
}

function normalizeSavedTrips(value: unknown): SavedTrip[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is SavedTrip => {
      return Boolean(
        item &&
          typeof item === "object" &&
          "id" in item &&
          "savedAt" in item &&
          "cityName" in item,
      );
    })
    .sort((a, b) => {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });
}

function normalizeSavedItems(value: unknown): SavedItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is SavedItem => {
      return Boolean(
        item &&
          typeof item === "object" &&
          "id" in item &&
          "title" in item &&
          "itemType" in item,
      );
    })
    .sort((a, b) => {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });
}

function sourceLabel(source: SavedItem["source"]) {
  if (source === "agoda") return "아고다";
  if (source === "myrealtrip") return "마이리얼트립";
  if (source === "manual") return "저장한 상품";
  return "출처 확인";
}

function savedItemHref(item: SavedItem) {
  return (
    item.detailPath ||
    item.bookingUrl ||
    item.affiliateUrl ||
    item.originalUrl ||
    ""
  );
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function SavedItemsSection({
  title,
  description,
  emptyText,
  actionLabel,
  missingHrefText,
  items,
  onDelete,
}: {
  title: string;
  description: string;
  emptyText: string;
  actionLabel: string;
  missingHrefText: string;
  items: SavedItem[];
  onDelete: (id: string) => void;
}) {
  return (
    <section className="rounded-[28px] border border-[#f2ded4] bg-white/88 p-4 shadow-[0_18px_40px_rgba(111,63,48,0.08)]">
      <div className="mb-4">
        <h2 className="text-[19px] font-black tracking-[-0.05em]">
          {title}
        </h2>
        <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-[#8a7a72]">
          {description}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#ebcfc4] bg-[#fff8f5] p-5 text-center text-[13px] font-bold text-[#897970]">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const href = savedItemHref(item);
            return (
              <article
                key={item.id}
                className="rounded-[24px] border border-[#f0dfd7] bg-[#fffdfb] p-3 shadow-[0_12px_28px_rgba(92,55,43,0.06)]"
              >
                <div className="flex gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-[18px] object-cover"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-[#fff1ec] px-2 py-1 text-[10px] font-black text-[#c85c52]">
                        {sourceLabel(item.source)}
                      </span>
                      {item.badgeText || item.category ? (
                        <span className="rounded-full bg-[#f7f1ec] px-2 py-1 text-[10px] font-black text-[#7d6e66]">
                          {item.badgeText || item.category}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-[14px] font-black leading-snug tracking-[-0.04em] text-[#2c211d]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[11.5px] font-bold leading-relaxed text-[#8a7a72]">
                      {[item.cityName || item.area || item.category, item.priceText]
                        .filter(Boolean)
                        .join(" · ") || "저장한 상품"}
                    </p>
                    <p className="mt-1 text-[10.5px] font-semibold text-[#b0998e]">
                      저장일 {formatDate(item.savedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {href ? (
                    <a
                      href={href}
                      target={isExternalHref(href) ? "_blank" : undefined}
                      rel={isExternalHref(href) ? "noopener noreferrer" : undefined}
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-[#f26b61] px-4 py-2.5 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(219,85,75,0.18)]"
                    >
                      {actionLabel}
                    </a>
                  ) : (
                    <p className="min-w-0 flex-1 self-center text-[11.5px] font-bold text-[#b0998e]">
                      {missingHrefText}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
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
  );
}

export function SavedTripsClient() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [selectedTripFilter, setSelectedTripFilter] = useState("all");
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

  function deleteTrip(id: string) {
    if (!window.confirm("저장한 여행을 삭제할까요?")) return;

    const nextTrips = trips.filter((trip) => trip.id !== id);
    try {
      window.localStorage.setItem(
        SAVED_TRIPS_STORAGE_KEY,
        JSON.stringify(nextTrips),
      );
      setTrips(nextTrips);
      if (selectedTripFilter === id) setSelectedTripFilter("all");
    } catch {
      setStorageError("이 브라우저에서는 저장 변경을 사용할 수 없어요.");
    }
  }

  function deleteItem(id: string) {
    const nextItems = items.filter((item) => item.id !== id);
    try {
      window.localStorage.setItem(
        SAVED_ITEMS_STORAGE_KEY,
        JSON.stringify(nextItems.slice(0, MAX_SAVED_ITEMS)),
      );
      setItems(nextItems);
    } catch {
      setStorageError("이 브라우저에서는 저장 변경을 사용할 수 없어요.");
    }
  }

  const hotelItems = items.filter((item) => item.itemType === "hotel");
  const tourItems = items.filter((item) => item.itemType !== "hotel");
  const filteredTrips =
    selectedTripFilter === "all"
      ? trips
      : trips.filter((trip) => trip.id === selectedTripFilter);
  const filteredHotelItems =
    selectedTripFilter === "all"
      ? hotelItems
      : hotelItems.filter((item) => item.tripId === selectedTripFilter);
  const filteredTourItems =
    selectedTripFilter === "all"
      ? tourItems
      : tourItems.filter((item) => item.tripId === selectedTripFilter);
  const filteredHotelEmptyText =
    selectedTripFilter === "all"
      ? "아직 찜한 숙소가 없어요."
      : "이 여행에 저장한 숙소가 아직 없어요.";
  const filteredTourEmptyText =
    selectedTripFilter === "all"
      ? "아직 찜한 투어·티켓이 없어요."
      : "이 여행에 저장한 투어·티켓이 아직 없어요.";

  return (
    <div className="space-y-4">
    <section className="rounded-[28px] border border-[#f2ded4] bg-white/88 p-4 shadow-[0_18px_40px_rgba(111,63,48,0.08)]">
      <div>
        <h2 className="text-[19px] font-black tracking-[-0.05em]">
          여행별 보기
        </h2>
        <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-[#8a7a72]">
          저장한 여행을 기준으로 찜한 숙소와 투어를 나눠볼 수 있어요.
        </p>
      </div>
      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => setSelectedTripFilter("all")}
          className={`shrink-0 rounded-full px-3.5 py-2 text-[12px] font-black ${
            selectedTripFilter === "all"
              ? "bg-[#f26b61] text-white shadow-[0_8px_18px_rgba(219,85,75,0.18)]"
              : "border border-[#efd6cf] bg-white text-[#8a6f64]"
          }`}
        >
          전체
        </button>
        {trips.map((trip) => (
          <button
            key={trip.id}
            type="button"
            onClick={() => setSelectedTripFilter(trip.id)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[12px] font-black ${
              selectedTripFilter === trip.id
                ? "bg-[#f26b61] text-white shadow-[0_8px_18px_rgba(219,85,75,0.18)]"
                : "border border-[#efd6cf] bg-white text-[#8a6f64]"
            }`}
          >
            {tripFilterLabel(trip)}
          </button>
        ))}
      </div>
    </section>

    <section className="rounded-[28px] border border-[#f2ded4] bg-white/88 p-4 shadow-[0_18px_40px_rgba(111,63,48,0.08)]">
      <div className="mb-4">
        <h2 className="text-[19px] font-black tracking-[-0.05em]">
          저장한 여행
        </h2>
        <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-[#8a7a72]">
          이 기기에 저장된 여행 계획이에요.
        </p>
        <p className="mt-1 text-[11.5px] font-semibold leading-relaxed text-[#b0998e]">
          현재는 이 브라우저에만 저장돼요.
        </p>
      </div>

      {storageError ? (
        <div className="mb-3 rounded-2xl border border-[#f3d0c5] bg-[#fff8f5] px-3 py-2 text-[12px] font-bold text-[#c45449]">
          {storageError}
        </div>
      ) : null}

      {!loaded ? (
        <div className="rounded-3xl bg-[#fff8f5] p-5 text-center text-[13px] font-bold text-[#8a7a72]">
          저장한 여행을 확인하고 있어요.
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#ebcfc4] bg-[#fff8f5] p-5 text-center">
          <p className="text-[14px] font-black tracking-[-0.04em]">
            {selectedTripFilter === "all"
              ? "아직 저장한 여행이 없어요."
              : "선택한 여행을 찾을 수 없어요."}
          </p>
          <p className="mt-2 text-[12.5px] font-semibold leading-relaxed text-[#897970]">
            {selectedTripFilter === "all"
              ? "예산 플래너에서 마음에 드는 일정을 저장해보세요."
              : "전체 보기에서 저장한 여행을 다시 확인해보세요."}
          </p>
          {selectedTripFilter === "all" ? (
            <a
              href="/planner-wizard.html"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[#f26b61] px-4 py-2.5 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(219,85,75,0.18)]"
            >
              예산 플래너 시작하기
            </a>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrips.map((trip) => (
            <article
              key={trip.id}
              className="rounded-[24px] border border-[#f0dfd7] bg-[#fffdfb] p-4 shadow-[0_12px_28px_rgba(92,55,43,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-[#d95f55]">
                    {trip.cityName}
                  </p>
                  <h3 className="mt-1 text-[18px] font-black leading-snug tracking-[-0.05em]">
                    {trip.cityName} {trip.nights}박 {trip.days}일
                  </h3>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[11.5px] font-extrabold text-[#7d6e66]">
                <span className="rounded-full bg-[#fff1ec] px-2.5 py-1 text-[#c85c52]">
                  {formatBudget(trip.budgetTotal)}
                </span>
                <span className="rounded-full bg-[#f7f1ec] px-2.5 py-1">
                  {styleText(trip.styles)}
                </span>
                <span className="rounded-full bg-[#f7f1ec] px-2.5 py-1">
                  저장일 {formatDate(trip.savedAt)}
                </span>
              </div>

              <div className="mt-4 rounded-[18px] bg-[#fff8f5] p-3">
                <p className="text-[13px] font-black leading-snug tracking-[-0.04em]">
                  {trip.title}
                </p>
                <p className="mt-1 text-[12px] font-semibold leading-relaxed text-[#83736c]">
                  {trip.summary}
                </p>
              </div>

              <ol className="mt-3 space-y-1.5">
                {trip.itineraryOutline.map((day) => (
                  <li
                    key={`${trip.id}-${day.day}`}
                    className="flex gap-2 text-[12.5px] leading-relaxed"
                  >
                    <span className="shrink-0 font-black text-[#d95f55]">
                      {day.day}일차
                    </span>
                    <span className="min-w-0 font-bold text-[#3b302b]">
                      {day.title}
                    </span>
                  </li>
                ))}
              </ol>

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
          ))}
        </div>
      )}
    </section>

    <SavedItemsSection
      title="찜한 숙소"
      description="마음에 드는 숙소를 저장해두고 다시 확인할 수 있어요."
      emptyText={filteredHotelEmptyText}
      actionLabel="숙소 다시 보기"
      missingHrefText="다시 보기 링크가 없는 항목이에요."
      items={filteredHotelItems}
      onDelete={deleteItem}
    />

    <SavedItemsSection
      title="찜한 투어·티켓"
      description="입장권, 교통패스, 현지투어를 저장해두고 비교해보세요."
      emptyText={filteredTourEmptyText}
      actionLabel="상품 다시 보기"
      missingHrefText="다시 보기 링크가 없는 항목이에요."
      items={filteredTourItems}
      onDelete={deleteItem}
    />
    </div>
  );
}
