import Link from "next/link";

import { BedIcon, TicketIcon, UserIcon } from "@/src/components/home/icons";
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
    description: "인기 투어·티켓에 사용 가능한 할인쿠폰",
    cta: "쿠폰팩 다운로드",
    href: myrealtripCouponLinks.tourTicket,
    icon: <TicketIcon className="h-8 w-8" />,
  },
  {
    id: "overseas-stay",
    title: "해외 숙소 쿠폰팩",
    subtitle: "선착순 할인쿠폰",
    description: "해외 숙소 예약에 사용 가능한 할인쿠폰",
    cta: "쿠폰팩 다운로드",
    href: myrealtripCouponLinks.overseasStay,
    icon: <BedIcon className="h-8 w-8" />,
  },
];

const steps = [
  {
    title: "쿠폰팩 받기",
    icon: <TicketIcon className="h-8 w-8" />,
  },
  {
    title: "로그인 후 다운로드",
    icon: <UserIcon className="h-8 w-8" />,
  },
  {
    title: "결제 단계 쿠폰 적용",
    icon: <span className="text-[29px] font-black leading-none">%</span>,
  },
];

function HeroTravelIllustration() {
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-0 right-[-18px] h-[214px] w-[196px]"
    >
      <div className="absolute right-0 top-2 h-32 w-36 rounded-bl-[58px] rounded-tl-[58px] bg-[#ffe0d5]/80" />
      <div className="absolute right-10 top-9 h-28 w-28 rounded-full bg-[#fff2ea]/75" />
      <div className="absolute right-4 top-24 h-16 w-28 rounded-full bg-[#ffd8ce]/45 blur-xl" />

      <div className="absolute right-[54px] top-[34px] h-[58px] w-[96px] rotate-[-10deg] rounded-[16px] border border-[#f7beb0] bg-[#fff8f0] shadow-[0_12px_22px_rgba(210,100,82,0.12)]">
        <div className="absolute -left-2 top-[22px] h-4 w-4 rounded-full bg-[#ffe8dd]" />
        <div className="absolute -right-2 top-[22px] h-4 w-4 rounded-full bg-[#ffe8dd]" />
        <div className="absolute right-5 top-2 h-10 border-l border-dashed border-[#f3a898]" />
        <div className="absolute left-4 top-4 text-[10px] font-black tracking-[0.14em] text-[#f06b61]">
          COUPON
        </div>
      </div>

      <div className="absolute bottom-[50px] right-[54px] h-[78px] w-[122px] rotate-[5deg] rounded-[18px] bg-[#ffd7cb] shadow-[0_18px_28px_rgba(208,92,78,0.13)]">
        <div className="absolute -left-3 top-7 h-6 w-6 rounded-full bg-[#fff8f5]" />
        <div className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-[#fff8f5]" />
        <div className="absolute right-7 top-3 h-12 border-l border-dashed border-white/75" />
        <div className="absolute left-5 top-5 h-3 w-12 rounded-full bg-white/55" />
        <div className="absolute left-5 top-10 h-2 w-9 rounded-full bg-white/45" />
      </div>

      <div className="absolute bottom-[22px] right-8 h-[82px] w-[124px] rotate-[-5deg] rounded-[19px] bg-[linear-gradient(135deg,#ff8a76,#f45f56)] text-white shadow-[0_18px_28px_rgba(208,92,78,0.22)]">
        <div className="absolute -left-3 top-7 h-6 w-6 rounded-full bg-[#fff8f5]" />
        <div className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-[#fff8f5]" />
        <div className="absolute right-7 top-3 h-12 border-l border-dashed border-white/70" />
        <div className="absolute left-4 top-3 text-[9px] font-black tracking-[0.16em] text-white/78">
          COUPON
        </div>
        <div className="flex h-full items-center justify-center pt-2 text-[42px] font-black">
          %
        </div>
      </div>

      <div className="absolute right-[122px] top-[108px] flex h-[42px] w-[42px] rotate-[-12deg] items-center justify-center rounded-full border border-[#f3b6a9] bg-white/88 text-[10px] font-black tracking-[-0.04em] text-[#ef6258] shadow-[0_10px_18px_rgba(126,74,61,0.08)]">
        SALE
      </div>

      <div className="absolute bottom-[14px] right-[132px] h-11 w-9 rotate-[10deg] rounded-[11px] border border-[#f5b5a8] bg-[#fff6ef] shadow-[0_10px_18px_rgba(208,92,78,0.11)]">
        <div className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full border border-[#f06b61]" />
        <div className="absolute bottom-2 left-2 right-2 h-2 rounded-full bg-[#f06b61]/70" />
      </div>

      <div className="absolute right-16 top-5 text-[18px] text-[#e6a14f]">✦</div>
      <div className="absolute right-[136px] top-28 text-[14px] text-[#f0b65d]">✦</div>
      <div className="absolute right-6 top-8 text-[15px] text-[#f2a9a0]">✦</div>
      <div className="absolute right-24 top-1 text-[13px] text-[#f2a9a0]">✦</div>
    </div>
  );
}

export default function MyRealTripCouponPage() {
  return (
    <main id="top" className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto min-h-dvh max-w-[430px] bg-[linear-gradient(180deg,#fffdfb_0%,#fff8f4_50%,#fff1ec_100%)] pb-[calc(env(safe-area-inset-bottom)+116px)] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <header className="sticky top-0 z-20 border-b border-[#f0e0d8] bg-white/92 px-5 pt-[calc(env(safe-area-inset-top)+10px)] backdrop-blur-xl">
          <div className="flex h-14 items-center justify-center">
            <Link
              href="/"
              aria-label="홈으로 돌아가기"
              className="absolute left-5 flex h-10 w-10 items-center justify-center rounded-full text-[31px] font-light leading-none text-[#2c211d] transition active:scale-[0.98]"
            >
              ‹
            </Link>
            <h1 className="text-[20px] font-black tracking-[-0.055em]">
              마이리얼트립 쿠폰팩
            </h1>
          </div>
        </header>

        <div className="space-y-5 px-4 pt-5">
          <section className="relative min-h-[286px] overflow-hidden rounded-[30px] border border-[#f2d4c8] bg-[linear-gradient(135deg,#fffaf5_0%,#fff6ee_46%,#ffe7dc_100%)] p-5 shadow-[0_18px_42px_rgba(126,74,61,0.09)]">
            <HeroTravelIllustration />

            <div className="relative z-10 max-w-[68%]">
              <span className="inline-flex whitespace-nowrap rounded-full bg-[#f45f56] px-3 py-1.5 text-[11.5px] font-black tracking-[-0.04em] text-white shadow-[0_10px_20px_rgba(244,95,86,0.18)]">
                ✿ 후쿠오사카 전용 혜택
              </span>
              <h2 className="mt-7 text-[25px] font-black leading-[1.18] tracking-[-0.072em] text-[#2c211d] min-[390px]:text-[26px]">
                <span className="block whitespace-nowrap">결제 전 필수 확인!</span>
                <span className="block whitespace-nowrap">
                  <span className="text-[#ef5f55]">할인 쿠폰</span> 챙기셨나요?
                </span>
              </h2>
              <p className="mt-5 text-[16px] font-black leading-[1.28] tracking-[-0.062em] text-[#f05f55] min-[390px]:text-[17px]">
                <span className="block whitespace-nowrap">투어·티켓 할인부터</span>
                <span className="block whitespace-nowrap">해외 숙소까지 알뜰하게!</span>
              </p>
            </div>
          </section>

          <section className="rounded-[21px] border border-[#f0d4c8] bg-white/82 px-3.5 py-3 shadow-[0_12px_24px_rgba(126,74,61,0.05)]">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f26056] text-[15px] font-black text-white">
                ✓
              </div>
              <p className="min-w-0 text-[11.4px] font-semibold leading-[1.62] tracking-[-0.075em] text-[#3f302b] min-[390px]:text-[11.8px]">
                <span className="block whitespace-nowrap">
                  마이리얼트립 공식홈페이지에는 없는{" "}
                  <span className="font-black text-[#ef5f55]">
                    파트너 전용 쿠폰팩
                  </span>
                  으로
                </span>
                <span className="block whitespace-nowrap">
                  <span className="font-black text-[#ef5f55]">후쿠오사카</span>
                  에서 받으실 수 있어요.
                </span>
              </p>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            {couponCards.map((card) => (
              <article
                key={card.id}
                className="flex min-h-[278px] flex-col rounded-[25px] border border-[#efd8ce] bg-white/94 p-3.5 text-center shadow-[0_16px_32px_rgba(126,74,61,0.07)]"
              >
                <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#fff0e9] text-[#ef665b]">
                  {card.icon}
                </div>
                <h3 className="mt-4 whitespace-nowrap text-[15.5px] font-black leading-snug tracking-[-0.07em] min-[390px]:text-[16px]">
                  {card.title}
                </h3>
                <span className="mx-auto mt-2 inline-flex whitespace-nowrap rounded-full bg-[#fff0e9] px-2.5 py-1 text-[11px] font-black tracking-[-0.045em] text-[#ec6258]">
                  {card.subtitle}
                </span>
                <p className="mt-3 min-h-[44px] text-[12.5px] font-semibold leading-[1.62] tracking-[-0.045em] text-[#5d514c] min-[390px]:text-[13px]">
                  {card.description}
                </p>
                <div className="mt-auto pt-5">
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[50px] w-full items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#ff7466,#f25049)] px-2.5 py-3 text-center text-[13px] font-black leading-snug tracking-[-0.045em] text-white shadow-[0_14px_24px_rgba(213,91,78,0.18)] transition active:scale-[0.99] min-[390px]:text-[13.5px]"
                  >
                    {card.cta}
                  </a>
                </div>
              </article>
            ))}
          </section>

          <section className="pt-5">
            <h2 className="text-center text-[23px] font-black tracking-[-0.06em]">
              쿠폰팩 사용 방법
            </h2>
            <div className="relative mt-5 grid grid-cols-3 gap-2">
              <div
                aria-hidden="true"
                className="absolute left-[18%] right-[18%] top-[43px] hidden border-t-4 border-dotted border-[#f2d5c7] min-[370px]:block"
              />
              {steps.map((step, index) => (
                <div key={step.title} className="relative z-10 text-center">
                  <div className="relative mx-auto flex h-[86px] w-[86px] items-center justify-center rounded-full border border-[#f2d7cb] bg-[#fffaf6] text-[#6f5549] shadow-[0_10px_20px_rgba(126,74,61,0.04)]">
                    <span className="absolute -top-2 right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#f26056] text-[15px] font-black text-white">
                      {index + 1}
                    </span>
                    <span className="text-[#6a5147]">{step.icon}</span>
                  </div>
                  <p className="mt-3 text-[12.2px] font-black leading-snug tracking-[-0.055em] text-[#2f241f] min-[390px]:text-[12.7px]">
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[22px] border border-[#f0d9cd] bg-[#fff9f3] px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dfb98d] text-[16px] font-black text-white">
                i
              </div>
              <p className="text-[13px] font-semibold leading-[1.58] tracking-[-0.04em] text-[#57463f]">
                로그인이 안 되어 있으면 로그인 화면이 먼저 보일 수 있어요.
              </p>
            </div>
          </section>
        </div>
      </div>

      <BottomTabBar items={bottomTabs} />
    </main>
  );
}
