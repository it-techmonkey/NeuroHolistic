import Link from "next/link";

const PROGRAMS = [
  {
    title: "Private",
    description:
      "A personalized transformation journey tailored to your unique system. One-on-one sessions with certified practitioners to restore balance and support lasting change.",
    cta: "Explore the Business",
    href: "/programs/private",
  },
  {
    title: "Group Program",
    description:
      "A structured group transformation experience. Guided group sessions that combine the power of shared process with the NeuroHolistic Method™ for collective and individual growth.",
    cta: "Explore the Group Program",
    href: "/programs/group",
  },
];

export default function Programs() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
          Choose Your Path
        </h2>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {PROGRAMS.map((program) => (
            <Link
              key={program.title}
              href={program.href}
              className="group relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-10 hover:bg-white/10 hover:border-indigo-400/30 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {program.title}
              </h3>
              <p className="text-slate-300 leading-relaxed mb-8">
                {program.description}
              </p>
              <span className="inline-flex items-center text-indigo-300 font-semibold group-hover:text-indigo-200 transition-colors">
                {program.cta}
                <span className="ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
