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
    "bg-[#0B0F2B] text-white hover:bg-[#11174A] active:bg-[#11174A] disabled:bg-slate-300 disabled:text-slate-500 shadow-[0_10px_24px_rgba(11,15,43,0.18)]",
  secondary:
    "bg-[#2B2F55] text-white hover:bg-[#1F2345] active:bg-[#1F2345] disabled:bg-slate-300 disabled:text-slate-500",
  outline:
    "border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] active:bg-[#F1F5F9] disabled:border-slate-300 disabled:text-slate-300",
  ghost:
    "text-[#11174A] hover:bg-[#EEF2FF] active:bg-[#E2E8F0] disabled:text-slate-300",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500",
};

const sizeStyles = {
  sm: "px-3.5 py-2 text-sm font-medium rounded-[10px]",
  md: "px-[22px] py-[14px] text-[15px] font-medium rounded-[10px]",
  lg: "px-7 py-3.5 text-base font-semibold rounded-[10px]",
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
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B8BFF] disabled:cursor-not-allowed hover:translate-y-[-1px]";
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
