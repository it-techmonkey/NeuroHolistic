import Link from "next/link";

export default function AcademyCTA() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Become a Therapist
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed mb-10">
          Train in the NeuroHolistic Method™ and join a growing community of
          practitioners dedicated to deep systemic human transformation.
        </p>
        <Link
          href="/academy/apply"
          className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold text-base hover:bg-slate-100 transition-all shadow-xl shadow-indigo-500/20"
        >
          Explore the Academy
        </Link>
      </div>
    </section>
  );
}
