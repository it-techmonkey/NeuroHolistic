"use client";

import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function MethodHero() {
  const { t, isArabic } = useLang();
  const mp = t.methodPage;

  // Use a dedicated Arabic hero banner only for the Arabic version of the method page.
  const heroImageSrc = isArabic
    ? "/images/pages/arabic method page head banner.jpg"
    : "/images/pages/method-img3.webp";

  return (
    <PageHero
      eyebrow={mp.eyebrow}
      title={<>{mp.title}</>}
      description={mp.description}
      imageSrc={heroImageSrc}
      imageAlt={mp.title}
      imagePosition="object-center"
      primaryAction={{ label: mp.bookConsultation, kind: "modal" }}
      secondaryAction={{ label: mp.exploreResearch, href: "/research" }}
    />
  );
}
