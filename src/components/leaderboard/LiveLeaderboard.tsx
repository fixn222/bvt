"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Trophy,
  RefreshCw,
  Maximize2,
  Minimize2,
  EyeOff,
  Radio,
  Play,
  Pause,
} from "lucide-react";
import { VotingStatus } from "@/types";

interface LeaderboardTeam {
  rank?: number;
  teamId: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  votes?: number;
  voteShare: number;
  diffFromPrev?: number;
}

export const LiveLeaderboard = () => {
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [showResults, setShowResults] = useState(true);
  const [showVoteCounts, setShowVoteCounts] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [status, setStatus] = useState<VotingStatus>("OPEN");
  const [hiddenMessage, setHiddenMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (manual: boolean = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/results?t=${Date.now()}`);
      const data = await res.json();

      if (!data.showResults) {
        setShowResults(false);
        setHiddenMessage(data.message || "Results are currently hidden by event organizers.");
        setStatus(data.status || "OPEN");
      } else {
        setShowResults(true);
        setShowVoteCounts(data.showVoteCounts ?? true);
        setShowLeaderboard(data.showLeaderboard ?? true);
        setStatus(data.status || "OPEN");
        setTeams(data.teams || []);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch live results:", err);
    } finally {
      setIsLoading(false);
      if (manual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Real-time polling interval (5 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchResults(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchResults]);

  const toggleProjectorMode = () => {
    if (!isProjectorMode) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsProjectorMode(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsProjectorMode(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsProjectorMode(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={
        isProjectorMode
          ? "fixed inset-0 z-50 bg-party-dark p-6 sm:p-12 overflow-y-auto"
          : "max-w-5xl mx-auto px-4 py-8"
      }
    >
      {/* Top Controls & Status Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-party-card/70 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-party-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-party-gold/15 text-party-gold border border-party-gold/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">Live Stage Leaderboard</h1>
              <Badge status={status} className="text-[10px] px-2 py-0.5" />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <Radio className="w-3.5 h-3.5 text-party-neonCyan animate-pulse" />
              <span>
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="text-xs"
            title={autoRefresh ? "Pause live auto updates" : "Resume live auto updates"}
          >
            {autoRefresh ? (
              <>
                <Pause className="w-3.5 h-3.5 mr-1 text-party-neonCyan" />
                <span>Live On</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1 text-gray-400" />
                <span>Paused</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => fetchResults(true)}
            isLoading={isRefreshing}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={toggleProjectorMode}
            className="text-xs"
            title="Toggle Stage Projector Fullscreen Mode"
          >
            {isProjectorMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 mr-1" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 mr-1" />
                <span>Stage Projector</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Content */}
      {!showResults ? (
        <div className="text-center py-20 px-4 bg-party-surface/40 rounded-3xl border border-party-border/60 max-w-2xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-party-neonPurple/20 border border-party-neonPurple/40 flex items-center justify-center mx-auto mb-4 text-party-neonPurple">
            <EyeOff className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Leaderboard Hidden
          </h2>
          <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
            {hiddenMessage}
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-party-card px-4 py-2 rounded-full border border-party-border">
            <span>Keep voting! The final tally will be unveiled on stage soon.</span>
          </div>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-party-surface/50 border border-party-border/50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-20 bg-party-surface/30 rounded-3xl border border-party-border">
          <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-1">
            No Votes Recorded Yet
          </h3>
          <p className="text-xs text-gray-400">
            Be the first to vote for your favorite team!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map((t, idx) => (
            <LeaderboardRow
              key={t.teamId}
              rank={t.rank ?? idx + 1}
              name={t.name}
              image={t.image}
              votes={t.votes}
              voteShare={t.voteShare}
              diffFromPrev={t.diffFromPrev}
              showVoteCounts={showVoteCounts}
              showLeaderboard={showLeaderboard}
              isProjectorMode={isProjectorMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
