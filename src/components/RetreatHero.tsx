import PageHero from "@/components/ui/PageHero";

export default function RetreatHero() {
  return (
    <PageHero
      eyebrow="Immersive Transformation"
      title={
        <>
          Something Changes Here. <br className="hidden lg:block" />
          <span className="italic">You’ll Feel It.</span>
        </>
      }
      description="Immersive retreat experiences that allow you to step away from the noise and enter a deeper, truly transformative process."
      imageSrc="/images/pages/retreat.jpg"
      imageAlt="A serene retreat location in nature"
      metaTags={["Deep Immersion", "Nature Based", "Held Container"]}
      primaryAction={{ label: "View Upcoming Retreats", href: "#upcoming-retreats" }}
      secondaryAction={{ label: "Join Wish List", href: "#newsletter" }}
    />
  );
}