"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import BookNowButton from "@/components/booking/BookNowButton";

export default function CorporateCTA() {
  return (
    <section id="corporate-cta" className="bg-white py-16 md:py-20 lg:py-24 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          
          {/* ── Text Column (Spans 7) ── */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >


              <h2 className="mb-8 text-[34px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px] lg:text-[64px]">
                Bring the NeuroHolistic <br className="hidden md:block" />
                Method to your <span className="italic text-[#64748B] font-normal">organization.</span>
              </h2>

              <p className="max-w-[540px] text-[17px] leading-[1.8] text-[#475569] md:text-[19px]">
                Partner with the Institute to build systemic resilience, cognitive clarity, and sustainable performance within your executive and operational teams.
              </p>
            </motion.div>
          </div>

          {/* ── Action Column (Spans 5) ── */}
          <div className="lg:col-span-5 lg:pt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col gap-8"
            >
              <div className="flex flex-col gap-6 sm:flex-row lg:flex-col">
                <BookNowButton
                  className="inline-flex h-14 items-center justify-center bg-[#0F172A] px-10 text-[13px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-[#1E293B] rounded-none active:scale-[0.98]"
                >
                  Book a Consultation
                </BookNowButton>
                
                <Link
                  href="mailto:corporate@neuroholistic.com"
                  className="group inline-flex h-14 items-center justify-center border border-[#E2E8F0] bg-transparent px-10 text-[13px] font-bold uppercase tracking-[0.2em] text-[#0F172A] transition-all hover:border-[#0F172A] rounded-none"
                >
                  Contact the Institute
                </Link>
              </div>

              {/* Institutional Footer Detail */}
              <div className="border-t border-[#F1F5F9] pt-8">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">
                    Direct Correspondence
                  </span>
                  <a 
                    href="mailto:corporate@neuroholistic.com"
                    className="text-[14px] font-medium text-[#0F172A] border-b border-[#E2E8F0] pb-1 hover:border-[#0F172A] transition-colors w-fit"
                  >
                    corporate@neuroholistic.com
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}