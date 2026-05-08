import type { ProductCardData } from "@/src/data/home";
import { ProductCarousel } from "@/src/components/home/ProductCarousel";

type StayCardCarouselProps = {
  items: ProductCardData[];
};

export function StayCardCarousel({ items }: StayCardCarouselProps) {
  return (
    <ProductCarousel
      id="stays-section"
      title="지금 많이 보는 숙소"
      viewAllHref="/stays"
      items={items}
    />
  );
}
