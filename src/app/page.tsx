import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import Method from "@/components/Method";
import Programs from "@/components/Programs";
import TransformationAreas from "@/components/TransformationAreas";
import Testimonials from "@/components/Testimonials";
import ScientificFoundation from "@/components/ScientificFoundation";
import Team from "@/components/Team";
import AcademyCTA from "@/components/AcademyCTA";
import Research from "@/components/Research";
import FinalCTA from "@/components/FinalCTA";

export default function HomePage() {
  return (
    <div className="w-full">
      <Hero />
      <Philosophy />
      <Method />
      <Programs />
      <TransformationAreas />
      <Testimonials />
      <ScientificFoundation />
      <Team />
      <AcademyCTA />
      <Research />
      <FinalCTA />
    </div>
  );
}
