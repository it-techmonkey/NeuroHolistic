"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/translations/LanguageContext";

export default function RetreatNewsletter() {
  const [email, setEmail] = useState("");
  const { t } = useLang();
  const rl = t.retreatsLanding;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registry submission:", email);
  };

  return (
    <section className="border-t border-[#E2E8F0] bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="mb-4 text-[34px] font-light tracking-tight text-[#0F172A] md:text-[48px]">
              {rl.registryTitleStart}
              <span className="italic font-normal text-[#64748B]">{rl.registryTitleAccent}</span>
            </h2>
            <p className="mx-auto max-w-[480px] text-[16px] leading-relaxed text-[#475569]">
              {rl.registryDescription}
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-[540px]"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-0 border border-[#E2E8F0] sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={rl.registryEmailPlaceholder}
                className="flex-1 bg-transparent px-5 py-4 text-[15px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] sm:px-6"
                required
              />
              <button
                type="submit"
                className="bg-[#0F172A] px-6 py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#1E293B] sm:px-10 sm:text-[13px] sm:tracking-widest"
              >
                {rl.registrySubscribe}
              </button>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">
                {rl.registryFooter}
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
