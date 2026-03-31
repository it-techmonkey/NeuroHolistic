"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function CorporateApproach() {
  return (
    <section className="bg-[#FAFBFF] py-16 md:py-20 lg:py-24 border-y border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          
          {/* ── Heading Column (Spans 5) ── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >

            <h2 className="text-[34px] font-light leading-[1.15] tracking-tight text-[#0F172A] md:text-[48px]">
              The approach for <br className="hidden md:block" />
              <span className="italic text-[#64748B] font-normal">organizations</span>
            </h2>
          </motion.div>

          {/* ── Content Column (Spans 7) ── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 lg:pt-14"
          >
            <div className="max-w-[620px]">
              <p className="text-[18px] leading-[1.8] text-[#475569] md:text-[20px]">
                Our corporate programs integrate neuroscience-informed principles-regulation, perception, and cognitive flexibility-to support teams navigating complexity.
              </p>
              
              <div className="my-10 h-px w-full bg-[#E2E8F0]" />

              <p className="text-[16px] leading-[1.8] text-[#64748B]">
                We focus on building resilience and sustainable performance without relying on short-term fixes. By working with the human system as a whole, we help individuals think more clearly and perform under pressure without depletion.
              </p>
              <div className="mt-8 relative h-[260px] md:h-[320px] rounded-2xl overflow-hidden border border-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80"
                  alt="Corporate approach"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}