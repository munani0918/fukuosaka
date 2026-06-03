import { PolicyBackButton } from "@/src/components/PolicyBackButton";
import { PolicyLinks } from "@/src/components/PolicyLinks";

const sections = [
  {
    title: "1. 수집하는 정보",
    body: "후쿠오사카는 카카오 로그인 시 카카오 provider id, 닉네임, 선택적으로 프로필 이미지를 수집할 수 있습니다. 로그인 상태 유지를 위해 httpOnly 세션 쿠키를 사용합니다. 저장한 여행과 찜한 상품 정보는 현재 사용자의 브라우저 localStorage에 보관될 수 있습니다.",
  },
  {
    title: "2. 수집 목적",
    body: "수집한 정보는 로그인 상태 유지, 사용자 식별, 저장한 여행 및 찜한 상품 관리 기능 제공, 서비스 안정성 개선을 위해 사용합니다.",
  },
  {
    title: "3. 보관 기간",
    body: "세션 쿠키의 유효 기간은 30일입니다. 로그아웃하면 세션 쿠키가 삭제됩니다. localStorage에 저장된 여행 및 찜 정보는 사용자의 브라우저 또는 기기 저장소에 보관되며, 사용자가 직접 삭제할 수 있습니다.",
  },
  {
    title: "4. 제3자 제공 및 외부 플랫폼",
    body: "예약과 구매는 마이리얼트립, 아고다 등 외부 제휴 플랫폼에서 진행될 수 있습니다. 후쿠오사카는 카카오 access token을 장기 보관하지 않으며, 로그인 처리와 사용자 정보 확인에 필요한 범위에서만 사용합니다.",
  },
  {
    title: "5. 쿠키 사용",
    body: "후쿠오사카는 로그인 상태 유지를 위해 httpOnly, sameSite=lax 설정의 세션 쿠키를 사용합니다. 사용자는 브라우저 설정을 통해 쿠키를 삭제할 수 있으며, 이 경우 다시 로그인이 필요할 수 있습니다.",
  },
  {
    title: "6. 이용자의 권리",
    body: "사용자는 로그아웃하거나 브라우저 저장소를 삭제해 저장된 정보를 정리할 수 있습니다. 향후 계정 기반 저장 기능이 추가되면 관련 열람, 수정, 삭제 절차를 함께 안내할 예정입니다.",
  },
  {
    title: "7. 문의",
    body: "개인정보 관련 문의는 서비스 내 문의 채널 또는 운영자 연락처를 통해 접수할 수 있습니다. 정식 문의처는 서비스 운영 단계에 맞춰 업데이트될 수 있습니다.",
  },
  {
    title: "8. 시행일",
    body: "본 개인정보처리방침은 2026년 6월 3일부터 적용됩니다. 서비스 정책 변경 시 본 페이지를 통해 안내합니다.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto min-h-dvh max-w-[430px] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_55%,#fff1ec_100%)] px-5 pb-16 pt-[calc(env(safe-area-inset-top)+18px)] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <header className="flex items-center justify-between">
          <PolicyBackButton label="이전 화면으로 돌아가기" />
          <h1 className="text-[21px] font-black tracking-[-0.055em]">
            개인정보처리방침
          </h1>
          <div className="h-10 w-10" />
        </header>

        <section className="mt-6 rounded-[28px] border border-[#f0ded6] bg-white/86 p-5 shadow-[0_18px_42px_rgba(126,74,61,0.08)]">
          <p className="text-[13px] font-semibold leading-relaxed text-[#7a6c65]">
            아래 내용은 FUKUOSAKA 서비스 운영을 위한 1차 개인정보처리방침
            초안입니다. 정식 운영 전 법률 검토와 서비스 정책에 맞춰 업데이트될 수
            있습니다.
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
