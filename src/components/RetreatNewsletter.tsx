"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function RetreatNewsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registry submission:", email);
  };

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="flex flex-col items-center text-center">
          
          {/* ── Heading ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >

            <h2 className="text-[34px] md:text-[48px] font-light tracking-tight text-[#0F172A] mb-4">
              Join the <span className="italic font-normal text-[#64748B]">Registry.</span>
            </h2>
            <p className="text-[16px] text-[#475569] max-w-[480px] mx-auto leading-relaxed">
              Formal updates regarding upcoming clinical workshops, retreats, and live integration sessions.
            </p>
          </motion.div>

          {/* ── Simplified Form ── */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-[540px]"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-0 border border-[#E2E8F0] transition-within:border-[#0F172A] sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 bg-transparent px-5 py-4 text-[15px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none sm:px-6"
                required
              />
              <button
                type="submit"
                className="bg-[#0F172A] px-6 py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#1E293B] sm:px-10 sm:text-[13px] sm:tracking-widest"
              >
                Subscribe
              </button>
            </div>
            
            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">
                Institutional Updates // NeuroHolistic Institute
              </p>
            </div>
          </motion.form>

        </div>
      </div>
    </section>
  );
}