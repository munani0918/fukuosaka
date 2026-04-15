import { notFound } from "next/navigation";
import { hotels } from "@/src/data/hotels";
import HotelDetailTemplate from "@/src/components/hotel/HotelDetailTemplate";
import { buildMylinkUrl } from "@/src/lib/myrealtrip";

// Server Component — MYREALTRIP_MYLINK_ID는 서버에서만 읽히고 클라이언트에 노출되지 않는다.
export default function Page() {
  const hotel = hotels.find((h) => h.detail?.code === "OSA301");
  if (!hotel) notFound();

  const { url: mylinkUrl } = buildMylinkUrl({
    targetUrl: "https://accommodation.myrealtrip.com/union/products/4069388?checkIn=2026-06-01&checkOut=2026-06-02&roomCount=1&adultCount=2&childCount=0&providerRoomId=&segment=&isDomestic=false",
    utmContent: "OSA301-detail-myrealtrip",
  });

  const hotelWithMylink = {
    ...hotel,
    partnerLinks: { ...hotel.partnerLinks, myrealtrip: mylinkUrl },
  };

  return <HotelDetailTemplate hotel={hotelWithMylink} />;
}
