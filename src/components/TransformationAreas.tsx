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
      "Internal coherence changes how we relate to others—communication, boundaries, and connection deepen.",
    icon: "○",
    href: "/programs#relationships",
  },
  {
    title: "Human Potential",
    description:
      "When internal systems align, energy becomes available for creativity, purpose, and meaningful growth.",
    icon: "△",
    href: "/programs#potential",
  },
];

export default function TransformationAreas() {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
          Where Transformation Takes Shape
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {AREAS.map((area) => (
            <div
              key={area.title}
              className="rounded-2xl bg-white p-6 md:p-8 shadow-md border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
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
                className="text-indigo-600 font-semibold text-sm hover:text-indigo-700 hover:underline"
              >
                Explore More
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
