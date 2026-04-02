"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function TransformationPathway() {
  return (
    <section className="w-full bg-white px-4 py-20 md:px-6 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        className="mx-auto max-w-[800px] text-center"
      >
        <p className="text-[20px] md:text-[22px] leading-[1.9] text-[#475569] font-light tracking-tight">
          For many individuals, the NeuroHolistic Method&trade; becomes not only a process of healing, but a pathway toward a more{" "}
          <span className="text-[#0F172A] font-medium">conscious</span>,{" "}
          <span className="text-[#0F172A] font-medium">balanced</span>, and{" "}
          <span className="text-[#0F172A] font-medium">empowered</span>{" "}
          way of living.
        </p>

        <div className="mt-10">
          <Link
            href="/consultation/book"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0F172A] px-8 text-[14.5px] font-medium text-white transition-all hover:bg-[#1E293B] hover:shadow-[0_8px_20px_rgba(15,23,42,0.15)]"
          >
            Book a Consultation
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
