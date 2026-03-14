import Link from "next/link";

export default function Research() {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">
              Research & Systems Development
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Our work extends beyond clinical practice. We are committed to
              advancing the understanding of human transformation through
              ongoing research and the development of integrative frameworks
              that bring together neuroscience, psychology, and systemic
              approaches to human potential. Through observation, case studies,
              and continuous refinement of the NeuroHolistic Method™, we aim to
              contribute to a deeper understanding of how internal systems can be
              restored to coherence.
            </p>
            <Link
              href="/research"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              Learn More
            </Link>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden bg-slate-200 aspect-[4/3] flex items-center justify-center border border-slate-200 shadow-xl">
              <span className="text-slate-500 font-medium text-lg">
                Research
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
