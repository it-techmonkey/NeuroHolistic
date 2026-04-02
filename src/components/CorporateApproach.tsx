"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function CorporateApproach() {
  return (
    <section className="bg-[#FAFBFF] py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          
          {/* ── Content Column (Spans 7, Left) ── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <h2 className="mb-8 text-[34px] font-light leading-[1.15] tracking-tight text-[#0F172A] md:text-[48px]">
              The Approach for <br className="hidden md:block" />
              <span className="italic text-[#64748B] font-normal">Organizations</span>
            </h2>

            <p className="text-[17px] leading-[1.8] text-[#475569]">
              Our corporate programs integrate neuroscience-informed principles-regulation, perception, and cognitive flexibility-to support teams navigating complexity.
            </p>
              
            <p className="mt-8 text-[17px] leading-[1.8] text-[#475569]">
              We focus on building resilience and sustainable performance without relying on short-term fixes. By working with the human system as a whole, we help individuals think more clearly and perform under pressure without depletion.
            </p>
          </motion.div>

          {/* ── Image Column (Spans 5, Right) ── */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 lg:pt-14"
          >
            <div className="relative h-[260px] md:h-[320px] rounded-2xl overflow-hidden border border-slate-200">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80"
                alt="Corporate approach"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}