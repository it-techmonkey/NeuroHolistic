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
    <div className="mb-10 w-full sm:mb-12">
      <motion.div
        key={banner.src}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[min(100%,1100px)] overflow-hidden rounded-xl border border-white/[0.1] bg-black/30 p-1.5 sm:p-2"
      >
        <div className="relative flex min-h-[min(40vh,280px)] items-center justify-center sm:min-h-[min(36vh,360px)] md:min-h-[min(34vh,400px)]">
          <Image
            src={banner.src}
            alt={alt}
            width={1600}
            height={900}
            className="h-auto w-full max-w-full object-contain object-center"
            sizes="(max-width: 768px) 100vw, 1100px"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
}
