import { connection } from "next/server";

import { BottomTabBar } from "@/src/components/home/BottomTabBar";
import { BudgetPresetList } from "@/src/components/home/BudgetPresetList";
import { FlightSearchSection } from "@/src/components/home/FlightSearchSection";
import { HeroSection } from "@/src/components/home/HeroSection";
import { PromoBanner } from "@/src/components/home/PromoBanner";
import { SearchSection } from "@/src/components/home/SearchSection";
import { StayCardCarousel } from "@/src/components/home/StayCardCarousel";
import { TopAppBar } from "@/src/components/home/TopAppBar";
import { TourCardCarousel } from "@/src/components/home/TourCardCarousel";
import { WeatherSection } from "@/src/components/home/WeatherSection";
import { getHomePageData } from "@/src/lib/home";

export default async function HomePage() {
  await connection();
  const homeData = await getHomePageData();
  const productSearchTabs = homeData.searchTabs.filter(
    (tab) => tab.id === "stay" || tab.id === "tour",
  );

  return (
    <main id="top" className="min-h-dvh bg-[#fff8f5] text-[#2c211d]">
      <div className="mx-auto min-h-dvh max-w-[430px] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_48%,#fff1ec_100%)] pb-32 md:my-6 md:min-h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-[40px] md:shadow-[0_30px_70px_rgba(126,74,61,0.14)]">
        <TopAppBar />
        <HeroSection hero={homeData.hero} />

        <div className="space-y-6 pb-[calc(env(safe-area-inset-bottom)+84px)] pt-1">
          <BudgetPresetList items={homeData.budgetPresets} />

          <section className="space-y-3">
            <div className="px-5">
              <h2 className="text-[18px] font-black tracking-[-0.05em] text-[#2c211d]">
                원하는 항목만 따로 검색해보세요
              </h2>
            </div>
            <FlightSearchSection />
            <SearchSection
              tabs={productSearchTabs}
              placeholder={homeData.searchPlaceholder}
              hideTitle
            />
          </section>

          <PromoBanner promo={homeData.promo} />
          <WeatherSection items={homeData.weatherCards} />
          <StayCardCarousel items={homeData.stayCards} />
          <TourCardCarousel items={homeData.tourCards} />
        </div>
      </div>

      <BottomTabBar items={homeData.bottomTabs} />
    </main>
  );
}
