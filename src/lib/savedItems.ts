import {
  MAX_SAVED_ITEMS,
  SAVED_ITEMS_STORAGE_KEY,
  type SavedItem,
  type SavedItemType,
} from "@/src/types/savedTrip";

export function readSavedItems(): SavedItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SAVED_ITEMS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSavedItems(items: SavedItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    SAVED_ITEMS_STORAGE_KEY,
    JSON.stringify(items.slice(0, MAX_SAVED_ITEMS)),
  );
}

export function buildSavedItemKey(item: Partial<SavedItem>) {
  const stableUrl =
    item.detailPath || item.bookingUrl || item.affiliateUrl || item.originalUrl || "";
  if (stableUrl) return String(stableUrl).trim();
  return [item.source || "unknown", item.itemType || "unknown", item.title || ""]
    .join("|")
    .toLowerCase();
}

export function isSavedItem(item: Partial<SavedItem>) {
  const key = buildSavedItemKey(item);
  if (!key) return false;
  return readSavedItems().some((savedItem) => buildSavedItemKey(savedItem) === key);
}

function savedItemId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `saved-item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function toggleSavedItem(item: SavedItem) {
  const key = buildSavedItemKey(item);
  if (!key || !item.title) return false;

  const current = readSavedItems();
  const existingIndex = current.findIndex((savedItem) => buildSavedItemKey(savedItem) === key);
  const nextItems =
    existingIndex >= 0
      ? current.filter((_, index) => index !== existingIndex)
      : [{ ...item, id: item.id || savedItemId(), savedAt: new Date().toISOString() }, ...current];

  writeSavedItems(nextItems);
  return existingIndex < 0;
}

export function getSavedItemUrl(item: SavedItem) {
  return item.detailPath || item.bookingUrl || item.affiliateUrl || item.originalUrl || "";
}

function hasAny(value: string, keywords: string[]) {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function inferSavedTourItemType(input: {
  title?: string;
  category?: string;
  tags?: string[] | string;
}): SavedItemType {
  const text = [input.title, input.category, Array.isArray(input.tags) ? input.tags.join(" ") : input.tags]
    .filter(Boolean)
    .join(" ");

  if (hasAny(text, ["esim", "e-sim", "이심", "유심", "usim", "로밍"])) return "esim";
  if (hasAny(text, ["라피트", "교통", "공항 이동", "공항버스", "리무진", "지하철", "열차"])) {
    return "transport";
  }
  if (hasAny(text, ["입장권", "티켓", "패스", "주유패스", "전망대", "테마파크", "usj", "유니버설"])) {
    return "ticket";
  }
  return "tour";
}
