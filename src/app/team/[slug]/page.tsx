import { notFound } from "next/navigation";
import { TEAM_PROFILE_MAP, TEAM_PROFILES } from "@/components/team/team-profiles";
import ProfileDossier from "@/components/team/ProfileDossier";

// This generates the paths at build time (Static Site Generation)
export async function generateStaticParams() {
  return TEAM_PROFILES.map((profile) => ({
    slug: profile.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = TEAM_PROFILE_MAP.get(slug);
  if (!profile) return { title: "Practitioner Not Found" };

  return {
    title: `${profile.name.en} | NeuroHolistic Faculty`,
    description: profile.shortBio.en,
  };
}

export default async function TeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = TEAM_PROFILE_MAP.get(slug);

  if (!profile) {
    notFound();
  }

  return <ProfileDossier profile={profile} />;
}