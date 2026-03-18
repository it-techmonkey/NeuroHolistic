"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/ui/PageHero";

const RESEARCH_FOCUS = [
  {
    step: "01",
    label: "Biological",
    title: "Neuroscience of Transformation",
    description: "Exploring neural mechanisms involved in perception, emotional regulation, and adaptive change.",
    symbol: "◆",
  },
  {
    step: "02",
    label: "Physiological",
    title: "Mind-Body Interaction",
    description: "Investigating the relationship between psychological states, physiological regulation, and wellbeing.",
    symbol: "◇",
  },
  {
    step: "03",
    label: "Genetics",
    title: "Epigenetic Adaptation",
    description: "Understanding how environment and experience interact with biological systems over time.",
    symbol: "○",
  },
  {
    step: "04",
    label: "Methodology",
    title: "Applied Transformation Models",
    description: "Studying how structured frameworks facilitate sustainable and measurable human change.",
    symbol: "△",
  },
] as const;

export default function ResearchPage() {
  return (
    <div className="w-full bg-white">
      <PageHero
        eyebrow="Research"
        title={
          <>
            Advancing the science of <br />
            <span className="italic text-white/60 font-normal">transformation.</span>
          </>
        }
        description="Developing a deeper understanding of human systems through interdisciplinary scientific inquiry and applied practice."
        imageSrc="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1920&q=80"
        imageAlt="Neuroscience research environment"
        metaTags={["Interdisciplinary", "Practice-Based", "Applied Science"]}
        primaryAction={{ label: "Inquire for Collaboration", href: "mailto:info@neuroholistic.com" }}
      />

      {/* ── Section 01: Research Vision (Editorial Spread) ── */}
      <section className="py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6"
            >
              <h2 className="mb-8 text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]">
                Understanding the <br />
                <span className="italic text-[#64748B] font-normal">emergent human.</span>
              </h2>
              <div className="space-y-8 border-l border-[#E2E8F0] pl-8">
                <p className="text-[17px] leading-[1.8] text-[#475569]">
                  The NeuroHolistic Institute is committed to developing a scientific understanding of how human perception and behavioral change emerge from the interaction of biological and experiential systems.
                </p>
                <p className="text-[17px] leading-[1.8] text-[#475569]">
                  Our research explores how integrative approaches support sustainable transformation in individuals and communities, grounded in rigorous observation.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-6"
            >
              <div className="group relative w-full bg-[#FAFBFF] p-4 border border-[#F1F5F9]">
                <div className="relative aspect-[16/11] w-full overflow-hidden grayscale-[40%] transition-all duration-1000 group-hover:grayscale-0">
                  <Image
                    src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1400&q=80"
                    alt="Scientific data visualization"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 02: Focus Areas (Registry Matrix) ── */}
      <section className="bg-[#FAFBFF] py-24 md:py-32 lg:py-40 border-y border-[#E2E8F0]">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="mb-20">
            <h2 className="mt-6 text-[34px] font-light tracking-tight text-[#0F172A] md:text-[48px]">Areas of <span className="italic text-[#64748B]">Inquiry.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-[#E2E8F0]">
            {RESEARCH_FOCUS.map((item, i) => (
              <div key={item.title} className="group border-b border-[#E2E8F0] p-10 transition-colors hover:bg-white lg:border-r last:lg:border-r-0">
                <div className="mb-12 flex items-center justify-between">
                  <span className="font-mono text-[12px] text-[#CBD5E1] group-hover:text-[#6366F1] transition-colors">[ {item.step} ]</span>
                  <span className="text-[18px] text-[#6366F1] opacity-30 group-hover:opacity-100 transition-opacity">{item.symbol}</span>
                </div>
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">{item.label}</span>
                <h3 className="mb-4 text-[19px] font-semibold text-[#0F172A] leading-snug">{item.title}</h3>
                <p className="text-[15px] leading-[1.7] text-[#64748B]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 03: Practice & Collaboration (Asymmetrical Dossier) ── */}
      <section className="py-24 md:py-32 lg:py-40 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
            <div className="border-l border-[#E2E8F0] pl-10">
              <h3 className="text-[28px] font-light tracking-tight text-[#0F172A] md:text-[36px]">
                Practice-Based <br/><span className="italic text-[#64748B]">Research.</span>
              </h3>
              <p className="mt-6 text-[16px] leading-[1.8] text-[#4B5563]">
                The Institute develops research through structured observation of applied work. Case documentation and practitioner inquiry contribute to building a body of knowledge around the mechanisms of human transformation.
              </p>
            </div>
            <div className="border-l border-[#E2E8F0] pl-10 lg:mt-20">
              <h3 className="text-[28px] font-light tracking-tight text-[#0F172A] md:text-[36px]">
                Academic <br/><span className="italic text-[#64748B]">Collaboration.</span>
              </h3>
              <p className="mt-6 text-[16px] leading-[1.8] text-[#4B5563]">
                The Institute collaborates with universities and academic institutions interested in advancing interdisciplinary research on applied psychology, neuroscience, and wellbeing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 04: Publications (Dark Capstone) ── */}
      <section className="bg-[#0F172A] py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-end">
            <div className="lg:col-span-7">
              <h3 className="mt-6 text-[32px] font-light text-white md:text-[44px]">Research Projects <br/>& <span className="italic text-slate-400">Publications.</span></h3>
            </div>
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-white/10 pt-8">
                {["Research Papers", "Ongoing Studies", "Case Studies", "Presentations"].map((pub, i) => (
                  <div key={pub} className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-white/30">0{i+1}</span>
                    <span className="text-[12px] font-bold uppercase tracking-widest text-white/80">{pub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 05: Final Inquiry (Clean CTA) ── */}
      <section className="py-24 md:py-32 border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-[800px] px-6 text-center">
          <h2 className="mt-6 text-[32px] font-light tracking-tight text-[#0F172A] md:text-[42px]">
            Inquire for <span className="italic text-[#64748B]">partnership.</span>
          </h2>
          <p className="mt-8 text-[17px] leading-[1.8] text-[#475569]">
            Researchers and institutions interested in collaboration are invited to contact the NeuroHolistic Institute.
          </p>
          <Link
            href="mailto:info@neuroholistic.com"
            className="mt-12 inline-flex h-14 items-center justify-center bg-[#0F172A] px-10 text-[13px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-[#1E293B]"
          >
            Contact the Institute
          </Link>
        </div>
      </section>
    </div>
  );
}