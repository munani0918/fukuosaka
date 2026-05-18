"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { SearchIcon } from "@/src/components/home/icons";
import {
  addStayDays,
  buildStayResultsHref,
  type StaySearchState,
} from "@/src/lib/stays";

type StaySearchFormProps = {
  state: StaySearchState;
  quickKeywords: string[];
};

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
  name,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  name: string;
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
        <input type="hidden" name={name} value={value} />
      </div>
    </div>
  );
}

export function StaySearchForm({ state, quickKeywords }: StaySearchFormProps) {
  const [keyword, setKeyword] = useState(state.keyword);
  const [checkIn, setCheckIn] = useState(state.checkIn);
  const [checkOut, setCheckOut] = useState(state.checkOut);
  const [adultCount, setAdultCount] = useState(state.adultCount);
  const [childCount, setChildCount] = useState(state.childCount);
  const [roomCount, setRoomCount] = useState(state.roomCount);
  const minCheckOut = useMemo(() => addStayDays(checkIn, 1), [checkIn]);
  const summary = `${keyword || "숙소"} · ${compactDateRange(checkIn, checkOut)}`;

  function handleCheckInChange(nextCheckIn: string) {
    const nextMinCheckOut = addStayDays(nextCheckIn, 1);
    setCheckIn(nextCheckIn);
    setCheckOut((current) => (current > nextCheckIn ? current : nextMinCheckOut));
  }

  function handleCheckOutChange(nextCheckOut: string) {
    setCheckOut(nextCheckOut > checkIn ? nextCheckOut : minCheckOut);
  }

  return (
    <form action="/stays" method="get" className="mt-4 space-y-2.5">
      <div className="flex h-12 items-center gap-2 rounded-[18px] border border-[#eadcd3] bg-white px-3.5 shadow-[0_10px_20px_rgba(92,50,38,0.05)]">
        <SearchIcon className="h-[18px] w-[18px] shrink-0 text-[#a28f88]" />
        <input
          type="search"
          name="keyword"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="오사카, 후쿠오카, 난바처럼 검색해보세요"
          className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#241b17] outline-none placeholder:text-[#b3a39b]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-[#cb4b42] px-3.5 py-1.5 text-[11px] font-black text-white"
        >
          검색
        </button>
      </div>

      <div className="rounded-[18px] bg-white/76 p-3 ring-1 ring-[#efe3db]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[12px] font-black tracking-[-0.02em] text-[#241b17]">
              {summary}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-[#8f776f]">
              성인 {adultCount} · 아동 {childCount} · 객실 {roomCount}
            </p>
          </div>
          <button
            type="submit"
            className="shrink-0 whitespace-nowrap rounded-full bg-[#fff4f0] px-3 py-1.5 text-[11px] font-black text-[#cb4b42] ring-1 ring-[#f1d7cf]"
          >
            숙소 검색
          </button>
        </div>

        <details className="group mt-2">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-[14px] bg-[#fbf2ed] px-3 py-2 text-[11px] font-black text-[#8c746a] [&::-webkit-details-marker]:hidden">
            <span>조건 변경</span>
            <span className="transition group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[10px] font-bold text-[#8f776f]">체크인</span>
              <input
                type="date"
                name="checkIn"
                value={checkIn}
                onChange={(event) => handleCheckInChange(event.target.value)}
                className="h-10 w-full rounded-[14px] border border-[#eadcd3] bg-white px-2.5 text-[12px] font-semibold text-[#241b17] outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-bold text-[#8f776f]">체크아웃</span>
              <input
                type="date"
                name="checkOut"
                min={minCheckOut}
                value={checkOut}
                onChange={(event) => handleCheckOutChange(event.target.value)}
                className="h-10 w-full rounded-[14px] border border-[#eadcd3] bg-white px-2.5 text-[12px] font-semibold text-[#241b17] outline-none"
              />
            </label>
            <div className="col-span-2 grid gap-2">
              <CounterControl
                label="성인"
                name="adultCount"
                value={adultCount}
                min={1}
                max={8}
                onChange={setAdultCount}
              />
              <CounterControl
                label="아동"
                name="childCount"
                value={childCount}
                min={0}
                max={6}
                onChange={setChildCount}
              />
              <CounterControl
                label="객실"
                name="roomCount"
                value={roomCount}
                min={1}
                max={4}
                onChange={setRoomCount}
              />
            </div>
          </div>
        </details>
      </div>

      <input type="hidden" name="adults" value={adultCount} />
      <input type="hidden" name="children" value={childCount} />
      <input type="hidden" name="rooms" value={roomCount} />
      <input type="hidden" name="childCount" value={childCount} />
      <input type="hidden" name="isDomestic" value={String(state.isDomestic)} />
      <input type="hidden" name="hotelPriceMin" value={state.hotelPriceMin ?? ""} />
      <input type="hidden" name="hotelPriceMax" value={state.hotelPriceMax ?? ""} />
      <input type="hidden" name="page" value="0" />
      <input type="hidden" name="size" value={state.size} />

      <div className="flex flex-wrap gap-1.5">
        {quickKeywords.map((quickKeyword) => (
          <Link
            key={quickKeyword}
            href={buildStayResultsHref({
              ...state,
              keyword: quickKeyword,
              checkIn,
              checkOut,
              adultCount,
              childCount,
              roomCount,
              page: 0,
            })}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              quickKeyword === keyword
                ? "bg-[#cb4b42] text-white"
                : "bg-[#f8ede6] text-[#8c746a]"
            }`}
          >
            {quickKeyword}
          </Link>
        ))}
      </div>
    </form>
  );
}
