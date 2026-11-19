import React from "react";
import { cn } from "@/lib/utils";
import { VotingStatus } from "@/types";
import { Flame, Clock, Lock, Sparkles } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "yellow" | "pink" | "cyan" | "purple" | "lime" | "orange" | "white";
  status?: VotingStatus;
  compact?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "yellow",
  status,
  compact = false,
  children,
  ...props
}) => {
  if (status) {
    const statusConfig = {
      open: "bg-party-yellow text-slate-950 border-black shadow-cartoon-sm",
      upcoming: "bg-party-cyan text-slate-950 border-black shadow-cartoon-sm",
      closed: "bg-party-pink text-white border-black shadow-cartoon-sm",
    };

    const statusIcons = {
      open: Flame,
      upcoming: Clock,
      closed: Lock,
    };

    const statusLabels = {
      open: compact ? "LIVE" : "VOTING IS LIVE! 🚀",
      upcoming: compact ? "SOON" : "PARTY STARTING SOON! ⏳",
      closed: compact ? "LOCKED" : "VOTING LOCKED! 🔒",
    };

    const Icon = statusIcons[status] || Sparkles;

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border-2",
          statusConfig[status],
          className
        )}
        {...props}
      >
        <Icon className={cn("w-3.5 h-3.5", status === "open" && "animate-bounce text-party-pink")} />
        <span>{children || statusLabels[status]}</span>
      </span>
    );
  }

  const variants = {
    yellow: "bg-party-yellow text-slate-950 border-black shadow-cartoon-sm",
    pink: "bg-party-pink text-white border-black shadow-cartoon-sm",
    cyan: "bg-party-cyan text-slate-950 border-black shadow-cartoon-sm",
    purple: "bg-party-purple text-white border-black shadow-cartoon-sm",
    lime: "bg-party-lime text-slate-950 border-black shadow-cartoon-sm",
    orange: "bg-party-orange text-white border-black shadow-cartoon-sm",
    white: "bg-white text-slate-950 border-black shadow-cartoon-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border-2 uppercase",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
