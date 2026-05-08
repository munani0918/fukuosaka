import type { BudgetPreset } from "@/src/data/home";
import { PlannerEntryButton } from "@/src/components/home/PlannerEntryButton";
import {
  ChevronRightIcon,
  CrownIcon,
  SparklesIcon,
  WalletIcon,
} from "@/src/components/home/icons";

type BudgetPresetListProps = {
  items: BudgetPreset[];
};

type PresetTone = {
  iconShell: string;
  iconCore: string;
  amount: string;
  summary: string;
};

function toneClasses(id: string): PresetTone {
  if (id === "budget" || id === "value") {
    return {
      iconShell: "bg-[linear-gradient(180deg,#fff5f3_0%,#ffe8e2_100%)]",
      iconCore: "text-[#f0615c]",
      amount: "text-[#2f2521]",
      summary: "text-[#9e8d84]",
    };
  }

  if (id === "premium" || id === "luxury") {
    return {
      iconShell: "bg-[linear-gradient(180deg,#fff3ef_0%,#ffe4dc_100%)]",
      iconCore: "text-[#f0615c]",
      amount: "text-[#2f2521]",
      summary: "text-[#9e8d84]",
    };
  }

  return {
    iconShell: "bg-[linear-gradient(180deg,#fff4f2_0%,#ffe6df_100%)]",
    iconCore: "text-[#f0615c]",
    amount: "text-[#2f2521]",
    summary: "text-[#9e8d84]",
  };
}

function presetIcon(icon: BudgetPreset["icon"]) {
  if (icon === "wallet") return <WalletIcon className="h-[18px] w-[18px]" />;
  if (icon === "crown") return <CrownIcon className="h-[18px] w-[18px]" />;
  return <SparklesIcon className="h-[18px] w-[18px]" />;
}

function compactSummary(id: string) {
  if (id === "budget" || id === "value") return "시내 중심 + 가까운 근교 선택";
  if (id === "premium" || id === "luxury") return "좋은 숙소 + 근교/테마 경험";
  return "시내 + 대표 근교 1곳 추천";
}

export function BudgetPresetList({ items }: BudgetPresetListProps) {
  return (
    <section className="px-5">
      <div className="mb-4">
        <h2 className="text-[18px] font-black tracking-[-0.05em] text-[#2c211d]">
          예산별로 바로 시작해보세요
        </h2>
        <p className="mt-1.5 text-[12px] font-medium leading-[17px] tracking-[-0.03em] text-[#8d7c74]">
          1인 예산을 고르면 일정과 추천 구성이 자동으로 세팅돼요.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const tone = toneClasses(item.id);
          const budgetPresetId =
            item.id === "value" ? "budget" : item.id === "luxury" ? "premium" : item.id;

          return (
            <PlannerEntryButton
              key={item.id}
              source={`budget-${item.id}`}
              budgetPresetId={budgetPresetId}
              presetBudget={item.defaultBudgetPerPerson ?? item.presetBudget}
              nights={item.nights}
              packageType={item.defaultPackageType}
              nearbyMode={item.nearbyMode}
              className="group grid h-[72px] w-full grid-cols-[44px_minmax(0,112px)_minmax(0,1fr)_14px] items-center gap-2.5 rounded-[20px] border border-[#f2e5de] bg-white px-3.5 text-left shadow-[0_12px_24px_rgba(115,72,59,0.05)] transition active:scale-[0.995]"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${tone.iconShell} ${tone.iconCore}`}
              >
                {presetIcon(item.icon)}
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#f06a63]">{item.label}</p>
                <p
                  className={`mt-0.5 truncate text-[15px] font-black leading-none tracking-[-0.05em] ${tone.amount}`}
                >
                  {item.displayRange ?? item.budgetRange}
                </p>
              </div>

              <p
                className={`pr-1 text-[10.5px] font-medium leading-[15px] tracking-[-0.035em] ${tone.summary}`}
              >
                {item.summary || compactSummary(item.id)}
              </p>

              <span className="flex items-center justify-end text-[#aea09a]">
                <ChevronRightIcon className="h-4 w-4" />
              </span>
            </PlannerEntryButton>
          );
        })}
      </div>
    </section>
  );
}
