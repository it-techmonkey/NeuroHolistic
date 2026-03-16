import PageHero from "@/components/ui/PageHero";

export default function EventsHero() {
  return (
    <PageHero
      eyebrow="Live Learning"
      title="Events That Translate Neuroscience Into Daily Practice"
      description="Join workshops, guided sessions, and live learning experiences designed to restore nervous system balance and deepen practical transformation."
      imageSrc="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80"
      imageAlt="Participants in a premium wellness workshop"
      badges={["Workshops", "Live Sessions", "Practical Tools"]}
      primaryAction={{ label: "Get Event Updates", href: "#newsletter" }}
      secondaryAction={{ label: "Explore Retreats", href: "/retreats" }}
    />
  );
}
