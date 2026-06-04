import Link from "next/link";

import { PolicyBackButton } from "@/src/components/PolicyBackButton";
import { PolicyLinks } from "@/src/components/PolicyLinks";

const sections = [
  {
    title: "1. 수집하는 정보",
    body:
      "후쿠오사카는 로그인과 저장 기능 제공을 위해 다음 정보를 처리할 수 있습니다.\n\n" +
      "카카오 로그인: 카카오 provider id, 닉네임, 프로필 이미지\n" +
      "Google 로그인: Google provider id, 이름 또는 닉네임, 이메일 주소, 프로필 이미지\n" +
      "공통: 로그인 상태 유지를 위한 세션 쿠키, 저장한 여행 일정, 찜한 숙소·투어 정보, 브라우저 localStorage에 저장되는 정보",
  },
  {
    title: "2. 수집 및 이용 목적",
    body:
      "수집한 정보는 로그인 사용자 식별, 로그인 상태 유지, 저장한 여행 및 찜한 상품 관리, 서비스 이용 편의 제공을 위해 사용합니다.",
  },
  {
    title: "3. 보관 기간",
    body:
      "로그인 세션 쿠키는 최대 30일 동안 유지됩니다. 사용자가 로그아웃하면 세션 쿠키는 삭제됩니다.\n\n" +
      "저장한 여행 일정과 찜한 상품 정보는 현재 브라우저 localStorage를 기준으로 보관됩니다. 사용자는 앱 내 삭제 기능, 브라우저 사이트 데이터 삭제, 또는 기기 저장소 정리를 통해 해당 데이터를 삭제할 수 있습니다.",
  },
  {
    title: "4. OAuth 토큰 처리",
    body:
      "후쿠오사카는 카카오 또는 Google 로그인 과정에서 발급되는 access_token, refresh_token, id_token 원문을 장기 보관하지 않습니다. 해당 토큰은 로그인 처리와 사용자 정보 확인에 필요한 범위에서만 사용됩니다.",
  },
  {
    title: "5. 제3자 제공 및 외부 플랫폼 이동",
    body:
      "예약·결제는 마이리얼트립, 아고다 등 외부 제휴 플랫폼에서 진행될 수 있습니다. 외부 플랫폼으로 이동한 뒤의 개인정보 처리, 결제, 예약, 취소, 환불은 해당 플랫폼의 약관과 개인정보처리방침을 따릅니다.\n\n" +
      "제휴 관계와 수수료 고지에 대한 자세한 내용은 제휴 안내 페이지에서 확인할 수 있습니다.",
  },
  {
    title: "6. 쿠키 사용",
    body:
      "후쿠오사카는 로그인 상태 유지를 위해 httpOnly, sameSite=lax 설정의 세션 쿠키를 사용합니다. 사용자는 브라우저 설정을 통해 쿠키를 삭제할 수 있으며, 이 경우 다시 로그인이 필요할 수 있습니다.",
  },
  {
    title: "7. 이용자의 권리",
    body:
      "사용자는 언제든지 로그인 또는 로그아웃할 수 있고, 저장한 여행 일정과 찜한 상품을 앱 내에서 삭제할 수 있습니다. 계정 및 데이터 삭제 안내 페이지를 통해 삭제 방법과 요청 절차를 확인할 수 있습니다.",
  },
  {
    title: "8. 문의",
    body:
      "개인정보와 데이터 삭제 관련 문의는 서비스 내 안내 또는 운영자 문의 채널을 통해 접수할 수 있습니다. 정식 문의처는 서비스 운영 단계에 맞춰 업데이트될 수 있습니다.",
  },
  {
    title: "9. 시행일",
    body:
      "본 개인정보처리방침은 2026년 6월 4일부터 적용됩니다. 서비스 정책이 변경되는 경우 본 페이지를 통해 안내합니다.",
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
            아래 내용은 FUKUOSAKA 서비스 운영을 위한 1차 개인정보처리방침 초안입니다.
            정식 운영 및 법률 검토에 따라 업데이트될 수 있습니다.
          </p>
          <Link
            href="/data-deletion"
            className="mt-4 inline-flex rounded-full bg-[#fff0ea] px-4 py-2 text-[12.5px] font-black text-[#e95f49] underline-offset-4 hover:underline"
          >
            계정 및 데이터 삭제 안내 보기
          </Link>
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

        <PolicyLinks className="mt-8" variant="full" />
      </div>
    </main>
  );
}
