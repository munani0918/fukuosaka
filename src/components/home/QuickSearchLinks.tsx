import Link from "next/link";

import {
  BedIcon,
  ChevronRightIcon,
  PlaneIcon,
  TicketIcon,
} from "@/src/components/home/icons";

const QUICK_LINKS = [
  {
    title: "최저가 항공권",
    description: "후쿠오카·오사카 항공권 확인",
    href: "/flights",
    icon: "flight",
  },
  {
    title: "숙소",
    description: "지역·날짜·예산으로 찾기",
    href: "/stays",
    icon: "stay",
  },
  {
    title: "투어·티켓",
    description: "입장권·패스·근교투어 보기",
    href: "/tours",
    icon: "tour",
  },
] as const;

function quickIcon(icon: (typeof QUICK_LINKS)[number]["icon"]) {
  if (icon === "flight") return <PlaneIcon className="h-[19px] w-[19px]" />;
  if (icon === "stay") return <BedIcon className="h-[19px] w-[19px]" />;
  return <TicketIcon className="h-[19px] w-[19px]" />;
}

export function QuickSearchLinks() {
  return (
    <section className="px-5">
      <div className="mb-3">
        <h2 className="text-[18px] font-black tracking-[-0.05em] text-[#2c211d]">
          개별로 찾아보기
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group flex min-h-[104px] flex-col rounded-[20px] border border-[#f0e2da] bg-white px-3 py-3 shadow-[0_10px_20px_rgba(115,72,59,0.05)] transition active:scale-[0.99]"
          >
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0eb] text-[#f05f5b]">
              {quickIcon(item.icon)}
            </span>
            <span className="text-[13px] font-black tracking-[-0.05em] text-[#2c211d]">
              {item.title}
            </span>
            <span className="mt-1 text-[10.5px] font-semibold leading-4 tracking-[-0.03em] text-[#8d7c74]">
              {item.description}
            </span>
            <ChevronRightIcon className="mt-auto h-3.5 w-3.5 self-end text-[#b9a8a0] transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}
