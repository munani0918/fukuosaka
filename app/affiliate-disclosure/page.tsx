import { PolicyBackButton } from "@/src/components/PolicyBackButton";
import { PolicyLinks } from "@/src/components/PolicyLinks";

const notices = [
  "후쿠오사카는 여행 준비에 필요한 항공권, 숙소, 투어·티켓 정보를 더 쉽게 비교할 수 있도록 제휴 플랫폼의 상품 정보를 함께 안내합니다.",
  "일부 예약 버튼과 상품 링크는 제휴 링크로 연결되며, 사용자가 해당 링크를 통해 예약 또는 구매를 진행하는 경우 후쿠오사카는 제휴사로부터 수수료를 지급받습니다.",
  "이 수수료는 사용자가 결제하는 상품 가격에 별도로 추가되지 않습니다. 실제 가격, 예약 조건, 취소·환불 정책은 각 제휴 플랫폼의 안내를 기준으로 확인해 주세요.",
];

export default function AffiliateDisclosurePage() {
  return (
    <main className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto min-h-dvh max-w-[430px] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_55%,#fff1ec_100%)] px-5 pb-16 pt-[calc(env(safe-area-inset-top)+18px)] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <header className="flex items-center justify-between">
          <PolicyBackButton label="이전 화면으로 돌아가기" />
          <h1 className="text-[21px] font-black tracking-[-0.055em]">제휴 안내</h1>
          <div className="h-10 w-10" />
        </header>

        <section className="mt-6 rounded-[30px] border border-[#f0ded6] bg-white/90 p-5 shadow-[0_20px_48px_rgba(126,74,61,0.09)]">
          <p className="inline-flex rounded-full bg-[#fff0ea] px-3 py-1 text-[12px] font-black text-[#e95f49]">
            제휴 관계 고지
          </p>
          <h2 className="mt-4 text-[24px] font-black leading-tight tracking-[-0.06em] text-[#2f211c]">
            예약 정보는 투명하게,
            <br />
            가격 부담은 더하지 않아요.
          </h2>
          <p className="mt-3 text-[13px] font-semibold leading-relaxed text-[#7a6c65]">
            후쿠오사카는 사용자가 여행 상품을 편하게 비교할 수 있도록 일부 제휴
            플랫폼의 링크를 함께 안내합니다.
          </p>
        </section>

        <div className="mt-5 space-y-3">
          {notices.map((notice, index) => (
            <section
              key={notice}
              className="rounded-[24px] border border-[#f0ded6] bg-white/78 p-4"
            >
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff0ea] text-[13px] font-black text-[#e95f49]">
                  {index + 1}
                </span>
                <p className="text-[13px] font-semibold leading-relaxed text-[#625650]">
                  {notice}
                </p>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-5 rounded-[24px] border border-[#f2d6ca] bg-[#fff4ef] p-4">
          <p className="text-[12.5px] font-bold leading-relaxed text-[#7a5f56]">
            예약과 결제는 각 제휴 플랫폼에서 진행됩니다. 상품 가격, 예약 조건,
            취소·환불 정책은 이동한 페이지의 안내를 기준으로 확인해 주세요.
          </p>
        </section>

        <PolicyLinks className="mt-8" />
      </div>
    </main>
  );
}
