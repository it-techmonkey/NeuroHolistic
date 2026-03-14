import { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

// Display - Hero text
export function Display({ children, className = "" }: TypographyProps) {
  return (
    <h1
      className={`text-5xl md:text-6xl font-bold leading-tight tracking-tight ${className}`}
    >
      {children}
    </h1>
  );
}

// H1
export function H1({ children, className = "" }: TypographyProps) {
  return (
    <h1 className={`text-4xl md:text-5xl font-bold leading-tight ${className}`}>
      {children}
    </h1>
  );
}

// H2
export function H2({ children, className = "" }: TypographyProps) {
  return (
    <h2 className={`text-3xl md:text-4xl font-semibold leading-snug ${className}`}>
      {children}
    </h2>
  );
}

// H3
export function H3({ children, className = "" }: TypographyProps) {
  return (
    <h3 className={`text-2xl md:text-3xl font-semibold leading-snug ${className}`}>
      {children}
    </h3>
  );
}

// H4
export function H4({ children, className = "" }: TypographyProps) {
  return (
    <h4 className={`text-xl md:text-2xl font-semibold leading-snug ${className}`}>
      {children}
    </h4>
  );
}

// Body text
export function Body({ children, className = "" }: TypographyProps) {
  return (
    <p className={`text-base md:text-lg leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

// Small body text
export function BodySmall({ children, className = "" }: TypographyProps) {
  return (
    <p className={`text-sm md:text-base leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

// Label
export function Label({ children, className = "" }: TypographyProps) {
  return (
    <label className={`text-sm font-medium leading-snug ${className}`}>
      {children}
    </label>
  );
}

// Caption
export function Caption({ children, className = "" }: TypographyProps) {
  return (
    <p className={`text-xs md:text-sm leading-relaxed text-neutral-500 ${className}`}>
      {children}
    </p>
  );
}
