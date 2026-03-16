import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  shadow?: "none" | "sm" | "md" | "lg" | "elevated";
  border?: boolean;
}

export function Card({
  children,
  className = "",
  hoverable = false,
  shadow = "md",
  border = false,
}: CardProps) {
  const shadowStyles = {
    none: "shadow-none",
    sm: "shadow-[0_6px_20px_rgba(15,23,42,0.06)]",
    md: "shadow-[0_10px_30px_rgba(15,23,42,0.08)]",
    lg: "shadow-[0_16px_36px_rgba(15,23,42,0.12)]",
    elevated: "shadow-[0_20px_48px_rgba(15,23,42,0.16)]",
  };

  const hoverClass = hoverable
    ? "hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] hover:translate-y-[-4px] transition-all duration-300"
    : "";
  const borderClass = border ? "border border-slate-200/70" : "";

  return (
    <div
      className={`bg-white rounded-[20px] ${shadowStyles[shadow]} ${borderClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-slate-100 ${className}`}>
      {children}
    </div>
  );
}
