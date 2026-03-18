"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function WhyItMatters() {
  return (
    <section className="bg-white py-16 md:py-20 lg:py-24 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          
          {/* ── Text Column (Spans 5) ── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >

            <h2 className="mb-8 text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]">
              Why it <span className="italic text-[#64748B] font-normal">matters.</span>
            </h2>

            <div className="space-y-8">
              <p className="text-[17px] leading-[1.8] text-[#475569] md:text-[18px]">
                Modern organizations face growing challenges: stress, burnout, cognitive overload, and reduced engagement. These issues often stem from nervous system dysregulation—yet traditional initiatives rarely address the underlying mechanisms.
              </p>
              
              <div className="h-px w-12 bg-[#E2E8F0]" />

              <p className="text-[16px] leading-[1.8] text-[#64748B]">
                The NeuroHolistic approach supports internal regulation and sustainable performance by working with the human system as a whole. When teams regulate effectively, they collaborate better and perform under pressure without depletion.
              </p>
            </div>

          </motion.div>

          {/* ── Image Column (Spans 7) ── */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="group relative w-full bg-[#FAFBFF] p-4 border border-[#F1F5F9]">
              {/* Sharp Edge Image Frame */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 md:aspect-[16/11]">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80"
                  alt="Corporate wellness and team collaboration"
                  fill
                  className="object-cover grayscale-[20%] transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
              

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}