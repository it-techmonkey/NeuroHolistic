import TeamPageHero from "@/components/team/TeamPageHero";
import TeamRegistry from "@/components/team/TeamRegistry";

export const metadata = {
  title: "Faculty & Practitioners | NeuroHolistic",
  description: "The registry of certified NeuroHolistic practitioners and institute faculty.",
};

export default function TeamPage() {
  return (
    <main className="w-full bg-white">
      <TeamPageHero />
      <TeamRegistry />
    </main>
  );
}