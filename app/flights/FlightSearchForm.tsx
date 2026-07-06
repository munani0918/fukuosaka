"use client";

import { useMemo, useState, type FormEvent } from "react";

import {
  buildFlightResultsHref,
  getAvailableFlightOrigins,
  getMinimumFlightReturnDate,
  JAPAN_FLIGHT_DESTINATIONS,
  normalizeFlightSearchState,
  type FlightAirportCode,
  type FlightDestinationCode,
  type FlightSearchState,
  type FlightTripType,
} from "@/src/lib/flights";

type FlightSearchFormProps = {
  state: FlightSearchState;
};

export function FlightSearchForm({ state }: FlightSearchFormProps) {
  const [search, setSearch] = useState(() => normalizeFlightSearchState(state));
  const availableOrigins = useMemo(
    () => getAvailableFlightOrigins(search.destination),
    [search.destination],
  );
  const minReturnDate = getMinimumFlightReturnDate(search.departDate);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.assign(buildFlightResultsHref(normalizeFlightSearchState(search)));
  }

  return (
    <form onSubmit={submitSearch} className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="min-w-0 rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
          <span className="text-[10px] font-bold text-[#a08d85]">출발지</span>
          <select
            name="origin"
            value={search.origin}
            onChange={(event) =>
              setSearch((current) => ({
                ...current,
                origin: event.target.value as FlightAirportCode,
              }))
            }
            className="mt-1 block w-full min-w-0 bg-transparent text-[12px] font-black text-[#2d211d] outline-none"
          >
            <option value="ALL">전체 직항 공항</option>
            {availableOrigins.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.city}({airport.code})
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0 rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
          <span className="text-[10px] font-bold text-[#a08d85]">도착지</span>
          <select
            name="destination"
            value={search.destination}
            onChange={(event) => {
              const destination = event.target.value as FlightDestinationCode;
              const nextOrigins = getAvailableFlightOrigins(destination);
              const nextOrigin =
                search.origin === "ALL" || nextOrigins.some((airport) => airport.code === search.origin)
                  ? search.origin
                  : nextOrigins[0]?.code ?? "ICN";

              setSearch((current) => ({
                ...current,
                destination,
                origin: nextOrigin,
              }));
            }}
            className="mt-1 block w-full min-w-0 bg-transparent text-[12px] font-black text-[#2d211d] outline-none"
          >
            {JAPAN_FLIGHT_DESTINATIONS.map((destination) => (
              <option key={destination.code} value={destination.code}>
                {destination.city}({destination.code})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="min-w-0 rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
          <span className="text-[10px] font-bold text-[#a08d85]">여정</span>
          <select
            name="tripType"
            value={search.tripType}
            onChange={(event) => {
              const tripType = event.target.value as FlightTripType;
              setSearch((current) =>
                normalizeFlightSearchState({
                  ...current,
                  tripType,
                }),
              );
            }}
            className="mt-1 block w-full min-w-0 bg-transparent text-[12px] font-black text-[#2d211d] outline-none"
          >
            <option value="RT">왕복</option>
            <option value="OW">편도</option>
          </select>
        </label>

        <label className="min-w-0 rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
          <span className="text-[10px] font-bold text-[#a08d85]">성인</span>
          <select
            name="adult"
            value={search.adult}
            onChange={(event) =>
              setSearch((current) => ({
                ...current,
                adult: Number.parseInt(event.target.value, 10),
              }))
            }
            className="mt-1 block w-full min-w-0 bg-transparent text-[12px] font-black text-[#2d211d] outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>
                {count}명
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="min-w-0 rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
          <span className="text-[10px] font-bold text-[#a08d85]">출발일</span>
          <input
            type="date"
            name="departDate"
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
            className="flight-date-input mt-1 block w-full min-w-0 bg-transparent text-[12px] font-black text-[#2d211d] outline-none"
          />
        </label>

        <label className="min-w-0 rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
          <span className="text-[10px] font-bold text-[#a08d85]">복귀일</span>
          <input
            type="date"
            name="returnDate"
            min={minReturnDate}
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
            className="flight-date-input mt-1 block w-full min-w-0 bg-transparent text-[12px] font-black text-[#2d211d] outline-none disabled:text-[#c1aea6]"
          />
        </label>
      </div>

      <button
        type="submit"
        className="h-[54px] w-full rounded-[18px] bg-[#cb4b42] px-5 text-[13px] font-black text-white shadow-[0_10px_18px_rgba(203,75,66,0.18)]"
      >
        항공 검색
      </button>
    </form>
  );
}
