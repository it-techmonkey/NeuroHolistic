"use client";

import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function TeamPageHero() {
  const { t } = useLang();
  const tp = t.teamPage;

  return (
    <PageHero
      eyebrow={tp.eyebrow}
      title={<span className="text-white font-normal">{tp.title}</span>}
      description={tp.description}
      imageSrc="/images/pages/teams.jpg"
      imageAlt="NeuroHolistic Faculty and Research Environment"
      metaTags={[]}
    />
  );
}
