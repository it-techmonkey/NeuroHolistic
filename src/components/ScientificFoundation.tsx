import Link from "next/link";

export default function ScientificFoundation() {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">
              Scientific & Theoretical Foundations
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              The NeuroHolistic Method™ integrates insights from contemporary
              neuroscience, research on neuroplasticity and epigenetic
              expression, and emerging perspectives on bioenergetic processes in
              human functioning. It also draws on modern physics concepts that
              highlight the interconnected, dynamic nature of complex systems—a
              broader framework for understanding human potential and
              transformation.
            </p>
            <Link
              href="/research"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              Explore More
            </Link>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-slate-200 aspect-[4/3] flex items-center justify-center border border-slate-200 shadow-xl">
              <div className="w-32 h-32 rounded-full bg-slate-300 flex items-center justify-center text-slate-500 text-4xl font-bold">
                Dr
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
