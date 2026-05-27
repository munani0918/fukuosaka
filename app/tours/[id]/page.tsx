import { notFound } from "next/navigation";
import { connection } from "next/server";

import { SavedItemStarButton } from "@/src/components/SavedItemStarButton";
import { Artwork } from "@/src/components/home/Artwork";
import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import { StarIcon } from "@/src/components/home/icons";
import {
  buildMylinkUrl,
  fetchTnaCalendarsViaApi,
  fetchTnaOptionsViaApi,
  fetchTnaProductDetailViaApi,
  searchTnaProductsViaApi,
  type TnaSearchItem,
} from "@/src/lib/myrealtrip";
import {
  buildTourResultsHref,
  buildTourDetailHref,
  coerceTourSearchState,
  formatTourPriceLabel,
  formatTourReviewLabel,
  futureTourDate,
  type TourSnapshot,
} from "@/src/lib/tours";
import { inferSavedTourItemType } from "@/src/lib/savedItems";
import type { SavedItem } from "@/src/types/savedTrip";
import { TourReturnLink } from "./TourReturnLink";

function bottomTabs() {
  return [
    { id: "home", label: "홈", href: "/", icon: "home" as const },
    { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" as const },
    { id: "stay", label: "숙소", href: "/stays", icon: "stay" as const },
    { id: "tour", label: "투어", href: "/tours", icon: "tour" as const, active: true },
    { id: "my", label: "마이", href: "/mypage", icon: "my" as const },
  ];
}

function toNullableNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableString(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ? raw.trim() : null;
}

function toTags(value: string | string[] | undefined) {
  const raw = toNullableString(value);
  return raw ? raw.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
}

function hiddenFieldValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function safeRelativeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (/^https?:\/\//i.test(value)) return null;
  return value;
}

function buildSnapshot(
  id: string,
  input: Record<string, string | string[] | undefined>,
): TourSnapshot {
  const productUrl =
    toNullableString(input.productUrl) ??
    toNullableString(input.bookingUrl) ??
    (/^\d+$/.test(id)
      ? `https://experiences.myrealtrip.com/products/${id}`
      : "https://experiences.myrealtrip.com/");

  return {
    gid: id,
    itemName: toNullableString(input.name) ?? "투어&티켓 상품",
    productUrl,
    salePrice: toNullableNumber(input.salePrice) ?? 0,
    priceDisplay: toNullableString(input.priceDisplay) ?? "",
    category: toNullableString(input.itemCategory) ?? undefined,
    deepLink: toNullableString(input.deepLink) ?? undefined,
    description: toNullableString(input.description) ?? undefined,
    imageUrl: toNullableString(input.imageUrl) ?? undefined,
    reviewCount: toNullableNumber(input.reviewCount) ?? undefined,
    reviewScore: toNullableNumber(input.reviewScore) ?? undefined,
    tags: toTags(input.tags),
  };
}

function mergeTourSnapshot(
  id: string,
  snapshot: TourSnapshot,
  liveTour: TnaSearchItem | null,
  title?: string,
): TourSnapshot {
  return {
    gid: id,
    itemName: liveTour?.itemName || title || snapshot.itemName,
    productUrl: liveTour?.productUrl ?? snapshot.productUrl,
    salePrice: liveTour?.salePrice ?? snapshot.salePrice,
    priceDisplay: liveTour?.priceDisplay ?? snapshot.priceDisplay,
    category: liveTour?.category ?? snapshot.category,
    deepLink: liveTour?.deepLink ?? snapshot.deepLink,
    description: liveTour?.description ?? snapshot.description,
    imageUrl: liveTour?.imageUrl ?? snapshot.imageUrl,
    reviewCount: liveTour?.reviewCount ?? snapshot.reviewCount,
    reviewScore: liveTour?.reviewScore ?? snapshot.reviewScore,
    tags: liveTour?.tags ?? snapshot.tags,
  };
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImageUrls(value: string) {
  return Array.from(value.matchAll(/<img[^>]+src=["']([^"']+)["']/gi))
    .map((match) => match[1]?.replace("https://dry7pvlp22cox.cloudfront.net//", "https://dry7pvlp22cox.cloudfront.net/"))
    .filter((url): url is string => Boolean(url));
}

function optionPriceLabel(option: { salePrice: number; currency?: string }) {
  if (!option.salePrice || option.salePrice <= 0) return "요금 확인";
  const suffix = option.currency === "KRW" || !option.currency ? "원" : ` ${option.currency}`;
  return `${option.salePrice.toLocaleString("ko-KR")}${suffix}`;
}

function tourCityCode(city: string) {
  return city.includes("후쿠오카") ? "FUK" : "KIX";
}

export default async function TourDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const state = coerceTourSearchState(resolvedSearchParams);
  const selectedDate = toNullableString(resolvedSearchParams.selectedDate) ?? futureTourDate(35);
  const snapshot = buildSnapshot(id, resolvedSearchParams);

  const [searchResult, detailResult, optionResult, calendarResult] = await Promise.all([
    searchTnaProductsViaApi({
      ...state,
      perPage: Math.max(state.perPage, 20),
    }),
    fetchTnaProductDetailViaApi({ gid: id }),
    fetchTnaOptionsViaApi({ gid: id, selectedDate }),
    fetchTnaCalendarsViaApi({ gid: id, selectedDate }),
  ]);

  const liveTour =
    searchResult.ok ? searchResult.data.items.find((item) => item.gid === id) ?? null : null;
  const detail = detailResult.ok ? detailResult.data : null;
  const tour = mergeTourSnapshot(id, snapshot, liveTour, detail?.title);
  const options = optionResult.ok && Array.isArray(optionResult.data.options)
    ? optionResult.data.options
    : [];
  const sharedUnits = optionResult.ok && Array.isArray(optionResult.data.units)
    ? optionResult.data.units
    : [];
  const calendar = calendarResult.ok ? calendarResult.data : null;
  const detailDescription = typeof detail?.description === "string" ? detail.description : "";
  const detailImages = extractImageUrls(detailDescription);
  const heroImageUrl = tour.imageUrl ?? detailImages[0];
  const introText =
    stripHtml(detailDescription) ||
    tour.description ||
    "마이리얼트립 공식 투어&티켓 상품 정보를 기준으로 소개와 예약 옵션을 모아 보여드려요.";

  if (!tour.itemName) {
    notFound();
  }

  const returnTo = safeRelativeReturnTo(toNullableString(resolvedSearchParams.returnTo));
  const backHref = returnTo ?? buildTourResultsHref(state);
  const backLabel = returnTo?.includes("planner-result.html")
    ? "결과 화면으로 돌아가기"
    : "검색 결과로 돌아가기";
  const bookingUrl = buildMylinkUrl({
    targetUrl: tour.productUrl,
    utmContent: `tour-detail-${id}`,
    openInApp: true,
  }).url;
  const detailPath = buildTourDetailHref(tour, state);
  const primaryPrice = options[0]
    ? optionPriceLabel(options[0])
    : formatTourPriceLabel(tour.priceDisplay, tour.salePrice);
  const included = detail?.included ?? [];
  const excluded = detail?.excluded ?? [];
  const itineraries = detail?.itineraries ?? [];
  const savedTourItem: SavedItem = {
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
    priceText: primaryPrice,
    ...(heroImageUrl ? { imageUrl: heroImageUrl } : {}),
    ...(tour.reviewScore ? { ratingText: `★ ${tour.reviewScore.toFixed(1).replace(/\.0$/, "")}` } : {}),
    badgeText: tour.category || "투어·티켓",
    detailPath,
    bookingUrl,
    ...(tour.deepLink ? { affiliateUrl: tour.deepLink } : {}),
    originalUrl: tour.productUrl || tour.deepLink,
    savedAt: "",
  };

  return (
    <main
      id="top"
      className="min-h-dvh bg-[linear-gradient(180deg,#fff8f3_0%,#fcf2eb_48%,#f6ede6_100%)] text-[#241b17]"
    >
      <div className="mx-auto min-h-dvh max-w-[430px] pb-[calc(env(safe-area-inset-bottom)+132px)]">
        <header className="sticky top-0 z-30 border-b border-[#f0e4dd] bg-[#fffaf6]/95 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+14px)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <TourReturnLink
              href={backHref}
              label={backLabel}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#7f6f69] shadow-[0_8px_18px_rgba(78,42,29,0.07)] ring-1 ring-[#efe3db]"
              returnTo={returnTo}
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </TourReturnLink>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[-0.02em] text-[#a58f86]">
                {state.city} 투어 상세
              </p>
              <h1 className="truncate text-[19px] font-black tracking-[-0.05em] text-[#241b17]">
                {tour.itemName}
              </h1>
            </div>
          </div>
        </header>

        <section className="px-5 pt-5">
          <div className="overflow-hidden rounded-[30px] bg-white shadow-[0_16px_30px_rgba(85,42,28,0.07)] ring-1 ring-[#efe3db]">
            <div className="relative h-[248px] bg-[#f4e8df]">
              <SavedItemStarButton
                item={savedTourItem}
                className="absolute right-4 top-4 z-10 bg-white/95"
              />
              {heroImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImageUrl}
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
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,14,11,0)_0%,rgba(26,14,11,0.42)_100%)]" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-black text-[#cb4b42]">
                  {tour.category || "투어&티켓"}
                </span>
                <h2 className="mt-2 text-[24px] font-black leading-[1.14] tracking-[-0.05em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.16)]">
                  {tour.itemName}
                </h2>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-[#7a6862]">
                    <StarIcon className="h-4 w-4 text-[#ffb627]" />
                    <span className="text-[#d45c3b]">
                      {tour.reviewScore ? tour.reviewScore.toFixed(1).replace(/\.0$/, "") : "-"}
                    </span>
                    <span>리뷰 {tour.reviewCount?.toLocaleString("ko-KR") ?? 0}개</span>
                    {tour.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#fff2e7] px-2 py-0.5 text-[10px] font-black text-[#cb6b34]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[13px] font-medium leading-6 text-[#7f706a]">
                    {introText}
                  </p>
                </div>

                <div className="shrink-0 rounded-[18px] bg-[#fff7f3] px-4 py-3 text-right ring-1 ring-[#f0ded6]">
                  <p className="text-[11px] font-semibold text-[#9f8c84]">시작가</p>
                  <p className="mt-1 whitespace-nowrap text-[18px] font-black tracking-[-0.05em] text-[#221c19]">
                    {primaryPrice}
                  </p>
                </div>
              </div>

              {detailImages.length > 1 ? (
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {detailImages.slice(1, 5).map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="h-24 w-32 shrink-0 overflow-hidden rounded-[18px] bg-[#f4e8df] ring-1 ring-[#f0e4dc]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={`${tour.itemName} 소개 이미지 ${index + 1}`}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-4 rounded-[22px] bg-[#fcf6f2] p-4 ring-1 ring-[#f0e4dc]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-black tracking-[-0.03em] text-[#2a1e19]">
                      이용일 기준 옵션 조회
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-[#7e6d66]">
                      투어&티켓은 홈 검색에서는 날짜를 받지 않고, 상세에서 옵션 확인용 날짜만 바꿀 수 있어요.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#b18778] ring-1 ring-[#efddd5]">
                    {calendar?.instantConfirm ? "즉시 확정" : "예약 후 확인"}
                  </span>
                </div>

                <form action={`/tours/${id}`} method="get" className="grid gap-3">
                  <label className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#8f776f]">선택 날짜</span>
                    <input
                      type="date"
                      name="selectedDate"
                      defaultValue={selectedDate}
                      className="h-11 w-full rounded-[16px] border border-[#eadcd3] bg-white px-3 text-[13px] font-semibold text-[#241b17] outline-none"
                    />
                  </label>

                  <input type="hidden" name="keyword" value={state.keyword} />
                  <input type="hidden" name="city" value={state.city} />
                  <input type="hidden" name="category" value={state.category} />
                  <input type="hidden" name="sort" value={state.sort} />
                  <input type="hidden" name="name" value={tour.itemName} />
                  <input type="hidden" name="salePrice" value={hiddenFieldValue(tour.salePrice)} />
                  <input type="hidden" name="priceDisplay" value={hiddenFieldValue(tour.priceDisplay)} />
                  <input type="hidden" name="reviewScore" value={hiddenFieldValue(tour.reviewScore)} />
                  <input type="hidden" name="reviewCount" value={hiddenFieldValue(tour.reviewCount)} />
                  <input type="hidden" name="imageUrl" value={hiddenFieldValue(tour.imageUrl)} />
                  <input type="hidden" name="productUrl" value={hiddenFieldValue(tour.productUrl)} />
                  <input type="hidden" name="deepLink" value={hiddenFieldValue(tour.deepLink)} />
                  <input type="hidden" name="description" value={hiddenFieldValue(tour.description)} />
                  <input type="hidden" name="itemCategory" value={hiddenFieldValue(tour.category)} />
                  <input type="hidden" name="tags" value={tour.tags?.join(",") ?? ""} />

                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-[16px] bg-[#cb4b42] px-4 text-[13px] font-black text-white"
                  >
                    옵션 다시 조회하기
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold text-[#a58f86]">
                      {selectedDate}
                    </p>
                    <h3 className="mt-1 text-[20px] font-black tracking-[-0.04em] text-[#241b17]">
                      예약 가능한 옵션
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#fff5f0] px-3 py-1 text-[11px] font-black text-[#cb4b42]">
                    {options.length}개 옵션
                  </span>
                </div>

                {calendar?.basePrice ? (
                  <div className="rounded-[18px] bg-[#fff9f6] px-4 py-3 text-[12px] font-semibold text-[#765f56] ring-1 ring-[#f0e2db]">
                    캘린더 기준 시작가 {calendar.basePrice} · 매진일 {calendar.blockDates.length}개
                  </div>
                ) : null}

                {options.length > 0 ? (
                  options.map((option) => (
                    <article
                      key={option.id}
                      className="rounded-[24px] bg-white p-4 ring-1 ring-[#f0e4dc]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-[15px] font-black leading-[1.35] tracking-[-0.03em] text-[#241b17]">
                            {option.name}
                          </h4>
                          <p className="mt-2 text-[12px] font-medium leading-5 text-[#7f6f69]">
                            최소 구매 {option.minPurchaseQuantity ?? 1}개
                            {typeof option.availablePurchaseQuantity === "number"
                              ? ` · 구매 가능 ${option.availablePurchaseQuantity}개`
                              : ""}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#fff2ee] px-3 py-1 text-[11px] font-black text-[#cb4b42]">
                          {optionPriceLabel(option)}
                        </span>
                      </div>

                      {(option.units ?? sharedUnits).length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(option.units ?? sharedUnits).map((unit) => (
                            <span
                              key={unit.id}
                              className="rounded-full bg-[#f8ede6] px-2.5 py-1 text-[10.5px] font-bold text-[#8c746a]"
                            >
                              {unit.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#f0e4dc]">
                    <p className="text-[15px] font-black tracking-[-0.03em] text-[#241b17]">
                      현재 선택한 날짜의 옵션을 아직 불러오지 못했어요
                    </p>
                    <p className="mt-2 text-[12px] leading-6 text-[#7f6f69]">
                      날짜를 바꿔 다시 조회하거나, 아래 예약 버튼으로 마이리얼트립 상세 페이지에서
                      최신 가능 일정을 확인해보세요.
                    </p>
                  </div>
                )}
              </div>

              {(included.length > 0 || excluded.length > 0) ? (
                <div className="grid gap-3">
                  {included.length > 0 ? (
                    <section className="rounded-[22px] bg-white p-4 ring-1 ring-[#f1e6df]">
                      <p className="text-[12px] font-black tracking-[-0.03em] text-[#2a1e19]">
                        포함 사항
                      </p>
                      <ul className="mt-3 space-y-2.5 text-[13px] leading-6 text-[#6f605a]">
                        {included.slice(0, 8).map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#cb4b42]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {excluded.length > 0 ? (
                    <section className="rounded-[22px] bg-white p-4 ring-1 ring-[#f1e6df]">
                      <p className="text-[12px] font-black tracking-[-0.03em] text-[#2a1e19]">
                        불포함 사항
                      </p>
                      <ul className="mt-3 space-y-2.5 text-[13px] leading-6 text-[#6f605a]">
                        {excluded.slice(0, 8).map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b8a8a0]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>
              ) : null}

              {itineraries.length > 0 ? (
                <section className="rounded-[22px] bg-white p-4 ring-1 ring-[#f1e6df]">
                  <p className="text-[12px] font-black tracking-[-0.03em] text-[#2a1e19]">
                    일정 소개
                  </p>
                  <div className="mt-3 space-y-3">
                    {itineraries.slice(0, 6).map((itinerary, index) => (
                      <article key={`${itinerary.title ?? "itinerary"}-${index}`} className="rounded-[18px] bg-[#fcf6f2] p-3">
                        <p className="text-[13px] font-black text-[#241b17]">
                          {itinerary.title || `${index + 1}번째 일정`}
                        </p>
                        {itinerary.description ? (
                          <p className="mt-1.5 text-[12px] leading-6 text-[#75665f]">
                            {itinerary.description}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#f1e6df]">
                <p className="text-[12px] font-black tracking-[-0.03em] text-[#2a1e19]">
                  상품 요약
                </p>
                <ul className="mt-3 space-y-2.5 text-[13px] leading-6 text-[#6f605a]">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#cb4b42]" />
                    <span>{state.city}에서 검색된 마이리얼트립 공식 투어&티켓 상품이에요.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#cb4b42]" />
                    <span>{formatTourReviewLabel(tour.reviewScore, tour.reviewCount)}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#cb4b42]" />
                    <span>최종 결제와 확정 조건은 마이리얼트립 예약 페이지에서 다시 확인돼요.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="px-5 pt-5">
          <TourReturnLink
            href={backHref}
            label={backLabel}
            className="inline-flex items-center gap-2 text-[12px] font-bold text-[#8d7b73]"
            returnTo={returnTo}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {backLabel}
          </TourReturnLink>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+74px)] z-40 flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-[398px] rounded-[24px] bg-white/96 p-3 shadow-[0_18px_40px_rgba(71,34,26,0.18)] ring-1 ring-[#f0dfd6] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold text-[#2a1f1a]">
                {tour.itemName}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#8b7a73]">
                {primaryPrice} · 마이리얼트립 예약 연동
              </p>
            </div>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-full bg-[#cb4b42] px-4 py-2.5 text-[12px] font-black text-white"
            >
              예약하기
            </a>
          </div>
        </div>
      </div>

      <BottomTabBar items={bottomTabs()} />
    </main>
  );
}
