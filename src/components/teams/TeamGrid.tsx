"use client";

import React from "react";
import { ITeam } from "@/types";
import { TeamCard } from "@/components/teams/TeamCard";
import { Sparkles } from "lucide-react";

interface TeamGridProps {
  teams: ITeam[];
  selectedTeamId?: string | null;
  onSelectTeam?: (team: ITeam) => void;
  isLoading?: boolean;
  selectable?: boolean;
}

export const TeamGrid: React.FC<TeamGridProps> = ({
  teams,
  selectedTeamId,
  onSelectTeam,
  isLoading = false,
  selectable = true,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-party-surface/40 border border-party-border/40 h-80 animate-pulse flex flex-col overflow-hidden"
          >
            <div className="w-full h-48 bg-party-surface/80" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-party-border/60 rounded w-2/3" />
              <div className="h-3 bg-party-border/40 rounded w-full" />
              <div className="h-3 bg-party-border/40 rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-party-surface/30 rounded-2xl border border-party-border/50">
        <Sparkles className="w-12 h-12 text-party-neonPurple mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          No Competing Teams Listed Yet
        </h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          The event organizers are currently preparing the roster. Please check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard
          key={team._id}
          team={team}
          isSelected={selectedTeamId === team._id}
          onSelect={onSelectTeam}
          selectable={selectable}
        />
      ))}
    </div>
  );
};
