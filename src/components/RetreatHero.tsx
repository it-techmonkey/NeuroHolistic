import PageHero from "@/components/ui/PageHero";

export default function RetreatHero() {
  return (
    <PageHero
      eyebrow="Immersive Transformation"
      title={
        <>
          Step away to restore <br className="hidden lg:block" />
          <span className="italic">nervous coherence.</span>
        </>
      }
      description="Immersive retreat experiences designed to decouple from daily stressors and engage deeply in the transformational process of the NeuroHolistic Method™."
      imageSrc="https://images.unsplash.com/photo-1544367563-12123d8965cd?w=1400&q=80"
      imageAlt="A serene retreat location in nature"
      metaTags={["Deep Immersion", "Nature Based", "Held Container"]}
      primaryAction={{ label: "View Upcoming Retreats", href: "#upcoming-retreats" }}
      secondaryAction={{ label: "Join Waitlist", href: "#newsletter" }}
    />
  );
}