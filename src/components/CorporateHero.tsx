"use client";

import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function CorporateHero() {
  const { t } = useLang();
  const ch = t.corporateHero;

  return (
    <PageHero
      eyebrow={ch.eyebrow}
      title={ch.title}
      description=""
      customDescription={
        <div className="mb-7 max-w-[620px] sm:mb-7 lg:mb-10">
          <p className="text-[15px] leading-[1.7] text-white/70 sm:text-[16px] md:text-[18px]">
            {ch.description1} <em>state</em>.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {ch.description2.split('·').map((item: string, i: number) => (
              <span key={i} className="flex items-center gap-2 text-[15px] text-white/70 sm:text-[16px] md:text-[18px]">
                <span className="text-white/40">—</span>
                {item.trim()}
              </span>
            ))}
          </div>
        </div>
      }
      imageSrc="/images/pages/corportate_wellbeing.jpg"
      imageAlt="Corporate team in a wellbeing strategy workshop"
      metaTags={[...ch.metaTags]}
      primaryAction={{ label: ch.contactUs, href: "/contact" }}
    />
  );
}
