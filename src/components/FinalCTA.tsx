"use client";

import { motion } from "framer-motion";
import LandingBookingCTA from "@/components/booking/LandingBookingCTA";

export default function FinalCTA() {
  return (
    <section className="w-full bg-white px-4 py-14 md:px-6 md:py-18">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        className="mx-auto max-w-[1280px]"
      >
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#F8FAFC] via-[#FAFBFF] to-[#F1F5F9] px-8 py-16 text-center md:px-12 md:py-24 border border-[#E2E8F0]">
          <LandingBookingCTA
            containerClassName="mx-auto flex max-w-max flex-col sm:flex-row items-center gap-3"
            primaryClassName="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#0F172A] px-10 text-[15px] font-medium text-white transition-all duration-300 hover:bg-[#1E293B] hover:shadow-[0_12px_32px_rgba(15,23,42,0.2)]"
            secondaryClassName="group inline-flex h-14 items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-10 text-[15px] font-medium text-slate-800 transition-all duration-300 hover:border-slate-400 hover:bg-slate-50"
          />
        </div>
      </motion.div>
    </section>
  );
}
