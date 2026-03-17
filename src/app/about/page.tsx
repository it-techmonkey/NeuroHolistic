"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/ui/PageHero";

const JOURNEY = [
  {
    step: "01",
    label: "Origins",
    title: "The Beginning",
    description: [
      "More than twenty years ago, Dr. Fawzia Yassmina began working closely with individuals facing complex emotional and psychological challenges. Through thousands of hours of observation, deeper patterns of human perception and transformation began to reveal themselves.",
      "These early experiences laid the foundation for what would eventually become the NeuroHolistic Method™.",
    ],
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1400&q=80",
  },
  {
    step: "02",
    label: "Convergence",
    title: "Years of Exploration",
    description: [
      "As the work deepened, insights from neuroscience, psychology, and systemic awareness began to converge. It became clear that lasting transformation could not be understood through a single discipline alone.",
      "Through years of refinement, recurring mechanisms of change became visible across diverse backgrounds and life situations.",
    ],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80",
  },
  {
    step: "03",
    label: "Synthesis",
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
        eyebrow="Identity"
        title={
          <>
            Two decades of exploration <br />
            <span className="italic text-white/60 font-normal">& discovery.</span>
          </>
        }
        description="The story behind the NeuroHolistic Method™ and its evolution from applied practice into a structured framework for transformation."
        imageSrc="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1920&q=80"
        imageAlt="Premium wellbeing consultation environment"
        metaTags={["20+ Years", "Applied Practice", "Interdisciplinary"]}
      />

      {/* ── Section 01: The Chronology (Editorial Spreads) ── */}
      <section className="py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 space-y-32 md:space-y-48">
          {JOURNEY.map((block, i) => (
            <div key={block.title} className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
              
              {/* Text Column */}
              <motion.div 
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <div className="mb-10 flex items-center gap-4">
                  <span className="font-mono text-[11px] tracking-[0.4em] text-[#6366F1] uppercase">
                    {block.label} // {block.step}
                  </span>
                </div>
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
                  <div className="relative aspect-[16/11] w-full overflow-hidden grayscale-[20%] transition-all duration-1000 group-hover:grayscale-0">
                    <Image src={block.image} alt={block.title} fill className="object-cover" />
                  </div>
                  <div className="mt-6 flex justify-between px-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">Registry // Archive</span>
                    <span className="text-[13px] italic text-[#64748B]">Historical Context</span>
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
          <div className="mb-20">
            <span className="font-mono text-[11px] tracking-[0.4em] text-[#6366F1] uppercase">Institutional Structure</span>
            <h2 className="mt-6 text-[34px] font-light tracking-tight text-[#0F172A] md:text-[48px]">The Birth of the <br/> <span className="italic text-[#64748B]">NeuroHolistic Institute.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#E2E8F0]">
            {[
              "Therapeutic work with individuals",
              "Practitioner training through the Academy",
              "Research and development of the framework"
            ].map((text, i) => (
              <div key={i} className="group border-b border-[#E2E8F0] p-10 transition-colors hover:bg-white md:border-r last:md:border-r-0">
                <span className="font-mono text-[12px] text-[#CBD5E1] group-hover:text-[#6366F1] transition-colors">[ 0{i + 1} ]</span>
                <p className="mt-8 text-[16px] font-semibold text-[#0F172A] leading-relaxed uppercase tracking-wide">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 03: Founder (Editorial Spread) ── */}
      <section className="py-24 md:py-32 lg:py-40 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="lg:col-span-5">
              <span className="font-mono text-[11px] tracking-[0.4em] text-[#6366F1] uppercase">The Founder</span>
              <h2 className="mt-6 mb-8 text-[34px] font-light text-[#0F172A] md:text-[48px]">Dr. Fawzia <span className="italic text-[#64748B]">Yassmina.</span></h2>
              <div className="space-y-6 border-l border-[#E2E8F0] pl-8 text-[17px] leading-[1.8] text-[#475569]">
                <p>Dr. Fawzia Yassmina is the founder of the NeuroHolistic Method™ and the Institute. With more than two decades of experience, her work focuses on the deeper mechanisms of human transformation.</p>
                <p className="text-[15px] italic text-[#94A3B8]">Leaders, public figures, and individuals facing complex psychological and life challenges.</p>
              </div>
            </motion.div>
            <div className="lg:col-span-7">
              <div className="group relative w-full bg-[#FAFBFF] p-4 border border-[#F1F5F9]">
                <div className="relative aspect-[4/5] md:aspect-[16/10] overflow-hidden grayscale-[30%] transition-all duration-700 group-hover:grayscale-0">
                  <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1400&q=80" alt="Dr. Fawzia Yassmina" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 04: Vision (Dark Capstone) ── */}
      <section className="bg-[#0F172A] py-24 md:py-32">
        <div className="mx-auto max-w-[900px] px-6 text-center">
          <span className="font-mono text-[11px] tracking-[0.4em] text-[#8B8BFF] uppercase">Future // Vision</span>
          <h2 className="mt-8 mb-10 text-[32px] font-light text-white md:text-[48px]">The long-term vision is to <span className="italic text-slate-400">deepen the science.</span></h2>
          <div className="space-y-8 text-[17px] leading-[1.8] text-slate-400">
            <p>We aim to support the emergence of a new generation of practitioners capable of working responsibly with the complexity of human experience.</p>
            <p className="font-mono text-[11px] uppercase tracking-widest opacity-40">Systemic Evolution // Applied Awareness</p>
          </div>
        </div>
      </section>
    </div>
  );
}