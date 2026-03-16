import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import { TEAM_PROFILES } from "@/components/team/team-profiles";

export const metadata = {
  title: "Team | NeuroHolistic",
  description:
    "Meet the NeuroHolistic team guiding therapeutic transformation, practitioner development, and human-centered research.",
};

export default function TeamPage() {
  return (
    <div className="w-full bg-[#F4F5F7]">
      <PageHero
        eyebrow="Our Team"
        title="NeuroHolistic Team"
        description="Meet the practitioners and leadership team guiding personal transformation, practitioner training, and research within the NeuroHolistic Institute."
        imageSrc="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80"
        imageAlt="Professional wellbeing team collaboration"
        badges={["Founder-Led", "Certified Practitioners", "Client-Centered"]}
      />

      <section className="px-6 py-[110px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM_PROFILES.map((profile) => (
              <article
                key={profile.slug}
                className="overflow-hidden rounded-[22px] bg-white shadow-[0_10px_30px_rgba(17,24,39,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(17,24,39,0.12)]"
              >
                <div className="relative h-[250px] overflow-hidden">
                  <img
                    src={profile.image}
                    alt={`${profile.name} profile image`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/45 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h2 className="text-[22px] font-semibold text-[#111827]">{profile.name}</h2>
                  <p className="mt-1 text-[14px] text-[#6B7280]">{profile.role}</p>
                  <p className="mt-4 text-[15px] leading-[1.75] text-[#4B5563]">{profile.shortBio}</p>
                  <Link
                    href={`/team/${profile.slug}`}
                    className="mt-5 inline-flex items-center rounded-[10px] bg-[#2B2F55] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1F2345]"
                  >
                    View Profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
