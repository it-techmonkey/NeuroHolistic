"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLang } from "@/lib/translations/LanguageContext";

const CAMPAIGN_BANNER = {
  en: { src: "/Campeigns/en.PNG" },
  ar: { src: "/Campeigns/ar.PNG" },
} as const;

/** Locale-only campaign image; no chrome or extra copy. */
export default function HeroCampaignStrip() {
  const { isArabic } = useLang();
  const banner = isArabic ? CAMPAIGN_BANNER.ar : CAMPAIGN_BANNER.en;
  const alt = isArabic ? "لافتة الحملة" : "Campaign banner";

  return (
    <div className="mb-8 w-full sm:mb-10">
      <motion.div
        key={banner.src}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[min(100%,900px)] overflow-hidden rounded-lg border border-white/[0.08] bg-black/20"
      >
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={banner.src}
            alt={alt}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 900px"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
}
