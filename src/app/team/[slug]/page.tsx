import { notFound } from "next/navigation";
import Link from "next/link";
import { TEAM_PROFILES, TEAM_PROFILE_MAP } from "@/components/team/team-profiles";

const BOOKING_CALENDAR_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendly.com";

export function generateStaticParams() {
  return TEAM_PROFILES.map((profile) => ({ slug: profile.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const profile = TEAM_PROFILE_MAP.get(params.slug);

  if (!profile) {
    return {
      title: "Team Member | NeuroHolistic",
    };
  }

  return {
    title: `${profile.name} | NeuroHolistic`,
    description: profile.shortBio,
  };
}

export default function TeamProfilePage({ params }: { params: { slug: string } }) {
  const profile = TEAM_PROFILE_MAP.get(params.slug);

  if (!profile) {
    notFound();
  }

  return (
    <div className="w-full bg-[#F4F5F7]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={profile.image} alt={`${profile.name} cover image`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(11,15,43,0.92)_0%,rgba(17,23,74,0.74)_42%,rgba(11,15,43,0.5)_100%)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1200px] px-6 pb-24 pt-44 md:px-10 md:pt-48">
          <p className="text-[12px] uppercase tracking-[0.2em] text-[#A6A6FF]">NeuroHolistic Team</p>
          <h1 className="mt-4 max-w-[820px] text-[36px] font-semibold leading-[1.1] text-white sm:text-[48px] md:text-[58px]">
            {profile.heroTitle}
          </h1>
          <p className="mt-5 max-w-[860px] text-[20px] leading-relaxed text-white/88">{profile.role}</p>
          <a
            href={BOOKING_CALENDAR_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center rounded-[10px] bg-white px-6 py-3.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-slate-100"
          >
            Book a Session
          </a>
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-[1200px] rounded-[24px] bg-white p-8 shadow-[0_12px_32px_rgba(17,24,39,0.08)] md:p-10">
          <h2 className="text-[30px] font-semibold text-[#111827]">Profile</h2>
          <div className="mt-6 space-y-5 text-[17px] leading-[1.85] text-[#4B5563]">
            {profile.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-[120px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[34px] font-semibold text-[#111827]">Testimonials</h2>
            <Link
              href="/team"
              className="text-sm font-semibold text-[#2B2F55] transition-colors hover:text-[#1F2345]"
            >
              Back to Team
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {profile.testimonials.map((testimonial) => (
              <article
                key={testimonial}
                className="rounded-[18px] bg-white p-6 shadow-[0_8px_24px_rgba(17,24,39,0.08)]"
              >
                <p className="text-[16px] leading-[1.75] text-[#374151]">&ldquo;{testimonial}&rdquo;</p>
              </article>
            ))}
          </div>

          <a
            href={BOOKING_CALENDAR_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex items-center rounded-[10px] bg-[#2B2F55] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1F2345]"
          >
            Book a Session
          </a>
        </div>
      </section>
    </div>
  );
}
