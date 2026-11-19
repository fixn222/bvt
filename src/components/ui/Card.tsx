import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "default" | "yellow" | "pink" | "cyan" | "purple" | "lime" | "orange";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, color = "default", children, ...props }, ref) => {
    const colorClasses = {
      default: "bg-party-card border-party-border shadow-cartoon-lg",
      yellow: "bg-party-yellow text-slate-950 border-black shadow-cartoon-lg",
      pink: "bg-party-pink text-white border-black shadow-cartoon-lg",
      cyan: "bg-party-cyan text-slate-950 border-black shadow-cartoon-lg",
      purple: "bg-party-purple text-white border-black shadow-cartoon-lg",
      lime: "bg-party-lime text-slate-950 border-black shadow-cartoon-lg",
      orange: "bg-party-orange text-white border-black shadow-cartoon-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl border-3 transition-all duration-200",
          colorClasses[color],
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
