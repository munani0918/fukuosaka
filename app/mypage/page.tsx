import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import type { BottomTabItem } from "@/src/data/home";

import { SavedTripsClient } from "./SavedTripsClient";

const bottomTabs: BottomTabItem[] = [
  { id: "home", label: "홈", href: "/", icon: "home" },
  { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" },
  { id: "stay", label: "숙소", href: "/stays", icon: "stay" },
  { id: "tour", label: "투어·티켓", href: "/tours", icon: "tour" },
  { id: "my", label: "마이", href: "/mypage", icon: "my", active: true },
];

export default function MyPage() {
  return (
    <main id="top" className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto min-h-dvh max-w-[430px] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_52%,#fff1ec_100%)] px-5 pb-32 pt-6 md:my-6 md:min-h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <header className="mb-5">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d95f55]">
            FUKUOSAKA
          </p>
          <h1 className="mt-2 text-[28px] font-black tracking-[-0.06em]">
            마이페이지
          </h1>
          <p className="mt-2 text-[13px] font-semibold leading-relaxed text-[#81716a]">
            저장한 여행 계획과 상품을 확인해 보세요.
          </p>
        </header>

        <SavedTripsClient />
      </div>

      <BottomTabBar items={bottomTabs} />
    </main>
  );
}
