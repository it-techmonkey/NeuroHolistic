import PageHero from "@/components/ui/PageHero";

export default function CorporateHero() {
  return (
    <PageHero
      eyebrow="Corporate Wellbeing"
      title="Regulation-Informed Wellbeing for High-Performance Teams"
      description="Build cultures that sustain focus, resilience, and emotional clarity through neuroscience-led wellbeing programs tailored to modern organizations."
      imageSrc="/images/pages/corportate_wellbeing.jpg"
      imageAlt="Corporate team in a wellbeing strategy workshop"
      metaTags={["Leadership Cohorts", "Team Resilience", "Culture Health"]}
      primaryAction={{ label: "Schedule a Consultation", kind: "modal" }}
      secondaryAction={{ label: "Contact Us", href: "/contact" }}
    />
  );
}
