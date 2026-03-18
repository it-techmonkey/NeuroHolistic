import MethodHero from "@/components/method/MethodHero";
import MethodVision from "@/components/method/MethodVision";
import MethodScientificFoundations from "@/components/method/MethodScientificFoundations";
import FivePhaseArchitecture from "@/components/method/FivePhaseArchitecture";
import MethodDifference from "@/components/method/MethodDifference";
import MethodTransformationAreas from "@/components/method/MethodTransformationAreas";
import TransformationPathway from "@/components/TransformationPathway";

export const metadata = {
  title: "The Method | NeuroHolistic",
  description:
    "The NeuroHolistic Method™—a five-phase architecture for systemic transformation grounded in neuroscience and integrative practice.",
};

export default function MethodPage() {
  return (
    <div className="w-full">
      <MethodHero />
      <MethodVision />
      <MethodScientificFoundations />
      <FivePhaseArchitecture />
      <MethodDifference />
      <MethodTransformationAreas />
      <TransformationPathway />
    </div>
  );
}
