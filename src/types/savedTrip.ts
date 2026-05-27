export type SavedTripMapMode = "route" | "options";

export type SavedTripMapOption = {
  label: string;
  spots: string[];
};

export type SavedTripItineraryDay = {
  day: number;
  title: string;
  summary: string;
  spots: string[];
  mapMode?: SavedTripMapMode;
  mapOptions?: SavedTripMapOption[];
};

export type SavedTrip = {
  id: string;
  userId?: string;
  mode?: "saved";
  savedSource?: "planner-result";
  resultVersion?: number;
  savedAt: string;
  cityCode: string;
  cityName: string;
  date?: string;
  returnDate?: string;
  origin?: string;
  packageType?: string;
  nights: number;
  days: number;
  budgetTotal: number | null;
  travelers: number | null;
  styles: string[];
  title: string;
  summary: string;
  itineraryOutline: SavedTripItineraryDay[];
  selectedHotel?: {
    title?: string;
    area?: string;
    priceText?: string;
  };
  selectedFlight?: {
    title?: string;
    airline?: string;
    route?: string;
    departureText?: string;
    arrivalText?: string;
    priceText?: string;
    bookingUrl?: string;
    statusText?: string;
  };
  selectedTours?: Array<{
    title?: string;
    priceText?: string;
  }>;
};

export const SAVED_TRIPS_STORAGE_KEY = "fukuosaka_saved_trips";
export const MAX_SAVED_TRIPS = 20;
