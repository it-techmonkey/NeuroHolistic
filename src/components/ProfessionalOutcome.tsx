import Image from "next/image";
import { H2, Body } from "@/components/ui/Typography";

export default function ProfessionalOutcome() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1920&q=80"
          alt=""
          fill
          className="object-cover scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-slate-900/75" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="w-full max-w-2xl rounded-2xl bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl p-8 md:p-12 text-center">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Graduates receive the title
          </p>
          <H2 className="text-neutral-900 mb-6 text-2xl md:text-3xl">
            Certified NeuroHolistic Applied Psychology Practitioner
          </H2>
          <Body className="text-neutral-600 max-w-xl mx-auto">
            Graduates are prepared to work in applied psychology, emotional
            regulation, and wellbeing contexts while maintaining professional
            boundaries and ethical standards aligned with the NeuroHolistic
            Method™.
          </Body>
        </div>
      </div>
    </section>
  );
}
