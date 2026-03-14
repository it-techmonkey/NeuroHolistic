import ProgramsHero from "@/components/ProgramsHero";
import ProgramsSection from "@/components/ProgramsSection";

export const metadata = {
  title: "Programs | NeuroHolistic",
  description:
    "Experience the NeuroHolistic Method™ through Private or Group Programs. Personalized or collective transformation journeys.",
};

export default function ProgramsPage() {
  return (
    <div className="w-full">
      <ProgramsHero />
      <ProgramsSection />
    </div>
  );
}
