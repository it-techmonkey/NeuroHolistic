import Link from "next/link";
import Section from "@/components/ui/Section";
import { H2, Body } from "@/components/ui/Typography";

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
          <Link
            href="/book"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-500 text-white font-semibold text-base hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25"
          >
            Schedule a Consultation
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-primary-500 text-primary-600 font-semibold text-base hover:bg-primary-50 transition-all"
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
