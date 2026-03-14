import Image from "next/image";
import Link from "next/link";

export default function CorporateHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
          alt=""
          fill
          className="object-cover scale-105"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/88 via-slate-900/55 to-transparent" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 md:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            Corporate Wellbeing
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-200 leading-relaxed">
            Strengthening human performance, resilience, and mental clarity within
            modern organizations.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold text-base hover:bg-slate-100 transition-all shadow-xl shadow-indigo-500/20"
            >
              Contact Us
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white text-white font-semibold text-base hover:bg-white/10 transition-all"
            >
              Schedule a Consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
