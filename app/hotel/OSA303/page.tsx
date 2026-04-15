import { notFound } from "next/navigation";
import { hotels } from "@/src/data/hotels";
import HotelDetailTemplate from "@/src/components/hotel/HotelDetailTemplate";
import { buildMylinkUrl } from "@/src/lib/myrealtrip";

export default function Page() {
  const hotel = hotels.find((h) => h.detail?.code === "OSA303");
  if (!hotel) notFound();

  const { url: mylinkUrl } = buildMylinkUrl({
    targetUrl:
      "https://accommodation.myrealtrip.com/union/products/1544900?checkIn=2026-06-28&checkOut=2026-06-29&roomCount=1&adultCount=2&childCount=0&providerRoomId=&segment=&isDomestic=false",
    utmContent: "OSA303-detail-myrealtrip",
  });

  const hotelWithMylink = {
    ...hotel,
    partnerLinks: { ...hotel.partnerLinks, myrealtrip: mylinkUrl },
  };

  return <HotelDetailTemplate hotel={hotelWithMylink} />;
}
