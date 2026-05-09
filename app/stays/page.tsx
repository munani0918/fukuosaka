import Link from "next/link";
import { connection } from "next/server";

import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import { SearchIcon } from "@/src/components/home/icons";
import {
  hydrateAccommodationImages,
  searchAccommodationsSmart,
} from "@/src/lib/myrealtrip";
import {
  buildStayResultsHref,
  coerceStaySearchState,
} from "@/src/lib/stays";
import { StayResultsClient } from "./StayResultsClient";

function bottomTabs() {
  return [
    { id: "home", label: "홈", href: "/", icon: "home" as const },
    { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" as const },
    { id: "stay", label: "숙소", href: "/stays", icon: "stay" as const, active: true },
    { id: "tour", label: "투어", href: "/tours", icon: "tour" as const },
    { id: "my", label: "마이", href: "#top", icon: "my" as const },
  ];
}

export default async function StaysPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const resolvedSearchParams = await searchParams;
  const state = coerceStaySearchState(resolvedSearchParams);
  const searchState = {
    ...state,
    hotelPriceMin: null,
    hotelPriceMax: null,
    size: Math.max(state.size, 48),
  };
  const result = await searchAccommodationsSmart(searchState);
  const stays = result.ok
    ? await hydrateAccommodationImages(result.items, searchState, 24)
    : [];
  const totalCount = result.ok ? result.totalCount : 0;

  const quickKeywords = ["오사카", "후쿠오카", "난바", "하카타"];

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
                FUKUOSAKA STAYS
              </p>
              <h1 className="text-[21px] font-black tracking-[-0.05em] text-[#241b17]">
                숙소 검색
              </h1>
            </div>
          </div>

          <form action="/stays" method="get" className="mt-4 space-y-3">
            <div className="flex h-12 items-center gap-2 rounded-[18px] border border-[#eadcd3] bg-white px-3.5 shadow-[0_10px_20px_rgba(92,50,38,0.05)]">
              <SearchIcon className="h-[18px] w-[18px] shrink-0 text-[#a28f88]" />
              <input
                type="search"
                name="keyword"
                defaultValue={state.keyword}
                placeholder="오사카, 후쿠오카, 난바처럼 지역으로 검색해보세요"
                className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#241b17] outline-none placeholder:text-[#b3a39b]"
              />
              <input type="hidden" name="checkIn" value={state.checkIn} />
              <input type="hidden" name="checkOut" value={state.checkOut} />
              <input type="hidden" name="adultCount" value={state.adultCount} />
              <input type="hidden" name="childCount" value={state.childCount} />
              <input type="hidden" name="isDomestic" value={String(state.isDomestic)} />
              <input
                type="hidden"
                name="hotelPriceMin"
                value={state.hotelPriceMin ?? ""}
              />
              <input
                type="hidden"
                name="hotelPriceMax"
                value={state.hotelPriceMax ?? ""}
              />
              <input type="hidden" name="page" value="0" />
              <input type="hidden" name="size" value={state.size} />
              <button
                type="submit"
                className="rounded-full bg-[#cb4b42] px-3.5 py-1.5 text-[11px] font-black text-white"
              >
                검색
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {quickKeywords.map((keyword) => (
                <Link
                  key={keyword}
                  href={buildStayResultsHref({
                    ...state,
                    keyword,
                    page: 0,
                  })}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                    keyword === state.keyword
                      ? "bg-[#cb4b42] text-white"
                      : "bg-[#f8ede6] text-[#8c746a]"
                  }`}
                >
                  {keyword}
                </Link>
              ))}
            </div>
          </form>
        </header>

        <StayResultsClient
          state={state}
          stays={stays}
          resultOk={result.ok}
          totalCount={totalCount}
        />
      </div>

      <BottomTabBar items={bottomTabs()} />
    </main>
  );
}
