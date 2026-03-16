import Image from "next/image";
import Link from "next/link";
import BookNowButton from "@/components/booking/BookNowButton";

type ActionLink = {
  label: string;
  href?: string;
  kind?: "link" | "modal";
  variant?: "solid" | "outline";
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  badges?: string[];
  primaryAction?: ActionLink;
  secondaryAction?: ActionLink;
};

function HeroAction({ action }: { action: ActionLink }) {
  const baseClass =
    "inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-sm font-semibold transition-all duration-300";

  if (action.kind === "modal") {
    return (
      <BookNowButton
        className={`${baseClass} ${
          action.variant === "outline"
            ? "border border-white/70 text-white hover:bg-white/10"
            : "bg-white text-slate-900 hover:bg-slate-100"
        }`}
      >
        {action.label}
      </BookNowButton>
    );
  }

  return (
    <Link
      href={action.href ?? "#"}
      className={`${baseClass} ${
        action.variant === "outline"
          ? "border border-white/70 text-white hover:bg-white/10"
          : "bg-white text-slate-900 hover:bg-slate-100"
      }`}
    >
      {action.label}
    </Link>
  );
}

export default function PageHero({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  badges = [],
  primaryAction,
  secondaryAction,
}: PageHeroProps) {
  return (
    <section className="relative min-h-[72vh] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover scale-105"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(11,15,43,0.92)_0%,rgba(17,23,74,0.72)_42%,rgba(11,15,43,0.32)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-[1200px] items-center px-6 py-24 md:px-10 md:py-32">
        <div className="max-w-[760px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#A6A6FF]">
            {eyebrow}
          </p>
          <h1
            className="mt-4 text-[38px] font-semibold leading-[1.08] tracking-[-0.02em] text-white sm:text-[50px] lg:text-[62px]"
            style={{ fontFamily: "Inter, Satoshi, 'Neue Montreal', -apple-system, sans-serif" }}
          >
            {title}
          </h1>
          <p className="mt-6 max-w-[620px] text-[18px] leading-relaxed text-[#E1E5FF]/85">
            {description}
          </p>

          {badges.length > 0 && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[12px] font-medium text-white/90 backdrop-blur-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="mt-9 flex flex-wrap gap-3">
              {primaryAction && <HeroAction action={primaryAction} />}
              {secondaryAction && <HeroAction action={{ ...secondaryAction, variant: "outline" }} />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
