import Link from "next/link";
import { notFound } from "next/navigation";

import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import { PlannerEntryButton } from "@/src/components/home/PlannerEntryButton";
import { budgetTemplates, findBudgetTemplate } from "@/src/data/budgetTemplates";

export function generateStaticParams() {
  return budgetTemplates.map((template) => ({ slug: template.slug }));
}

function bottomTabs() {
  return [
    { id: "home", label: "홈", href: "/", icon: "home" as const },
    { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" as const },
    { id: "stay", label: "숙소", href: "/stays", icon: "stay" as const },
    { id: "tour", label: "투어", href: "/tours", icon: "tour" as const },
    { id: "my", label: "MY", href: "/mypage", icon: "my" as const },
  ];
}

export default async function BudgetPlanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = findBudgetTemplate(slug);
  if (!template) notFound();

  return (
    <main
      id="top"
      className="min-h-dvh bg-[linear-gradient(180deg,#fff8f3_0%,#fcf2eb_48%,#f6ede6_100%)] text-[#241b17]"
    >
      <div className="mx-auto min-h-dvh max-w-[430px] pb-[calc(env(safe-area-inset-bottom)+104px)]">
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
            <div>
              <p className="text-[11px] font-semibold tracking-[-0.02em] text-[#a58f86]">
                SAMPLE BUDGET PLAN
              </p>
              <h1 className="text-[21px] font-black tracking-[-0.05em] text-[#241b17]">
                {template.title}
              </h1>
            </div>
          </div>
        </header>

        <section className="px-5 pt-5">
          <div className="rounded-[28px] border border-[#f0ded5] bg-white p-5 shadow-[0_18px_34px_rgba(94,45,31,0.07)]">
            <div className="flex flex-wrap gap-1.5">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#fff0eb] px-2.5 py-1 text-[10px] font-black text-[#ef625d]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="mt-4 text-[28px] font-black leading-[1.05] tracking-[-0.07em] text-[#2c211d]">
              {template.title}
            </h2>
            <p className="mt-2 text-[16px] font-black text-[#f05f5b]">
              {template.budgetLabel} · {template.duration}
            </p>
            <p className="mt-3 text-[13px] font-semibold leading-6 tracking-[-0.03em] text-[#7d6b64]">
              {template.shortDescription}
            </p>
          </div>
        </section>

        <section className="mt-5 px-5">
          <div className="rounded-[24px] bg-white/88 p-4 ring-1 ring-[#f0e2da]">
            <h3 className="text-[17px] font-black tracking-[-0.05em] text-[#2c211d]">
              간단한 예산 구성
            </h3>
            <div className="mt-3 space-y-2">
              {template.budgetBreakdown.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-[16px] bg-[#fff8f4] px-3 py-2.5 text-[13px]"
                >
                  <span className="font-bold text-[#806d66]">{item.label}</span>
                  <span className="font-black text-[#2c211d]">{item.amount}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-[16px] bg-[#fff3ee] px-3 py-2.5 text-[11.5px] font-semibold leading-5 tracking-[-0.03em] text-[#8a746b]">
              이 플랜은 항공·숙소·티켓 중심의 예약 예산 샘플입니다. 식비·교통·쇼핑 등 현지 사용비는 별도로 준비하는 것을 추천해요.
            </p>
          </div>
        </section>

        <section className="mt-5 px-5">
          <div className="rounded-[24px] bg-white/88 p-4 ring-1 ring-[#f0e2da]">
            <h3 className="text-[17px] font-black tracking-[-0.05em] text-[#2c211d]">
              일정 뼈대
            </h3>
            <div className="mt-3 space-y-2">
              {template.itinerarySummary.map((line) => (
                <p
                  key={line}
                  className="rounded-[16px] bg-[#fff8f4] px-3 py-2.5 text-[12.5px] font-semibold leading-5 text-[#7d6b64]"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pt-5">
          <PlannerEntryButton
            source={`sample-${template.slug}`}
            budgetPresetId={template.budgetPreset}
            presetBudget={template.defaultBudgetPerPerson}
            nights={template.nights}
            packageType={template.packageType}
            nearbyMode={template.nearbyMode}
            cityCode={template.cityCode}
            styles={template.styles}
            templateTitle={template.title}
            routeStyle={template.routeStyle}
            planType={template.planType}
            recommendedExtras={template.recommendedExtras}
            nearbyTrip={template.nearbyTrip}
            className="flex h-[54px] w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#ff6e65_0%,#f4514f_100%)] text-[15px] font-black text-white shadow-[0_14px_24px_rgba(244,89,85,0.22)]"
          >
            이 플랜으로 내 날짜에 맞춰보기
          </PlannerEntryButton>
        </section>
      </div>

      <BottomTabBar items={bottomTabs()} />
    </main>
  );
}
