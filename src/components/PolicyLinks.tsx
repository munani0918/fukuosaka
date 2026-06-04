import Link from "next/link";

type PolicyLinksProps = {
  className?: string;
  variant?: "basic" | "full";
};

const policyLinks = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/affiliate-disclosure", label: "제휴 안내" },
];

const dataDeletionLink = {
  href: "/data-deletion",
  label: "데이터 삭제 안내",
};

export function PolicyLinks({ className = "", variant = "basic" }: PolicyLinksProps) {
  const links = variant === "full" ? [...policyLinks, dataDeletionLink] : policyLinks;

  return (
    <footer className={`text-center text-[11.5px] leading-relaxed text-[#8b7c74] ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-bold text-[#6f625c]">
        {links.map((link, index) => (
          <span key={link.href} className="inline-flex items-center gap-x-3">
            {index > 0 ? <span className="text-[#d7c7bf]">|</span> : null}
            <Link href={link.href} className="underline-offset-4 hover:underline">
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    </footer>
  );
}
