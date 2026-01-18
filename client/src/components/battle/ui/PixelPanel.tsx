import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PixelPanelProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "dark" | "light";
}

const variantStyles = {
  default: "bg-slate-100 border-slate-400",
  dark: "bg-slate-800 border-slate-600 text-white",
  light: "bg-white border-slate-300",
};

export function PixelPanel({
  children,
  className,
  variant = "default",
}: PixelPanelProps) {
  return (
    <div
      className={cn(
        "border-4 rounded-lg p-4",
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
