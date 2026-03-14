import Link from "next/link";
import Image from "next/image";

export default function MethodVision() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">
              The Vision Behind the Method
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              The NeuroHolistic Method™ emerged from years of therapeutic work
              and careful observation of the deeper mechanisms that shape human
              experience. It reflects a vision of transformation that goes beyond
              symptom management—one that restores the internal system to balance
              and coherence, creating the conditions for lasting change.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
            >
              Read More
              <span className="ml-1" aria-hidden>→</span>
            </Link>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-100 aspect-[4/3] relative">
              <Image
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80"
                alt="Two people in a supportive therapy environment"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
