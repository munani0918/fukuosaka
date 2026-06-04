import { PolicyBackButton } from "@/src/components/PolicyBackButton";
import { PolicyLinks } from "@/src/components/PolicyLinks";

const sections = [
  {
    title: "삭제 가능한 데이터",
    items: [
      "로그인 세션 정보",
      "저장한 여행 일정",
      "찜한 숙소·투어 정보",
      "브라우저에 저장된 localStorage 데이터",
      "소셜 로그인에서 제공된 닉네임, 이메일, 프로필 이미지 등 계정 표시 정보",
    ],
  },
  {
    title: "앱 안에서 삭제하는 방법",
    items: [
      "마이페이지에서 저장한 여행 일정 또는 찜한 상품을 개별 삭제할 수 있습니다.",
      "로그아웃하면 로그인 세션 쿠키가 삭제됩니다.",
      "로그아웃만으로 브라우저 localStorage에 저장된 여행·찜 데이터가 자동 삭제되지는 않을 수 있습니다.",
      "브라우저 설정에서 FUKUOSAKA 사이트 데이터를 삭제하면 이 브라우저에 저장된 localStorage 데이터도 삭제할 수 있습니다.",
    ],
  },
  {
    title: "삭제 요청 방법",
    items: [
      "현재 1차 서비스 기준으로 후쿠오사카는 별도의 서버 회원 DB를 운영하지 않고, 소셜 로그인 세션과 브라우저 저장소를 중심으로 기능을 제공합니다.",
      "계정 또는 데이터 삭제 요청이 필요한 경우 서비스 내 안내 또는 운영자 문의 채널을 통해 요청할 수 있습니다.",
      "정식 문의처는 서비스 운영 단계에 맞춰 업데이트될 수 있습니다.",
    ],
  },
  {
    title: "처리 기간",
    items: [
      "삭제 요청이 접수되면 영업일 기준 7일 이내 확인 및 처리를 목표로 합니다.",
      "요청 내용 확인에 추가 정보가 필요한 경우 처리 기간이 달라질 수 있습니다.",
    ],
  },
  {
    title: "삭제 후 영향",
    items: [
      "삭제된 저장 여행 일정과 찜한 상품은 다시 불러올 수 없습니다.",
      "마이리얼트립, 아고다 등 외부 제휴 플랫폼에서 진행한 예약·결제 정보는 후쿠오사카에서 삭제할 수 없습니다.",
      "외부 플랫폼의 예약, 결제, 취소, 환불 및 개인정보 처리는 해당 플랫폼에서 직접 확인해야 합니다.",
    ],
  },
];

export default function DataDeletionPage() {
  return (
    <main className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto min-h-dvh max-w-[430px] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_55%,#fff1ec_100%)] px-5 pb-16 pt-[calc(env(safe-area-inset-top)+18px)] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <header className="flex items-center justify-between">
          <PolicyBackButton label="이전 화면으로 돌아가기" />
          <h1 className="text-center text-[20px] font-black tracking-[-0.055em]">
            계정 및 데이터 삭제 안내
          </h1>
          <div className="h-10 w-10" />
        </header>

        <section className="mt-6 rounded-[30px] border border-[#f0ded6] bg-white/90 p-5 shadow-[0_20px_48px_rgba(126,74,61,0.09)]">
          <p className="inline-flex rounded-full bg-[#fff0ea] px-3 py-1 text-[12px] font-black text-[#e95f49]">
            Google Play 데이터 안내
          </p>
          <h2 className="mt-4 text-[24px] font-black leading-tight tracking-[-0.06em] text-[#2f211c]">
            저장한 여행과 찜한 상품을
            <br />
            직접 관리할 수 있어요
          </h2>
          <p className="mt-3 text-[13px] font-semibold leading-relaxed text-[#7a6c65]">
            후쿠오사카는 카카오 또는 Google 로그인을 통해 사용자를 식별하고, 저장한
            여행 일정과 찜한 상품을 관리할 수 있도록 돕습니다.
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
              <ul className="mt-3 space-y-2 text-[13px] font-semibold leading-relaxed text-[#6f625c]">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#f08a73]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-5 rounded-[24px] border border-[#f2d6ca] bg-[#fff4ef] p-4">
          <p className="text-[12.5px] font-bold leading-relaxed text-[#7a5f56]">
            현재 저장 기능은 브라우저 저장소를 함께 사용하므로, 공용 기기에서는 로그아웃과
            브라우저 사이트 데이터 삭제를 함께 진행하는 것을 권장합니다.
          </p>
        </section>

        <PolicyLinks className="mt-8" />
      </div>
    </main>
  );
}
