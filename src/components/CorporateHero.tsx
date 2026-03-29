import PageHero from "@/components/ui/PageHero";

export default function CorporateHero() {
  return (
    <PageHero
      eyebrow="Corporate Wellbeing"
      title="The State Behind Performance"
      description=""
      customDescription={
        <p className="mb-7 max-w-[620px] text-[15px] leading-[1.7] text-white/70 sm:text-[16px] md:text-[18px] lg:mb-10">
          Your team&apos;s performance reflects their <em>state</em>. <br /> Clear minds Strong teams <em>Better decisions</em>
        </p>  
      }
      imageSrc="/images/pages/corportate_wellbeing.jpg"
      imageAlt="Corporate team in a wellbeing strategy workshop"
      metaTags={["Leadership Cohorts", "Team Resilience", "Culture Health"]}
      primaryAction={{ label: "Contact Us", href: "/contact" }}
    />
  );
}
