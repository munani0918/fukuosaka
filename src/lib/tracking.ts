export const FUKUOSAKA_UTM = {
  source: "fukuosaka",
  medium: "webapp",
  campaign: "initial_launch",
} as const;

function safeUtmContent(value: string) {
  return value.trim().replace(/\s+/g, "_").slice(0, 100);
}

export function addFukuosakaUtm(targetUrl: string, utmContent: string) {
  if (!targetUrl) return targetUrl;

  try {
    const url = new URL(targetUrl);
    url.searchParams.set("utm_source", FUKUOSAKA_UTM.source);
    url.searchParams.set("utm_medium", FUKUOSAKA_UTM.medium);
    url.searchParams.set("utm_campaign", FUKUOSAKA_UTM.campaign);

    const content = safeUtmContent(utmContent);
    if (content) url.searchParams.set("utm_content", content);

    return url.toString();
  } catch {
    return targetUrl;
  }
}
