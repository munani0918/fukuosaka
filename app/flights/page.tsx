import Link from "next/link";
import { connection } from "next/server";

import { Artwork } from "@/src/components/home/Artwork";
import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import { FlightResultsList } from "@/app/flights/FlightResultsList";
import {
  JAPAN_FLIGHT_DESTINATIONS,
  KOREA_DIRECT_FLIGHT_AIRPORTS,
  buildFlightResultsHref,
  coerceFlightSearchState,
  getAirportLabel,
  getAvailableFlightOrigins,
  getDestinationLabel,
  isDirectFlightRoute,
  type FlightSearchState,
} from "@/src/lib/flights";

function bottomTabs() {
  return [
    { id: "home", label: "홈", href: "/", icon: "home" as const },
    { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" as const },
    { id: "stay", label: "숙소", href: "/stays", icon: "stay" as const },
    { id: "tour", label: "투어", href: "/tours", icon: "tour" as const },
    { id: "my", label: "마이", href: "#top", icon: "my" as const },
  ];
}

function flightArt(destination: FlightSearchState["destination"]) {
  return destination === "FUK" ? "flight-fukuoka" : "flight-osaka";
}

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const resolvedSearchParams = await searchParams;
  const state = coerceFlightSearchState(resolvedSearchParams);
  const availableOrigins = getAvailableFlightOrigins(state.destination);
  const isSelectedRouteValid = isDirectFlightRoute(state.origin, state.destination);

  return (
    <main
      id="top"
      className="min-h-dvh bg-[linear-gradient(180deg,#fff8f3_0%,#fcf2eb_48%,#f6ede6_100%)] text-[#241b17]"
    >
      <div className="mx-auto min-h-dvh max-w-[430px] pb-[calc(env(safe-area-inset-bottom)+92px)]">
        <header className="sticky top-0 z-30 border-b border-[#f0e4dd] bg-[#fffaf6]/95 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+14px)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#7f6f69] shadow-[0_8px_18px_rgba(78,42,29,0.07)] ring-1 ring-[#efe3db]"
              aria-label="홈으로 돌아가기"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[-0.02em] text-[#a58f86]">
                FUKUOSAKA FLIGHTS
              </p>
              <h1 className="text-[21px] font-black tracking-[-0.05em] text-[#241b17]">
                항공권 검색
              </h1>
            </div>
          </div>

          <form action="/flights" method="get" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
                <span className="text-[10px] font-bold text-[#a08d85]">출발지</span>
                <select
                  name="origin"
                  defaultValue={state.origin}
                  className="mt-1 block w-full bg-transparent text-[12px] font-black text-[#2d211d] outline-none"
                >
                  <option value="ALL">전체 직항 공항</option>
                  {KOREA_DIRECT_FLIGHT_AIRPORTS.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.city}({airport.code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
                <span className="text-[10px] font-bold text-[#a08d85]">도착지</span>
                <select
                  name="destination"
                  defaultValue={state.destination}
                  className="mt-1 block w-full bg-transparent text-[12px] font-black text-[#2d211d] outline-none"
                >
                  {JAPAN_FLIGHT_DESTINATIONS.map((destination) => (
                    <option key={destination.code} value={destination.code}>
                      {destination.city}({destination.code})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <label className="rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
                <span className="text-[10px] font-bold text-[#a08d85]">여정</span>
                <select
                  name="tripType"
                  defaultValue={state.tripType}
                  className="mt-1 block w-full bg-transparent text-[12px] font-black text-[#2d211d] outline-none"
                >
                  <option value="RT">왕복</option>
                  <option value="OW">편도</option>
                </select>
              </label>

              <label className="rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
                <span className="text-[10px] font-bold text-[#a08d85]">출발일</span>
                <input
                  type="date"
                  name="departDate"
                  defaultValue={state.departDate}
                  className="mt-1 block w-full bg-transparent text-[11px] font-black text-[#2d211d] outline-none"
                />
              </label>

              <label className="rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
                <span className="text-[10px] font-bold text-[#a08d85]">복귀일</span>
                <input
                  type="date"
                  name="returnDate"
                  defaultValue={state.returnDate}
                  className="mt-1 block w-full bg-transparent text-[11px] font-black text-[#2d211d] outline-none"
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="min-w-0 flex-1 rounded-[16px] border border-[#eadcd3] bg-white px-3 py-2.5">
                <span className="text-[10px] font-bold text-[#a08d85]">성인</span>
                <select
                  name="adult"
                  defaultValue={state.adult}
                  className="mt-1 block w-full bg-transparent text-[12px] font-black text-[#2d211d] outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((count) => (
                    <option key={count} value={count}>
                      {count}명
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="h-[54px] shrink-0 rounded-[18px] bg-[#cb4b42] px-5 text-[13px] font-black text-white shadow-[0_10px_18px_rgba(203,75,66,0.18)]"
              >
                항공 검색
              </button>
            </div>
          </form>
        </header>

        <section className="px-5 pb-4 pt-4">
          <div className="overflow-hidden rounded-[26px] bg-white shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]">
            <div className="relative h-[148px] bg-[#f5e8df]">
              <Artwork variant={flightArt(state.destination)} className="h-full w-full" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,14,11,0.02)_0%,rgba(26,14,11,0.34)_100%)]" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-black text-[#cb4b42]">
                  대한민국 출발 직항 기준
                </span>
                <h2 className="mt-2 text-[23px] font-black tracking-[-0.05em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.16)]">
                  {getAirportLabel(state.origin)} → {getDestinationLabel(state.destination)}
                </h2>
              </div>
            </div>

            <div className="p-4">
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[#fff4f0] px-3 py-1.5 text-[11px] font-black text-[#cb4b42]">
                  {state.tripType === "RT" ? "왕복" : "편도"}
                </span>
                <span className="rounded-full bg-[#f8ede6] px-3 py-1.5 text-[11px] font-bold text-[#806b62]">
                  출발 {state.departDate}
                </span>
                {state.tripType === "RT" ? (
                  <span className="rounded-full bg-[#f8ede6] px-3 py-1.5 text-[11px] font-bold text-[#806b62]">
                    복귀 {state.returnDate}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-[12px] leading-5 text-[#7d6f69]">
                노선은 오사카·후쿠오카 직항 운항 이력이 있는 국내 공항 기준으로 구성했어요.
                항공편 운항 여부와 가격은 항공사/시즌에 따라 달라질 수 있어 최종 화면에서 다시 확인해주세요.
              </p>
            </div>
          </div>

          {!isSelectedRouteValid ? (
            <div className="mt-3 rounded-[20px] bg-[#fff8f3] p-4 text-[12px] leading-6 text-[#7d6f69] ring-1 ring-[#efdcd3]">
              선택한 출발지는 현재 {getDestinationLabel(state.destination)} 직항 후보에 없어서,
              가능한 직항 출발 공항을 대신 보여드려요.
            </div>
          ) : null}
        </section>

        <FlightResultsList state={state} />

        <section className="px-5 pt-5">
          <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#f1e6df]">
            <p className="text-[12px] font-black tracking-[-0.03em] text-[#2a1e19]">
              직항 출발 공항
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {availableOrigins.map((airport) => (
                <Link
                  key={airport.code}
                  href={buildFlightResultsHref({ ...state, origin: airport.code })}
                  className="rounded-full bg-[#f8ede6] px-3 py-1.5 text-[11px] font-bold text-[#806b62]"
                >
                  {airport.city}({airport.code})
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <BottomTabBar items={bottomTabs()} />
    </main>
  );
}
