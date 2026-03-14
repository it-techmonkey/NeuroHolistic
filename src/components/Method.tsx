import Link from "next/link";

export default function Method() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">
              The NeuroHolistic Method™
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              A five-phase architecture for systemic transformation. The
              NeuroHolistic Method™ unfolds through five structured phases—from
              releasing accumulated stress patterns to stabilizing new neural,
              emotional, and cognitive pathways—supporting deep, lasting change.
            </p>
            <Link
              href="/method"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              Explore the Method
            </Link>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xl aspect-[4/3] flex items-center justify-center">
              <div className="text-center p-8">
                <span className="text-2xl md:text-3xl font-semibold text-slate-400 tracking-widest uppercase">
                  Mental Health
                </span>
                <p className="mt-2 text-sm text-slate-400">Integrated wellness</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
