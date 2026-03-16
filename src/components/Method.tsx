import Link from "next/link";

export default function Method() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#8B8BFF] mb-3">
              The Method
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-6">
              The NeuroHolistic Method™
            </h2>
            <p className="text-slate-600 text-[17px] leading-[1.8] mb-8 max-w-[560px]">
              A five-phase architecture for systemic transformation. The
              NeuroHolistic Method™ unfolds through five structured phases—from
              releasing accumulated stress patterns to stabilizing new neural,
              emotional, and cognitive pathways—supporting deep, lasting change.
            </p>
            <Link
              href="/method"
              className="inline-flex items-center justify-center px-6 py-3 rounded-[10px] bg-[#0B0F2B] text-white font-semibold text-sm hover:bg-[#11174A] transition-all hover:-translate-y-[1px] shadow-[0_10px_24px_rgba(11,15,43,0.18)]"
            >
              Explore the Method
            </Link>
          </div>
          <div className="relative">
            <div className="rounded-[24px] overflow-hidden border border-slate-200/80 shadow-[0_14px_34px_rgba(15,23,42,0.1)] aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1400&q=80"
                alt="Mindfulness and neuroscience-oriented transformation session"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
