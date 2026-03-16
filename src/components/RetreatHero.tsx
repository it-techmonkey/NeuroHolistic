import PageHero from "@/components/ui/PageHero";

export default function RetreatHero() {
  return (
    <PageHero
      eyebrow="Immersive Retreats"
      title="Retreat Experiences for Deep System Reset"
      description="Step away from daily pressure and enter guided spaces where regulation, integration, and personal clarity can unfold in depth."
      imageSrc="https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=1920&q=80"
      imageAlt="Serene coastal wellness retreat setting"
      badges={["3-7 Day Formats", "Guided Integration", "Small Cohorts"]}
      primaryAction={{ label: "Get Retreat Updates", href: "#retreat-newsletter" }}
      secondaryAction={{ label: "See Events", href: "/events" }}
    />
  );
}
