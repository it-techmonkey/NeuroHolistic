import PageHero from "@/components/ui/PageHero";

export const metadata = {
  title: "About | NeuroHolistic",
  description:
    "The story behind the NeuroHolistic Method and its evolution over two decades of exploration, practice, and discovery.",
};

const JOURNEY = [
  {
    title: "The Beginning",
    text: [
      "More than twenty years ago, Dr. Fawzia Yassmina began working closely with individuals facing complex emotional, psychological, and life challenges. Through thousands of hours of observation and practice, deeper patterns of human perception, emotional response, and transformation began to reveal themselves.",
      "These early experiences laid the foundation for what would eventually become the NeuroHolistic Method™.",
    ],
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1400&q=80",
    imageAlt: "Reflective therapeutic consultation setting",
  },
  {
    title: "Years of Exploration",
    text: [
      "As the work deepened, it became clear that lasting transformation could not be understood through a single discipline alone. Insights from neuroscience, psychology, human behavior, and systemic awareness gradually began to converge.",
      "Through years of practice and refinement, recurring mechanisms of change became increasingly visible across individuals from very different backgrounds and life situations.",
    ],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80",
    imageAlt: "Interdisciplinary research notes and workshop discussion",
  },
  {
    title: "Structuring the Method",
    text: [
      "Over time, these insights were organized into a coherent framework. What had initially emerged through observation and practice was eventually articulated into a structured model of transformation.",
      "This process led to the development of the five-phase architecture of the NeuroHolistic Method™, providing a systematic way to understand and facilitate human change.",
    ],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80",
    imageAlt: "Strategic framework planning session",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="w-full bg-[#F4F5F7]">
      <PageHero
        eyebrow="About"
        title="About the NeuroHolistic Institute"
        description="The story behind the NeuroHolistic Method™ and its evolution over two decades of exploration, practice, and discovery."
        imageSrc="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1920&q=80"
        imageAlt="Premium wellbeing consultation environment"
        badges={["20+ Years", "Applied Practice", "Interdisciplinary"]}
      />

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-[1200px] space-y-8">
          {JOURNEY.map((block, index) => (
            <article
              key={block.title}
              className="grid gap-8 rounded-[24px] bg-white p-7 shadow-[0_10px_30px_rgba(17,24,39,0.08)] md:grid-cols-2 md:items-center md:p-9"
            >
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <h2 className="text-[30px] font-semibold text-[#111827]">{block.title}</h2>
                <div className="mt-4 space-y-4 text-[16px] leading-[1.8] text-[#4B5563]">
                  {block.text.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <div className={index % 2 === 1 ? "md:order-1" : ""}>
                <div className="relative h-[260px] overflow-hidden rounded-[18px] md:h-[300px]">
                  <img src={block.image} alt={block.imageAlt} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/35 via-transparent to-transparent" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[1200px] rounded-[24px] bg-white p-8 shadow-[0_10px_30px_rgba(17,24,39,0.08)] md:p-10">
          <h2 className="text-[30px] font-semibold text-[#111827]">The Birth of the NeuroHolistic Institute</h2>
          <p className="mt-4 text-[16px] leading-[1.8] text-[#4B5563]">
            As interest in the work continued to grow, the NeuroHolistic Institute was established to support the continued development and responsible dissemination of the method.
          </p>
          <p className="mt-3 text-[16px] leading-[1.8] text-[#4B5563]">Today the Institute serves three main functions:</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[16px] bg-[#F4F5F7] p-5">
              <p className="text-[12px] uppercase tracking-[0.18em] text-[#8B8BFF]">Function 01</p>
              <p className="mt-2 text-[15px] font-medium text-[#1F2937]">therapeutic work with individuals</p>
            </div>
            <div className="rounded-[16px] bg-[#F4F5F7] p-5">
              <p className="text-[12px] uppercase tracking-[0.18em] text-[#8B8BFF]">Function 02</p>
              <p className="mt-2 text-[15px] font-medium text-[#1F2937]">practitioner training through the NeuroHolistic Academy</p>
            </div>
            <div className="rounded-[16px] bg-[#F4F5F7] p-5">
              <p className="text-[12px] uppercase tracking-[0.18em] text-[#8B8BFF]">Function 03</p>
              <p className="mt-2 text-[15px] font-medium text-[#1F2937]">research and development of the NeuroHolistic framework</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[24px] bg-[#11174A] p-8 text-white shadow-[0_16px_40px_rgba(17,24,39,0.22)]">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#A6A6FF]">Founder</p>
            <h2 className="mt-3 text-[30px] font-semibold">Dr. Fawzia Yassmina</h2>
            <p className="mt-4 text-[16px] leading-[1.8] text-white/85">
              Dr. Fawzia Yassmina is the founder of the NeuroHolistic Method™ and the NeuroHolistic Institute. With more than two decades of experience working with individuals across diverse backgrounds, including leaders, public figures, and individuals facing complex psychological and life challenges-her work focuses on understanding the deeper mechanisms that shape human transformation.
            </p>
          </div>
          <div className="relative h-[340px] overflow-hidden rounded-[24px] shadow-[0_12px_34px_rgba(17,24,39,0.12)]">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1400&q=80"
              alt="Professional portrait representing leadership and clinical expertise"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/40 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="px-6 pb-[120px]">
        <div className="mx-auto max-w-[1200px] rounded-[24px] bg-white p-8 shadow-[0_10px_30px_rgba(17,24,39,0.08)] md:p-10">
          <h2 className="text-[30px] font-semibold text-[#111827]">Vision for the Future</h2>
          <div className="mt-4 space-y-4 text-[16px] leading-[1.85] text-[#4B5563]">
            <p>
              The NeuroHolistic Institute continues to expand the development and application of the NeuroHolistic Method™ through therapeutic work, practitioner training, and research.
            </p>
            <p>
              The Institute's long-term vision is to deepen the scientific understanding of human transformation while supporting the emergence of a new generation of practitioners capable of working responsibly with the complexity of human experience.
            </p>
            <p>
              Through continued exploration, collaboration, and structured practice, the NeuroHolistic framework aims to contribute to a broader evolution in how human wellbeing, awareness, and transformation are understood and facilitated.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
