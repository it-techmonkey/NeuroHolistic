import PageHero from "@/components/ui/PageHero";

export default function CorporateHero() {
  return (
    <PageHero
      eyebrow="Corporate Wellbeing"
      title="The State Behind Performance"
      description=""
      customDescription={
        <p className="mb-7 max-w-[620px] text-[15px] leading-[1.7] text-white/70 sm:text-[16px] md:text-[18px] lg:mb-10">
          Your team&apos;s <strong className="text-white font-semibold">performance</strong> reflects their <em>state</em>. <strong className="text-white font-semibold">Clear minds</strong>. <strong className="text-white font-semibold">Strong teams</strong>. <em>Better decisions</em>.
        </p>
      }
      imageSrc="/images/pages/corportate_wellbeing.jpg"
      imageAlt="Corporate team in a wellbeing strategy workshop"
      metaTags={["Leadership Cohorts", "Team Resilience", "Culture Health"]}
      primaryAction={{ label: "Contact Us", href: "/contact" }}
    />
  );
}
