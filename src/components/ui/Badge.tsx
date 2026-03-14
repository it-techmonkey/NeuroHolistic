import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles = {
  primary: "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs font-medium rounded",
  md: "px-3 py-1.5 text-sm font-medium rounded",
};

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-block ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
