"use client";

import React from "react";
import Image from "next/image";
import { Check, Users, Sparkles } from "lucide-react";
import { ITeam } from "@/types";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  team: ITeam;
  isSelected?: boolean;
  onSelect?: (team: ITeam) => void;
  selectable?: boolean;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  isSelected = false,
  onSelect,
  selectable = true,
}) => {
  return (
    <div
      onClick={() => selectable && onSelect && onSelect(team)}
      className={cn(
        "group relative flex flex-col rounded-2xl overflow-hidden border bg-party-card/90 transition-all duration-300",
        selectable ? "cursor-pointer select-none" : "",
        isSelected
          ? "border-party-neonPink shadow-glow-pink scale-[1.02] ring-2 ring-party-neonPink/50"
          : "border-party-border/60 hover:border-party-neonPurple/60 hover:scale-[1.01] hover:shadow-glow"
      )}
    >
      {/* Selection Indicator Banner */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-party-neonPink text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg animate-in zoom-in-90">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Selected</span>
        </div>
      )}

      {/* Image Container with Stage Glow */}
      <div className="relative w-full h-52 sm:h-56 bg-party-surface overflow-hidden">
        {team.image ? (
          <Image
            src={team.image}
            alt={team.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              "object-cover transition-transform duration-500",
              isSelected ? "scale-105" : "group-hover:scale-105"
            )}
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-party-surface text-gray-500">
            <Sparkles className="w-12 h-12 text-party-neonPurple/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-party-card via-party-card/30 to-transparent" />
      </div>

      {/* Team Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-xl font-extrabold text-white group-hover:text-party-neonPink transition-colors">
              {team.name}
            </h3>
          </div>

          <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed mb-4">
            {team.description}
          </p>

          {team.members && team.members.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
              <Users className="w-3.5 h-3.5 text-party-neonCyan" />
              <span className="truncate">{team.members.join(", ")}</span>
            </div>
          )}
        </div>

        {selectable && (
          <div className="mt-2 pt-3 border-t border-party-border/50">
            <div
              className={cn(
                "w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2",
                isSelected
                  ? "bg-party-neonPink text-white shadow-glow-pink"
                  : "bg-party-surface text-gray-300 group-hover:bg-party-neonPurple group-hover:text-white"
              )}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Your Choice</span>
                </>
              ) : (
                <span>Select Team</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
