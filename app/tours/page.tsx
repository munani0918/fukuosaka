import Link from "next/link";
import { connection } from "next/server";

import { SavedItemStarButton } from "@/src/components/SavedItemStarButton";
import { Artwork } from "@/src/components/home/Artwork";
import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import { SearchIcon, StarIcon } from "@/src/components/home/icons";
import {
  type TnaSearchItem,
  searchTnaCategoriesViaApi,
  searchTnaProductsViaApi,
} from "@/src/lib/myrealtrip";
import {
  buildTourDetailHref,
  buildTourRegionFallbackSearches,
  buildTourResultsHref,
  coerceTourSearchState,
  formatTourPriceLabel,
} from "@/src/lib/tours";
import { inferSavedTourItemType } from "@/src/lib/savedItems";
import type { SavedItem } from "@/src/types/savedTrip";
import { ReturnLink } from "../stays/ReturnLink";

function bottomTabs() {
  return [
    { id: "home", label: "홈", href: "/", icon: "home" as const },
    { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" as const },
    { id: "stay", label: "숙소", href: "/stays", icon: "stay" as const },
    { id: "tour", label: "투어·티켓", href: "/tours", icon: "tour" as const, active: true },
    { id: "my", label: "MY", href: "/mypage", icon: "my" as const },
  ];
}

function pickSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeRelativeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (/^https?:\/\//i.test(value)) return null;
  return value;
}

function tourCityCode(city: string) {
  return city.includes("후쿠오카") ? "FUK" : "KIX";
}

function tourSavedItemPayload(
  tour: TnaSearchItem,
  state: ReturnType<typeof coerceTourSearchState>,
  detailPath: string,
): SavedItem {
  const priceText = formatTourPriceLabel(tour.priceDisplay, tour.salePrice);

  return {
    id: "",
    itemType: inferSavedTourItemType({
      title: tour.itemName,
      category: tour.category,
      tags: tour.tags,
    }),
    source: "myrealtrip",
    cityCode: tourCityCode(state.city),
    cityName: state.city,
    title: tour.itemName,
    subtitle: tour.category || "투어·티켓",
    category: tour.category || "투어·티켓",
    priceText,
    ...(tour.imageUrl ? { imageUrl: tour.imageUrl } : {}),
    ...(tour.reviewScore ? { ratingText: `★ ${tour.reviewScore.toFixed(1).replace(/\.0$/, "")}` } : {}),
    badgeText: tour.category || "투어·티켓",
    detailPath,
    bookingUrl: tour.productUrl,
    ...(tour.deepLink ? { affiliateUrl: tour.deepLink } : {}),
    originalUrl: tour.deepLink || tour.productUrl,
    savedAt: "",
  };
}

type TourSearchResult = Awaited<ReturnType<typeof searchTnaProductsViaApi>>;

function mergeTourSearchResults(
  primary: TourSearchResult,
  fallbacks: TourSearchResult[],
): TourSearchResult | null {
  const okResults = [primary, ...fallbacks].filter((entry) => entry.ok);
  const items = okResults.flatMap((entry) => entry.data.items);
  if (!items.length) return null;

  const seen = new Set<string>();
  const mergedItems = items.filter((item) => {
    const key = item.gid || item.productUrl || item.itemName;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!mergedItems.length) return null;

  const first = okResults[0];
  return {
    ok: true,
    status: first.status,
    data: {
      ...first.data,
      items: mergedItems,
      totalCount: Math.max(first.data.totalCount, mergedItems.length),
      hasNextPage: okResults.some((entry) => entry.data.hasNextPage),
    },
    meta: first.meta,
    result: first.result,
  };
}

async function searchTnaProductsWithRegionFallback(
  state: ReturnType<typeof coerceTourSearchState>,
) {
  const primary = await searchTnaProductsViaApi(state);
  if (primary.ok && primary.data.items.length > 0) return primary;

  const fallbackSearches = buildTourRegionFallbackSearches(state);
  if (!fallbackSearches.length) return primary;

  const fallbackResults = await Promise.all(
    fallbackSearches.map((fallback) =>
      searchTnaProductsViaApi({
        ...state,
        ...fallback,
        page: 1,
      }),
    ),
  );

  return mergeTourSearchResults(primary, fallbackResults) ?? primary;
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const resolvedSearchParams = await searchParams;
  const state = coerceTourSearchState(resolvedSearchParams);
  const returnTo = safeRelativeReturnTo(pickSearchParam(resolvedSearchParams.returnTo));
  const backHref = returnTo ?? "/";
  const backLabel = returnTo?.includes("planner-result.html")
    ? "결과 화면으로 돌아가기"
    : "홈으로 돌아가기";
  const [result, categoryResult] = await Promise.all([
    searchTnaProductsWithRegionFallback(state),
    searchTnaCategoriesViaApi({ city: state.city }),
  ]);

  const tours = result.ok ? result.data.items : [];
  const categories = categoryResult.ok ? categoryResult.data.categories : [];
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
        <header className="sticky top-0 z-30 border-b border-[#f0e4dd] bg-[#fffaf6]/95 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <ReturnLink
              href={backHref}
              label={backLabel}
              preferHref
              storageKey="fukuosaka_last_result_url"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#7f6f69] shadow-[0_8px_18px_rgba(78,42,29,0.07)] ring-1 ring-[#efe3db]"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ReturnLink>
            <div className="min-w-0">
              <h1 className="text-[22px] font-black tracking-[-0.055em] text-[#241b17]">
                투어·티켓 검색
              </h1>
              <p className="mt-1 max-w-[320px] text-[12px] font-semibold leading-[1.45] tracking-[-0.03em] text-[#8b7770]">
                eSIM, 교통패스, 입장권, 현지투어를 한 번에 확인해보세요.
              </p>
            </div>
          </div>

          <form action="/tours" method="get" className="mt-3">
            <div className="flex h-11 items-center gap-2 rounded-[17px] border border-[#eadcd3] bg-white px-3.5 shadow-[0_10px_20px_rgba(92,50,38,0.05)]">
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
                className="rounded-full bg-[#cb4b42] px-3.5 py-1.5 text-[11px] font-black text-white shadow-[0_7px_14px_rgba(203,75,66,0.18)]"
              >
                검색
              </button>
            </div>
          </form>
        </header>

        <section className="px-5 pb-2.5 pt-2">
          {categoryChips.length > 1 ? (
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
              {categoryChips.map((category) => (
                <Link
                  key={category.value}
                  href={buildTourResultsHref({
                    ...state,
                    category: category.value,
                    page: 1,
                  })}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${
                    category.value === state.category
                      ? "bg-[#cb4b42] text-white shadow-[0_7px_14px_rgba(203,75,66,0.14)]"
                      : "bg-[#fffdfa] text-[#84716a] ring-1 ring-[#efe3db]"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-2.5 px-5">
          {tours.length > 0 ? (
            tours.map((tour) => {
              const detailHref = buildTourDetailHref(tour, state);
              return (
              <article key={tour.gid} className="relative">
                <SavedItemStarButton
                  item={tourSavedItemPayload(tour, state, detailHref)}
                  className="absolute right-3 top-3 z-10 bg-white/95"
                />
                <Link
                  href={detailHref}
                  className="flex overflow-hidden rounded-[22px] bg-white shadow-[0_12px_22px_rgba(85,42,28,0.055)] ring-1 ring-[#efe3db] transition active:scale-[0.99]"
                >
                <div className="relative h-[136px] w-[118px] shrink-0 overflow-hidden bg-[#f5e8df]">
                  {tour.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tour.imageUrl}
                      alt={tour.itemName}
                      className="h-full w-full object-cover object-center"
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

                <div className="flex min-w-0 flex-1 flex-col p-3.5">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="min-w-0 pr-10">
                      <p className="inline-flex max-w-full items-center rounded-full bg-[#f7eee8] px-2 py-1 text-[10px] font-black leading-none text-[#9a7368]">
                        {tour.category || "투어&티켓"}
                      </p>
                      <h3 className="mt-2 min-h-[42px] overflow-hidden pb-0.5 text-[15px] font-black leading-[1.38] tracking-[-0.045em] text-[#221a17] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                        {tour.itemName}
                      </h3>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-[#766761]">
                      <StarIcon className="h-3.5 w-3.5 text-[#ffb627]" />
                      <span className="text-[#a85e47]">
                        {tour.reviewScore ? tour.reviewScore.toFixed(1).replace(/\.0$/, "") : "-"}
                      </span>
                      <span className="min-w-0 truncate">
                        후기 {tour.reviewCount?.toLocaleString("ko-KR") ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-end justify-between gap-2 border-t border-[#f4e9e2] pt-2.5">
                    <p className="min-w-0 truncate whitespace-nowrap text-[14px] font-black tracking-[-0.04em] text-[#201b19]">
                      {formatTourPriceLabel(tour.priceDisplay, tour.salePrice)}
                    </p>
                    <span className="inline-flex shrink-0 items-center whitespace-nowrap text-[11px] font-black text-[#b95248]">
                      상세보기
                    </span>
                  </div>
                </div>
                </Link>
              </article>
            );
            })
          ) : (
            <div className="rounded-[24px] bg-white p-5 text-center shadow-[0_14px_26px_rgba(85,42,28,0.06)] ring-1 ring-[#efe3db]">
              <p className="text-[17px] font-black tracking-[-0.04em] text-[#271d18]">
                조건에 맞는 투어·티켓을 찾지 못했어요
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#7f6f69]">
                카테고리나 검색어를 바꿔 다시 확인해보세요.
              </p>
            </div>
          )}
        </section>
      </div>

      <BottomTabBar items={bottomTabs()} />
    </main>
  );
}
