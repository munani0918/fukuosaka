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
      className="absolute bottom-0 right-[-15px] h-[214px] w-[204px]"
    >
      <div className="absolute right-0 top-0 h-28 w-32 rounded-bl-[54px] rounded-tl-[54px] bg-[#ffe2d7]/78" />
      <div className="absolute right-5 top-4 h-16 w-16 rounded-full border-[3px] border-[#f5a190]/72" />
      <div className="absolute right-7 top-6 h-12 w-12 rounded-full border-[2px] border-[#f5a190]/60" />
      <div className="absolute right-[39px] top-4 h-16 w-[2px] rotate-45 bg-[#f5a190]/58" />
      <div className="absolute right-[39px] top-4 h-16 w-[2px] -rotate-45 bg-[#f5a190]/58" />

      <div className="absolute right-[92px] top-[58px] h-24 w-7">
        <div className="mx-auto h-4 w-3 rounded-t-full bg-[#d9a28d]" />
        <div className="h-20 w-7 border-x-[3px] border-[#c98779]" />
        <div className="absolute left-[-4px] top-10 h-[3px] w-10 bg-[#c98779]" />
      </div>

      <div className="absolute right-12 top-16 h-[76px] w-[98px]">
        <div className="absolute left-7 top-0 h-5 w-12 bg-[#805b4a] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
        <div className="absolute left-3 top-16 h-3 w-20 rounded-t-lg bg-[#7e5145]" />
        <div className="absolute left-4 top-9 h-10 w-[72px] rounded-t-[10px] border border-[#f1c7b8] bg-[#fff8ee]" />
        <div className="absolute left-1 top-8 h-5 w-[88px] bg-[#f35f56] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
        <div className="absolute left-7 top-11 h-8 w-8 rounded-t-lg border border-[#e8baaa] bg-white" />
        <div className="absolute left-[50px] top-11 h-8 w-8 rounded-t-lg border border-[#e8baaa] bg-white" />
      </div>

      <div className="absolute bottom-[26px] right-9 h-[78px] w-[116px] rotate-[-4deg] rounded-[18px] bg-[linear-gradient(135deg,#ff8a76,#f45f56)] text-white shadow-[0_18px_28px_rgba(208,92,78,0.22)]">
        <div className="absolute -left-3 top-7 h-6 w-6 rounded-full bg-[#fff8f5]" />
        <div className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-[#fff8f5]" />
        <div className="absolute right-7 top-3 h-12 border-l border-dashed border-white/65" />
        <div className="flex h-full items-center justify-center text-[38px] font-black">
          %
        </div>
      </div>

      <div className="absolute bottom-2 right-4 h-10 w-7 rounded-[8px] bg-[#f36b5f] shadow-[0_8px_14px_rgba(208,92,78,0.18)]">
        <div className="mx-auto mt-[-8px] h-3 w-4 rounded-t-full border-2 border-[#f36b5f]" />
        <div className="mx-auto mt-2 h-5 w-[2px] bg-white/38" />
      </div>
      <div className="absolute right-16 top-5 text-[18px] text-[#e6a14f]">✦</div>
      <div className="absolute right-32 top-32 text-[14px] text-[#f0b65d]">✦</div>
      <div className="absolute right-4 top-7 text-[15px] text-[#f2a9a0]">✿</div>
      <div className="absolute right-20 top-2 text-[13px] text-[#f2a9a0]">✿</div>
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
              <h2 className="mt-7 text-[31px] font-black leading-[1.14] tracking-[-0.078em] text-[#2c211d] min-[390px]:text-[32px]">
                <span className="block whitespace-nowrap">예약 전에</span>
                <span className="block whitespace-nowrap">쿠폰을 챙기세요</span>
              </h2>
              <p className="mt-5 text-[18px] font-black leading-[1.22] tracking-[-0.07em] text-[#f05f55] min-[390px]:text-[19px]">
                <span className="block whitespace-nowrap">투어·티켓</span>
                <span className="block whitespace-nowrap">해외 숙소 혜택</span>
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
