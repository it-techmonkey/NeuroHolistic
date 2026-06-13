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

  // Split Arabic title for better visibility
  const heroTitle = isArabic ? (
    <>
      {mp.titlePart1} <br />
      <span className="font-normal">{mp.titlePart2}</span>
    </>
  ) : (
    mp.title
  );

  return (
    <PageHero
      eyebrow={mp.eyebrow}
      title={heroTitle}
      description={mp.description}
      imageSrc={heroImageSrc}
      imageAlt={mp.title}
      imagePosition="object-center"
      primaryAction={{ label: mp.bookConsultation, kind: "modal" }}
      secondaryAction={{ label: mp.exploreResearch, href: "/research" }}
    />
  );
}
