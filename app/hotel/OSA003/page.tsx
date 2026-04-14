import { notFound } from "next/navigation";
import { hotels } from "@/src/data/hotels";
import HotelDetailTemplate from "@/src/components/hotel/HotelDetailTemplate";

export default function Page() {
  const hotel = hotels.find((h) => h.detail?.code === "OSA003");
  if (!hotel) notFound();
  return <HotelDetailTemplate hotel={hotel} />;
}
