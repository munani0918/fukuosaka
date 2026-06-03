import Link from "next/link";

export function HomePolicyFooter() {
  return (
    <footer className="mx-3 mt-2 rounded-[24px] border border-[#eaded8] bg-[#fffaf7]/86 px-2.5 py-5 text-center text-[10.5px] font-semibold leading-[1.75] tracking-[-0.04em] text-[#8d7f78]">
      <p className="text-[9.5px] leading-[1.75] tracking-[-0.07em] text-[#8c7f78]">
        <span className="block whitespace-nowrap">
          후쿠오사카는 항공권, 숙소, 투어·티켓 정보를 비교·추천하고
        </span>
        <span className="block whitespace-nowrap">제휴 플랫폼으로 연결하는 서비스입니다.</span>
        <span className="block whitespace-nowrap">
          예약·결제·취소·환불은 각 판매자 및 제휴 플랫폼의 기준을 따릅니다.
        </span>
      </p>

      <nav
        className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-bold tracking-[-0.02em] text-[#756861]"
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
