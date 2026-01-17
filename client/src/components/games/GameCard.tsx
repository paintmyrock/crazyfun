import { ReactNode } from "react";

interface GameCardProps {
  children: ReactNode;
  floating?: boolean;
  delay?: string;
}

export function GameCard({ children, floating = false, delay = "0s" }: GameCardProps) {
  return (
    <div
      className={`cartoon-border cartoon-shadow bg-card p-8 rounded-3xl hover:scale-105 transition-transform ${
        floating ? "animate-[float_2s_ease-in-out_infinite]" : ""
      }`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}
