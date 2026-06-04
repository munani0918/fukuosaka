"use client";

import { useMemo, useState, type FormEvent } from "react";

import {
  buildFlightResultsHref,
  getAvailableFlightOrigins,
  getDefaultFlightSearchState,
  getMinimumFlightReturnDate,
  JAPAN_FLIGHT_DESTINATIONS,
  normalizeFlightSearchState,
  type FlightAirportCode,
  type FlightDestinationCode,
  type FlightTripType,
} from "@/src/lib/flights";
import { PlaneIcon } from "@/src/components/home/icons";

export function FlightSearchSection() {
  const [search, setSearch] = useState(() => getDefaultFlightSearchState());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const origins = useMemo(
    () => getAvailableFlightOrigins(search.destination),
    [search.destination],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      window.location.assign(buildFlightResultsHref(normalizeFlightSearchState(search)));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="px-5">
      <div className="overflow-hidden rounded-[26px] border border-[#f2e5de] bg-[linear-gradient(180deg,#fffdfa_0%,#fff6f0_100%)] px-4 py-4 shadow-[0_12px_26px_rgba(110,66,52,0.06)]">
        <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[#f6ddd5] bg-white px-3.5 text-[#ef625d] shadow-[0_6px_14px_rgba(98,45,33,0.04)]">
          <PlaneIcon className="h-4 w-4" />
          <span className="text-[14px] font-bold tracking-[-0.03em]">
            실시간 항공권 최저가
          </span>
        </div>

        <p className="mt-3 text-[13px] font-medium leading-5 text-[#8b746d]">
          오사카와 후쿠오카 직항 항공권을 바로 검색해보세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <label className="rounded-[18px] border border-[#f1e3db] bg-white px-3.5 py-2.5 shadow-[0_6px_14px_rgba(111,66,51,0.03)]">
              <p className="text-[12px] font-semibold text-[#9a837b]">출발지</p>
              <select
                value={search.origin}
                onChange={(event) =>
                  setSearch((current) => ({
                    ...current,
                    origin: event.target.value as FlightAirportCode,
                  }))
                }
                className="mt-1 block w-full bg-transparent text-[15px] font-bold text-[#2f2420] outline-none"
              >
                {origins.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.city}({airport.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="rounded-[18px] border border-[#f1e3db] bg-white px-3.5 py-2.5 shadow-[0_6px_14px_rgba(111,66,51,0.03)]">
              <p className="text-[12px] font-semibold text-[#9a837b]">도착지</p>
              <select
                value={search.destination}
                onChange={(event) => {
                  const destination = event.target
                    .value as FlightDestinationCode;
                  const nextOrigins = getAvailableFlightOrigins(destination);
                  const nextOrigin = nextOrigins.some(
                    (airport) => airport.code === search.origin,
                  )
                    ? search.origin
                    : nextOrigins[0]?.code ?? "ICN";

                  setSearch((current) => ({
                    ...current,
                    destination,
                    origin: nextOrigin,
                  }));
                }}
                className="flight-date-input mt-1 block w-full min-w-0 bg-transparent text-[15px] font-bold text-[#2f2420] outline-none"
              >
                {JAPAN_FLIGHT_DESTINATIONS.map((destination) => (
                  <option key={destination.code} value={destination.code}>
                    {destination.city}({destination.code})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-3">
            <label className="rounded-[18px] border border-[#f1e3db] bg-white px-3.5 py-2.5 shadow-[0_6px_14px_rgba(111,66,51,0.03)]">
              <p className="text-[12px] font-semibold text-[#9a837b]">여정</p>
              <select
                value={search.tripType}
                onChange={(event) =>
                  setSearch((current) =>
                    normalizeFlightSearchState({
                      ...current,
                      tripType: event.target.value as FlightTripType,
                    }),
                  )
                }
                className="mt-1 block w-full bg-transparent text-[15px] font-bold text-[#2f2420] outline-none"
              >
                <option value="RT">왕복</option>
                <option value="OW">편도</option>
              </select>
            </label>

            <label className="rounded-[18px] border border-[#f1e3db] bg-white px-3.5 py-2.5 shadow-[0_6px_14px_rgba(111,66,51,0.03)]">
              <p className="text-[12px] font-semibold text-[#9a837b]">성인</p>
              <select
                value={search.adult}
                onChange={(event) =>
                  setSearch((current) => ({
                    ...current,
                    adult: Number.parseInt(event.target.value, 10),
                  }))
                }
                className="mt-1 block w-full bg-transparent text-[15px] font-bold text-[#2f2420] outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count}명
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="rounded-[18px] border border-[#f1e3db] bg-white px-3.5 py-2.5 shadow-[0_6px_14px_rgba(111,66,51,0.03)]">
              <p className="text-[12px] font-semibold text-[#9a837b]">출발일</p>
              <input
                type="date"
                value={search.departDate}
                onChange={(event) => {
                  const departDate = event.target.value;
                  setSearch((current) =>
                    normalizeFlightSearchState({
                      ...current,
                      departDate,
                    }),
                  );
                }}
                className="mt-1 block w-full bg-transparent text-[15px] font-bold text-[#2f2420] outline-none"
              />
            </label>

            <label className="rounded-[18px] border border-[#f1e3db] bg-white px-3.5 py-2.5 shadow-[0_6px_14px_rgba(111,66,51,0.03)]">
              <p className="text-[12px] font-semibold text-[#9a837b]">복귀일</p>
              <input
                type="date"
                min={getMinimumFlightReturnDate(search.departDate)}
                value={search.returnDate}
                disabled={search.tripType === "OW"}
                onChange={(event) => {
                  const returnDate = event.target.value;
                  setSearch((current) =>
                    normalizeFlightSearchState({
                      ...current,
                      returnDate,
                    }),
                  );
                }}
                className="flight-date-input mt-1 block w-full min-w-0 bg-transparent text-[15px] font-bold text-[#2f2420] outline-none disabled:text-[#c1aea6]"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-[50px] w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#ff6f65_0%,#f4514f_100%)] text-[15px] font-black text-white shadow-[0_12px_22px_rgba(244,89,85,0.22)] transition active:scale-[0.99] disabled:opacity-70"
          >
            {isSubmitting ? "찾는 중" : "항공권 최저가 보기"}
          </button>
        </form>
      </div>
    </section>
  );
}
