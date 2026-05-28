import Link from "next/link";

import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import type { BottomTabItem } from "@/src/data/home";

const bottomTabs: BottomTabItem[] = [
  { id: "home", label: "홈", href: "/", icon: "home" },
  { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" },
  { id: "stay", label: "숙소", href: "/stays", icon: "stay" },
  { id: "tour", label: "투어·티켓", href: "/tours", icon: "tour" },
  { id: "my", label: "마이", href: "/mypage", icon: "my" },
];

export default function AccountPage() {
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
        </header>

        <section className="mt-8 rounded-[30px] border border-[#f0ded6] bg-white/86 p-5 shadow-[0_18px_42px_rgba(126,74,61,0.08)]">
          <div className="mb-4 inline-flex rounded-full bg-[#fff2ed] px-3 py-1 text-[11px] font-black text-[#d95f55]">
            준비 중
          </div>
          <h2 className="text-[22px] font-black leading-tight tracking-[-0.055em]">
            SNS 로그인 기능을 준비 중이에요.
          </h2>
          <p className="mt-3 text-[14px] font-semibold leading-relaxed text-[#76675f]">
            현재 저장한 여행은 이 브라우저에 보관됩니다. 로그인 기능이 추가되면
            다른 기기에서도 저장한 여행을 이어서 볼 수 있게 확장할 예정이에요.
          </p>
          <Link
            href="/mypage"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#f26b61] px-5 py-3 text-[14px] font-black text-white shadow-[0_12px_24px_rgba(214,95,85,0.18)] transition active:scale-[0.99]"
          >
            여행 보관함 보기
          </Link>
        </section>
      </div>

      <BottomTabBar items={bottomTabs} />
    </main>
  );
}
