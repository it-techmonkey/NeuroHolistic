import PageHero from "@/components/ui/PageHero";

export default function EventsHero() {
  return (
    <PageHero
      eyebrow="Live Learning Experiences"
      title={
        <>
          Translating neuroscience into <br className="hidden lg:block" />
          <span className="italic">daily practice.</span>
        </>
      }
      description="Join workshops, guided sessions, and live learning experiences designed to restore nervous system balance and deepen practical transformation through the NeuroHolistic Method™."
      imageSrc="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400&q=80"
      imageAlt="Participants in a premium wellness workshop"
      metaTags={["Workshops", "Live Sessions", "Practical Tools"]}
      primaryAction={{ label: "Get Event Updates", href: "#newsletter" }}
      secondaryAction={{ label: "Explore Retreats", href: "/retreats" }}
    />
  );
}