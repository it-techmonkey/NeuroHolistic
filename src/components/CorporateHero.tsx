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
        <p className="mb-7 max-w-[620px] text-[15px] leading-[1.7] text-white/70 sm:text-[16px] md:text-[18px] lg:mb-10">
          {ch.description1} <em>state</em>. <br /> {ch.description2}
        </p>  
      }
      imageSrc="/images/pages/corportate_wellbeing.jpg"
      imageAlt="Corporate team in a wellbeing strategy workshop"
      metaTags={[...ch.metaTags]}
      primaryAction={{ label: ch.contactUs, href: "/contact" }}
    />
  );
}
