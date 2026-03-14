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
    sm: "shadow-sm",
    md: "shadow",
    lg: "shadow-lg",
    elevated: "shadow-elevated",
  };

  const hoverClass = hoverable
    ? "hover:shadow-lg hover:translate-y-[-4px] transition-all duration-300"
    : "";
  const borderClass = border ? "border border-neutral-200" : "";

  return (
    <div
      className={`bg-white rounded-lg ${shadowStyles[shadow]} ${borderClass} ${hoverClass} ${className}`}
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
    <div className={`px-6 py-4 border-b border-neutral-100 ${className}`}>
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
    <div className={`px-6 py-4 border-t border-neutral-100 ${className}`}>
      {children}
    </div>
  );
}
