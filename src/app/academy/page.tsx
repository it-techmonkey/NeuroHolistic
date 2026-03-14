import AcademyHero from "@/components/AcademyHero";
import AcademyIntro from "@/components/AcademyIntro";
import TrainingStructure from "@/components/TrainingStructure";
import ProfessionalOutcome from "@/components/ProfessionalOutcome";
import Accreditation from "@/components/Accreditation";
import AcademyCTA from "@/components/AcademyCTA";

export const metadata = {
  title: "Academy | NeuroHolistic",
  description:
    "Training the next generation of NeuroHolistic practitioners. NeuroHolistic Applied Psychology Mastery for Practitioners.",
};

export default function AcademyPage() {
  return (
    <div className="w-full">
      <AcademyHero />
      <AcademyIntro />
      <TrainingStructure />
      <ProfessionalOutcome />
      <Accreditation />
      <AcademyCTA />
    </div>
  );
}
