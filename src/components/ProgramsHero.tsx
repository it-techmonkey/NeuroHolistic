"use client";

import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function ProgramsHero() {
  const { t } = useLang();
  const ph = t.programsHero;

  return (
    <PageHero
      eyebrow={ph.eyebrow}
      title={ph.title}
      description={ph.description}
      imageSrc="/images/pages/programs.jpg"
      imageAlt="Professional wellbeing coaching session"
      imagePosition="object-[center_60%]"
      metaTags={[]}
      primaryAction={{ label: ph.bookConsultation, kind: "modal" }}
    />
  );
}
