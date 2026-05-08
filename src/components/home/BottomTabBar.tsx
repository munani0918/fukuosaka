import type { BottomTabItem } from "@/src/data/home";
import {
  BedIcon,
  HomeIcon,
  PlannerIcon,
  TicketIcon,
  UserIcon,
} from "@/src/components/home/icons";

type BottomTabBarProps = {
  items: BottomTabItem[];
};

function iconForTab(icon: BottomTabItem["icon"]) {
  if (icon === "planner") return <PlannerIcon className="h-[18px] w-[18px]" />;
  if (icon === "stay") return <BedIcon className="h-[18px] w-[18px]" />;
  if (icon === "tour") return <TicketIcon className="h-[18px] w-[18px]" />;
  if (icon === "my") return <UserIcon className="h-[18px] w-[18px]" />;
  return <HomeIcon className="h-[18px] w-[18px]" />;
}

export function BottomTabBar({ items }: BottomTabBarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center">
      <nav className="pointer-events-auto w-full max-w-[430px] border-t border-[#f2e4dc] bg-white/96 px-2 pt-1.5 shadow-[0_-10px_24px_rgba(68,33,27,0.05)] backdrop-blur-xl">
        <div className="grid grid-cols-5">
          {items.map((item) => {
            const active = Boolean(item.active);

            return (
              <a
                key={item.id}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 px-1 py-1 text-center transition"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                    active ? "bg-[#ffe9e2] text-[#f05f5b]" : "text-[#918680]"
                  }`}
                >
                  {iconForTab(item.icon)}
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-[-0.02em] ${
                    active ? "text-[#f05f5b]" : "text-[#847872]"
                  }`}
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                </span>
              </a>
            );
          })}
        </div>
        <div className="h-[calc(env(safe-area-inset-bottom)+4px)]" />
      </nav>
    </div>
  );
}
