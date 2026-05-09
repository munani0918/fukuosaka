import { connection } from "next/server";

import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import { BudgetSamplePlans } from "@/src/components/home/BudgetSamplePlans";
import { HeroSection } from "@/src/components/home/HeroSection";
import { QuickSearchLinks } from "@/src/components/home/QuickSearchLinks";
import { StayCardCarousel } from "@/src/components/home/StayCardCarousel";
import { TopAppBar } from "@/src/components/home/TopAppBar";
import { TourCardCarousel } from "@/src/components/home/TourCardCarousel";
import { TravelBenefitBanners } from "@/src/components/home/TravelBenefitBanners";
import { budgetTemplates } from "@/src/data/budgetTemplates";
import { homeBenefitBanners } from "@/src/data/homeBanners";
import { getHomePageData } from "@/src/lib/home";

export default async function HomePage() {
  await connection();
  const homeData = await getHomePageData();

  return (
    <main id="top" className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto min-h-dvh max-w-[430px] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_48%,#fff1ec_100%)] pb-32 md:my-6 md:min-h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <TopAppBar />
        <HeroSection hero={homeData.hero} />

        <div className="space-y-6 pb-[calc(env(safe-area-inset-bottom)+84px)] pt-1">
          <BudgetSamplePlans items={budgetTemplates} />
          <TravelBenefitBanners items={homeBenefitBanners} />
          <QuickSearchLinks />
          <StayCardCarousel items={homeData.stayCards} />
          <TourCardCarousel items={homeData.tourCards} />
        </div>
      </div>

      <BottomTabBar items={homeData.bottomTabs} />
    </main>
  );
}
