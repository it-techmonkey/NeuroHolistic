import Image from "next/image";

const PHASES = [
  {
    number: "01",
    title: "Release",
    description:
      "Releasing accumulated emotional and physiological tension so the system can begin to shift out of chronic stress and into a state of safety.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
  },
  {
    number: "02",
    title: "Developmental Repatterning",
    description:
      "Reorganizing deep neural patterns that have kept the system locked in old adaptations, creating space for new ways of responding.",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
  },
  {
    number: "03",
    title: "Neuroplastic Integration",
    description:
      "Stabilizing new neural pathways and integrating changes so that regulation and coherence become the default rather than the exception.",
    image:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80",
  },
  {
    number: "04",
    title: "Coherence & Regulation",
    description:
      "Strengthening the nervous system's capacity for self-regulation and resilience in daily life.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
  },
  {
    number: "05",
    title: "Integration & Expansion",
    description:
      "Embedding transformation into identity and life direction, supporting both healing and the expansion of human potential.",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80",
  },
];

export default function FivePhaseArchitecture() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            The Five-Phase Architecture of the NeuroHolistic Method™
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Transformation unfolds through structured phases that restore
            internal balance and create the conditions for deep, lasting change.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {PHASES.map((phase) => (
            <div
              key={phase.number}
              className="group relative rounded-xl overflow-hidden aspect-[3/4] min-h-[320px] shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <Image
                src={phase.image}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/20" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-4xl font-bold text-white/90 tracking-tight mb-1">
                  {phase.number}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  {phase.title}
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed line-clamp-3">
                  {phase.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
