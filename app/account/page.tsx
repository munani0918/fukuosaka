import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import { PolicyLinks } from "@/src/components/PolicyLinks";
import type { BottomTabItem } from "@/src/data/home";

import { AccountClient } from "./AccountClient";

const bottomTabs: BottomTabItem[] = [
  { id: "home", label: "홈", href: "/", icon: "home" },
  { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" },
  { id: "stay", label: "숙소", href: "/stays", icon: "stay" },
  { id: "tour", label: "투어·티켓", href: "/tours", icon: "tour" },
  { id: "my", label: "마이", href: "/mypage", icon: "my" },
];

type AccountPageProps = {
  searchParams: Promise<{
    login?: string;
    error?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;

  return (
    <main id="top" className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_54%,#fff1ec_100%)] px-5 pb-32 pt-[calc(env(safe-area-inset-top)+24px)] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <header>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d95f55]">
            FUKUOSAKA
          </p>
          <h1 className="mt-2 text-[30px] font-black tracking-[-0.06em]">
            계정
          </h1>
          <p className="mt-2 text-[13px] font-semibold leading-relaxed text-[#81716a]">
            로그인하고 여행 계획을 더 편하게 관리할 수 있어요.
          </p>
        </header>

        <AccountClient loginStatus={params.login} error={params.error} />

        <div className="mt-auto pt-8">
          <PolicyLinks />
        </div>
      </div>

      <BottomTabBar items={bottomTabs} />
    </main>
  );
}
