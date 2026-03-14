import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "xl";
  background?: "white" | "light" | "dark" | "primary" | "secondary" | "none";
  id?: string;
}

const paddingStyles = {
  sm: "py-8 md:py-12",
  md: "py-12 md:py-20",
  lg: "py-16 md:py-28",
  xl: "py-20 md:py-32",
};

const backgroundStyles = {
  white: "bg-white",
  light: "bg-neutral-50",
  dark: "bg-neutral-900 text-white",
  primary: "bg-primary-500 text-white",
  secondary: "bg-secondary-500 text-white",
  none: "",
};

export default function Section({
  children,
  className = "",
  padding = "md",
  background = "white",
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`w-full ${paddingStyles[padding]} ${backgroundStyles[background]} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
