"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import HeroBookingForm from "@/components/booking/HeroBookingForm";
import { useLang } from "@/lib/translations/LanguageContext";
import { useLang } from "@/lib/translations/LanguageContext";

export default function Hero() {
  const { t } = useLang();
  const h = t.hero;

  const eyebrowLines = h.eyebrow.split("\n");
  const taglineLines = h.tagline.split("\n");

  const { isArabic } = useLang();

  // Use a dedicated Arabic hero image only for the Arabic version of the homepage.
  const heroImageSrc = isArabic
    ? "/images/pages/arabic version home page img.jpg"
    : "/images/pages/hero-img-main.webp";

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-dvh w-full items-center overflow-hidden bg-[#050608]"
    >
      <div className="absolute inset-0">
        <Image
          src={heroImageSrc}
          alt="A figure walking toward sunrise through a coastal cave"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,3,10,0.96)_0%,rgba(0,3,10,0.92)_31%,rgba(0,3,10,0.54)_55%,rgba(0,3,10,0.16)_76%,rgba(0,3,10,0.28)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#050608] to-transparent" />
      </div>

      <div className="relative z-10 w-full px-6 pb-14 pt-28 sm:px-10 sm:pb-16 sm:pt-32 md:px-[92px] lg:pt-36">
        <div className="flex min-h-[calc(100dvh-10rem)] w-full items-center">
          <div
            className="flex max-w-[650px] flex-col items-start text-left"
            style={{ fontFamily: "var(--font-hero-copy), 'Montserrat', system-ui, sans-serif" }}
          >
            <p className="text-[19px] font-normal uppercase tracking-[5] leading-[1.55] text-[#D3AB79] sm:text-[23px] md:text-[27px]">
              {eyebrowLines[0]}
              <br />
              {eyebrowLines[1]}
            </p>
            <h1
              className="mt-8 text-[50px] uppercase text-[#D3AB79] sm:mt-9 sm:text-[70px] md:text-[86px] lg:text-[90px]"
              style={{
                fontFamily: "var(--font-hero-display), 'Playfair Display', serif",
                fontWeight: 300,
                letterSpacing: 10,
                lineHeight: 0.92,
              }}
            >
              {h.title}
            </h1>
            <div className="mt-10 h-px w-[72px] bg-[#D3AB79] sm:mt-11" />
            <p className="mt-7 text-[18px] font-normal uppercase leading-[1.6] tracking-[5] !text-[#D3AB79] sm:text-[21px] md:text-[23px]">
              {taglineLines[0]}
              <br />
              <span className="text-white">{taglineLines[1]}</span>
            </p>
            <div className="mt-5">
              <HeroBookingForm />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
