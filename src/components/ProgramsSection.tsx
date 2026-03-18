import Section from "@/components/ui/Section";
import ProgramCard from "./ProgramCard";

const PRIVATE_PROGRAM = {
  icon: "●",
  title: "Private Program",
  description:
    "The Private Program offers a personalized journey through the NeuroHolistic Method™. Working one-on-one allows the process to be fully adapted to your unique history, patterns, and goals.",
  descriptionSecondary:
    "Sessions are structured to support your pace and needs, with ongoing integration between meetings and dedicated support throughout your transformation.",
  suitedTitle: "Ideal for you if you:",
  suitedBullets: [
    "Prefer a private and personalized setting",
    "Are navigating significant life challenges or transitions",
    "Seek deeper individual guidance and support",
    "Want to move through transformation at your own pace",
  ],
  ctaLabel: "Book Consultation",
  ctaHref: "/book",
};

const GROUP_PROGRAM = {
  icon: "◉",
  title: "Group Program",
  description:
    "The Group Program offers the opportunity to experience the NeuroHolistic Method™ within a guided group setting. Participants move through the transformational process together in a supportive environment.",
  descriptionSecondary:
    "Shared learning, collective energy, and mutual understanding enrich the journey as participants witness and support one another through each transformation phase.",
  suitedTitle: "Ideal for you if you:",
  suitedBullets: [
    "Feel comfortable exploring personal growth in a group setting",
    "Value shared learning and collective experience",
    "Wish to engage in the NeuroHolistic journey alongside others",
    "Are ready to commit to a structured transformational process",
  ],
  ctaLabel: "Book Consultation",
  ctaHref: "/book",
};

export default function ProgramsSection() {
  return (
    <Section padding="lg" background="white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#6366F1] mb-3">
            Two Pathways
          </p>
          <h2 className="text-[32px] md:text-[42px] font-medium leading-[1.2] text-[#0B1028] mb-4">
            Choose Your Transformation Path
          </h2>
          <p className="text-[16px] md:text-[17px] text-[#64748B] max-w-[600px] mx-auto leading-[1.7]">
            Both programs deliver the full depth of the NeuroHolistic Method™, tailored to your personal needs and learning style.
          </p>
        </div>

        {/* Programs grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          <ProgramCard {...PRIVATE_PROGRAM} />
          <ProgramCard {...GROUP_PROGRAM} />
        </div>
      </div>
    </Section>
  );
}
