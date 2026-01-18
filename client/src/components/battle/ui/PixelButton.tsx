import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary: "bg-blue-500 hover:bg-blue-600 text-white border-blue-700",
  secondary: "bg-gray-500 hover:bg-gray-600 text-white border-gray-700",
  danger: "bg-red-500 hover:bg-red-600 text-white border-red-700",
  success: "bg-green-500 hover:bg-green-600 text-white border-green-700",
};

const sizeStyles = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export function PixelButton({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={cn(
        "font-bold uppercase tracking-wide",
        "border-4 border-b-8 rounded-lg",
        "transform active:translate-y-1 active:border-b-4",
        "transition-all duration-75",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
