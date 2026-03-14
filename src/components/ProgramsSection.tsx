import Section from "@/components/ui/Section";
import ProgramCard from "./ProgramCard";

const PRIVATE_PROGRAM = {
  icon: "◆",
  title: "Private",
  description:
    "The Private Program offers a personalized journey through the NeuroHolistic Method™. Working one-on-one allows the process to be fully adapted to your unique history, patterns, and goals, creating the space for deeper exploration and meaningful transformation.",
  descriptionSecondary:
    "Sessions are structured to support your pace and needs, with ongoing integration between meetings and dedicated support throughout your journey.",
  suitedTitle: "This program is especially suited for individuals who:",
  suitedBullets: [
    "Prefer a private and personalized setting",
    "Are navigating significant life challenges or transitions",
    "Seek deeper individual guidance and support",
    "Wish to move through the transformation process at their own pace",
  ],
  ctaLabel: "Book Consultation",
  ctaHref: "/book",
};

const GROUP_PROGRAM = {
  icon: "◇",
  title: "Group Program",
  description:
    "The Group Program offers the opportunity to experience the NeuroHolistic Method™ within a guided group setting. Participants move through the transformational process together, creating a supportive environment where shared insights, collective energy, and mutual understanding enrich the journey.",
  descriptionSecondary:
    "Group reflection and learning add a unique dimension to the process, as participants witness and support one another through structured phases of transformation.",
  suitedTitle: "This program is especially suited for individuals who:",
  suitedBullets: [
    "Feel comfortable exploring personal growth within a group setting",
    "Value shared learning and collective experience",
    "Wish to engage in the NeuroHolistic journey alongside others",
    "Are ready to commit to a structured transformational process",
  ],
  ctaLabel: "Book Consultation",
  ctaHref: "/book",
};

export default function ProgramsSection() {
  return (
    <Section padding="xl" background="light">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto">
        <ProgramCard {...PRIVATE_PROGRAM} />
        <ProgramCard {...GROUP_PROGRAM} />
      </div>
    </Section>
  );
}
