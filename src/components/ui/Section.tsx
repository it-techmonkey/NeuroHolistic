import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "xl";
  background?: "white" | "light" | "dark" | "primary" | "secondary" | "none";
  id?: string;
}

const paddingStyles = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-28",
  xl: "py-24 md:py-32",
};

const backgroundStyles = {
  white: "bg-white",
  light: "bg-[#F4F6F9]",
  dark: "bg-[#0B0F2B] text-white",
  primary: "bg-[#11174A] text-white",
  secondary: "bg-[#2B2F55] text-white",
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
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        {children}
      </div>
    </section>
  );
}
