import Image from "next/image";

export default function MethodHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background image - blurred; replace src with your therapy session image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80"
          alt=""
          fill
          className="object-cover scale-105"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 backdrop-blur-[2px] bg-slate-900/60" />
      </div>
      {/* Dark gradient overlay for readability */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 md:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            The Methods
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-200 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
    </section>
  );
}
