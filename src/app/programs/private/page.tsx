import ProgramsHero from "@/components/ProgramsHero";
import ProgramsSection from "@/components/ProgramsSection";

export const metadata = {
  title: "Private Program | NeuroHolistic",
  description: "A personalized transformational journey through the NeuroHolistic Method™.",
};

export default function PrivateProgramPage() {
  return (
    <div className="w-full">
      <ProgramsHero />
      <ProgramsSection />
    </div>
  );
}
