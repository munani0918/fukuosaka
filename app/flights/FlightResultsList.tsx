"use client";

import { useEffect, useMemo, useState } from "react";

import { PlaneIcon } from "@/src/components/home/icons";
import {
  buildMyRealTripFlightListRedirectHref,
  getAirportLabel,
  getAvailableFlightOrigins,
  getDestinationLabel,
  type FlightSearchState,
} from "@/src/lib/flights";

type FlightLeg = {
  date: string;
  departTime: string;
  arriveTime: string;
  duration: number;
  origin: string;
  destination: string;
};

type FlightItem = {
  airline: string;
  airlineCode: string;
  logoUrl: string;
  isDirect: boolean;
  isCheapest: boolean;
  price: number;
  reservationUrl: string;
  outbound: FlightLeg;
  inbound: FlightLeg | null;
};

type FlightResultsListProps = {
  state: FlightSearchState;
};

function formatDuration(minutes: number) {
  if (!minutes) return "시간 확인";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}분`;
  return rest ? `${hours}시간 ${rest}분` : `${hours}시간`;
}

function formatPrice(price: number) {
  if (!price || price <= 0) return "요금 확인";
  return `${price.toLocaleString("ko-KR")}원`;
}

function reservationAdultCount(url: string) {
  const decoded = decodeURIComponent(url);
  const tripbean = decoded.match(/tripbean=([^&]+)/)?.[1] ?? decoded;
  const match = tripbean.match(/\^(\d+)\^0\^0\^Y/);
  const parsed = Number.parseInt(match?.[1] ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function displayPrice(flight: FlightItem, adult: number) {
  const currentAdultCount = reservationAdultCount(flight.reservationUrl);
  if (currentAdultCount === adult) return flight.price;
  if (currentAdultCount > 0) {
    return Math.round((flight.price / currentAdultCount) * adult);
  }

  return flight.price;
}

function bookingUrl(flight: FlightItem, state: FlightSearchState) {
  return buildMyRealTripFlightListRedirectHref({
    origin: (flight.outbound.origin ||
      (state.origin === "ALL" ? "ICN" : state.origin)) as FlightSearchState["origin"],
    destination: state.destination,
    tripType: state.tripType,
    departDate: state.departDate,
    adult: state.adult,
    returnDate: state.returnDate,
  });
}

function routeOrigins(state: FlightSearchState) {
  if (state.origin !== "ALL") return [state.origin];
  return getAvailableFlightOrigins(state.destination).map((airport) => airport.code);
}

function flightKey(flight: FlightItem, index: number) {
  return [
    flight.airlineCode,
    flight.price,
    flight.outbound.departTime,
    flight.inbound?.departTime ?? "",
    index,
  ].join("-");
}

function airlineInitial(name: string) {
  return name.trim().charAt(0) || "항";
}

export function FlightResultsList({ state }: FlightResultsListProps) {
  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const origins = useMemo(() => routeOrigins(state), [state]);
  const tripLabel = state.tripType === "RT" ? "왕복" : "편도";

  useEffect(() => {
    let cancelled = false;

    async function loadFlights() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const responses = await Promise.all(
          origins.map(async (origin) => {
            const params = new URLSearchParams({
              type: "flights",
              origin,
              destination: state.destination,
              tripType: state.tripType,
              departDate: state.departDate,
              adult: String(state.adult),
            });

            if (state.tripType === "RT") {
              params.set("returnDate", state.returnDate);
            }

            const response = await fetch(`/api/search?${params.toString()}`, {
              cache: "no-store",
            });
            const data = (await response.json().catch(() => null)) as
              | { flights?: FlightItem[]; error?: string }
              | null;

            if (!response.ok) {
              throw new Error(data?.error || "항공권 검색에 실패했어요.");
            }

            return (data?.flights ?? []).map((flight) => ({
              ...flight,
              outbound: {
                ...flight.outbound,
                origin: flight.outbound.origin || origin,
                destination: flight.outbound.destination || state.destination,
              },
            }));
          }),
        );

        const merged = responses
          .flat()
          .filter((flight) => flight.price > 0)
          .sort((a, b) => {
            const aPrice = displayPrice(a, state.adult);
            const bPrice = displayPrice(b, state.adult);
            if (aPrice !== bPrice) return aPrice - bPrice;
            return a.outbound.departTime.localeCompare(b.outbound.departTime);
          })
          .slice(0, 30)
          .map((flight, index) => ({ ...flight, isCheapest: index === 0 }));

        if (!cancelled) {
          setFlights(merged);
        }
      } catch (error) {
        if (!cancelled) {
          setFlights([]);
          setErrorMessage(error instanceof Error ? error.message : "항공권 검색에 실패했어요.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadFlights();

    return () => {
      cancelled = true;
    };
  }, [origins, state.adult, state.departDate, state.destination, state.returnDate, state.tripType]);

  if (isLoading) {
    return (
      <section className="px-5">
        <div className="rounded-[24px] bg-white p-6 text-center shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff2ee] text-[#cb4b42]">
            <PlaneIcon className="h-6 w-6" />
          </div>
          <p className="mt-4 text-[16px] font-black tracking-[-0.04em] text-[#241b17]">
            항공권 검색 중...
          </p>
          <p className="mt-2 text-[12px] text-[#7d6f69]">
            {getAirportLabel(state.origin)}에서 {getDestinationLabel(state.destination)}까지 최저가순으로 정렬하고 있어요.
          </p>
        </div>
      </section>
    );
  }

  if (errorMessage || flights.length === 0) {
    return (
      <section className="px-5">
        <div className="rounded-[24px] bg-white p-5 text-center shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]">
          <p className="text-[17px] font-black tracking-[-0.04em] text-[#271d18]">
            검색된 항공편이 없어요
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[#7f6f69]">
            {errorMessage || "날짜나 출발 공항을 바꿔 다시 검색해보세요."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 px-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold text-[#a58f86]">
            성인 {state.adult}명 · {tripLabel} 총액 기준
          </p>
          <h2 className="mt-1 text-[21px] font-black tracking-[-0.05em] text-[#241b17]">
            검색 결과 {flights.length}개
          </h2>
        </div>
        <span className="rounded-full bg-[#fff2ee] px-3 py-1.5 text-[11px] font-black text-[#cb4b42]">
          최저가순
        </span>
      </div>

      {flights.map((flight, index) => (
        <a
          key={flightKey(flight, index)}
          href={bookingUrl(flight, state)}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-[24px] bg-white shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]"
        >
          {flight.isCheapest ? (
            <div className="bg-[#ff5a2f] px-4 py-2 text-[11px] font-black text-white">
              최저가 항공편
            </div>
          ) : null}

          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#fff2ee] text-[13px] font-black text-[#cb4b42] ring-1 ring-[#f0ded6]">
                {flight.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={flight.logoUrl}
                    alt={flight.airline}
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  airlineInitial(flight.airline)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-black tracking-[-0.04em] text-[#241b17]">
                      {flight.airline || "항공사 확인"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-[#eef8ff] px-2.5 py-1 text-[10px] font-black text-[#1571c2]">
                        {flight.isDirect ? "직항" : "경유 포함"}
                      </span>
                      <span className="rounded-full bg-[#f8ede6] px-2.5 py-1 text-[10px] font-bold text-[#806b62]">
                        {tripLabel}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10.5px] font-bold text-[#9f8c84]">
                      성인 {state.adult}명
                    </p>
                    <p className="mt-1 text-[18px] font-black tracking-[-0.05em] text-[#cb4b42]">
                      {formatPrice(displayPrice(flight, state.adult))}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5 rounded-[18px] bg-[#fcf6f2] p-3">
                  <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2">
                    <div>
                      <p className="text-[15px] font-black text-[#241b17]">
                        {flight.outbound.departTime}
                      </p>
                      <p className="text-[10px] font-bold text-[#8d7c74]">
                        {flight.outbound.origin}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="h-px bg-[#d8c9c0]" />
                      <p className="mt-1 text-[10px] font-semibold text-[#9b8a82]">
                        {formatDuration(flight.outbound.duration)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-black text-[#241b17]">
                        {flight.outbound.arriveTime}
                      </p>
                      <p className="text-[10px] font-bold text-[#8d7c74]">
                        {flight.outbound.destination}
                      </p>
                    </div>
                  </div>

                  {flight.inbound ? (
                    <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2 border-t border-[#f0e4dc] pt-2.5">
                      <div>
                        <p className="text-[15px] font-black text-[#241b17]">
                          {flight.inbound.departTime}
                        </p>
                        <p className="text-[10px] font-bold text-[#8d7c74]">
                          {flight.inbound.origin}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="h-px bg-[#d8c9c0]" />
                        <p className="mt-1 text-[10px] font-semibold text-[#9b8a82]">
                          {formatDuration(flight.inbound.duration)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-black text-[#241b17]">
                          {flight.inbound.arriveTime}
                        </p>
                        <p className="text-[10px] font-bold text-[#8d7c74]">
                          {flight.inbound.destination}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[10.5px] font-semibold text-[#8d7c74]">
                    운임규정 · 상세 정보는 예약 페이지에서 확인
                  </p>
                  <span className="inline-flex h-8 shrink-0 items-center rounded-full bg-[#cb4b42] px-3.5 text-[11px] font-black text-white">
                    예약하기
                  </span>
                </div>
              </div>
            </div>
          </div>
        </a>
      ))}
    </section>
  );
}
