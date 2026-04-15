import Link from "next/link";
import { hotels, type Hotel, type PartnerLinks } from "@/src/data/hotels";
import { buildMylinkUrl } from "@/src/lib/myrealtrip";

const guideItems = [
  {
    condition: "공항에서 제일 안 헤매고 싶다면",
    hotel: "스위소텔 난카이 오사카",
    hotelId: "swissotel-nankai",
  },
  {
    condition: "귀국 동선까지 편하면 좋겠다면",
    hotel: "호텔 몬토레 그라스미어 오사카",
    hotelId: "hotel-monterey-grasmere",
  },
  {
    condition: "일본 감성도 챙기고 싶다면",
    hotel: "온야도 노노 난바",
    hotelId: "onyado-nono-namba",
  },
];

const badgeStyle: Record<Hotel["badgeColor"], string> = {
  sky:     "bg-sky-100 text-sky-700",
  indigo:  "bg-indigo-100 text-indigo-700",
  violet:  "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
  orange:  "bg-orange-100 text-orange-700",
};

/** 항상 3개 플랫폼을 고정 순서로 표시 */
const PLATFORMS: { key: keyof PartnerLinks; label: string; activeColor: string }[] = [
  { key: "agoda",      label: "Agoda",        activeColor: "bg-[#e31837] text-white" },
  { key: "myrealtrip", label: "마이리얼트립", activeColor: "bg-[#00b8f1] text-white" },
  { key: "tripdotcom", label: "Trip.com",     activeColor: "bg-[#003580] text-white" },
];

/** 실링크가 연결된 호텔의 마이리얼트립 버튼 라벨 override */
const MYLINK_LABEL_OVERRIDES: Record<string, string> = {
  "swissotel-nankai": "마이리얼트립 최신 가격 보기",
};

// 특정 호텔·플랫폼 버튼 URL을 서버에서만 교체하는 override map
// MYREALTRIP_MYLINK_ID는 서버에서만 읽히고 클라이언트에 노출되지 않는다.
const buildPartnerLinksOverrides = (): Record<string, Partial<PartnerLinks>> => {
  const { url: osa001MylinkUrl } = buildMylinkUrl({
    targetUrl:
      "https://accommodation.myrealtrip.com/union/products/1101376?checkIn=2026-06-28&checkOut=2026-06-29&adultCount=2&childCount=0&isDomestic=false&providerRoomId=&segment=&childAges=",
    utmContent: "OSA001-first-trip-card-myrealtrip",
  });

  return {
    "swissotel-nankai": { myrealtrip: osa001MylinkUrl },
  };
};

export default function FirstTripPage() {
  const firstTripHotels = hotels.filter((h) => h.primaryThemes.includes("첫 여행용"));

  // 서버에서 override map 생성 (렌더마다 한 번만 실행)
  const partnerLinksOverrides = buildPartnerLinksOverrides();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="홈으로"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-semibold text-gray-900">첫 오사카 여행용</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4">
        {/* 히어로 */}
        <section className="pt-7 pb-5">
          <h1 className="text-[1.45rem] font-bold text-gray-900 leading-tight mb-2.5">
            첫 오사카 자유여행이라면<br />먼저 보기 좋은 숙소
          </h1>
          <p className="text-[0.9rem] text-gray-500 leading-relaxed">
            길 찾기, 공항 이동, 중심권 접근까지 고려해<br />
            처음 가도 덜 헤매는 숙소부터 골랐어요.
          </p>
        </section>

        {/* 빠른 선택 가이드 */}
        <section className="mb-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-blue-500 mb-3 tracking-wide">빠른 선택 가이드</p>
            <ul className="flex flex-col gap-2.5">
              {guideItems.map((item) => (
                <li key={item.hotelId} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-300 mt-0.5 shrink-0">→</span>
                  <span className="text-gray-600">
                    {item.condition}{" "}
                    <span className="font-semibold text-blue-700">{item.hotel}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 정렬 기준 안내 */}
        <section className="mb-4">
          <p className="text-xs text-gray-400 leading-relaxed px-1">
            공항 접근, 중심권 이동 편의, 첫 여행 안정감을 기준으로
            먼저 보기 좋은 순서로 정리했어요.
          </p>
        </section>

        {/* 호텔 카드 리스트 */}
        <section className="pb-4">
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">
            추천 숙소 {firstTripHotels.length}개
          </p>
          <div className="flex flex-col gap-3">
            {firstTripHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* ① 콘텐츠 영역 */}
                <div className="px-5 pt-4 pb-3">

                  {/* 뱃지 + 지역 */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeStyle[hotel.badgeColor]}`}>
                      {hotel.badge}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 rounded-full px-2.5 py-1">
                      {hotel.area}
                    </span>
                  </div>

                  {/* 호텔명 */}
                  <h2 className="text-[1.05rem] font-bold text-gray-900 leading-snug mb-2">
                    {hotel.name}
                  </h2>

                  {/* 선택 이유 — 핵심 메시지 */}
                  <p className="text-[0.9rem] font-semibold text-blue-700 leading-snug mb-3">
                    {hotel.selectionReason}
                  </p>

                  {/* 추천대상 / 주의포인트 */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex gap-2.5 text-xs leading-relaxed">
                      <span className="shrink-0 font-semibold text-emerald-600 pt-[1px]">추천대상</span>
                      <span className="text-gray-600">{hotel.recommendedFor}</span>
                    </div>
                    <div className="flex gap-2.5 text-xs leading-relaxed">
                      <span className="shrink-0 font-semibold text-amber-500 pt-[1px]">주의포인트</span>
                      <span className="text-gray-500">{hotel.caution}</span>
                    </div>
                  </div>
                </div>

                {/* ② 예약 버튼 영역 — 배경색으로 구분 */}
                <div className="bg-gray-50 px-5 pt-3 pb-2 flex flex-col gap-2">

                  {/* 예약처 3개 고정 — 링크 없으면 비활성 */}
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map(({ key, label, activeColor }) => {
                      // OSA001 마이리얼트립 버튼만 mylink URL로 교체, 나머지는 원본 그대로
                      const url =
                        partnerLinksOverrides[hotel.id]?.[key] ??
                        hotel.partnerLinks?.[key];
                      const displayLabel =
                        key === "myrealtrip"
                          ? (MYLINK_LABEL_OVERRIDES[hotel.id] ?? label)
                          : label;
                      return url ? (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center h-11 rounded-xl text-xs font-bold transition-opacity active:opacity-75 ${activeColor}`}
                        >
                          {displayLabel}
                        </a>
                      ) : (
                        <span
                          key={key}
                          className="flex flex-col items-center justify-center h-11 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed"
                        >
                          <span className="text-[10px] font-semibold leading-none">{label}</span>
                          <span className="text-[9px] leading-none mt-0.5">준비중</span>
                        </span>
                      );
                    })}
                  </div>

                  {/* 자세히 보기 — 보조 CTA */}
                  {hotel.detail ? (
                    <Link
                      href={`/hotel/${hotel.detail.code}`}
                      className="w-full flex items-center justify-center gap-1 py-1 text-xs text-gray-500 font-medium hover:text-gray-700 transition-colors"
                    >
                      자세히 보기
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <button className="w-full flex items-center justify-center gap-1 py-1 text-xs text-gray-400 font-medium cursor-default" disabled>
                      자세히 보기
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
