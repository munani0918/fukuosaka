import Link from "next/link";

type PolicyLinksProps = {
  className?: string;
};

export function PolicyLinks({ className = "" }: PolicyLinksProps) {
  return (
    <footer className={`text-center text-[11.5px] leading-relaxed text-[#8b7c74] ${className}`}>
      <p>
        후쿠오사카는 제휴 링크를 통해 발생한 예약·구매에 대해 일정 수수료를
        지급받을 수 있습니다.
      </p>
      <div className="mt-3 flex items-center justify-center gap-3 font-bold text-[#6f625c]">
        <Link href="/terms" className="underline-offset-4 hover:underline">
          이용약관
        </Link>
        <span className="text-[#d7c7bf]">|</span>
        <Link href="/privacy" className="underline-offset-4 hover:underline">
          개인정보처리방침
        </Link>
      </div>
    </footer>
  );
}
