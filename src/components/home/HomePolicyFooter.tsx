import Link from "next/link";

export function HomePolicyFooter() {
  return (
    <footer className="mx-5 mt-2 rounded-[24px] border border-[#eaded8] bg-[#fffaf7]/86 px-4 py-5 text-center text-[11px] font-semibold leading-relaxed text-[#8d7f78]">
      <p>
        후쿠오사카는 항공권, 숙소, 투어·티켓 정보를 비교·추천하고 제휴
        플랫폼으로 연결하는 서비스입니다.
        <br />
        예약·결제·취소·환불은 각 판매자 및 제휴 플랫폼의 기준을 따릅니다.
      </p>

      <details className="group mt-3">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-[#7d706a] underline-offset-4 hover:underline">
          사업자 정보
          <span className="transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <p className="mx-auto mt-2 max-w-[300px] rounded-[18px] bg-white/70 px-3 py-2 text-[10.5px] leading-relaxed text-[#9a8a83]">
          사업자 세부 정보는 서비스 운영 단계에 맞춰 업데이트됩니다.
        </p>
      </details>

      <nav
        className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-bold text-[#756861]"
        aria-label="정책 링크"
      >
        <Link href="/terms" className="underline-offset-4 hover:underline">
          이용약관
        </Link>
        <span className="text-[#d4c6bf]">|</span>
        <Link href="/privacy" className="underline-offset-4 hover:underline">
          개인정보처리방침
        </Link>
        <span className="text-[#d4c6bf]">|</span>
        <Link href="/affiliate-disclosure" className="underline-offset-4 hover:underline">
          제휴 안내
        </Link>
      </nav>

      <p className="mt-3 text-[10.5px] font-bold tracking-[0.01em] text-[#a0948e]">
        © FUKUOSAKA. All rights reserved.
      </p>
    </footer>
  );
}
