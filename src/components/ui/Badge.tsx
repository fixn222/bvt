import React from "react";
import { cn } from "@/lib/utils";
import { VotingStatus } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "pink" | "purple" | "cyan" | "gold" | "gray";
  status?: VotingStatus;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "gray",
  status,
  children,
  ...props
}) => {
  if (status) {
    const statusConfig = {
      OPEN: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
      PAUSED: "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
      CLOSED: "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.3)]",
      UPCOMING: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]",
    };

    const statusLabels = {
      OPEN: "Voting is Live",
      PAUSED: "Voting Paused",
      CLOSED: "Voting Closed",
      UPCOMING: "Voting Upcoming",
    };

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border uppercase",
          statusConfig[status],
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            status === "OPEN" ? "bg-emerald-400 animate-pulse" : "bg-current opacity-70"
          )}
        />
        {children || statusLabels[status]}
      </span>
    );
  }

  const variants = {
    pink: "bg-party-neonPink/15 text-pink-400 border-party-neonPink/30",
    purple: "bg-party-neonPurple/15 text-purple-300 border-party-neonPurple/30",
    cyan: "bg-party-neonCyan/15 text-cyan-300 border-party-neonCyan/30",
    gold: "bg-party-gold/15 text-amber-300 border-party-gold/30",
    gray: "bg-gray-800/80 text-gray-300 border-gray-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
