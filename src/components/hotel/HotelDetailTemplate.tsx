import Link from "next/link";
import { type Hotel, type PartnerLinks } from "@/src/data/hotels";

// ─────────────────────────────────────────────
// 테마별 뒤로가기 경로
// ─────────────────────────────────────────────

const THEME_BACK: Record<string, { href: string; label: string }> = {
  "첫 여행용":        { href: "/themes/first-trip", label: "첫 오사카 여행용 목록으로" },
  "쇼핑 중심":        { href: "/themes/shopping",   label: "쇼핑 중심 목록으로" },
  "덜 피곤한 숙소":   { href: "/themes/calm",        label: "덜 피곤한 숙소 목록으로" },
  "가족·부모님 동반": { href: "/themes/family",      label: "가족·부모님 동반 목록으로" },
};

// ─────────────────────────────────────────────
// 예약 버튼
// ─────────────────────────────────────────────

const PLATFORMS: {
  key: keyof PartnerLinks;
  label: string;
  color: string;
}[] = [
  { key: "agoda",      label: "Agoda에서 보기",        color: "bg-[#e31837] text-white" },
  { key: "myrealtrip", label: "마이리얼트립 최신 가격 보기", color: "bg-[#00b8f1] text-white" },
  { key: "tripdotcom", label: "Trip.com에서 보기",      color: "bg-[#003580] text-white" },
];

function BookingButtons({ partnerLinks }: { partnerLinks?: PartnerLinks }) {
  return (
    <div className="flex flex-col gap-2">
      {PLATFORMS.map(({ key, label, color }) => {
        const url = partnerLinks?.[key] ?? "#";
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center h-12 rounded-xl text-sm font-bold transition-opacity active:opacity-80 ${color}`}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="text-center text-[11px] text-gray-400 mt-2.5 leading-relaxed">
      실제 가격과 취소 조건은 예약처에서 최종 확인하세요.
    </p>
  );
}

// ─────────────────────────────────────────────
// 섹션 래퍼
// ─────────────────────────────────────────────

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="text-[0.95rem] font-bold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────
// 메인 템플릿
// ─────────────────────────────────────────────

export default function HotelDetailTemplate({ hotel }: { hotel: Hotel }) {
  if (!hotel.detail) return null;
  const detail = hotel.detail;
  const back = THEME_BACK[hotel.primaryThemes[0]] ?? { href: "/", label: "목록으로" };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* 헤더 */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href={back.href}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="목록으로"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-semibold text-gray-900 truncate">{hotel.name}</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6">

        {/* ① 뱃지 + 지역 + 호텔명 + 핵심 한 줄 */}
        <section className="mb-4">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {detail.badges.map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-700"
              >
                {badge}
              </span>
            ))}
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
              {hotel.area}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-snug mb-2">{hotel.name}</h1>
          <p className="text-[0.95rem] font-semibold text-blue-700 leading-snug">{detail.summary}</p>
        </section>

        {/* ② 상단 예약 버튼 */}
        <section className="mb-2">
          <BookingButtons partnerLinks={hotel.partnerLinks} />
          <Disclaimer />
        </section>

        {/* ③ 한눈에 보기 */}
        <section className="mb-6 mt-8">
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">한눈에 보기</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              {[
                { label: "추천", value: detail.quickSummary.recommendation },
                { label: "강점", value: detail.quickSummary.strength },
                { label: "주의", value: detail.quickSummary.caution },
                { label: "성격", value: detail.quickSummary.character },
              ].map(({ label, value }) => (
                <div key={label} className="contents">
                  <dt className="text-xs font-semibold text-gray-400 whitespace-nowrap pt-[1px]">{label}</dt>
                  <dd className="text-xs text-gray-700 leading-relaxed">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="flex flex-col gap-0">

          {/* ④ 왜 먼저 보라고 추천하나요? */}
          <SectionBlock title="왜 먼저 보라고 추천하나요?">
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm flex flex-col gap-3">
              {detail.whyRecommended.map((para, i) => (
                <p key={i} className="text-sm text-gray-700 leading-relaxed">{para}</p>
              ))}
            </div>
          </SectionBlock>

          {/* ⑤ 이런 여행자에게 잘 맞아요 */}
          <SectionBlock title="이런 여행자에게 잘 맞아요">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 shadow-sm">
              <ul className="flex flex-col gap-2.5">
                {detail.goodFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionBlock>

          {/* ⑥ 이런 경우엔 다른 선택지가 더 나을 수 있어요 */}
          <SectionBlock title="이런 경우엔 다른 선택지가 더 나을 수 있어요">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 shadow-sm">
              <ul className="flex flex-col gap-2.5">
                {detail.notBestFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="text-amber-400 mt-0.5 shrink-0">△</span>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionBlock>

          {/* ⑦ 핵심 요약 */}
          <SectionBlock title="핵심 요약">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                <p className="text-xs font-bold text-emerald-600 mb-2.5 tracking-wide">장점</p>
                <ul className="flex flex-col gap-2">
                  {detail.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                      <span className="text-gray-700 leading-relaxed">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-5 pt-3 pb-4">
                <p className="text-xs font-bold text-amber-500 mb-2.5 tracking-wide">주의포인트</p>
                <ul className="flex flex-col gap-2">
                  {detail.cons.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="text-amber-400 shrink-0 mt-0.5">△</span>
                      <span className="text-gray-500 leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionBlock>

          {/* ⑧ 왜 이 지역에서 이 호텔이 강한가요? */}
          <SectionBlock title={`왜 ${hotel.area}에서 이 호텔이 강한가요?`}>
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm flex flex-col gap-3">
              {detail.areaContext.map((para, i) => (
                <p key={i} className="text-sm text-gray-700 leading-relaxed">{para}</p>
              ))}
            </div>
          </SectionBlock>

          {/* ⑨ 후쿠오사카 한 줄 판단 */}
          <section className="mb-8">
            <div className="bg-gray-900 rounded-2xl px-5 py-5">
              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">
                후쿠오사카 한 줄 판단
              </p>
              <p className="text-[0.95rem] font-semibold text-white leading-relaxed">
                {detail.hukosakaVerdict}
              </p>
            </div>
          </section>

          {/* ⑩ 하단 예약 버튼 */}
          <section className="mb-4">
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">예약처 바로가기</p>
            <BookingButtons partnerLinks={hotel.partnerLinks} />
            <Disclaimer />
          </section>

          {/* 목록으로 */}
          <div className="flex justify-center pt-2 pb-4">
            <Link
              href={back.href}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {back.label}
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
