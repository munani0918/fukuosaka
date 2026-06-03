import Link from "next/link";

type PolicyLinksProps = {
  className?: string;
};

export function PolicyLinks({ className = "" }: PolicyLinksProps) {
  return (
    <footer className={`text-center text-[11.5px] leading-relaxed text-[#8b7c74] ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-bold text-[#6f625c]">
        <Link href="/terms" className="underline-offset-4 hover:underline">
          이용약관
        </Link>
        <span className="text-[#d7c7bf]">|</span>
        <Link href="/privacy" className="underline-offset-4 hover:underline">
          개인정보처리방침
        </Link>
        <span className="text-[#d7c7bf]">|</span>
        <Link href="/affiliate-disclosure" className="underline-offset-4 hover:underline">
          제휴 안내
        </Link>
      </div>
    </footer>
  );
}
