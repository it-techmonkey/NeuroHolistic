"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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
          <Link
            href="/programs"
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#0F172A] px-10 text-[15px] font-medium text-white transition-all duration-300 hover:bg-[#1E293B] hover:shadow-[0_12px_32px_rgba(15,23,42,0.2)]"
          >
            Book a Consultation
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
