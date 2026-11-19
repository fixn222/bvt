import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "cyan";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5",
      xl: "text-lg px-8 py-4 gap-3 font-bold",
    };

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-party-neonPink via-purple-600 to-party-neonPurple text-white shadow-glow hover:shadow-glow-pink hover:brightness-110 border border-pink-400/30",
      secondary:
        "bg-party-surface hover:bg-party-border text-white border border-party-border hover:border-party-neonPurple/50 shadow-md",
      outline:
        "bg-transparent border border-party-neonPurple/60 text-purple-200 hover:bg-party-neonPurple/10 hover:border-party-neonPurple",
      danger:
        "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md hover:from-red-500 hover:to-rose-600 border border-red-500/30",
      ghost:
        "bg-transparent text-gray-300 hover:text-white hover:bg-white/5",
      cyan:
        "bg-gradient-to-r from-party-neonCyan to-cyan-600 text-slate-950 font-bold shadow-glow-cyan hover:brightness-110 border border-cyan-300/40",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
