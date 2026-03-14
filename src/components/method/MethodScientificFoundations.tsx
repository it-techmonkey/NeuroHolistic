const TAGS = [
  "Neuroscience",
  "Neuroplasticity",
  "Epigenetic Regulation",
  "Autonomic & Nervous System Science",
];

export default function MethodScientificFoundations() {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-8">
          Scientific & Theoretical Foundations
        </h2>
        <p className="text-slate-600 text-lg leading-relaxed mb-10">
          The NeuroHolistic Method™ is grounded in contemporary neuroscience,
          psychoneuroimmunology, epigenetic regulation, and neuroplasticity. It
          integrates these disciplines into a coherent framework for
          understanding how the human system regulates, adapts, and transforms.
        </p>
        <div className="flex flex-wrap gap-3">
          {TAGS.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-sm shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
