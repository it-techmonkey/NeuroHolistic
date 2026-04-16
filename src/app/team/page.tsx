"use client";

import TeamRegistry from "@/components/team/TeamRegistry";
import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function TeamPage() {
  const { t } = useLang();
  const tp = t.teamPage;

  return (
    <main className="w-full bg-white">
      <PageHero
        eyebrow={tp.eyebrow}
        title={
          <>
            <span className="text-white font-normal">{tp.title}</span>
          </>
        }
        description={tp.description}
        imageSrc="/images/pages/teams.jpg"
        imageAlt="NeuroHolistic Faculty and Research Environment"
        metaTags={[]}
      />

      <TeamRegistry />
    </main>
  );
}
