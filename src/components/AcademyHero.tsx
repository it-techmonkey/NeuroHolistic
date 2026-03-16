import PageHero from "@/components/ui/PageHero";

export default function AcademyHero() {
  return (
    <PageHero
      eyebrow="Academy"
      title="Train as a NeuroHolistic Applied Psychology Practitioner"
      description="A rigorous, mentor-led curriculum that combines neuroscience, integrative psychology, and clinical ethics for real-world practice."
      imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
      imageAlt="Wellness education cohort in a training session"
      badges={["Mentor-Led", "Applied Psychology", "Certification Pathway"]}
      primaryAction={{ label: "Apply to Academy", href: "/academy/apply" }}
      secondaryAction={{ label: "Book Intro Call", kind: "modal" }}
    />
  );
}
