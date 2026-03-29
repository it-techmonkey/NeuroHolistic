import PageHero from "@/components/ui/PageHero";

export default function ProgramsHero() {
  return (
    <PageHero
      eyebrow="Programs"
      title="Choose the Path That Moves You Forward"
      description="Designed for your stage of change."
      imageSrc="/images/pages/programs.jpg"
      imageAlt="Professional wellbeing coaching session"
      imagePosition="object-[center_60%]"
      metaTags={[]}
      primaryAction={{ label: "Book a Consultation", kind: "modal" }}
    />
  );
}
