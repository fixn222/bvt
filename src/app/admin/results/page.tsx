"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { firePartyConfetti } from "@/components/voting/Confetti";
import {
  Trophy,
  Crown,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw,
  Radio,
  Medal,
} from "lucide-react";
import { ITeamResult, VotingStatus } from "@/types";
import { formatPercentage } from "@/lib/utils";

export default function AdminResultsStagePage() {
  const [resultsVisible, setResultsVisible] = useState(false);
  const [status, setStatus] = useState<VotingStatus>("open");
  const [totalDevices, setTotalDevices] = useState(0);
  const [teams, setTeams] = useState<ITeamResult[]>([]);
  const [winners, setWinners] = useState<ITeamResult[]>([]);
  const [isTie, setIsTie] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/results?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setStatus(data.status);
        setResultsVisible(data.resultsVisible);
        setTotalDevices(data.totalDevices || 0);
        setTeams(data.teams || []);
        setWinners(data.winners || []);
        setIsTie(!!data.isTie);
      }
    } catch (err) {
      console.error("Failed to load stage results:", err);
    }
  }, []);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 3000);
    return () => clearInterval(interval);
  }, [fetchResults]);

  const handleToggleReveal = async () => {
    try {
      setIsToggling(true);
      const res = await fetch("/api/admin/event/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultsVisible: !resultsVisible }),
      });
      const data = await res.json();
      setResultsVisible(data.resultsVisible);
      if (data.resultsVisible) firePartyConfetti();
      fetchResults();
    } catch (err) {
      console.error("Reveal toggle error:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-party-bg bg-party-dots p-6 sm:p-12 overflow-y-auto"
          : "space-y-6 pb-12"
      }
    >
      {/* Top Controls Bar */}
      <div className="bg-party-card border-3 border-black rounded-3xl p-5 shadow-cartoon flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-party-yellow border-2 border-black shadow-cartoon-sm flex items-center justify-center">
            <Trophy className="w-6 h-6 text-party-pink fill-party-pink" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-cartoon">
                STAGE PROJECTOR DISPLAY
              </h1>
              <Badge status={status} className="text-[10px] px-2 py-0.5" />
            </div>
            <p className="text-xs text-gray-300 font-bold mt-0.5 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-party-cyan animate-pulse" />
              <span>{totalDevices} audience phones connected</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={resultsVisible ? "lime" : "pink"}
            onClick={handleToggleReveal}
            isLoading={isToggling}
            className="text-xs font-black shadow-cartoon-sm"
          >
            {resultsVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5 mr-1" />
                <span>Hide Results</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 mr-1" />
                <span>Reveal Winner on Screen! 🎉</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="cyan"
            onClick={toggleFullscreen}
            className="text-xs font-black shadow-cartoon-sm"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 mr-1" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 mr-1" />
                <span>Fullscreen Projector Mode</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Screen Projection Content */}
      <div className="space-y-6">
        {/* Winner Highlight Card */}
        {resultsVisible && winners.length > 0 && (
          <div className="bg-party-yellow text-slate-950 border-4 border-black rounded-3xl p-6 sm:p-10 shadow-cartoon-xl text-center animate-in zoom-in-95">
            <div className="inline-flex items-center gap-2 bg-party-pink text-white font-black text-xs sm:text-sm px-4 py-2 rounded-full border-2 border-black shadow-cartoon-sm mb-4 uppercase animate-bounce-subtle">
              <Crown className="w-5 h-5 fill-current" />
              <span>{isTie ? "IT'S A TIE! MULTIPLE CHAMPIONS!" : "TONIGHT'S TALENT CHAMPION!"}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 my-4">
              {winners.map((winner) => (
                <div
                  key={winner.teamId}
                  className="bg-white border-4 border-black rounded-3xl p-5 shadow-cartoon flex flex-col items-center max-w-xs w-full"
                >
                  <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-3 border-black mb-3">
                    <Image
                      src={winner.image}
                      alt={winner.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-3xl font-black text-slate-950 font-cartoon">
                    {winner.name}
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-2 bg-party-yellow px-4 py-1.5 rounded-full border-2 border-black font-black text-sm">
                    <Trophy className="w-4 h-4 text-party-pink fill-party-pink" />
                    <span>
                      {winner.votes} votes ({formatPercentage(winner.percentage)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Leaderboard Standings */}
        <div className="bg-party-card border-3 border-black rounded-3xl p-6 shadow-cartoon space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-white font-cartoon flex items-center gap-2">
            <Medal className="w-6 h-6 text-party-cyan" />
            <span>Leaderboard Standings</span>
          </h2>

          <div className="space-y-3">
            {teams.map((team, index) => {
              const rank = index + 1;
              const isFirst = rank === 1 && team.votes > 0;

              return (
                <div
                  key={team.teamId}
                  className={`relative rounded-2xl border-3 border-black p-4 sm:p-5 transition-all overflow-hidden ${
                    isFirst
                      ? "bg-party-yellow text-slate-950 shadow-cartoon"
                      : "bg-party-surface text-white"
                  }`}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-black/10 pointer-events-none transition-all duration-500"
                    style={{ width: `${team.percentage}%` }}
                  />

                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 border-black flex items-center justify-center font-black text-base sm:text-lg flex-shrink-0 ${
                          isFirst
                            ? "bg-party-pink text-white"
                            : "bg-party-card text-party-yellow"
                        }`}
                      >
                        #{rank}
                      </div>

                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-black overflow-hidden flex-shrink-0">
                        <Image
                          src={team.image}
                          alt={team.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-black text-lg sm:text-2xl truncate font-cartoon">
                          {team.name}
                        </h4>
                        {isFirst && (
                          <span className="text-xs font-black uppercase tracking-wider text-party-pink flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5 fill-current" /> Leader
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 font-black">
                      <span className="font-mono text-xl sm:text-3xl block">
                        {team.votes} <span className="text-xs font-bold uppercase">votes</span>
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-400 block">
                        {formatPercentage(team.percentage)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
