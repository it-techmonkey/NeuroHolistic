import CorporateHero from "@/components/CorporateHero";
import WhyItMatters from "@/components/WhyItMatters";
import CorporateApproach from "@/components/CorporateApproach";
import ProgramFocusAreas from "@/components/ProgramFocusAreas";
import CorporateProgramFormats from "@/components/CorporateProgramFormats";
import OrganizationalImpact from "@/components/OrganizationalImpact";
import CorporateCTA from "@/components/CorporateCTA";

export const metadata = {
  title: "Corporate Wellbeing | NeuroHolistic",
  description:
    "Strengthening human performance, resilience, and mental clarity within modern organizations. Partner with NeuroHolistic for regulation-informed wellbeing programs.",
};

export default function CorporateWellbeingPage() {
  return (
    <div className="w-full">
      <CorporateHero />
      <WhyItMatters />
      <CorporateApproach />
      <ProgramFocusAreas />
      <CorporateProgramFormats />
      <OrganizationalImpact />
      <CorporateCTA />
    </div>
  );
}
