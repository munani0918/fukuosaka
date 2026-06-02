import Link from "next/link";

import { ArrowRightIcon } from "@/src/components/home/icons";
import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import type { BottomTabItem } from "@/src/data/home";
import { myrealtripCouponLinks } from "@/src/data/benefits";

const bottomTabs: BottomTabItem[] = [
  { id: "home", label: "홈", href: "/", icon: "home" },
  { id: "planner", label: "예산플래너", href: "/planner-wizard.html", icon: "planner" },
  { id: "stay", label: "숙소", href: "/stays", icon: "stay" },
  { id: "tour", label: "투어·티켓", href: "/tours", icon: "tour" },
  { id: "my", label: "마이", href: "/mypage", icon: "my" },
];

const couponCards = [
  {
    id: "tour-ticket",
    title: "투어·티켓 쿠폰팩",
    subtitle: "선착순 할인쿠폰",
    description: "입장권·교통패스·현지투어 예약 전 추천",
    cta: "투어·티켓 쿠폰팩 받기",
    href: myrealtripCouponLinks.tourTicket,
    icon: "%",
  },
  {
    id: "overseas-stay",
    title: "해외 숙소 쿠폰팩",
    subtitle: "선착순 할인쿠폰",
    description: "숙소 예약 전 먼저 받아두세요",
    cta: "해외 숙소 쿠폰팩 받기",
    href: myrealtripCouponLinks.overseasStay,
    icon: "▥",
  },
];

const steps = [
  {
    title: "쿠폰팩 받기",
    description: "원하는 쿠폰팩 버튼을 눌러 이동해요.",
  },
  {
    title: "로그인 후 다운로드",
    description: "마이리얼트립 로그인 후 쿠폰을 다운로드해요.",
  },
  {
    title: "결제 단계에서 쿠폰 적용",
    description: "사용 가능한 쿠폰을 선택해 할인받아요.",
  },
];

