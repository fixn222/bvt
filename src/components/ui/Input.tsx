import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            "w-full min-h-12 px-4 py-3 bg-party-surface/80 border rounded-xl text-white placeholder-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-party-yellow focus:border-party-yellow",
            "transition-all duration-200 text-base",
            error ? "border-rose-500 focus:ring-rose-500" : "border-party-border/80",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
