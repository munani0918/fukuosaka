import Link from "next/link";

const themeCards = [
  {
    id: "first-time",
    href: "/themes/first-trip",
    emoji: "✈️",
    title: "첫 오사카\n여행용",
    desc: "동선 짧고 핵심 관광지 근처",
    bg: "bg-blue-50",
    border: "border-blue-100",
    accent: "text-blue-600",
  },
  {
    id: "shopping",
    href: "/themes/shopping",
    emoji: "🛍️",
    title: "쇼핑 중심\n여행용",
    desc: "신사이바시·난바 도보권 숙소",
    bg: "bg-rose-50",
    border: "border-rose-100",
    accent: "text-rose-600",
  },
  {
    id: "relaxed",
    href: "/themes/calm",
    emoji: "🛏️",
    title: "덜 피곤한\n숙소",
    desc: "넓고 조용한 쾌적 숙소 위주",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    accent: "text-emerald-600",
  },
  {
    id: "family",
    href: "/themes/family",
    emoji: "👨‍👩‍👧",
    title: "가족 /\n부모님 동반용",
    desc: "접근성 좋고 이동 부담 적은 숙소",
    bg: "bg-amber-50",
    border: "border-amber-100",
    accent: "text-amber-600",
  },
];

const areaGuides = [
  {
    id: "namba",
    name: "난바",
    nameEn: "Namba",
    desc: "도톤보리·먹거리 중심지",
    tag: "관광·맛집",
  },
  {
    id: "shinsaibashi",
    name: "신사이바시",
    nameEn: "Shinsaibashi",
    desc: "오사카 최대 쇼핑 거리",
    tag: "쇼핑",
  },
  {
    id: "umeda",
    name: "우메다",
    nameEn: "Umeda",
    desc: "JR 오사카역, 교통 허브",
    tag: "교통 편리",
  },
  {
    id: "tennoji",
    name: "덴노지",
    nameEn: "Tennoji",
    desc: "동물원·절·현지 분위기",
    tag: "조용·현지",
  },
];

const tabs = [
  { id: "home", label: "홈", href: "/", active: true },
  { id: "stay", label: "숙소", href: "/stay", active: true },
  { id: "flight", label: "항공", href: null, active: false },
  { id: "tour", label: "투어", href: null, active: false },
  { id: "my", label: "마이", href: null, active: false },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            후쿠오사카
          </span>
          <span className="text-xs text-gray-400 font-medium">Fukuosaka</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4">
        {/* 히어로 */}
        <section className="py-8">
          <h1 className="text-[1.6rem] font-bold text-gray-900 leading-tight mb-3">
            오사카 숙소, 어디에 잡아야 할지부터
            <br />
            쉽게 정리해드릴게요
          </h1>
          <p className="text-[0.95rem] text-gray-500 leading-relaxed">
            첫 여행, 쇼핑 중심, 부모님 동반,
            <br />
            너무 피곤한 숙소는 싫은 사람까지
            <br />
            여행 스타일에 맞는 오사카 숙소를 골라드려요.
          </p>
        </section>

        {/* 테마 카드 */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">
            내 여행 스타일 찾기
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {themeCards.map((card) => {
              const inner = (
                <>
                  <span className="text-2xl mb-2 block">{card.emoji}</span>
                  <p className={`text-sm font-bold ${card.accent} whitespace-pre-line leading-snug mb-1`}>
                    {card.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-snug">{card.desc}</p>
                </>
              );
              const cls = `${card.bg} ${card.border} border rounded-2xl p-4 text-left transition-transform active:scale-[0.97]`;
              return card.href ? (
                <Link key={card.id} href={card.href} className={cls}>
                  {inner}
                </Link>
              ) : (
                <div key={card.id} className={`${cls} cursor-default`}>
                  {inner}
                </div>
              );
            })}
          </div>
        </section>

        {/* 지역 가이드 */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">
            지역별 가이드
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {areaGuides.map((area) => (
              <div
                key={area.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <p className="text-base font-bold text-gray-900">{area.name}</p>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 whitespace-nowrap">
                    {area.tag}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mb-1">{area.nameEn}</p>
                <p className="text-xs text-gray-600 leading-snug">{area.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 하단 탭바 */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto flex">
          {tabs.map((tab) =>
            tab.href ? (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-gray-900"
              >
                <TabIcon id={tab.id} active />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </Link>
            ) : (
              <div
                key={tab.id}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-gray-300 cursor-default"
                aria-disabled="true"
              >
                <TabIcon id={tab.id} active={false} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                <span className="text-[8px] text-gray-300 -mt-0.5">준비중</span>
              </div>
            )
          )}
        </div>
      </nav>
    </div>
  );
}

function TabIcon({ id, active }: { id: string; active: boolean }) {
  const cls = `w-5 h-5 ${active ? "text-gray-800" : "text-gray-300"}`;
  if (id === "home") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  }
  if (id === "stay") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }
  if (id === "flight") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    );
  }
  if (id === "tour") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    );
  }
  if (id === "my") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }
  return null;
}
