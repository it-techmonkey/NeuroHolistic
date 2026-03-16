import PageHero from "@/components/ui/PageHero";

export default function MethodHero() {
  return (
    <PageHero
      eyebrow="The NeuroHolistic Method"
      title="A Five-Phase Architecture for Lasting Transformation"
      description="A structured neuroscience-informed framework designed to move the human system from overload into coherence, resilience, and integrated growth."
      imageSrc="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&q=80"
      imageAlt="Focused mindfulness and neuroscience practice"
      badges={["Science-Based", "Five Phases", "Long-Term Integration"]}
      primaryAction={{ label: "Book Now", kind: "modal" }}
      secondaryAction={{ label: "View Programs", href: "/programs" }}
    />
  );
}
