"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import BookNowButton from "@/components/booking/BookNowButton";

interface HeroAction {
  label: string;
  href?: string;
  kind?: "link" | "modal";
}

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode; 
  description: string;
  customDescription?: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  metaTags?: string[];
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
}

export default function PageHero({
  eyebrow,
  title,
  description,
  customDescription,
  imageSrc,
  imageAlt,
  imagePosition = "object-center",
  metaTags = [],
  primaryAction,
  secondaryAction,
}: PageHeroProps) {
  const hasCustomDesc = !!customDescription;
  
  return (
    <section className="relative flex min-h-[80vh] w-full items-center overflow-hidden pt-28 pb-14 sm:min-h-[85vh] sm:pt-32 sm:pb-16 md:min-h-[90vh] md:pt-40 md:pb-24">
      
      {/* ── Background Layer ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className={`object-cover ${imagePosition}`}
          sizes="100vw"
          quality={95}
        />
        {/* Extended Gradient: Higher opacity on the left to handle longer text wrap */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.95)_0%,rgba(15,23,42,0.6)_40%,rgba(15,23,42,0)_100%)]" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ── Content Layer ── */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[900px]" // Widened slightly to prevent 1-word line breaks
        >
          {/* Label */}
          <div className="mb-5 flex items-center gap-4 md:mb-8">
            <span className="font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase">
              {eyebrow}
            </span>
          </div>

          {/* Headline: Uses 'clamp' to shrink on small laptops and wrap safely */}
          <h1 className="mb-5 text-[clamp(30px,9vw,72px)] font-light leading-[1.05] tracking-tight text-white md:mb-6 lg:text-[clamp(48px,6vw,84px)]">
            {title}
          </h1>

          {/* Description: Controlled max-width for line-length comfort */}
          {hasCustomDesc ? (
            customDescription
          ) : description ? (
            <p className="mb-7 max-w-[620px] text-[15px] leading-[1.7] text-white/70 sm:text-[16px] md:text-[18px] lg:mb-10">
              {description}
            </p>
          ) : null}

          {/* Meta Information: Switched to flex-wrap for better overflow management */}
          {metaTags.length > 0 && (
            <div className="mb-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6 lg:mb-12">
              {metaTags.map((tag, i) => (
                <div key={tag} className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-white/20">0{i + 1}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-10">
            {primaryAction?.kind === "modal" ? (
              <BookNowButton className="h-11 min-w-[160px] bg-white px-6 text-[12px] font-bold uppercase tracking-widest text-black transition-all hover:bg-neutral-100 active:scale-95 sm:h-12 sm:min-w-[180px] sm:px-8 sm:text-[13px] md:h-14">
                {primaryAction.label}
              </BookNowButton>
            ) : primaryAction && (
              <Link
                href={primaryAction.href || "#"}
                className="flex h-11 min-w-[160px] items-center justify-center bg-white px-6 text-[12px] font-bold uppercase tracking-widest text-black transition-all hover:bg-neutral-100 sm:h-12 sm:min-w-[180px] sm:px-8 sm:text-[13px] md:h-14"
              >
                {primaryAction.label}
              </Link>
            )}

            {secondaryAction && (
              <Link
                href={secondaryAction.href || "#"}
                className="group flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.2em] text-white"
              >
                <span className="relative">
                  {secondaryAction.label}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-white transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
                </span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}