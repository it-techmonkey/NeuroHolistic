/**
 * Arabic UI + hero campaign banner:
 * - **Production** (`NEXT_PUBLIC_VERCEL_ENV === "production"`): off (main site).
 * - **Everything else** (Vercel preview / dev branch deploys, local `next dev`, local prod-like builds without Vercel): on.
 *
 * Vercel sets `VERCEL_ENV` at build time; we expose it via `next.config.ts`. Self-hosted production should set
 * `VERCEL_ENV=production` before building if you want the same toggles as Vercel production.
 */
const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV ?? "";
const isProductionDeploy = vercelEnv === "production";

export const arabicUiEnabled = !isProductionDeploy;

export const heroCampaignBannerEnabled = !isProductionDeploy;