export default function MyRealTripCouponPage() {
  return (
    <main id="top" className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto min-h-dvh max-w-[430px] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_50%,#fff1ec_100%)] pb-[calc(env(safe-area-inset-bottom)+116px)] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <header className="sticky top-0 z-20 border-b border-[#f0e0d8] bg-white/90 px-5 pt-[calc(env(safe-area-inset-top)+10px)] backdrop-blur-xl">
          <div className="flex h-14 items-center justify-center">
            <Link
              href="/"
              aria-label="홈으로 돌아가기"
              className="absolute left-5 flex h-10 w-10 items-center justify-center rounded-full text-[29px] font-light leading-none text-[#3b2118] transition active:scale-[0.98]"
            >
              ‹
            </Link>
            <h1 className="text-[19px] font-black tracking-[-0.055em]">
              마이리얼트립 쿠폰팩
            </h1>
          </div>
        </header>

        <div className="space-y-4 px-5 pt-5">
          <section className="relative overflow-hidden rounded-[30px] border border-[#f3d6c9] bg-[radial-gradient(circle_at_82%_22%,#ffe0d5_0%,transparent_34%),linear-gradient(135deg,#fff7f0_0%,#fffdf9_48%,#ffe8de_100%)] p-5 shadow-[0_18px_42px_rgba(126,74,61,0.1)]">
            <div
              aria-hidden="true"
              className="absolute -right-10 top-16 h-32 w-32 rounded-full bg-[#ffc4b4]/40"
            />
            <div
              aria-hidden="true"
              className="absolute right-6 top-16 h-24 w-20 rotate-[7deg] rounded-[18px] border-2 border-dashed border-white/80 bg-[#f26b61] text-center text-[13px] font-black uppercase tracking-[0.08em] text-white shadow-[0_18px_28px_rgba(205,91,78,0.16)]"
            >
              <div className="pt-6">Coupon</div>
              <div className="mt-1 text-[25px]">%</div>
            </div>
            <div
              aria-hidden="true"
              className="absolute right-20 top-9 text-[21px] text-[#e5a349]"
            >
              ✦
            </div>
            <div
              aria-hidden="true"
              className="absolute right-36 top-24 text-[15px] text-[#efb35a]"
            >
              ✦
            </div>

            <div className="relative z-10 max-w-[72%]">
              <span className="inline-flex rounded-full bg-[#f45f56] px-3 py-1.5 text-[11.5px] font-black tracking-[-0.04em] text-white shadow-[0_10px_20px_rgba(244,95,86,0.2)]">
                후쿠오사카 전용 혜택
              </span>
              <h2 className="mt-5 text-[30px] font-black leading-[1.18] tracking-[-0.07em]">
                예약 전에
                <br />
                쿠폰을 챙기세요
              </h2>
              <p className="mt-4 text-[16px] font-black tracking-[-0.055em] text-[#3d2921]">
                투어·티켓 / 해외 숙소 혜택
              </p>
              <p className="mt-2.5 text-[13px] font-semibold leading-relaxed tracking-[-0.035em] text-[#7b675f]">
                여행 예약 전에 받을 수 있는 쿠폰팩을 모아뒀어요.
              </p>
            </div>
          </section>

          <section className="rounded-[26px] border border-[#f1d3c7] bg-white/90 p-4.5 shadow-[0_16px_32px_rgba(126,74,61,0.08)]">
            <div className="flex gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#ffb69f,#f35f56)] text-[26px] font-black text-white shadow-[0_12px_24px_rgba(211,92,77,0.16)]">
                ✓
              </div>
              <p className="text-[18px] font-black leading-[1.46] tracking-[-0.06em]">
                마이리얼트립 공식홈페이지에는 없는
                <br />
                <span className="text-[#ee5f56]">파트너 전용 쿠폰팩</span>으로
                <br />
                <span className="text-[#ee5f56]">후쿠오사카</span>에서 받으실 수 있어요.
              </p>
            </div>
          </section>

          <section className="grid gap-3.5">
            {couponCards.map((card) => (
              <article
                key={card.id}
                className="rounded-[26px] border border-[#f0d7cb] bg-white/92 p-4 shadow-[0_16px_30px_rgba(126,74,61,0.07)]"
              >
                <div className="flex gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fff0e9] text-[25px] font-black text-[#ef6b5d]">
                    {card.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[19px] font-black tracking-[-0.055em]">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-[13.5px] font-black tracking-[-0.04em] text-[#e56559]">
                      {card.subtitle}
                    </p>
                    <p className="mt-3 rounded-[17px] border border-[#f5cdbf] bg-[#fff8f4] px-3.5 py-3 text-[13.5px] font-semibold leading-relaxed tracking-[-0.035em] text-[#5c473f]">
                      {card.description}
                    </p>
                  </div>
                </div>
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#f26056] px-4 py-3.5 text-[15px] font-black tracking-[-0.045em] text-white shadow-[0_14px_24px_rgba(213,91,78,0.18)] transition active:scale-[0.99]"
                >
                  {card.cta}
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
              </article>
            ))}
          </section>

          <section className="rounded-[26px] bg-white/74 p-4.5">
            <h2 className="text-center text-[21px] font-black tracking-[-0.06em]">
              쿠폰팩 사용 방법
            </h2>
            <div className="mt-4 grid gap-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-3 rounded-[21px] border border-[#f1dfd6] bg-white px-4 py-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0e9] text-[15px] font-black text-[#e95f55]">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-[15.5px] font-black tracking-[-0.045em]">
                      {step.title}
                    </p>
                    <p className="mt-1.5 text-[13.5px] font-semibold leading-[1.7] tracking-[-0.035em] text-[#76675f]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#f0d9cd] bg-[#fff8f1] p-4.5">
            <h2 className="text-[15px] font-black tracking-[-0.045em] text-[#4a3027]">
              유의사항
            </h2>
            <ul className="mt-3 space-y-2.5 text-[13.5px] font-semibold leading-[1.75] tracking-[-0.035em] text-[#7a655d]">
              <li>로그인이 안 되어 있으면 로그인 화면이 먼저 보일 수 있어요.</li>
              <li>
                쿠폰 사용 조건, 할인 금액, 적용 가능 상품은 마이리얼트립 페이지
                기준으로 달라질 수 있어요.
              </li>
            </ul>
          </section>
        </div>
      </div>

      <BottomTabBar items={bottomTabs} />
    </main>
  );
}
