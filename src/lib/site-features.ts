/**
 * Defaults (e.g. production / main): Arabic UI off, hero campaign banner off.
 * Dev/preview: set `NEXT_PUBLIC_ENABLE_ARABIC=true` and
 * `NEXT_PUBLIC_ENABLE_HERO_CAMPAIGN_BANNER=true` on that environment.
 */
export const arabicUiEnabled = process.env.NEXT_PUBLIC_ENABLE_ARABIC === "true";

export const heroCampaignBannerEnabled =
  process.env.NEXT_PUBLIC_ENABLE_HERO_CAMPAIGN_BANNER === "true";
