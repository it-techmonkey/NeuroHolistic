const DISTINCTIONS = [
  "Works with the human system as an integrated whole",
  "Addresses root patterns rather than isolated symptoms",
  "Structured five-phase transformation process",
  "Integrates neuroscience with systemic human development",
  "Supports both healing and expansion of human potential",
];

export default function MethodDifference() {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">
          What Makes the NeuroHolistic Method™ Different
        </h2>
        <p className="text-slate-600 text-lg leading-relaxed mb-12">
          This approach works with the human system as an integrated whole,
          rather than treating symptoms in isolation. By addressing root
          patterns and supporting the nervous system, cognition, and
          emotional processes together, the method creates conditions for
          deep and lasting transformation.
        </p>
        <div className="rounded-2xl bg-slate-800 text-white p-8 md:p-10 shadow-xl border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">
            Key Distinctions
          </h3>
          <ul className="space-y-4">
            {DISTINCTIONS.map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="text-emerald-400 font-bold text-lg flex-shrink-0" aria-hidden>
                  ✔
                </span>
                <span className="text-slate-200 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
