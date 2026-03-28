import PageHero from "@/components/ui/PageHero";

const RESOURCE_SECTIONS = [
  {
    title: "Articles & Insights",
    desc: "Foundational reading on regulation, perception, emotional patterns, and transformation.",
  },
  {
    title: "Media & Videos",
    desc: "Curated interviews, educational clips, and practical guidance from the NeuroHolistic ecosystem.",
  },
  {
    title: "Audios",
    desc: "Practical worksheets and reflection tools to support integration between sessions.",
  },
];

export const metadata = {
  title: "Resources | NeuroHolistic",
  description: "Articles, media, and practical tools to support your NeuroHolistic journey.",
};

export default function ResourcesPage() {
  return (
    <main className="w-full bg-white">
      <PageHero
        eyebrow="Resources"
        title={
          <>
            Explore practical <br />
            <span className="italic text-white/60 font-normal">learning resources.</span>
          </>
        }
        description="A growing knowledge base to support awareness, integration, and meaningful change."
        imageSrc="/images/pages/teams.jpg"
        imageAlt="Resources"
        metaTags={["Articles", "Media", "Tools"]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {RESOURCE_SECTIONS.map((section) => (
            <div key={section.title} className="rounded-xl border border-slate-200 p-6 bg-slate-50/50">
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-3 text-slate-600 leading-relaxed">{section.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
