"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function TransformationPathway() {
  return (
    <section className="w-full bg-[#FAFBFF] px-4 py-16 md:px-6 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        className="mx-auto max-w-[900px] text-center"
      >
        <p className="mb-8 text-[17px] leading-[1.8] text-[#475569]">
          For many individuals, the NeuroHolistic Method™ becomes not only a process of healing, but a pathway toward a more conscious, balanced, and empowered way of living.
        </p>

        <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/method"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0F172A] px-8 text-[14.5px] font-medium text-white transition-all hover:bg-[#1E293B] hover:shadow-[0_8px_20px_rgba(15,23,42,0.15)]"
          >
            Experience the Method
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/programs"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#0F172A] bg-white px-8 text-[14.5px] font-medium text-[#0F172A] transition-all hover:bg-[#F8FAFC]"
          >
            Book a Consultation
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <p className="text-[13px] text-[#94A3B8]">
          Initial consultation is complimentary.
        </p>
      </motion.div>
    </section>
  );
}
