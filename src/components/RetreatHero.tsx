import PageHero from "@/components/ui/PageHero";

export default function RetreatHero() {
  return (
    <PageHero
      eyebrow="Immersive Transformation"
      title={
        <>
          Step Out of Routine <br className="hidden lg:block" />
          Enter Deep Transformation
        </>
      }
      description="Immersive retreats designed to help you disconnect from daily overload, regulate your system, and move through lasting inner transformation."
      imageSrc="/images/pages/retreat.jpg"
      imageAlt="A serene retreat location in nature"
      metaTags={["Deep Immersion", "Nature Based", "Held Container"]}
      primaryAction={{ label: "View Upcoming Retreats", href: "#upcoming-retreats" }}
      secondaryAction={{ label: "Join Wish List", href: "#newsletter" }}
    />
  );
}