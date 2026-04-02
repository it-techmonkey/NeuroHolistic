"use client";

import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function RetreatHero() {
  const { t } = useLang();
  const rh = t.retreatHero;

  return (
    <PageHero
      eyebrow={rh.eyebrow}
      title={
        <>
          {rh.title1} <br className="hidden lg:block" />
          {rh.title2}
        </>
      }
      description={rh.description}
      imageSrc="/images/pages/retreat.jpg"
      imageAlt="A serene retreat location in nature"
      metaTags={[...rh.metaTags]}
      primaryAction={{ label: rh.viewRetreats, href: "#upcoming-retreats" }}
      secondaryAction={{ label: rh.joinWishList, href: "#newsletter" }}
    />
  );
}