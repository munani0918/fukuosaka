import Link from "next/link";

import type { BudgetTemplate } from "@/src/data/budgetTemplates";
import { ChevronRightIcon } from "@/src/components/home/icons";

type BudgetSamplePlansProps = {
  items: BudgetTemplate[];
};

export function BudgetSamplePlans({ items }: BudgetSamplePlansProps) {
  return (
    <section className="px-5">
      <div className="mb-3">
        <h2 className="text-[18px] font-black tracking-[-0.05em] text-[#2c211d]">
          이 예산이면 이렇게 다녀올 수 있어요
        </h2>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/budget-plans/${item.slug}`}
            className="group flex min-h-[154px] w-[154px] shrink-0 flex-col rounded-[22px] border border-[#f0e0d8] bg-white p-3.5 shadow-[0_12px_24px_rgba(115,72,59,0.06)] transition active:scale-[0.99]"
          >
            <div className="mb-2 flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#fff0eb] px-2 py-1 text-[9.5px] font-black text-[#ef625d]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="text-[15px] font-black leading-5 tracking-[-0.05em] text-[#2c211d]">
              {item.title}
            </h3>
            <p className="mt-1 text-[13px] font-black tracking-[-0.04em] text-[#f05f5b]">
              {item.budgetLabel}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold leading-4 tracking-[-0.03em] text-[#8d7c74]">
              {item.shortDescription}
            </p>

            <span className="mt-auto inline-flex items-center justify-between gap-2 text-[11px] font-black text-[#7f6f69]">
              샘플 보기
              <ChevronRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
