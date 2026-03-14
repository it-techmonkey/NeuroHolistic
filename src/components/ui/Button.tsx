import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  destructive?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantStyles = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-neutral-300 disabled:text-neutral-500",
  secondary:
    "bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 disabled:bg-neutral-300 disabled:text-neutral-500",
  outline:
    "border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100 disabled:border-neutral-300 disabled:text-neutral-300",
  ghost:
    "text-primary-500 hover:bg-primary-50 active:bg-primary-100 disabled:text-neutral-300",
  danger:
    "bg-error text-white hover:bg-red-600 active:bg-red-700 disabled:bg-neutral-300 disabled:text-neutral-500",
};

const sizeStyles = {
  sm: "px-3 py-2 text-sm font-medium rounded-md",
  md: "px-4 py-2.5 text-base font-medium rounded-lg",
  lg: "px-6 py-3 text-lg font-semibold rounded-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  destructive = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const buttonVariant = destructive ? "danger" : variant;
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:cursor-not-allowed";
  const widthStyles = fullWidth ? "w-full" : "";
  const combinedClassName = `${baseStyles} ${variantStyles[buttonVariant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

  return (
    <button
      disabled={disabled || loading}
      className={combinedClassName}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block animate-spin">⟳</span>
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  );
}
