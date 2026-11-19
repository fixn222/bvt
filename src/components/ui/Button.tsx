import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "yellow" | "pink" | "cyan" | "purple" | "lime" | "orange" | "white" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "yellow",
      size = "md",
      isLoading = false,
      disabled,
      type = "button",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "pressable relative inline-flex items-center justify-center font-black rounded-2xl border-3 border-black uppercase tracking-wider select-none touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all duration-150";

    const sizeStyles = {
      sm: "text-xs px-3.5 py-2 min-h-11 gap-1.5 shadow-cartoon-sm",
      md: "text-sm px-5 py-2.5 min-h-11 gap-2 shadow-cartoon",
      lg: "text-base px-6 sm:px-7 py-3.5 min-h-12 gap-2.5 shadow-cartoon-lg",
      xl: "text-base sm:text-lg px-6 sm:px-8 py-4 min-h-14 gap-3 shadow-cartoon-lg font-black",
    };

    const variantStyles = {
      yellow: "bg-party-yellow text-slate-950 hover:bg-yellow-300",
      pink: "bg-party-pink text-white hover:bg-pink-400",
      cyan: "bg-party-cyan text-slate-950 hover:bg-cyan-300",
      purple: "bg-party-purple text-white hover:bg-purple-500",
      lime: "bg-party-lime text-slate-950 hover:bg-lime-300",
      orange: "bg-party-orange text-white hover:bg-orange-400",
      white: "bg-white text-slate-950 hover:bg-gray-100",
      ghost:
        "bg-transparent text-gray-200 border-transparent shadow-none hover:bg-white/10",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
