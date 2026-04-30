"use client";

import Image from "next/image";
import { useLang } from "@/lib/translations/LanguageContext";

export const CAMPAIGN_BANNER_SRC = "/Campeigns/Blank Banner.PNG";

/** Legibility on photo without panels or image gradients — layered shadow only. */
const TEXT_SHADE =
  "[text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_2px_12px_rgba(0,0,0,0.75),0_4px_28px_rgba(0,0,0,0.45)]";

function CampaignBannerCopy({ compact }: { compact?: boolean }) {
  const { isArabic } = useLang();
  const gapHeadingBody = compact ? "mt-4 sm:mt-5" : "mt-5 sm:mt-6 md:mt-7";
  const gapBodyClosing = compact ? "mt-5 sm:mt-6" : "mt-6 sm:mt-7 md:mt-8";

  const arabicBlock = (
    <div className="w-full max-w-[min(38ch,88vw)] text-right">
      <div dir="rtl" lang="ar" className={`font-arabic space-y-0 ${TEXT_SHADE}`}>
        <h3 className="text-[clamp(1.05rem,3.6vw,1.75rem)] font-semibold leading-snug tracking-tight text-white">
          معًا خلاله والمرّة
        </h3>
        <p
          className={`${gapHeadingBody} text-[clamp(0.78rem,2.9vw,0.95rem)] font-normal leading-relaxed text-white/95`}
        >
          يوفّر NeuroHolistic Institute خطًا ساخنًا مجانيًا يوميًا من 9 صباحًا حتى 8 مساءً للدعم النفسي والمعنوي في هذه المرحلة.
        </p>
        <p className={`${gapBodyClosing} text-[clamp(0.8rem,3vw,1rem)] font-medium tracking-wide text-white`}>نحن هنا.</p>
      </div>
    </div>
  );

  const englishBlock = (
    <section lang="en" className={`w-full max-w-[min(38ch,88vw)] text-left ${TEXT_SHADE}`}>
      <h3 className="font-display text-[clamp(1.1rem,3.8vw,1.9rem)] font-medium leading-[1.12] tracking-[-0.02em] text-white">
        Together
        <br />
        Through It All
      </h3>
      <p
        className={`${gapHeadingBody} text-[clamp(0.78rem,2.9vw,0.95rem)] font-normal leading-relaxed text-white/95`}
      >
        NeuroHolistic Institute offers a free daily hotline from 9:00 AM to 8:00 PM for emotional and moral support during
        difficult times.
      </p>
      <p className={`${gapBodyClosing} text-[clamp(0.8rem,3vw,1rem)] font-medium tracking-[0.04em] text-white`}>
        We&apos;re here.
      </p>
    </section>
  );

  return <>{isArabic ? arabicBlock : englishBlock}</>;
}

type CampaignBannerFigureProps = {
  priority?: boolean;
  sizes: string;
  compactCopy?: boolean;
  className?: string;
  /**
   * When true, fills a positioned parent (`absolute inset-0`) — same box as the neural graphic in the hero carousel.
   * When false, owns a classic 2:1 banner frame (strip / standalone).
   */
  fillParent?: boolean;
};

export function CampaignBannerFigure({
  priority,
  sizes,
  compactCopy,
  className,
  fillParent,
}: CampaignBannerFigureProps) {
  const { isArabic } = useLang();
  const alt = isArabic ? "لافتة الدعم النفسي" : "Emotional support campaign banner";

  const figureBase = "relative m-0 w-full overflow-hidden";
  const frameChrome = fillParent
    ? ""
    : "rounded-2xl ring-1 ring-black/10 sm:rounded-3xl aspect-[2/1]";

  return (
    <figure
      className={`${figureBase} ${
        fillParent ? "absolute inset-0 z-10 h-full min-h-0 rounded-none ring-0" : ""
      } ${frameChrome} ${className ?? ""}`}
    >
      <div className="absolute inset-0">
        <Image
          src={CAMPAIGN_BANNER_SRC}
          alt={alt}
          fill
          className={`object-cover ${isArabic ? "object-[center_left]" : "object-[center_right]"}`}
          sizes={sizes}
          priority={priority}
        />
      </div>

      <div className={`pointer-events-none absolute inset-0 z-20 flex items-center px-[clamp(14px,5vw,88px)] py-4 sm:py-6 md:py-8 ${isArabic ? "justify-end" : "justify-start"}`}>
        <div className="pointer-events-auto max-h-full min-w-0 overflow-visible">
          <CampaignBannerCopy compact={compactCopy} />
        </div>
      </div>
    </figure>
  );
}
