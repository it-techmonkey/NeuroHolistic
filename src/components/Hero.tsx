import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Soft gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              Restore the System
              <br />
              <span className="text-indigo-200">Transform Your Life.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed">
              The NeuroHolistic Method™ is a science-based approach that restores
              balance within the human system, supporting deep, long-lasting
              transformation.
            </p>
            <div className="mt-10">
              <Link
                href="/book"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold text-base hover:bg-slate-100 transition-all shadow-xl shadow-indigo-500/25"
              >
                Book Now
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <NeuralGraphic />
          </div>
        </div>
      </div>
    </section>
  );
}

function NeuralGraphic() {
  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-3xl scale-110 animate-pulse" />
      {/* Orbital rings */}
      <div className="absolute w-full h-full rounded-full border border-indigo-400/20 animate-spin-slow" />
      <div className="absolute w-[85%] h-[85%] rounded-full border border-indigo-400/15 animate-spin-slower" />
      <div className="absolute w-[70%] h-[70%] rounded-full border border-indigo-400/10 animate-spin-slowest" />
      {/* Orbiting dots */}
      <div className="absolute w-full h-full animate-spin-dots">
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 rounded-full bg-indigo-300 shadow-lg shadow-indigo-400/50 translate-y-[-120px]" />
      </div>
      <div className="absolute w-full h-full animate-spin-dots" style={{ animationDelay: "-2s" }}>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 rounded-full bg-indigo-300/80 shadow-lg translate-y-[-100px] translate-x-[60px]" />
      </div>
      <div className="absolute w-full h-full animate-spin-dots" style={{ animationDelay: "-4s" }}>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 rounded-full bg-indigo-200 shadow-lg translate-y-[-80px] translate-x-[-70px]" />
      </div>
      <div className="absolute w-full h-full animate-spin-dots-2" style={{ animationDelay: "-1s" }}>
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -mt-0.5 -ml-0.5 rounded-full bg-indigo-400/90 translate-y-[100px]" />
      </div>
      <div className="absolute w-full h-full animate-spin-dots-3" style={{ animationDelay: "-5s" }}>
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -mt-0.5 -ml-0.5 rounded-full bg-indigo-300/80 translate-x-[-110px]" />
      </div>
      <div className="absolute w-full h-full animate-spin-dots-3" style={{ animationDelay: "-9s" }}>
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -mt-0.5 -ml-0.5 rounded-full bg-indigo-300/80 translate-x-[110px]" />
      </div>
      {/* Central orb */}
      <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-300 to-indigo-600 shadow-2xl shadow-indigo-500/50 ring-4 ring-indigo-400/30" />
      <div className="absolute z-10 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
    </div>
  );
}
