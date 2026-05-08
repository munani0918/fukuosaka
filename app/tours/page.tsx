import Link from "next/link";
import { connection } from "next/server";

import { Artwork } from "@/src/components/home/Artwork";
import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import { SearchIcon, StarIcon } from "@/src/components/home/icons";
import {
  searchTnaCategoriesViaApi,
  searchTnaProductsViaApi,
} from "@/src/lib/myrealtrip";
import {
  buildTourDetailHref,
  buildTourResultsHref,
  coerceTourSearchState,
  formatTourPriceLabel,
} from "@/src/lib/tours";

function bottomTabs() {
  return [
    { id: "home", label: "홈", href: "/", icon: "home" as const },
    { id: "planner", label: "AI 플래너", href: "/planner-wizard.html", icon: "planner" as const },
    { id: "stay", label: "숙소", href: "/stays", icon: "stay" as const },
    { id: "tour", label: "투어", href: "/tours", icon: "tour" as const, active: true },
    { id: "my", label: "마이", href: "#top", icon: "my" as const },
  ];
}

function cityLabel(city: string) {
  return city.includes("후쿠오카") ? "후쿠오카" : "오사카";
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const resolvedSearchParams = await searchParams;
  const state = coerceTourSearchState(resolvedSearchParams);
  const [result, categoryResult] = await Promise.all([
    searchTnaProductsViaApi(state),
    searchTnaCategoriesViaApi({ city: state.city }),
  ]);

  const tours = result.ok ? result.data.items : [];
  const totalCount = result.ok ? result.data.totalCount : 0;
  const categories = categoryResult.ok ? categoryResult.data.categories : [];
  const quickKeywords = ["오사카", "라피트", "유니버설", "후쿠오카", "패스"];
  const categoryChips = [
    { name: "전체", value: "all" },
    ...categories.filter((category) => category.value !== "all").slice(0, 8),
  ];

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
                FUKUOSAKA TOURS
              </p>
              <h1 className="text-[21px] font-black tracking-[-0.05em] text-[#241b17]">
                투어&티켓 검색
              </h1>
            </div>
          </div>

          <form action="/tours" method="get" className="mt-4 space-y-3">
            <div className="flex h-12 items-center gap-2 rounded-[18px] border border-[#eadcd3] bg-white px-3.5 shadow-[0_10px_20px_rgba(92,50,38,0.05)]">
              <SearchIcon className="h-[18px] w-[18px] shrink-0 text-[#a28f88]" />
              <input
                type="search"
                name="keyword"
                defaultValue={state.keyword}
                placeholder="라피트, 유니버설, 시티투어처럼 검색해보세요"
                className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#241b17] outline-none placeholder:text-[#b3a39b]"
              />
              <input type="hidden" name="category" value={state.category} />
              <input type="hidden" name="sort" value={state.sort} />
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="perPage" value={state.perPage} />
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
                  href={buildTourResultsHref({
                    ...state,
                    keyword,
                    city: keyword.includes("후쿠오카") ? "후쿠오카" : state.city,
                    page: 1,
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

        <section className="px-5 pb-4 pt-4">
          <div className="rounded-[24px] bg-white/88 p-4 shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-[#a58f86]">
                  {cityLabel(state.city)} · {state.category === "all" ? "전체 카테고리" : "선택 카테고리"}
                </p>
                <h2 className="mt-1 text-[24px] font-black tracking-[-0.05em] text-[#251b17]">
                  {state.keyword}
                </h2>
                <p className="mt-1 text-[13px] font-medium text-[#7d6f69]">
                  {result.ok
                    ? `${totalCount.toLocaleString("ko-KR")}개 상품 중 상위 결과를 보여드려요`
                    : "지금은 투어&티켓 결과를 불러오지 못했어요"}
                </p>
              </div>
              <span className="rounded-full bg-[#fbf2ed] px-3 py-1.5 text-[11px] font-black text-[#cb4b42]">
                날짜 없이 먼저 보기
              </span>
            </div>
          </div>

          {categoryChips.length > 1 ? (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {categoryChips.map((category) => (
                <Link
                  key={category.value}
                  href={buildTourResultsHref({
                    ...state,
                    category: category.value,
                    page: 1,
                  })}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-black ${
                    category.value === state.category
                      ? "bg-[#cb4b42] text-white"
                      : "bg-white text-[#8c746a] ring-1 ring-[#efe3db]"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-3 px-5">
          {tours.length > 0 ? (
            tours.map((tour) => (
              <Link
                key={tour.gid}
                href={buildTourDetailHref(tour, state)}
                className="flex overflow-hidden rounded-[24px] bg-white shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]"
              >
                <div className="relative h-[148px] w-[126px] shrink-0 overflow-hidden bg-[#f5e8df]">
                  {tour.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tour.imageUrl}
                      alt={tour.itemName}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Artwork
                      variant={state.city.includes("후쿠오카") ? "tour-fukuoka" : "tour-osaka"}
                      className="h-full w-full"
                    />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(50,26,18,0.12)_100%)]" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#b48577]">
                        {tour.category || "투어&티켓"}
                      </p>
                      <h3 className="mt-1 text-[16px] font-black leading-[1.35] tracking-[-0.04em] text-[#221a17] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                        {tour.itemName}
                      </h3>
                    </div>
                    <svg className="mt-1 h-4 w-4 shrink-0 text-[#b19c94]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M7.5 4.5 13 10l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#7a6862]">
                    <StarIcon className="h-3.5 w-3.5 text-[#ffb627]" />
                    <span className="text-[#d45c3b]">
                      {tour.reviewScore ? tour.reviewScore.toFixed(1).replace(/\.0$/, "") : "-"}
                    </span>
                    <span>리뷰 {tour.reviewCount?.toLocaleString("ko-KR") ?? 0}개</span>
                  </div>

                  <p className="mt-2 text-[11px] font-medium leading-5 text-[#88766e] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                    {tour.description || `${cityLabel(state.city)}에서 바로 예약 가능한 상품이에요.`}
                  </p>

                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#f3e7df] pt-3">
                    <div>
                      <p className="text-[11px] font-medium text-[#8d7c74]">
                        마이리얼트립 실시간 상품
                      </p>
                      <p className="mt-1 whitespace-nowrap text-[18px] font-black tracking-[-0.04em] text-[#201b19]">
                        {formatTourPriceLabel(tour.priceDisplay, tour.salePrice)}
                      </p>
                    </div>
                    <span className="inline-flex h-8 items-center rounded-full bg-[#fff4f0] px-3.5 text-[11px] font-black text-[#cb4b42] ring-1 ring-[#f1d7cf]">
                      상세 보기
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-[24px] bg-white p-5 text-center shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]">
              <p className="text-[17px] font-black tracking-[-0.04em] text-[#271d18]">
                아직 보여드릴 투어&티켓이 없어요
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#7f6f69]">
                라피트 · 유니버설 · 패스처럼 더 구체적인 상품명으로 다시 찾아보세요.
              </p>
            </div>
          )}
        </section>
      </div>

      <BottomTabBar items={bottomTabs()} />
    </main>
  );
}
