import { connection } from "next/server";
import { notFound } from "next/navigation";

import { SavedItemStarButton } from "@/src/components/SavedItemStarButton";
import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import { Artwork } from "@/src/components/home/Artwork";
import { StarIcon } from "@/src/components/home/icons";
import { ReturnLink } from "../ReturnLink";
import {
  buildAccommodationBookUrl,
  buildMylinkUrl,
  fetchAccommodationImageUrl,
  fetchAccommodationProductDetail,
  searchAccommodationsSmart,
  type AccommodationSearchItem,
} from "@/src/lib/myrealtrip";
import {
  addStayDays,
  buildStayDetailHref,
  buildStayResultsHref,
  coerceStaySearchState,
  formatStayPriceLabel,
} from "@/src/lib/stays";
import type { SavedItem } from "@/src/types/savedTrip";

function bottomTabs() {
  return [
    { id: "home", label: "홈", href: "/", icon: "home" as const },
    { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" as const },
    { id: "stay", label: "숙소", href: "/stays", icon: "stay" as const, active: true },
    { id: "tour", label: "투어·티켓", href: "/tours", icon: "tour" as const },
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

function buildSnapshot(
  id: string,
  input: Record<string, string | string[] | undefined>,
  bookUrl: string,
): AccommodationSearchItem {
  return {
    itemId: id,
    itemName: toNullableString(input.name) ?? "숙소 정보",
    originalPrice: null,
    salePrice: toNullableNumber(input.salePrice),
    reviewScore: toNullableString(input.reviewScore),
    reviewCount: toNullableNumber(input.reviewCount),
    starRating: null,
    imageUrl: toNullableString(input.imageUrl) ?? undefined,
    bookUrl,
    raw: {},
  };
}

function hiddenFieldValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function formatStayDetailPriceText(value: string | null | undefined) {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  if (!cleaned) return "가격 확인";

  const amountMatch = cleaned.match(/([\d,]+)\s*원/);
  if (amountMatch) {
    return `1박 ${amountMatch[1]}원~`;
  }

  return cleaned;
}

function compactDateRange(checkIn: string, checkOut: string) {
  const [inYear, inMonth, inDay] = checkIn.split("-");
  const [, outMonth, outDay] = checkOut.split("-");
  if (!inYear || !inMonth || !inDay || !outMonth || !outDay) {
    return `${checkIn} - ${checkOut}`;
  }

  return `${inYear}.${inMonth}.${inDay} - ${outMonth}.${outDay}`;
}

function safeRelativeReturnUrl(value: string | string[] | undefined) {
  const raw = toNullableString(value);
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;

  try {
    const url = new URL(raw, "https://fukuosaka.local");
    if (url.origin !== "https://fukuosaka.local") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function cityNameFromKeyword(keyword: string) {
  return keyword.includes("후쿠오카") || keyword.includes("하카타") ? "후쿠오카" : "오사카";
}

function cityCodeFromKeyword(keyword: string) {
  return cityNameFromKeyword(keyword) === "후쿠오카" ? "FUK" : "KIX";
}

export default async function StayDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const state = coerceStaySearchState(resolvedSearchParams);
  const fallbackBookUrl =
    toNullableString(resolvedSearchParams.bookUrl) ??
    buildAccommodationBookUrl(id, state);

  const [searchResult, productDetail] = await Promise.all([
    searchAccommodationsSmart({
      ...state,
      minPrice: state.hotelPriceMin ?? undefined,
      maxPrice: state.hotelPriceMax ?? undefined,
      size: Math.max(state.size, 20),
    }),
    fetchAccommodationProductDetail(id, state),
  ]);

  const liveStay =
    searchResult.ok ? searchResult.items.find((item) => item.itemId === id) : null;
  const snapshotStay = buildSnapshot(id, resolvedSearchParams, fallbackBookUrl);
  const roomOptions = productDetail.ok ? productDetail.roomOptions : [];
  const primaryRoom =
    roomOptions.find((room) => room.status === "ON_SALE") ?? roomOptions[0] ?? null;

  const stayName =
    liveStay?.itemName ??
    (productDetail.ok ? productDetail.title : null) ??
    snapshotStay.itemName;
  const fallbackImageUrl =
    liveStay?.imageUrl ??
    (productDetail.ok ? productDetail.heroImageUrl : undefined) ??
    snapshotStay.imageUrl ??
    (await fetchAccommodationImageUrl(id, state));
  const stay: AccommodationSearchItem = {
    itemId: id,
    itemName: stayName,
    originalPrice: liveStay?.originalPrice ?? snapshotStay.originalPrice,
    salePrice:
      liveStay?.salePrice ??
      primaryRoom?.averagePrice ??
      snapshotStay.salePrice,
    reviewScore: liveStay?.reviewScore ?? snapshotStay.reviewScore,
    reviewCount: liveStay?.reviewCount ?? snapshotStay.reviewCount,
    starRating:
      liveStay?.starRating ?? (productDetail.ok ? productDetail.ratingScore : null),
    imageUrl: fallbackImageUrl ?? undefined,
    bookUrl: liveStay?.bookUrl ?? snapshotStay.bookUrl,
    raw: liveStay?.raw ?? {},
  };

  if (!stay.itemName) {
    notFound();
  }

  const returnUrl = safeRelativeReturnUrl(resolvedSearchParams.returnUrl);
  const backHref = returnUrl ?? buildStayResultsHref(state);
  const backLabel = returnUrl?.includes("planner-result.html")
    ? "결과 화면으로 돌아가기"
    : "검색 결과로 돌아가기";
  const rawStickyHref = primaryRoom?.bookUrl ?? stay.bookUrl;
  const stickyHref = buildMylinkUrl({
    targetUrl: rawStickyHref,
    utmContent: `stay-detail-${id}`,
  }).url;
  const stickyPrice =
    formatStayDetailPriceText(
      primaryRoom?.footerPriceText ??
        primaryRoom?.averagePriceText ??
        formatStayPriceLabel(stay.salePrice),
    );
  const heroPrice = formatStayDetailPriceText(
    primaryRoom?.averagePriceText ?? formatStayPriceLabel(stay.salePrice),
  );
  const minCheckOut = addStayDays(state.checkIn, 1);
  const detailAddress = productDetail.ok ? productDetail.address : null;
  const stayDetailPath = buildStayDetailHref(stay, state);
  const savedStayItem: SavedItem = {
    id: "",
    itemType: "hotel",
    source: "myrealtrip",
    cityCode: cityCodeFromKeyword(state.keyword),
    cityName: cityNameFromKeyword(state.keyword),
    title: stay.itemName,
    subtitle: "마이리얼트립",
    area: detailAddress ?? state.keyword,
    category: "숙소",
    priceText: heroPrice,
    ...(stay.imageUrl ? { imageUrl: stay.imageUrl } : {}),
    ...(stay.reviewScore ? { ratingText: `${stay.reviewScore}/5` } : {}),
    badgeText: "마이리얼트립",
    detailPath: stayDetailPath,
    bookingUrl: stickyHref,
    originalUrl: rawStickyHref,
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
            <ReturnLink
              href={backHref}
              label={backLabel}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#7f6f69] shadow-[0_8px_18px_rgba(78,42,29,0.07)] ring-1 ring-[#efe3db]"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ReturnLink>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[-0.02em] text-[#a58f86]">
                {state.keyword} 숙소 상세
              </p>
              <h1 className="truncate text-[19px] font-black tracking-[-0.05em] text-[#241b17]">
                {stay.itemName}
              </h1>
            </div>
          </div>
        </header>

        <section className="px-5 pt-5">
          <div className="overflow-hidden rounded-[30px] bg-white shadow-[0_16px_30px_rgba(85,42,28,0.07)] ring-1 ring-[#efe3db]">
            <div className="relative h-[248px] bg-[#f4e8df]">
              <SavedItemStarButton
                item={savedStayItem}
                className="absolute right-4 top-4 z-10 bg-white/95"
              />
              {stay.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stay.imageUrl}
                  alt={stay.itemName}
                  className="h-full w-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Artwork
                  variant={state.keyword.includes("후쿠오카") ? "stay-fukuoka" : "stay-osaka"}
                  className="h-full w-full"
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,14,11,0)_0%,rgba(26,14,11,0.36)_100%)]" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-black text-[#cb4b42]">
                    {state.keyword} 추천
                  </span>
                  <h2 className="mt-2 text-[24px] font-black leading-[1.14] tracking-[-0.05em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.16)]">
                    {stay.itemName}
                  </h2>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-[#7a6862]">
                    <StarIcon className="h-4 w-4 text-[#ffb627]" />
                    <span className="text-[#d45c3b]">{stay.reviewScore ?? "-"}</span>
                    <span>리뷰 {stay.reviewCount?.toLocaleString("ko-KR") ?? 0}개</span>
                    {stay.starRating ? (
                      <span className="rounded-full bg-[#fff2e7] px-2 py-0.5 text-[10px] font-black text-[#cb6b34]">
                        {stay.starRating}성급
                      </span>
                    ) : null}
                  </div>
                  {detailAddress ? (
                    <p className="mt-2 text-[13px] font-medium leading-6 text-[#7f706a]">
                      {detailAddress}
                    </p>
                  ) : (
                    <p className="mt-2 text-[13px] font-medium leading-6 text-[#7f706a]">
                      선택한 날짜 기준으로 객실 타입과 가격을 다시 확인하고, 마지막 예약만
                      마이리얼트립으로 이어지도록 연결했어요.
                    </p>
                  )}
                </div>

                <div className="shrink-0 rounded-[18px] bg-[#fff7f3] px-4 py-3 text-right ring-1 ring-[#f0ded6]">
                  <p className="text-[11px] font-semibold text-[#9f8c84]">최저가 기준</p>
                  <p className="mt-1 whitespace-nowrap text-[16px] font-black tracking-[-0.05em] text-[#221c19]">
                    {heroPrice}
                  </p>
                </div>
              </div>

              <details className="group rounded-[22px] bg-[#fcf6f2] p-3 ring-1 ring-[#f0e4dc]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[16px] bg-white px-3 py-2.5 text-[12px] font-black text-[#2a1e19] ring-1 ring-[#efddd5] [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 truncate">
                    📅 {compactDateRange(state.checkIn, state.checkOut)} · 성인 {state.adultCount} · 아동 {state.childCount} · 객실 {state.roomCount}
                  </span>
                  <span className="shrink-0 rounded-full bg-[#fff4f0] px-2.5 py-1 text-[10px] font-black text-[#cb4b42]">
                    수정
                  </span>
                </summary>
                <form
                  action={`/stays/${id}`}
                  method="get"
                  className="mt-3 grid gap-2 sm:grid-cols-2"
                >
                  <label className="space-y-1">
                    <span className="text-[11px] font-bold text-[#8f776f]">체크인</span>
                    <input
                      type="date"
                      name="checkIn"
                      defaultValue={state.checkIn}
                      className="h-10 w-full rounded-[14px] border border-[#eadcd3] bg-white px-3 text-[12px] font-semibold text-[#241b17] outline-none"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] font-bold text-[#8f776f]">체크아웃</span>
                    <input
                      type="date"
                      name="checkOut"
                      min={minCheckOut}
                      defaultValue={state.checkOut}
                      className="h-10 w-full rounded-[14px] border border-[#eadcd3] bg-white px-3 text-[12px] font-semibold text-[#241b17] outline-none"
                    />
                  </label>

                  <input type="hidden" name="keyword" value={state.keyword} />
                  <input type="hidden" name="adultCount" value={state.adultCount} />
                  <input type="hidden" name="adults" value={state.adultCount} />
                  <input type="hidden" name="childCount" value={state.childCount} />
                  <input type="hidden" name="children" value={state.childCount} />
                  <input type="hidden" name="roomCount" value={state.roomCount} />
                  <input type="hidden" name="rooms" value={state.roomCount} />
                  <input type="hidden" name="isDomestic" value={String(state.isDomestic)} />
                  <input type="hidden" name="name" value={stay.itemName} />
                  <input type="hidden" name="salePrice" value={hiddenFieldValue(stay.salePrice)} />
                  <input type="hidden" name="reviewScore" value={hiddenFieldValue(stay.reviewScore)} />
                  <input type="hidden" name="reviewCount" value={hiddenFieldValue(stay.reviewCount)} />
                  <input type="hidden" name="imageUrl" value={hiddenFieldValue(stay.imageUrl)} />
                  <input type="hidden" name="bookUrl" value={hiddenFieldValue(stay.bookUrl)} />

                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-[14px] bg-[#cb4b42] px-4 text-[12px] font-black text-white sm:col-span-2"
                  >
                    객실 타입 다시 조회하기
                  </button>
                </form>
              </details>

              <div className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold text-[#a58f86]">
                      {state.checkIn} ~ {state.checkOut}
                    </p>
                    <h3 className="mt-1 text-[20px] font-black tracking-[-0.04em] text-[#241b17]">
                      예약 가능한 룸타입
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#fff5f0] px-3 py-1 text-[11px] font-black text-[#cb4b42]">
                    {roomOptions.length}개 옵션
                  </span>
                </div>

                {roomOptions.length > 0 ? (
                  roomOptions.map((room) => (
                    <article
                      key={room.roomKey}
                      className="overflow-hidden rounded-[24px] bg-white ring-1 ring-[#f0e4dc]"
                    >
                      {room.headline ? (
                        <div className="bg-[#ec4937] px-4 py-2 text-[11px] font-black text-white">
                          {room.headline}
                        </div>
                      ) : null}

                      <div className="flex gap-3 p-3">
                        <div className="h-[90px] w-[90px] shrink-0 overflow-hidden rounded-[18px] bg-[#f3e7df]">
                          {room.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={room.imageUrl}
                              alt={room.title}
                              className="h-full w-full object-cover object-center"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Artwork
                              variant={state.keyword.includes("후쿠오카") ? "stay-fukuoka" : "stay-osaka"}
                              className="h-full w-full"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="text-[15px] font-black leading-[1.35] tracking-[-0.03em] text-[#241b17] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                                {room.title}
                              </h4>
                              {room.badges.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {room.badges.slice(0, 2).map((badge) => (
                                    <span
                                      key={badge}
                                      className="rounded-full bg-[#eef8ff] px-2.5 py-1 text-[10px] font-black text-[#1571c2]"
                                    >
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            {room.isSoonSoldOut ? (
                              <span className="rounded-full bg-[#fff1ec] px-2.5 py-1 text-[10px] font-black text-[#cb4b42]">
                                마감 임박
                              </span>
                            ) : null}
                          </div>

                          {room.attributes.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {room.attributes.slice(0, 3).map((attribute) => (
                                <span
                                  key={attribute}
                                  className="rounded-full bg-[#fbf2ed] px-2 py-1 text-[10px] font-bold text-[#7a6862]"
                                >
                                  {attribute}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          <div className="mt-2 border-t border-[#f3e7df] pt-2.5">
                            <div className="flex items-end justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-[#9b8780]">
                                  {room.priceLabel ?? "선택한 날짜 기준"}
                                </p>
                                <p className="mt-1 whitespace-nowrap text-[16px] font-black tracking-[-0.04em] text-[#201b19]">
                                  {formatStayDetailPriceText(
                                    room.footerPriceText ??
                                      room.averagePriceText ??
                                      room.totalPriceText,
                                  )}
                                </p>
                                {room.footerSubPriceText || room.priceDescription ? (
                                  <p className="mt-1 text-[11px] leading-5 text-[#7f6f69]">
                                    {room.footerSubPriceText ?? room.priceDescription}
                                  </p>
                                ) : null}
                              </div>
                              <a
                                href={
                                  buildMylinkUrl({
                                    targetUrl: room.bookUrl,
                                    utmContent: `stay-detail-${id}-room`,
                                  }).url
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#cb4b42] px-3.5 text-[11px] font-black text-white"
                              >
                                예약하기
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#f0e4dc]">
                    <p className="text-[15px] font-black tracking-[-0.03em] text-[#241b17]">
                      현재 선택한 날짜의 객실 옵션을 아직 불러오지 못했어요
                    </p>
                    <p className="mt-2 text-[12px] leading-6 text-[#7f6f69]">
                      날짜를 바꿔 다시 조회하거나, 아래 예약 버튼으로 마이리얼트립 상세 페이지에서
                      최신 객실 옵션을 확인해보세요.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#f1e6df]">
                <p className="text-[12px] font-black tracking-[-0.03em] text-[#2a1e19]">
                  이런 분께 잘 맞아요
                </p>
                <ul className="mt-3 space-y-2.5 text-[13px] leading-6 text-[#6f605a]">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#cb4b42]" />
                    <span>{state.keyword} 중심으로 숙소를 고르고 싶은 여행자</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#cb4b42]" />
                    <span>같은 숙소 안에서 날짜별 객실 타입과 요금을 비교하고 싶은 경우</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#cb4b42]" />
                    <span>최종 예약 전에 후쿠오사카 안에서 먼저 후보를 정리하고 싶은 경우</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="px-5 pt-5">
          <ReturnLink
            href={backHref}
            label={backLabel}
            className="inline-flex items-center gap-2 text-[12px] font-bold text-[#8d7b73]"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {backLabel}
          </ReturnLink>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+74px)] z-40 flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-[398px] rounded-[24px] bg-white/96 p-3 shadow-[0_18px_40px_rgba(71,34,26,0.18)] ring-1 ring-[#f0dfd6] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black text-[#cb4b42]">
                최저가 객실
              </p>
              <p className="mt-0.5 truncate whitespace-nowrap text-[14px] font-black tracking-[-0.04em] text-[#2a1f1a]">
                {stickyPrice}
              </p>
              <p className="truncate text-[10px] font-medium text-[#8b7a73]">
                {primaryRoom?.title ?? stay.itemName}
              </p>
            </div>
            <a
              href={stickyHref}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 whitespace-nowrap rounded-full bg-[#cb4b42] px-4 py-2.5 text-[12px] font-black text-white"
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
