import PageHero from "@/components/ui/PageHero";

export default function CorporateHero() {
  return (
    <PageHero
      eyebrow="Corporate Wellbeing"
      title="The State Behind Performance"
      description={<>Your team's performance reflects their state.<br/><strong>Clear minds.</strong> <em>Strong teams.</em><br/><strong>Better decisions.</strong></>}
      imageSrc="/images/pages/corportate_wellbeing.jpg"
      imageAlt="Corporate team in a wellbeing strategy workshop"
      metaTags={["Leadership Cohorts", "Team Resilience", "Culture Health"]}
      primaryAction={{ label: "Contact Us", href: "/contact" }}
    />
  );
}
