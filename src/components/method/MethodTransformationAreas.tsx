import Link from "next/link";

const AREAS = [
  {
    title: "Health",
    description:
      "When the nervous system returns to balance, the body shifts out of chronic stress and into regulation.",
    icon: "◆",
    href: "/programs#health",
  },
  {
    title: "Mind",
    description:
      "As neural patterns reorganize, mental clarity increases and emotional reactivity decreases.",
    icon: "◇",
    href: "/programs#mind",
  },
  {
    title: "Relationships",
    description:
      "Internal coherence changes how we relate to others—communication and connection deepen.",
    icon: "○",
    href: "/programs#relationships",
  },
  {
    title: "Human Potential",
    description:
      "When internal systems align, energy becomes available for creativity, purpose, and growth.",
    icon: "△",
    href: "/programs#potential",
  },
];

export default function MethodTransformationAreas() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Where Transformation Takes Shape
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Changes appear across different areas of life—health, mind,
            relationships, and human potential—as the internal system returns
            to coherence.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {AREAS.map((area) => (
            <div
              key={area.title}
              className="rounded-2xl bg-slate-50 border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold mb-5">
                {area.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {area.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {area.description}
              </p>
              <Link
                href={area.href}
                className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
              >
                Explore Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
