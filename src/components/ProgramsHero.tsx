import PageHero from "@/components/ui/PageHero";

export default function ProgramsHero() {
  return (
    <PageHero
      eyebrow="Programs"
      title="Choose a Program Designed for Your Stage of Change"
      description="From private one-to-one pathways to guided group experiences, each program is structured to support regulation, integration, and practical growth."
      imageSrc="/images/pages/programs.jpg"
      imageAlt="Professional wellbeing coaching session"
      metaTags={["Private Sessions", "Group Programs", "Corporate Tracks"]}
      primaryAction={{ label: "Book Consultation", kind: "modal" }}
      secondaryAction={{ label: "See Method", href: "/method" }}
    />
  );
}
