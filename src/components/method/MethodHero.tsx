import PageHero from "@/components/ui/PageHero";

export default function MethodHero() {
  return (
    <PageHero
    eyebrow="The Methodology"
      title={<>The NeuroHolistic <br/><span className="italic font-light opacity-90">Methods.</span></>}
      description="Systematic approaches to transformation. Harnessing neuroplasticity for lasting growth and systemic coherence."
      imageSrc="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&q=80" // Use a sharp, professional consultation photo
      imageAlt="Clinical consultation"
      primaryAction={{ label: "Book a Consultation", kind: "modal" }}
      secondaryAction={{ label: "Explore Research", href: "/research" }}
    />
  );
}



