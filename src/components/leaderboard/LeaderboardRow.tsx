"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Medal, Sparkles } from "lucide-react";
import { cn, formatPercentage } from "@/lib/utils";

interface LeaderboardRowProps {
  rank?: number;
  name: string;
  image?: string;
  votes?: number;
  voteShare: number;
  diffFromPrev?: number;
  showVoteCounts?: boolean;
  showLeaderboard?: boolean;
  isProjectorMode?: boolean;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank = 1,
  name,
  image,
  votes,
  voteShare,
  diffFromPrev,
  showVoteCounts = true,
  showLeaderboard = true,
  isProjectorMode = false,
}) => {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  const rankBadgeStyle = isFirst
    ? "bg-party-gold text-slate-950 shadow-glow-gold"
    : isSecond
    ? "bg-slate-200 text-slate-950 shadow-md"
    : isThird
    ? "bg-amber-700 text-white shadow-md"
    : "bg-party-surface text-gray-300 border border-party-border";

  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-all duration-300 overflow-hidden",
        isFirst
          ? "bg-party-card border-party-gold/50 shadow-glow-gold/40"
          : "bg-party-card/80 border-party-border/60 hover:border-party-neonPurple/50",
        isProjectorMode ? "p-5 sm:p-7" : "p-4 sm:p-5"
      )}
    >
      {/* Background fill gauge bar */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 opacity-15 transition-all duration-700 pointer-events-none",
          isFirst
            ? "bg-gradient-to-r from-party-gold to-party-neonPink"
            : "bg-gradient-to-r from-party-neonPurple to-party-neonCyan"
        )}
        style={{ width: `${Math.max(voteShare, 2)}%` }}
      />

      <div className="relative flex items-center justify-between gap-4">
        {/* Left: Rank & Team Info */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {showLeaderboard && (
            <div
              className={cn(
                "rounded-xl font-black flex items-center justify-center flex-shrink-0 transition-transform",
                rankBadgeStyle,
                isProjectorMode
                  ? "w-12 h-12 text-xl"
                  : "w-9 h-9 sm:w-10 sm:h-10 text-sm sm:text-base"
              )}
            >
              {isFirst ? (
                <Trophy className="w-5 h-5 fill-current" />
              ) : isSecond || isThird ? (
                <Medal className="w-5 h-5" />
              ) : (
                <span>#{rank}</span>
              )}
            </div>
          )}

          {/* Avatar */}
          <div
            className={cn(
              "relative rounded-xl overflow-hidden bg-black flex-shrink-0 border border-party-border",
              isProjectorMode ? "w-16 h-16 sm:w-20 sm:h-20" : "w-12 h-12 sm:w-14 sm:h-14"
            )}
          >
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-party-neonPink" />
              </div>
            )}
          </div>

          {/* Name */}
          <div className="min-w-0">
            <h3
              className={cn(
                "font-black text-white truncate",
                isProjectorMode
                  ? "text-xl sm:text-3xl"
                  : "text-base sm:text-xl",
                isFirst && "text-party-gold"
              )}
            >
              {name}
            </h3>
            {isFirst && (
              <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-party-gold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Current Leader
              </span>
            )}
          </div>
        </div>

        {/* Right: Vote Statistics */}
        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 text-right">
          {showVoteCounts && votes !== undefined && (
            <div>
              <span
                className={cn(
                  "font-mono font-black text-white block",
                  isProjectorMode ? "text-2xl sm:text-4xl" : "text-lg sm:text-2xl"
                )}
              >
                {votes.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                Votes
              </span>
            </div>
          )}

          <div className="min-w-[70px] sm:min-w-[90px]">
            <span
              className={cn(
                "font-mono font-black text-party-neonCyan block",
                isProjectorMode ? "text-2xl sm:text-4xl" : "text-lg sm:text-2xl"
              )}
            >
              {formatPercentage(voteShare)}
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
              Share
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="relative mt-3 w-full bg-party-surface h-2 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            isFirst
              ? "bg-gradient-to-r from-party-gold via-party-neonPink to-party-neonCyan"
              : "bg-gradient-to-r from-party-neonPurple to-party-neonCyan"
          )}
          style={{ width: `${voteShare}%` }}
        />
      </div>
    </div>
  );
};
