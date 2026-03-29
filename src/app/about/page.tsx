"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/ui/PageHero";

const JOURNEY = [
  {
    title: "The Beginning",
    description: [
      "More than twenty years ago, Dr. Fawzia Yassmina began working closely with individuals facing complex emotional and psychological challenges. Through thousands of hours of observation, deeper patterns of human perception and transformation began to reveal themselves.",
      "These early experiences laid the foundation for what would eventually become the NeuroHolistic Method™.",
    ],
    image: "/images/team/Fawzia%20Yassmina.jpeg",
  },
  {
    title: "Years of Exploration",
    description: [
      "As the work deepened, insights from neuroscience, psychology, and systemic awareness began to converge. It became clear that lasting transformation could not be understood through a single discipline alone.",
      "Through years of refinement, recurring mechanisms of change became visible across diverse backgrounds and life situations.",
    ],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80",
  },
  {
    title: "Structuring the Method",
    description: [
      "Over time, these insights were organized into a coherent framework. What emerged through practice was articulated into a structured model of transformation.",
      "This led to the five-phase architecture of the NeuroHolistic Method™, providing a systematic way to facilitate human change.",
    ],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="w-full bg-white">
      <PageHero
        eyebrow="About Us"
        title={
          <>
            
            <span className="italic text-white/60 font-normal">The Evolution of the NeuroHolistic Method™<br /></span>
          </>
        }
        description="Redefining How Real Change Happens "
        imageSrc="/images/pages/about.jpg"
        imageAlt="Premium wellbeing consultation environment"
        metaTags={["20+ Years", "Applied Practice", "Interdisciplinary"]}
      />

      {/* ── Section 01: The Chronology (Editorial Spreads) ── */}
      <section className="py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 space-y-20 md:space-y-32">
          {JOURNEY.map((block, i) => (
            <div key={block.title} className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
              
              {/* Text Column */}
              <motion.div 
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <h2 className="mb-8 text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]">
                  {block.title.split(' ').slice(0, -1).join(' ')} <br/>
                  <span className="italic text-[#64748B] font-normal">{block.title.split(' ').pop()}</span>
                </h2>
                <div className="space-y-6 border-l border-[#E2E8F0] pl-8">
                  {block.description.map((p, idx) => (
                    <p key={idx} className="text-[17px] leading-[1.8] text-[#475569]">{p}</p>
                  ))}
                </div>
              </motion.div>

              {/* Image Column */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-1" : ""}`}
              >
                <div className="group relative w-full bg-[#FAFBFF] p-4 border border-[#F1F5F9]">
                  <div className="relative aspect-[16/11] w-full overflow-hidden grayscale-[20%] transition-all duration-1000 group-hover:grayscale-0 bg-white">
                    <Image
                      src={block.image}
                      alt={block.title}
                      fill
                      className={block.title === "The Beginning" ? "object-contain" : "object-cover"}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 02: Institute Functions (Registry Matrix) ── */}
      <section className="bg-[#FAFBFF] py-24 md:py-32 border-y border-[#E2E8F0]">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-[34px] font-light tracking-tight text-[#0F172A] md:text-[48px]">The Birth of the <br/> <span className="italic text-[#64748B]">NeuroHolistic Institute.</span></h2>
            </div>
            <div className="flex flex-col justify-center space-y-6 text-[17px] leading-[1.8] text-[#475569]">
              <p>As interest in the work continued to grow, the NeuroHolistic Institute was established to support the continued development and responsible dissemination of the method.</p>
              <p>Today the Institute serves three main functions:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#E2E8F0]">
            {[
              "Therapeutic work with individuals",
              "Practitioner training through the NeuroHolistic Academy",
              "Research and development of the NeuroHolistic framework"
            ].map((text, i) => (
              <div key={i} className="group flex flex-col justify-between border-b border-[#E2E8F0] p-10 transition-colors hover:bg-white md:border-r last:md:border-r-0">
                <span className="mb-8 font-mono text-[12px] text-[#CBD5E1] group-hover:text-[#6366F1] transition-colors">[ 0{i+1} ]</span>
                <p className="text-[17px] font-medium text-[#0F172A] leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 03: Founder (Editorial Spread) ── */}
      <section className="py-24 md:py-32 lg:py-40 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="lg:col-span-6 lg:sticky lg:top-32">
              <h2 className="mb-8 text-[34px] font-light text-[#0F172A] md:text-[48px]">Dr. Fawzia <span className="italic text-[#64748B]">Yassmina.</span></h2>
              <div className="group relative w-full bg-[#FAFBFF] p-4 border border-[#F1F5F9]">
                <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden grayscale-[30%] transition-all duration-700 group-hover:grayscale-0 rounded-lg bg-white">
                  <Image src="/images/team/Fawzia Yassmina Landing.jpeg" alt="Dr. Fawzia Yassmina" fill className="object-cover object-top" />
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="lg:col-span-6 lg:pt-4">
              <div className="space-y-12 text-[17px] leading-[1.8] text-[#475569]">
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">Natural State of Being</h3>
                  <p>From a young age, I believed in the power within us. I knew we shape our own lives and never allowed myself to be limited by the beliefs of others. I was fortunate to grow up in a loving family that supported free thinking, allowing me to preserve my natural way of being.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">Natural Access to Knowledge</h3>
                  <p>Much of what I later learned felt like something I already understood. I experienced knowledge before learning it and applied it naturally. This deepened my conviction that we have access to something far greater within us. I had a happy childhood and believed this was normal for everyone. I couldn’t understand why people would say, "I can’t."</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">Learn or Recycle</h3>
                  <div className="space-y-4">
                    <p>Life shifted when my father passed away, yet I continued forward. As a young woman, I achieved things others found difficult with ease and a playful spirit. Still, I had not yet learned what life was preparing to show me.</p>
                    <p>Then, within a few years, everything changed. I lost my home country, my nephew, my mother, my elder brother, and my younger brother, the last of my family.</p>
                    <p>I found myself completely cut off. It was then that I understood what "I can’t" truly means.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-[#0F172A]">It Is a Matter of Choice</h3>
                  <div className="space-y-4">
                    <p>I stepped away from life for a time, but deep within, I still knew we decide the course of our lives.</p>
                    <p>One night, I sat awake until sunrise, facing a decision, whether to follow those I had lost, or to continue.</p>
                    <p>With the first light, I chose to live. Not only to live, but to expand what is possible within a human life. In that moment, I understood where "I can’t" comes from, and how to move beyond it.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 04: Vision for the Future (Dark Capstone) ── */}
      <section className="bg-[#0F172A] py-24 md:py-32">
        <div className="mx-auto max-w-[900px] px-6 text-center">
          <h2 className="mb-12 text-[32px] font-light text-white md:text-[48px]">Vision for the <span className="italic text-slate-400">future.</span></h2>
          <div className="space-y-8 text-[17px] leading-[1.8] text-slate-400 max-w-3xl mx-auto">
            <p>
              The NeuroHolistic Institute continues to expand the development and application of the NeuroHolistic Method™ through therapeutic work, practitioner training, and research.
            </p>
            <p>
              The Institute’s long-term vision is to deepen the scientific understanding of human transformation while supporting the emergence of a new generation of practitioners capable of working responsibly with the complexity of human experience.
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