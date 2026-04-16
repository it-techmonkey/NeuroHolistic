"use client";

import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function MethodHero() {
  const { t } = useLang();
  const mp = t.methodPage;

  return (
    <PageHero
      eyebrow={mp.eyebrow}
      title={<>{mp.title}</>}
      description={mp.description}
      imageSrc="/images/pages/methods.jpg"
      imageAlt={mp.title}
      imagePosition="object-center"
      primaryAction={{ label: mp.bookConsultation, kind: "modal" }}
      secondaryAction={{ label: mp.exploreResearch, href: "/research" }}
    />
  );
}
