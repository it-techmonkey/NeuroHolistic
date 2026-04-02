"use client";

import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function AcademyHero() {
  const { t } = useLang();
  const ah = t.academyHero;

  return (
    <PageHero
      eyebrow={ah.eyebrow}
      title={ah.title}
      description={ah.description}
      imageSrc="/images/pages/academy.jpg"
      imageAlt="Wellness education cohort in a training session"
      metaTags={[]}
      primaryAction={{ label: ah.applyAcademy, href: "/booking/paid-program-booking?mode=academy" }}
      secondaryAction={{ label: ah.bookCall, kind: "modal" }}
    />
  );
}
