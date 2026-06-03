import Link from "next/link";

import { PolicyLinks } from "@/src/components/PolicyLinks";

const sections = [
  {
    title: "1. 서비스 목적",
    body: "후쿠오사카는 후쿠오카·오사카 여행을 준비하는 사용자가 예산, 일정, 항공권, 숙소, 투어·티켓 정보를 한 번에 비교하고 확인할 수 있도록 돕는 여행 정보 서비스입니다.",
  },
  {
    title: "2. 제공 기능",
    body: "후쿠오사카는 여행 예산 플래너, 일정 뼈대 추천, 항공·숙소·투어·티켓 정보, 쿠폰팩 안내, 저장한 여행 및 찜한 상품 관리 기능을 제공합니다. 일부 저장 기능은 현재 브라우저 저장소를 기반으로 동작할 수 있습니다.",
  },
  {
    title: "3. 외부 제휴 플랫폼 연결",
    body: "후쿠오사카에서 제공하는 항공권, 숙소, 투어·티켓, eSIM 등 상품 정보는 마이리얼트립, 아고다 등 외부 제휴 플랫폼의 상품 페이지로 연결될 수 있습니다. 실제 예약, 결제, 변경, 취소, 환불은 각 제휴 플랫폼 및 판매자의 약관과 정책을 따릅니다.",
  },
  {
    title: "4. 제휴 및 수수료 고지",
    body: "후쿠오사카는 마이리얼트립, 아고다 등 제휴사 링크를 통해 항공권, 숙소, 투어·티켓 등 여행 상품 정보를 제공할 수 있습니다.\n\n사용자가 후쿠오사카 내 일부 제휴 링크를 통해 외부 제휴 플랫폼에서 예약 또는 구매를 진행하는 경우, 후쿠오사카는 해당 제휴사로부터 수수료를 지급받습니다.\n\n이 제휴 수수료는 사용자가 부담하는 상품 가격에 별도로 추가되지 않으며, 실제 상품 가격, 예약 조건, 취소·환불 정책은 각 제휴 플랫폼 및 판매자의 기준을 따릅니다.",
  },
  {
    title: "5. 사용자의 의무",
    body: "사용자는 본 서비스를 부정한 목적으로 이용하거나, 타인의 정보를 도용하거나, 서비스 운영을 방해하는 행위를 해서는 안 됩니다.",
  },
  {
    title: "6. 서비스 변경 및 중단",
    body: "후쿠오사카는 서비스 개선, 제휴사 정책 변경, 시스템 점검 등의 사유로 서비스의 일부 또는 전체를 변경하거나 일시 중단할 수 있습니다.",
  },
  {
    title: "7. 면책",
    body: "후쿠오사카는 여행 계획 수립을 돕는 정보 제공 서비스이며, 외부 플랫폼에서 제공되는 상품의 가격, 재고, 예약 가능 여부, 취소·환불 조건을 직접 보장하지 않습니다. 사용자는 예약 전 외부 플랫폼의 최종 조건을 확인해야 합니다.",
  },
  {
    title: "8. 문의",
    body: "서비스 관련 문의는 서비스 내 문의 채널 또는 운영자 연락처를 통해 접수할 수 있습니다. 정식 문의처는 서비스 운영 단계에 맞춰 업데이트될 수 있습니다.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto min-h-dvh max-w-[430px] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_55%,#fff1ec_100%)] px-5 pb-16 pt-[calc(env(safe-area-inset-top)+18px)] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <header className="flex items-center justify-between">
          <Link
            href="/account"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[28px] leading-none text-[#2c211d] shadow-[0_8px_18px_rgba(126,74,61,0.06)]"
            aria-label="계정으로 돌아가기"
          >
            ‹
          </Link>
          <h1 className="text-[21px] font-black tracking-[-0.055em]">이용약관</h1>
          <div className="h-10 w-10" />
        </header>

        <section className="mt-6 rounded-[28px] border border-[#f0ded6] bg-white/86 p-5 shadow-[0_18px_42px_rgba(126,74,61,0.08)]">
          <p className="text-[13px] font-semibold leading-relaxed text-[#7a6c65]">
            아래 내용은 FUKUOSAKA 서비스 운영을 위한 1차 약관 초안입니다.
            정식 운영 전 법률 검토와 서비스 정책에 맞춰 업데이트될 수 있습니다.
          </p>
        </section>

        <div className="mt-5 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[24px] border border-[#f0ded6] bg-white/78 p-4"
            >
              <h2 className="text-[15px] font-black tracking-[-0.04em] text-[#3a2b26]">
                {section.title}
              </h2>
              <p className="mt-2 whitespace-pre-line text-[13px] font-semibold leading-relaxed text-[#6f625c]">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <PolicyLinks className="mt-8" />
      </div>
    </main>
  );
}
