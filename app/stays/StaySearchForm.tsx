"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { addStayDays, type StaySearchState } from "@/src/lib/stays";

type StaySearchFormProps = {
  state: StaySearchState;
};

const STAY_BUDGET_OPTIONS = [
  { id: "all", label: "전체", summary: "1박 전체", queryValue: "all", min: null, max: null },
  { id: "under-100k", label: "10만↓", summary: "1박 10만원 이하", queryValue: "100000", min: null, max: 100000 },
  { id: "under-200k", label: "20만↓", summary: "1박 20만원 이하", queryValue: "200000", min: null, max: 200000 },
  { id: "under-300k", label: "30만↓", summary: "1박 30만원 이하", queryValue: "300000", min: null, max: 300000 },
  { id: "over-300k", label: "30만+", summary: "1박 30만원 이상", queryValue: "premium", min: 300000, max: null },
] as const;

type StayBudgetOption = (typeof STAY_BUDGET_OPTIONS)[number];

function getInitialBudgetOption(state: StaySearchState): StayBudgetOption {
  if (state.hotelPriceMin === 300000 && state.hotelPriceMax === null) {
    return STAY_BUDGET_OPTIONS[4];
  }
  if (state.hotelPriceMax === 300000) return STAY_BUDGET_OPTIONS[3];
  if (state.hotelPriceMax === 200000) return STAY_BUDGET_OPTIONS[2];
  if (state.hotelPriceMax === 100000) return STAY_BUDGET_OPTIONS[1];
  return STAY_BUDGET_OPTIONS[0];
}

function destinationLabel(keyword: string) {
  return keyword.includes("후쿠오카") || keyword.includes("하카타")
    ? "후쿠오카"
    : "오사카";
}

function compactDateRange(checkIn: string, checkOut: string) {
  const [inYear, inMonth, inDay] = checkIn.split("-");
  const [, outMonth, outDay] = checkOut.split("-");
  if (!inYear || !inMonth || !inDay || !outMonth || !outDay) {
    return `${checkIn} - ${checkOut}`;
  }

  return `${Number(inMonth)}.${Number(inDay)} - ${Number(outMonth)}.${Number(outDay)}`;
}

function CounterControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const setClampedValue = (nextValue: number) => {
    onChange(Math.min(max, Math.max(min, nextValue)));
  };

  return (
    <div className="flex items-center justify-between rounded-[14px] bg-white px-3 py-2 ring-1 ring-[#eadcd3]">
      <span className="text-[11px] font-black text-[#6c5650]">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setClampedValue(value - 1)}
          disabled={value <= min}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fbf2ed] text-[14px] font-black text-[#9a7469] disabled:opacity-35"
          aria-label={`${label} 줄이기`}
        >
          -
        </button>
        <span className="w-8 text-center text-[12px] font-black text-[#241b17]">
          {value}
        </span>
        <button
          type="button"
          onClick={() => setClampedValue(value + 1)}
          disabled={value >= max}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff4f0] text-[14px] font-black text-[#cb4b42] disabled:opacity-35"
          aria-label={`${label} 늘리기`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function StaySearchForm({ state }: StaySearchFormProps) {
  const [keyword, setKeyword] = useState(destinationLabel(state.keyword));
  const [checkIn, setCheckIn] = useState(state.checkIn);
  const [checkOut, setCheckOut] = useState(state.checkOut);
  const [adultCount, setAdultCount] = useState(state.adultCount);
  const [childCount, setChildCount] = useState(state.childCount);
  const [roomCount, setRoomCount] = useState(state.roomCount);
  const [budgetOption, setBudgetOption] = useState(() =>
    getInitialBudgetOption(state),
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const minCheckOut = useMemo(() => addStayDays(checkIn, 1), [checkIn]);
  const summary = `${keyword || "숙소"} · ${compactDateRange(checkIn, checkOut)}`;
  const guestSummary = `성인 ${adultCount} · 아동 ${childCount} · 객실 ${roomCount}`;
  const budgetIndex = Math.max(
    0,
    STAY_BUDGET_OPTIONS.findIndex((option) => option.id === budgetOption.id),
  );
  const budgetProgress =
    (budgetIndex / (STAY_BUDGET_OPTIONS.length - 1)) * 100;

  useEffect(() => {
    const openPanel = () => setIsPanelOpen(true);
    window.addEventListener("open-stay-search-panel", openPanel);
    return () => window.removeEventListener("open-stay-search-panel", openPanel);
  }, []);

  function handleCheckInChange(nextCheckIn: string) {
    if (!nextCheckIn) {
      setCheckIn(nextCheckIn);
      return;
    }
    const nextMinCheckOut = addStayDays(nextCheckIn, 1);
    setCheckIn(nextCheckIn);
    setCheckOut((current) => (current > nextCheckIn ? current : nextMinCheckOut));
  }

  function handleCheckOutChange(nextCheckOut: string) {
    setCheckOut(nextCheckOut > checkIn ? nextCheckOut : minCheckOut);
  }

  function handleBudgetIndexChange(nextIndex: number) {
    const nextOption = STAY_BUDGET_OPTIONS[nextIndex] ?? STAY_BUDGET_OPTIONS[0];
    setBudgetOption(nextOption);
  }

  return (
    <form id="stay-search-form" action="/stays" method="get" className="mt-3">
      <button
        type="button"
        onClick={() => setIsPanelOpen(true)}
        className="w-full rounded-[20px] bg-white/86 p-3 text-left shadow-[0_10px_20px_rgba(92,50,38,0.05)] ring-1 ring-[#efe3db] transition active:scale-[0.99]"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[12px] font-black tracking-[-0.02em] text-[#241b17]">
              {summary}
            </p>
            <p className="mt-1 truncate text-[11px] font-semibold text-[#8f776f]">
              {guestSummary} · {budgetOption.summary}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#fff4f0] px-3 py-1.5 text-[11px] font-black text-[#cb4b42] ring-1 ring-[#f1d7cf]">
            변경
          </span>
        </div>
      </button>

      {isPanelOpen && typeof document !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(35,24,19,0.38)] px-3">
          <button
            type="button"
            aria-label="조건 변경 닫기"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsPanelOpen(false)}
          />
          <div className="relative max-h-[88dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-[#fffaf6] px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-4 shadow-[0_-18px_44px_rgba(42,23,18,0.20)] ring-1 ring-[#efe3db]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#e5d5cb]" />
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[16px] font-black tracking-[-0.04em] text-[#241b17]">
                  숙박 조건 설정
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-[#8f776f]">
                  {summary} · {budgetOption.summary}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[18px] font-black text-[#8c746a] ring-1 ring-[#eadcd3]"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-[11px] font-black text-[#6c5650]">
                  목적지
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["오사카", "후쿠오카"].map((destination) => {
                    const selected = keyword === destination;
                    return (
                      <button
                        key={destination}
                        type="button"
                        onClick={() => setKeyword(destination)}
                        className={`h-10 rounded-[14px] text-[12px] font-black ${
                          selected
                            ? "bg-[#cb4b42] text-white"
                            : "bg-white text-[#8c746a] ring-1 ring-[#eadcd3]"
                        }`}
                      >
                        {destination}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className="text-[10px] font-bold text-[#8f776f]">체크인</span>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(event) => handleCheckInChange(event.target.value)}
                    className="h-10 w-full rounded-[14px] border border-[#eadcd3] bg-white px-2.5 text-[12px] font-semibold text-[#241b17] outline-none"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-bold text-[#8f776f]">체크아웃</span>
                  <input
                    type="date"
                    min={minCheckOut}
                    value={checkOut}
                    onChange={(event) => handleCheckOutChange(event.target.value)}
                    className="h-10 w-full rounded-[14px] border border-[#eadcd3] bg-white px-2.5 text-[12px] font-semibold text-[#241b17] outline-none"
                  />
                </label>
              </div>

              <div className="col-span-2 grid gap-2">
                <CounterControl
                  label="성인"
                  value={adultCount}
                  min={1}
                  max={8}
                  onChange={setAdultCount}
                />
                <CounterControl
                  label="아동"
                  value={childCount}
                  min={0}
                  max={6}
                  onChange={setChildCount}
                />
                <CounterControl
                  label="객실"
                  value={roomCount}
                  min={1}
                  max={4}
                  onChange={setRoomCount}
                />
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-black text-[#6c5650]">
                  1박 예산
                </p>
                <div className="rounded-[18px] bg-white px-3 pb-3 pt-2 ring-1 ring-[#eadcd3]">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8f776f]">
                      {budgetOption.summary}
                    </span>
                    <span className="rounded-full bg-[#fff4f0] px-2 py-0.5 text-[10px] font-black text-[#cb4b42]">
                      스냅 선택
                    </span>
                  </div>
                  <div className="relative mt-3 h-14 px-2">
                    <div className="absolute left-2 right-2 top-5 h-2.5 rounded-full bg-[#ead6cc] shadow-inner">
                      <div
                        className="h-full rounded-full bg-[#cb4b42] shadow-[0_4px_10px_rgba(203,75,66,0.22)]"
                        style={{ width: `${budgetProgress}%` }}
                      />
                      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
                        {STAY_BUDGET_OPTIONS.map((option, index) => (
                          <span
                            key={option.id}
                            className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                              index <= budgetIndex
                                ? "bg-[#cb4b42]"
                                : "bg-[#d8c3b7]"
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#cb4b42] shadow-[0_8px_18px_rgba(203,75,66,0.34)]"
                        style={{ left: `${budgetProgress}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      step={1}
                      value={budgetIndex}
                      onChange={(event) =>
                        handleBudgetIndexChange(Number(event.target.value))
                      }
                      aria-label="1박 예산"
                      aria-valuetext={budgetOption.summary}
                      className="absolute inset-x-0 top-0 z-20 h-12 w-full cursor-pointer appearance-none bg-transparent opacity-0"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {STAY_BUDGET_OPTIONS.map((option) => {
                      const selected = option.id === budgetOption.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setBudgetOption(option)}
                          className={`h-7 whitespace-nowrap text-[10px] ${
                            selected
                              ? "font-black text-[#cb4b42]"
                              : "font-bold text-[#9b847b]"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              form="stay-search-form"
              className="mt-3 flex h-11 w-full items-center justify-center rounded-[16px] bg-[#cb4b42] text-[13px] font-black text-white"
            >
              예산에 맞는 숙소 보기
            </button>
          </div>
        </div>,
        document.body,
          )
        : null}

      <input type="hidden" name="keyword" value={keyword} />
      <input type="hidden" name="checkIn" value={checkIn} />
      <input type="hidden" name="checkOut" value={checkOut} />
      <input type="hidden" name="adultCount" value={adultCount} />
      <input type="hidden" name="childCount" value={childCount} />
      <input type="hidden" name="roomCount" value={roomCount} />
      <input type="hidden" name="adults" value={adultCount} />
      <input type="hidden" name="children" value={childCount} />
      <input type="hidden" name="rooms" value={roomCount} />
      <input type="hidden" name="isDomestic" value={String(state.isDomestic)} />
      <input type="hidden" name="budget" value={budgetOption.queryValue} />
      <input type="hidden" name="hotelPriceMin" value={budgetOption.min ?? ""} />
      <input type="hidden" name="hotelPriceMax" value={budgetOption.max ?? ""} />
      <input type="hidden" name="page" value="0" />
      <input type="hidden" name="size" value={state.size} />
    </form>
  );
}
