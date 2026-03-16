import Link from "next/link";

export default function Research() {
  return (
    <section className="py-20 md:py-28 bg-[#F4F5F7]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8B8BFF]">
              Research
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-6">
              Advancing Scientific Understanding of Human Transformation
            </h2>
            <p className="text-slate-600 text-[17px] leading-relaxed mb-8 max-w-[620px]">
              The NeuroHolistic Institute develops interdisciplinary research across neuroscience,
              psychology, and applied practice to better understand how meaningful and sustainable
              transformation unfolds in real human systems.
            </p>
            <div className="mb-8 flex flex-wrap gap-3">
              {[
                "Neuroscience",
                "Mind-Body Interaction",
                "Practice-Based Inquiry",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#D9DDF0] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#2B2F55]"
                >
                  {item}
                </span>
              ))}
            </div>
            <Link
              href="/research"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#2B2F55] text-white font-semibold text-sm hover:bg-[#1F2345] transition-all"
            >
              Learn More
            </Link>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-slate-200 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=1400&q=80"
                alt="Scientific research and analysis"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
