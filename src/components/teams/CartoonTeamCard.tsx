"use client";

import React from "react";
import Image from "next/image";
import { Star, Check, Sparkles } from "lucide-react";
import { ITeam } from "@/types";
import { cn } from "@/lib/utils";

interface CartoonTeamCardProps {
  team: ITeam;
  isSelected?: boolean;
  onSelect?: (team: ITeam) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const CartoonTeamCard: React.FC<CartoonTeamCardProps> = ({
  team,
  isSelected = false,
  onSelect,
  disabled = false,
  compact = false,
}) => {
  const colorBorders: Record<string, string> = {
    yellow: "border-party-yellow",
    pink: "border-party-pink",
    cyan: "border-party-cyan",
    lime: "border-party-lime",
    orange: "border-party-orange",
    purple: "border-party-purple",
  };

  const colorBadge: Record<string, string> = {
    yellow: "bg-party-yellow text-slate-950",
    pink: "bg-party-pink text-white",
    cyan: "bg-party-cyan text-slate-950",
    lime: "bg-party-lime text-slate-950",
    orange: "bg-party-orange text-white",
    purple: "bg-party-purple text-white",
  };

  const accentBorder = colorBorders[team.color || "yellow"] || "border-party-yellow";
  const badgeStyle = colorBadge[team.color || "yellow"] || "bg-party-yellow text-slate-950";

  return (
    <div
      onClick={() => !disabled && onSelect && onSelect(team)}
      className={cn(
        "group relative flex flex-col rounded-3xl border-4 transition-all duration-200 select-none overflow-hidden",
        disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer active:scale-95",
        isSelected
          ? "bg-party-card border-party-yellow shadow-cartoon-yellow scale-[1.02] ring-4 ring-party-yellow/50"
          : cn("bg-party-card border-black shadow-cartoon hover:-translate-y-1.5 hover:shadow-cartoon-lg")
      )}
    >
      {/* Selected Sticker Badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 rounded-full border-2 border-black bg-party-yellow px-2.5 py-1 text-[10px] font-black text-slate-950 shadow-cartoon-sm sm:top-3 sm:right-3 sm:px-3.5 sm:py-1.5 sm:text-xs">
          <Star className="h-3.5 w-3.5 fill-party-pink text-party-pink sm:h-4 sm:w-4" />
          <span>YOUR PICK</span>
        </div>
      )}

      {/* Image Preview Container */}
      <div
        className={cn(
          "relative w-full overflow-hidden border-b-4 border-black bg-party-bg",
          compact ? "h-36" : "h-40 sm:h-56"
        )}
      >
        {team.image ? (
          <Image
            src={team.image}
            alt={team.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={cn(
              "object-cover transition-transform duration-300",
              isSelected ? "scale-105" : "group-hover:scale-105"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-party-card">
            <Sparkles className="w-12 h-12 text-party-yellow" />
          </div>
        )}
      </div>

      {/* Team Info */}
      <div className={cn("flex flex-1 flex-col justify-between", compact ? "p-4" : "p-4 sm:p-5")}>
        <div>
          <h3 className={cn(
            "mb-1.5 font-cartoon font-black tracking-tight text-white transition-colors group-hover:text-party-yellow",
            compact ? "text-lg" : "text-xl sm:text-2xl"
          )}>
            {team.name}
          </h3>

          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-300 sm:line-clamp-3">
            {team.description || "Get ready for an electrifying performance!"}
          </p>
        </div>

        {/* Action Button state */}
        <div className="pt-2">
          <div
            className={cn(
              "w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-center border-3 border-black transition-all flex items-center justify-center gap-2",
              isSelected
                ? "bg-party-yellow text-slate-950 shadow-cartoon-sm font-black"
                : "bg-party-surface text-white group-hover:bg-party-pink group-hover:shadow-cartoon-sm"
            )}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 stroke-[3] text-party-pink" />
                <span className="sm:hidden">Your vote</span>
                <span className="hidden sm:inline">Selected as Your Vote!</span>
              </>
            ) : (
              <>
                <Star className="w-4 h-4 fill-current text-party-yellow" />
                <span className="sm:hidden">Vote for this team</span>
                <span className="hidden sm:inline">Vote For This Team!</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
