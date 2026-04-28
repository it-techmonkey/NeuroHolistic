"use client";

import { motion } from "framer-motion";
import { CampaignBannerFigure, CAMPAIGN_BANNER_SRC } from "@/components/CampaignBanner";

/** Campaign strip — same visual system as hero banner (shared component). */
export default function HeroCampaignStrip() {
  return (
    <div className="mb-8 w-full sm:mb-10">
      <motion.div
        key={CAMPAIGN_BANNER_SRC}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[min(100%,1400px)]"
      >
        <CampaignBannerFigure
          compactCopy
          sizes="(max-width: 768px) 100vw, 1400px"
        />
      </motion.div>
    </div>
  );
}
