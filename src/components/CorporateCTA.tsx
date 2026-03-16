import Link from "next/link";
import Section from "@/components/ui/Section";
import { H2, Body } from "@/components/ui/Typography";
import BookNowButton from "@/components/booking/BookNowButton";

export default function CorporateCTA() {
  return (
    <Section padding="xl" background="light" id="corporate-cta">
      <div className="max-w-3xl mx-auto text-center">
        <H2 className="text-neutral-900 mb-6">
          Bring the NeuroHolistic Method to Your Organization
        </H2>
        <Body className="text-neutral-600 mb-10">
          Partner with us to build resilience, clarity, and sustainable
          performance within your teams.
        </Body>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <BookNowButton
            className="inline-flex items-center justify-center px-8 py-4 rounded-[10px] bg-[#0B0F2B] text-white font-semibold text-base hover:bg-[#11174A] transition-all hover:-translate-y-[1px] shadow-[0_10px_24px_rgba(11,15,43,0.18)]"
          >
            Schedule a Consultation
          </BookNowButton>
          <Link
            href="mailto:corporate@neuroholistic.com"
            className="inline-flex items-center justify-center px-8 py-4 rounded-[10px] border border-[#CBD5E1] text-[#0F172A] font-semibold text-base hover:bg-[#F8FAFC] transition-all"
          >
            Contact Us
          </Link>
        </div>
        <p className="mt-8 text-sm text-neutral-500">
          For corporate inquiries:{" "}
          <a
            href="mailto:corporate@neuroholistic.com"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            corporate@neuroholistic.com
          </a>
        </p>
      </div>
    </Section>
  );
}
