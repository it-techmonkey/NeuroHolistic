"use client";

import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function EventsHero() {
  const { t } = useLang();
  const eh = t.eventsHero;

  return (
    <PageHero
      eyebrow={eh.eyebrow}
      title={
        <>
      {eh.title} <br className="hidden lg:block" />
        </>
      }
      description={eh.description}
      imageSrc="/images/pages/events.jpg"
      imageAlt="Participants in a premium wellness workshop"
      metaTags={[]}
      primaryAction={{ label: eh.getUpdates, href: "#newsletter" }}
      secondaryAction={{ label: eh.exploreRetreats, href: "/retreats" }}
    />
  );
}