import Link from "next/link";
import { headers } from "next/headers";
import { connection } from "next/server";

import { Artwork } from "@/src/components/home/Artwork";
import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import { StarIcon } from "@/src/components/home/icons";
import {
  type AgodaStayCardItem,
  fetchAgodaHotelsForStays,
} from "@/src/lib/agoda-stays";
import {
  buildStayResultsHref,
  coerceStaySearchState,
  formatStayPriceLabel,
} from "@/src/lib/stays";

type AgodaBridgeSnapshot = Omit<AgodaStayCardItem, "isBookable"> & {
  isBookable: boolean;
};

function bottomTabs() {
  return [
    { id: "home", label: "홈", href: "/", icon: "home" as const },
    { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" as const },
    { id: "stay", label: "숙소", href: "/stays", icon: "stay" as const, active: true },
    { id: "tour", label: "투어·티켓", href: "/tours", icon: "tour" as const },
    { id: "my", label: "마이", href: "#top", icon: "my" as const },
  ];
}

function pick(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function nullableNumber(value: string | string[] | undefined) {
  const raw = pick(value);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function nullableString(value: string | string[] | undefined) {
  const raw = pick(value)?.trim();
  return raw || null;
}

function snapshotFromQuery(
  id: string,
  input: Record<string, string | string[] | undefined>,
): AgodaBridgeSnapshot | null {
  const name = nullableString(input.name);
  const bookingUrl = nullableString(input.bookingUrl);
  if (!name && !bookingUrl) return null;

  return {
    id,
    source: "agoda",
    name: name ?? "아고다 숙소",
    imageUrl: nullableString(input.imageUrl),
    rating: nullableNumber(input.rating),
    ratingScale: 10,
    reviewCount: nullableNumber(input.reviewCount),
    starRating: nullableNumber(input.starRating),
    pricePerNight: nullableNumber(input.pricePerNight),
    totalPrice: nullableNumber(input.totalPrice),
    currency: nullableString(input.currency) ?? "KRW",
    bookingUrl: bookingUrl ?? "",
    isExternal: true,
    isBookable: Boolean(bookingUrl),
  };
}

function compactDateRange(checkIn: string, checkOut: string) {
  const [inYear, inMonth, inDay] = checkIn.split("-");
  const [, outMonth, outDay] = checkOut.split("-");
  if (!inYear || !inMonth || !inDay || !outMonth || !outDay) {
    return `${checkIn} - ${checkOut}`;
  }
  return `${inYear}.${inMonth}.${inDay} - ${outMonth}.${outDay}`;
}

function buildReturnHref(
  city: string | null,
  fallback: string,
) {
  if (!city) return fallback;
  const url = new URL(fallback, "https://fukuosaka.local");
  url.searchParams.set("city", city);
  return `${url.pathname}?${url.searchParams.toString()}`;
}

function safeRelativeReturnUrl(value: string | string[] | undefined) {
  const raw = nullableString(value);
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;

  try {
    const url = new URL(raw, "https://fukuosaka.local");
    if (url.origin !== "https://fukuosaka.local") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function totalPriceLabel(value: number | null) {
  if (!value || value <= 0) return "예약 페이지에서 확인";
  return `${value.toLocaleString("ko-KR")}원`;
}

function bookingUrlDebug(url: string) {
  try {
    const params = new URL(url).searchParams;
    return {
      hasCid: params.has("cid"),
      hasHid: params.has("hid"),
      hasCheckIn: params.has("checkin"),
      hasCheckOut: params.has("checkout"),
      hasAdults: params.has("NumberofAdults"),
      hasChildren: params.has("NumberofChildren"),
      hasRooms: params.has("Rooms"),
      language: params.get("language"),
      locale: params.get("locale"),
    };
  } catch {
    return null;
  }
}

export default async function AgodaStayBridgePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${protocol}://${host}` : null;
  const state = coerceStaySearchState(resolvedSearchParams);
  const city = nullableString(resolvedSearchParams.city);
  const snapshot = snapshotFromQuery(id, resolvedSearchParams);
  const agodaStays = await fetchAgodaHotelsForStays({
    origin,
    state,
    maxResult: 20,
  });
  const liveStay = agodaStays.find((stay) => stay.id === id) ?? null;
  const stay = liveStay ?? snapshot;
  const returnUrl = safeRelativeReturnUrl(resolvedSearchParams.returnUrl);
  const backHref = returnUrl ?? buildReturnHref(city, buildStayResultsHref(state));
  const backLabel = returnUrl?.includes("planner-result.html")
    ? "결과 화면으로 돌아가기"
    : "리스트로 돌아가기";
  const bookingUrl = stay?.bookingUrl || "";
  const bookingDebug = bookingUrl ? bookingUrlDebug(bookingUrl) : null;
  const priceLabel = formatStayPriceLabel(stay?.pricePerNight ?? null);
  const fallbackVariant = state.keyword.includes("후쿠오카")
    ? "stay-fukuoka"
    : "stay-osaka";

  return (
    <main
      id="top"
      className="min-h-dvh bg-[linear-gradient(180deg,#fff8f3_0%,#fcf2eb_48%,#f6ede6_100%)] text-[#241b17]"
    >
      <div className="mx-auto min-h-dvh max-w-[430px] pb-[calc(env(safe-area-inset-bottom)+132px)]">
        <header className="sticky top-0 z-30 border-b border-[#f0e4dd] bg-[#fffaf6]/95 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <Link
              href={backHref}
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#7f6f69] shadow-[0_8px_18px_rgba(78,42,29,0.07)] ring-1 ring-[#efe3db]"
              aria-label={backLabel}
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[-0.02em] text-[#a58f86]">
                아고다 예약 전 확인
              </p>
              <h1 className="mt-0.5 text-[17px] font-black leading-[1.2] tracking-[-0.045em] text-[#241b17] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                {stay?.name ?? "아고다 숙소"}
              </h1>
            </div>
          </div>
        </header>

        <section className="px-5 pt-4">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_16px_30px_rgba(85,42,28,0.07)] ring-1 ring-[#efe3db]">
            <div className="relative h-[220px] bg-[#f4e8df]">
              {stay?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stay.imageUrl}
                  alt={stay.name}
                  className="h-full w-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Artwork variant={fallbackVariant} className="h-full w-full" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,14,11,0)_0%,rgba(26,14,11,0.36)_100%)]" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-[#cb4b42]">
                  아고다
                </span>
                <h2 className="mt-2 text-[20px] font-black leading-[1.16] tracking-[-0.045em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.16)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                  {stay?.name ?? "아고다 숙소"}
                </h2>
              </div>
            </div>

            <div className="space-y-3.5 p-4">
              <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-[#7a6862]">
                <StarIcon className="h-4 w-4 text-[#ffb627]" />
                {stay?.rating ? (
                  <span className="text-[#d45c3b]">{stay.rating}/10</span>
                ) : null}
                <span>리뷰 {stay?.reviewCount?.toLocaleString("ko-KR") ?? 0}개</span>
                {stay?.starRating ? (
                  <span className="rounded-full bg-[#fff2e7] px-2 py-0.5 text-[10px] font-black text-[#cb6b34]">
                    {stay.starRating}성급
                  </span>
                ) : null}
              </div>

              <div className="rounded-[20px] bg-[#fcf6f2] p-3.5 ring-1 ring-[#f0e4dc]">
                <p className="text-[11px] font-black tracking-[-0.03em] text-[#2a1e19]">
                  예약 조건
                </p>
                <p className="mt-1.5 text-[12px] font-semibold leading-5 text-[#6f605a]">
                  {compactDateRange(state.checkIn, state.checkOut)} · 성인 {state.adultCount} · 아동 {state.childCount} · 객실 {state.roomCount}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[18px] bg-[#fff7f3] p-3.5 ring-1 ring-[#f0ded6]">
                  <p className="text-[11px] font-semibold text-[#9f8c84]">1박 예상</p>
                  <p className="mt-1 whitespace-nowrap text-[15px] font-black tracking-[-0.045em] text-[#221c19]">
                    {priceLabel}
                  </p>
                </div>
                <div className="rounded-[18px] bg-[#fff7f3] p-3.5 ring-1 ring-[#f0ded6]">
                  <p className="text-[11px] font-semibold text-[#9f8c84]">총 예상</p>
                  <p className="mt-1 whitespace-nowrap text-[15px] font-black tracking-[-0.045em] text-[#221c19]">
                    {totalPriceLabel(stay?.totalPrice ?? null)}
                  </p>
                </div>
              </div>

              <div className="rounded-[20px] bg-white p-3.5 ring-1 ring-[#f1e6df]">
                <p className="text-[13px] font-black tracking-[-0.03em] text-[#2a1e19]">
                  아고다에서 객실을 선택하고 예약을 진행해요.
                </p>
                <p className="mt-1.5 text-[12px] leading-5 text-[#7f6f69]">
                  요금은 예약 시점과 인원 조건에 따라 달라질 수 있어요.
                </p>
              </div>

              {bookingDebug ? (
                <p className="text-[11px] leading-5 text-[#9b8780]">
                  선택한 조건으로 아고다 예약 페이지에 연결해요.
                </p>
              ) : null}

              {!bookingUrl ? (
                <div className="rounded-[22px] bg-[#fff7f3] p-4 text-center ring-1 ring-[#f0ded6]">
                  <p className="text-[13px] font-black text-[#2a1e19]">
                    예약 링크를 다시 확인해야 해요
                  </p>
                  <p className="mt-2 text-[12px] leading-6 text-[#7f6f69]">
                    숙소 리스트로 돌아가 조건을 다시 선택해주세요.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="px-5 pb-5 pt-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-[12px] font-bold text-[#8d7b73]"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {backLabel}
          </Link>
        </div>
      </div>

      {bookingUrl ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+78px)] z-40 flex justify-center px-4">
          <div className="pointer-events-auto w-full max-w-[398px] rounded-[24px] bg-white/96 p-3 shadow-[0_18px_40px_rgba(71,34,26,0.18)] ring-1 ring-[#f0dfd6] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-[#cb4b42]">
                  아고다 예상가
                </p>
                <p className="mt-0.5 truncate whitespace-nowrap text-[14px] font-black tracking-[-0.04em] text-[#2a1f1a]">
                  {priceLabel}
                </p>
              </div>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 whitespace-nowrap rounded-full bg-[#cb4b42] px-4 py-2.5 text-[12px] font-black text-white"
              >
                아고다에서 예약하기
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <BottomTabBar items={bottomTabs()} />
    </main>
  );
}
