import Link from "next/link";
import PageHero from "@/components/ui/PageHero";

export const metadata = {
  title: "Research | NeuroHolistic",
  description:
    "Advancing the scientific understanding of human transformation through the NeuroHolistic framework.",
};

const RESEARCH_FOCUS = [
  {
    title: "Neuroscience of Human Transformation",
    description:
      "Exploring neural mechanisms involved in perception, emotional regulation, and adaptive change.",
    icon: "brain",
  },
  {
    title: "Mind-Body Interaction",
    description:
      "Investigating the relationship between psychological states, physiological regulation, and wellbeing.",
    icon: "pulse",
  },
  {
    title: "Epigenetic Adaptation",
    description:
      "Understanding how environment, experience, and behavior interact with biological systems over time.",
    icon: "helix",
  },
  {
    title: "Applied Transformation Models",
    description:
      "Studying how structured methods such as the NeuroHolistic framework facilitate sustainable human change.",
    icon: "layers",
  },
] as const;

function FocusIcon({ type }: { type: "brain" | "pulse" | "helix" | "layers" }) {
  const paths = {
    brain: "M9.5 4a3.5 3.5 0 016.7 1.3A3.8 3.8 0 0118 12.7V13a3.8 3.8 0 01-1.8 3.2A3.5 3.5 0 019.5 20H9a4 4 0 01-4-4v-1.4A3.7 3.7 0 013 11.3V11a3.7 3.7 0 012-3.2V7a4 4 0 014-4h.5z",
    pulse: "M3 12h4l2.4-5 3.2 10L15 12h6",
    helix: "M6 4c6 0 6 5 12 5M6 20c6 0 6-5 12-5M6 9h12M6 15h12",
    layers: "M12 3l8 4-8 4-8-4 8-4zm0 8l8 4-8 4-8-4 8-4z",
  } as const;

  return (
    <svg className="h-5 w-5 text-[#2B2F55]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d={paths[type]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ResearchPage() {
  return (
    <div className="w-full bg-[#F4F5F7]">
      <PageHero
        eyebrow="Research"
        title="Research"
        description="Advancing the scientific understanding of human transformation through the NeuroHolistic framework."
        imageSrc="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1920&q=80"
        imageAlt="Neuroscience research environment"
        badges={["Interdisciplinary", "Practice-Based", "Applied Science"]}
        primaryAction={{ label: "Contact Us", href: "mailto:info@neuroholistic.com" }}
      />

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div className="rounded-[24px] bg-white p-8 shadow-[0_12px_34px_rgba(17,24,39,0.08)] md:p-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8B8BFF]">Research Vision</p>
            <p className="mt-4 text-[17px] leading-[1.8] text-[#374151]">
              The NeuroHolistic Institute is committed to developing a deeper scientific understanding of how human perception, emotional patterns, and behavioral change emerge from the interaction of biological, psychological, and experiential systems.
            </p>
            <p className="mt-5 text-[17px] leading-[1.8] text-[#374151]">
              Our research explores how integrative approaches can support meaningful and sustainable transformation in individuals and communities.
            </p>
          </div>
          <div className="relative h-[320px] overflow-hidden rounded-[24px] shadow-[0_18px_42px_rgba(17,24,39,0.12)]">
            <img
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1400&q=80"
              alt="Scientific data visualization and analysis"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/55 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[34px] font-semibold tracking-tight text-[#111827] md:text-[42px]">Research Focus Areas</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {RESEARCH_FOCUS.map((item) => (
              <article
                key={item.title}
                className="rounded-[20px] bg-white p-7 shadow-[0_8px_28px_rgba(17,24,39,0.08)]"
              >
                <div className="inline-flex rounded-xl bg-[#EEF0F6] p-2.5">
                  <FocusIcon type={item.icon} />
                </div>
                <h3 className="mt-4 text-[20px] font-semibold text-[#111827]">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.75] text-[#4B5563]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-2">
          <article className="rounded-[22px] bg-white p-8 shadow-[0_8px_28px_rgba(17,24,39,0.08)]">
            <h3 className="text-[28px] font-semibold text-[#111827]">Practice-Based Research</h3>
            <p className="mt-4 text-[16px] leading-[1.8] text-[#4B5563]">
              The NeuroHolistic Institute also develops research through structured observation of applied work.
            </p>
            <p className="mt-3 text-[16px] leading-[1.8] text-[#4B5563]">
              Case documentation, practitioner observation, and practice-based inquiry contribute to building a growing body of knowledge around the mechanisms of human transformation.
            </p>
          </article>

          <article className="rounded-[22px] bg-white p-8 shadow-[0_8px_28px_rgba(17,24,39,0.08)]">
            <h3 className="text-[28px] font-semibold text-[#111827]">Academic Collaboration</h3>
            <p className="mt-4 text-[16px] leading-[1.8] text-[#4B5563]">
              The Institute aims to collaborate with universities, researchers, and academic institutions interested in advancing interdisciplinary research on human transformation, applied psychology, and wellbeing.
            </p>
          </article>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[1200px] rounded-[24px] bg-[#11174A] px-8 py-9 text-white shadow-[0_18px_44px_rgba(17,24,39,0.22)] md:px-10 md:py-10">
          <h3 className="text-[26px] font-semibold">Publications & Research Projects</h3>
          <div className="mt-5 grid gap-3 text-[15px] text-white/90 sm:grid-cols-2">
            <p>• research papers</p>
            <p>• case studies</p>
            <p>• ongoing studies</p>
            <p>• conference presentations</p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-[120px]">
        <div className="mx-auto max-w-[1200px] rounded-[24px] bg-white p-8 shadow-[0_12px_34px_rgba(17,24,39,0.08)] md:p-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8B8BFF]">Research Collaboration</p>
          <p className="mt-4 max-w-[820px] text-[17px] leading-[1.75] text-[#374151]">
            Researchers and institutions interested in collaboration are invited to contact the NeuroHolistic Institute.
          </p>
          <Link
            href="mailto:info@neuroholistic.com"
            className="mt-6 inline-flex items-center rounded-[10px] bg-[#2B2F55] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1F2345]"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
