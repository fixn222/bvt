import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "none" | "purple" | "pink" | "cyan" | "gold";
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = "none", glass = true, children, ...props }, ref) => {
    const glowClasses = {
      none: "border-party-border/60",
      purple: "border-party-neonPurple/50 shadow-glow",
      pink: "border-party-neonPink/50 shadow-glow-pink",
      cyan: "border-party-neonCyan/50 shadow-glow-cyan",
      gold: "border-party-gold/50 shadow-glow-gold",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300",
          glass
            ? "bg-party-card/80 backdrop-blur-md border"
            : "bg-party-card border",
          glowClasses[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
