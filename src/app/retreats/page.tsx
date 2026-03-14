import Section from "@/components/ui/Section";
import RetreatHero from "@/components/RetreatHero";
import FeaturedRetreat from "@/components/FeaturedRetreat";
import RetreatExperience from "@/components/RetreatExperience";
import RetreatFormat from "@/components/RetreatFormat";
import RetreatGrid from "@/components/RetreatGrid";
import RetreatNewsletter from "@/components/RetreatNewsletter";
import { FEATURED_RETREAT, UPCOMING_RETREATS } from "@/components/retreats/retreats-data";

export const metadata = {
  title: "Retreats | NeuroHolistic",
  description:
    "Immersive retreat experiences designed to step away from daily life and engage deeply in the transformational process of the NeuroHolistic Method™.",
};

export default function RetreatsPage() {
  return (
    <div className="w-full">
      <RetreatHero />
      <Section padding="lg" background="white">
        <FeaturedRetreat retreat={FEATURED_RETREAT} />
      </Section>
      <RetreatExperience />
      <RetreatFormat />
      <RetreatGrid retreats={UPCOMING_RETREATS} />
      <RetreatNewsletter />
    </div>
  );
}
