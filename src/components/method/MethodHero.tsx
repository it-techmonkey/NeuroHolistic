import PageHero from "@/components/ui/PageHero";

export default function MethodHero() {
  return (
    <PageHero
    eyebrow="The Methodology"
      title={<>The NeuroHolistic <br/><span className="italic font-light opacity-90">Methods.</span></>}
      description="Systematic approaches to transformation. Harnessing neuroplasticity for lasting growth and systemic coherence."
      imageSrc="/images/pages/methods.jpg"
      imageAlt="Clinical consultation"
      imagePosition="object-center"
      primaryAction={{ label: "Book a Consultation", kind: "modal" }}
      secondaryAction={{ label: "Explore Research", href: "/research" }}
    />
  );
}



