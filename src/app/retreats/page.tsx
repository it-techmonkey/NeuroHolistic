import RetreatHero from "@/components/RetreatHero";
// import Section from "@/components/ui/Section";
// import FeaturedRetreat from "@/components/FeaturedRetreat";
// import RetreatExperience from "@/components/RetreatExperience";
// import RetreatFormat from "@/components/RetreatFormat";
import RetreatGrid from "@/components/RetreatGrid";
import RetreatNewsletter from "@/components/RetreatNewsletter";
import { UPCOMING_RETREATS } from "@/components/retreats/retreats-data";
// import { FEATURED_RETREAT } from "@/components/retreats/retreats-data";

export const metadata = {
  title: "Retreats | NeuroHolistic",
  description:
    "Immersive retreat experiences designed to step away from daily life and engage deeply in the transformational process of the NeuroHolistic Method™.",
};

// Client requested only "SHE: Like Never Before™" to be shown for now;
// the rest are dummy/placeholder retreats kept in retreats-data.ts for later.
const VISIBLE_RETREATS = UPCOMING_RETREATS.filter(
  (retreat) => retreat.slug === "she-like-never-before"
);

export default function RetreatsPage() {
  return (
    <div className="w-full">
      <RetreatHero />
      {/* Meet & Greet featured section — client asked to remove (dummy content), can restore later */}
      {/* <Section padding="lg" background="white">
        <FeaturedRetreat retreat={FEATURED_RETREAT} />
      </Section> */}
      <RetreatGrid retreats={VISIBLE_RETREATS} />
      {/* "What You Will Experience" section — client asked to remove (dummy content), can restore later */}
      {/* <RetreatExperience /> */}
      {/* "How The Experience Is Structured" section — client asked to remove (dummy content), can restore later */}
      {/* <RetreatFormat /> */}
      <RetreatNewsletter />
    </div>
  );
}
