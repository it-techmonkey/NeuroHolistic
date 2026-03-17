import Link from "next/link";
import { type ReactNode } from "react";

export type IntroCardGridItem = {
  title: string;
  description: string;
  icon?: ReactNode;
  href?: string;
  actionLabel?: string;
};

type IntroCardGridSectionProps = {
  heading: string;
  description: string;
  items: IntroCardGridItem[];
  topDecoration?: ReactNode;
  className?: string;
  sectionClassName?: string;
  itemActionFullWidth?: boolean;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function IntroCardGridSection({
  heading,
  description,
  items,
  topDecoration,
  className,
  sectionClassName,
  itemActionFullWidth = false,
}: IntroCardGridSectionProps) {
  return (
    <section className={cx("py-20 md:py-28", sectionClassName)}>
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div
          className={cx(
            "rounded-[34px] bg-[#F3F8FD] px-6 py-10  sm:px-8 md:px-12 md:py-14 lg:px-14 lg:py-16",
            className
          )}
        >
          <div className="grid gap-8 border-b border-slate-200/70 pb-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:pb-12">
            <div className="max-w-[66ch]">
              <h2 className="text-[30px] font-bold leading-tight tracking-[-0.02em] text-slate-900 md:text-[42px] lg:text-[38px]">
                {heading}
              </h2>
              <p className="mt-4 max-w-[56ch] text-[16px] leading-8 text-slate-600 md:text-[17px]">
                {description}
              </p>
            </div>

            {topDecoration ? (
              <div className="pointer-events-none hidden md:flex md:justify-end">{topDecoration}</div>
            ) : null}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:mt-10 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.title}
                className="flex min-h-[290px] flex-col rounded-3xl bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(15,23,42,0.13)]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  {item.icon ?? <span className="h-2 w-2 rounded-full bg-slate-400" />}
                </div>

                <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-slate-900">{item.title}</h3>
                <p className="mt-3 text-[14px] leading-7 text-slate-600">{item.description}</p>

                {item.href ? (
                  <div className="mt-auto pt-6">
                    <Link
                      href={item.href}
                      className={cx(
                        "inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800",
                        itemActionFullWidth ? "w-full" : ""
                      )}
                    >
                      {item.actionLabel ?? "Learn More"}
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
