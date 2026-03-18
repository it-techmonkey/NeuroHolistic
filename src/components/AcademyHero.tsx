import PageHero from "@/components/ui/PageHero";

export default function AcademyHero() {
  return (
    <PageHero
      eyebrow="Academy"
      title="Training the next generation of NeuroHolistic practitioners."
      description=" "
      imageSrc="/images/pages/academy.jpg"
      imageAlt="Wellness education cohort in a training session"
      metaTags={[]}
      primaryAction={{ label: "Apply to Academy", href: "/academy/apply" }}
      secondaryAction={{ label: "Book Intro Call", kind: "modal" }}
    />
  );
}
