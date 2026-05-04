/**
 * Production (main) deployments: set `NEXT_PUBLIC_DISABLE_ARABIC=true` and
 * `NEXT_PUBLIC_DISABLE_HERO_CAMPAIGN_BANNER=true` in Vercel/host env.
 * Dev/preview: omit these or set to `false` so Arabic UI and the hero campaign banner stay enabled.
 */
export const arabicUiEnabled = process.env.NEXT_PUBLIC_DISABLE_ARABIC !== "true";

export const heroCampaignBannerEnabled =
  process.env.NEXT_PUBLIC_DISABLE_HERO_CAMPAIGN_BANNER !== "true";
