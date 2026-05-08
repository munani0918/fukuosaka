import type { ProductCardData } from "@/src/data/home";
import { ProductCarousel } from "@/src/components/home/ProductCarousel";

type TourCardCarouselProps = {
  items: ProductCardData[];
};

export function TourCardCarousel({ items }: TourCardCarouselProps) {
  return (
    <ProductCarousel
      id="tours-section"
      title="추천 투어 & 티켓"
      viewAllHref="/tours"
      items={items}
    />
  );
}
