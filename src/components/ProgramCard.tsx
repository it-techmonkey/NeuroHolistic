import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { H3, Body, BodySmall } from "@/components/ui/Typography";

export interface ProgramCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  descriptionSecondary?: string;
  suitedTitle: string;
  suitedBullets: string[];
  ctaLabel: string;
  ctaHref: string;
}

export default function ProgramCard({
  icon,
  title,
  description,
  descriptionSecondary,
  suitedTitle,
  suitedBullets,
  ctaLabel,
  ctaHref,
}: ProgramCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-8 md:p-10 transition-all duration-500 hover:border-[#D1D5DB] hover:shadow-xl hover:-translate-y-1">
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        {/* Header with icon and title */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white flex items-center justify-center text-2xl shadow-md">
            {icon}
          </div>
          <H3 className="text-[#0B1028] text-[24px] md:text-[28px] leading-tight">{title}</H3>
        </div>

        {/* Main description */}
        <Body className="text-[#475569] mb-5 text-[16px] md:text-[17px] leading-[1.7]">
          {description}
        </Body>

        {/* Secondary description */}
        {descriptionSecondary && (
          <BodySmall className="text-[#64748B] mb-8 text-[15px] leading-[1.6]">
            {descriptionSecondary}
          </BodySmall>
        )}

        {/* Suited for section */}
        <div className="mb-8 rounded-xl bg-gradient-to-br from-[#F0F4FF] to-[#F5F7FF] border border-[#E0E7FF] p-6 md:p-7">
          <p className="font-semibold text-[#0B1028] mb-4 text-[15px] md:text-[16px]">
            {suitedTitle}
          </p>
          <ul className="space-y-3">
            {suitedBullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 items-start">
                <span className="text-[#6366F1] mt-1.5 flex-shrink-0 font-bold">▸</span>
                <BodySmall className="text-[#475569] text-[15px] leading-[1.6]">{bullet}</BodySmall>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center px-7 py-3 rounded-lg bg-[#0B1028] text-white font-semibold text-[14px] md:text-[15px] transition-all duration-300 hover:bg-[#1F2347] hover:shadow-lg"
        >
          {ctaLabel} →
        </Link>
      </div>
    </div>
  );
}
