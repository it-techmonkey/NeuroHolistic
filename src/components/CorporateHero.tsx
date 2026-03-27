import PageHero from "@/components/ui/PageHero";

export default function CorporateHero() {
  return (
    <PageHero
      eyebrow="Corporate Wellbeing"
      title="The State Behind Performance"
      description="Your team’s performance reflects their state. Clear minds. Strong teams. Better decisions."
      imageSrc="/images/pages/corportate_wellbeing.jpg"
      imageAlt="Corporate team in a wellbeing strategy workshop"
      metaTags={["Leadership Cohorts", "Team Resilience", "Culture Health"]}
      primaryAction={{ label: "Schedule a Consultation", kind: "modal" }}
      secondaryAction={{ label: "Contact Us", href: "/contact" }}
    />
  );
}
