import PageHero from "@/components/ui/PageHero";

export default function AcademyHero() {
  return (
    <PageHero
      eyebrow="Academy"
      title="Master the NeuroHolistic Method™"
      description="NeuroHolistic Applied Psychology Mastery"
      imageSrc="/images/pages/academy.jpg"
      imageAlt="Wellness education cohort in a training session"
      metaTags={[]}
      primaryAction={{ label: "Apply to Academy", href: "/booking/paid-program-booking?mode=academy" }}
      secondaryAction={{ label: "Book Intro Call", kind: "modal" }}
    />
  );
}
