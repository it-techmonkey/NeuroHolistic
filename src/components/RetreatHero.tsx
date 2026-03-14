import Image from "next/image";
import Link from "next/link";

export default function RetreatHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"
          alt=""
          fill
          className="object-cover scale-105"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/50 to-transparent" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 md:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            Retreat
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-200 leading-relaxed">
            Immersive experiences designed to step away from daily life and
            engage deeply in the transformational process of the NeuroHolistic
            Method™.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="#retreat-newsletter"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold text-base hover:bg-slate-100 transition-all shadow-xl shadow-indigo-500/20"
            >
              Get Retreat Updates
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Register to be notified when new retreats and immersive gatherings
            are announced.
          </p>
        </div>
      </div>
    </section>
  );
}
