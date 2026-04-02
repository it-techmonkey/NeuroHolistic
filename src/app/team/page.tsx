import TeamRegistry from "@/components/team/TeamRegistry";
import PageHero from "@/components/ui/PageHero";

export const metadata = {
  title: "Faculty & Practitioners | NeuroHolistic",
  description: "The registry of certified NeuroHolistic practitioners and institute faculty.",
};

export default function TeamPage() {
  return (
    <main className="w-full bg-white">
      <PageHero
        eyebrow=""
        title={
          <>
            <span className="text-white/60 font-normal">The NeuroHolistic Team</span>
          </>
        }
        description="A registry of professionals trained in the intersection of neuroscience, psychology, and systemic transformation."
        imageSrc="/images/pages/teams.jpg"
        imageAlt="NeuroHolistic Faculty and Research Environment"
        metaTags={[]}
      />

      <TeamRegistry />
    </main>
  );
}