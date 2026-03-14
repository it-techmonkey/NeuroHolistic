const TESTIMONIALS = [
  {
    text: "The NeuroHolistic Method™ helped me find a sense of balance I hadn't felt in years. My nervous system finally feels regulated.",
    name: "Sarah M.",
    role: "Executive",
    rating: 5,
    avatar: "SM",
  },
  {
    text: "Deep, lasting change—not just coping. I'm more present in my relationships and more focused at work.",
    name: "James K.",
    role: "Entrepreneur",
    rating: 5,
    avatar: "JK",
  },
  {
    text: "Science-based and genuinely transformative. The team created a safe space for real healing to happen.",
    name: "Layla H.",
    role: "Educator",
    rating: 5,
    avatar: "LH",
  },
];

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: stars }).map((_, i) => (
        <span key={i} aria-hidden>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
          Outcomes in Practice
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl bg-slate-50 border border-slate-100 p-8 shadow-md hover:shadow-lg transition-shadow"
            >
              <StarRating stars={t.rating} />
              <blockquote className="mt-4 text-slate-700 leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
