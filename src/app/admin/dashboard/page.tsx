"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Trophy,
  Users,
  Play,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Crown,
  Sparkles,
  BarChart3,
  Flame,
  Mic2,
  CheckCircle2,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { ITeamResult, VotingStatus } from "@/types";
import { formatPercentage } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function AdminDashboardPage() {
  const [status, setStatus] = useState<VotingStatus>("open");
  const [resultsVisible, setResultsVisible] = useState(false);
  const [totalDevices, setTotalDevices] = useState(0);
  const [teams, setTeams] = useState<ITeamResult[]>([]);
  const [winners, setWinners] = useState<ITeamResult[]>([]);
  const [isTie, setIsTie] = useState(false);
  const [currentPerformingTeamId, setCurrentPerformingTeamId] = useState<string | null>(null);
  const [lockUnperformedTeams, setLockUnperformedTeams] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchLiveResults = useCallback(async (manual: boolean = false) => {
    try {
      const [resResults, resEvent, resTeams] = await Promise.all([
        fetch(`/api/admin/results?t=${Date.now()}`),
        fetch(`/api/event?t=${Date.now()}`),
        fetch(`/api/admin/teams?t=${Date.now()}`),
      ]);

      const data = await resResults.json();
      const eventData = await resEvent.json();
      const teamsData = await resTeams.json();

      if (data.success) {
        setStatus(data.status);
        setResultsVisible(data.resultsVisible);
        setTotalDevices(data.totalDevices || 0);

        // Merge hasPerformed info from teamsData
        const performedMap = new Map<string, boolean>();
        if (teamsData?.teams) {
          for (const t of teamsData.teams) {
            performedMap.set(t._id, !!t.hasPerformed);
          }
        }

        const enrichedTeams = (data.teams || []).map((t: ITeamResult) => ({
          ...t,
          hasPerformed: performedMap.get(t.teamId) ?? t.hasPerformed ?? false,
          isPerforming: eventData?.currentPerformingTeamId === t.teamId,
        }));

        setTeams(enrichedTeams);
        setWinners(data.winners || []);
        setIsTie(!!data.isTie);
      }

      if (eventData) {
        setCurrentPerformingTeamId(eventData.currentPerformingTeamId || null);
        setLockUnperformedTeams(eventData.lockUnperformedTeams !== false);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveResults();
    const interval = setInterval(() => {
      fetchLiveResults();
    }, 3500); // Poll every 3.5s for instant crowd updates
    return () => clearInterval(interval);
  }, [fetchLiveResults]);

  // Handle Event Status Change (Start Voting / End Voting)
  const handleStatusChange = async (nextStatus: VotingStatus) => {
    try {
      setIsActionLoading(true);
      setFeedback(null);
      const res = await fetch("/api/admin/event/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      setStatus(nextStatus);
      setFeedback(data.message);
      fetchLiveResults();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Reveal / Hide Results
  const handleToggleReveal = async () => {
    try {
      setIsActionLoading(true);
      setFeedback(null);
      const res = await fetch("/api/admin/event/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultsVisible: !resultsVisible }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle reveal");
      setResultsVisible(data.resultsVisible);
      setFeedback(data.message);
      fetchLiveResults();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Set Currently Performing Act on Stage
  const handleSetPerforming = async (teamId: string | null) => {
    try {
      setIsActionLoading(true);
      setFeedback(null);
      const res = await fetch("/api/admin/event/performing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update performing act");
      setCurrentPerformingTeamId(teamId);
      setFeedback(data.message);
      fetchLiveResults();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle locking unperformed teams
  const handleToggleLockUnperformed = async () => {
    try {
      setIsActionLoading(true);
      setFeedback(null);
      const nextLock = !lockUnperformedTeams;
      const res = await fetch("/api/admin/event/performing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: currentPerformingTeamId, lockUnperformedTeams: nextLock }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update lock setting");
      setLockUnperformedTeams(nextLock);
      setFeedback(
        nextLock
          ? "Locked: Guests can only vote for acts that have taken the stage! 🔒"
          : "Unlocked: Guests can now vote for any act freely! 🔓"
      );
      fetchLiveResults();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const chartColors = ["#FFE600", "#FF2E93", "#00F0FF", "#22C55E", "#FF6B00", "#9333EA"];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Quick Feedback */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-cartoon uppercase">
            PARTY CONTROL CENTER
          </h1>
          <p className="text-xs text-gray-300 font-bold mt-1">
            Control the voting stages, watch live device votes, and crown the winner!
          </p>
        </div>

        <Badge status={status} className="text-sm px-4 py-2" />
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-party-lime text-slate-950 border-3 border-black shadow-cartoon font-black text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-party-card border-3 border-black rounded-3xl p-6 shadow-cartoon flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-party-yellow block mb-1">
              Active Voting Devices
            </span>
            <span className="text-4xl font-black text-white font-mono">
              {totalDevices}
            </span>
            <p className="text-[11px] text-gray-400 font-bold mt-1">
              Phones with an active vote
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-party-yellow border-2 border-black shadow-cartoon-sm flex items-center justify-center">
            <Users className="w-6 h-6 text-slate-950" />
          </div>
        </div>

        <div className="bg-party-card border-3 border-black rounded-3xl p-6 shadow-cartoon flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-party-pink block mb-1">
              Current Leader
            </span>
            <span className="text-2xl font-black text-white font-cartoon truncate block max-w-[180px]">
              {winners.length > 0
                ? isTie
                  ? `${winners.length} Teams Tied!`
                  : winners[0].name
                : "No votes yet"}
            </span>
            <p className="text-[11px] text-gray-400 font-bold mt-1">
              {winners.length > 0 ? `${winners[0].votes} votes` : "Awaiting crowd votes"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-party-pink border-2 border-black shadow-cartoon-sm flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-party-card border-3 border-black rounded-3xl p-6 shadow-cartoon flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-party-cyan block mb-1">
              Now on Stage 🎤
            </span>
            <span className="text-xl font-black text-white font-cartoon truncate block max-w-[180px]">
              {teams.find((t) => t.teamId === currentPerformingTeamId)?.name || "Intermission"}
            </span>
            <p className="text-[11px] text-gray-400 font-bold mt-1">
              {currentPerformingTeamId ? "Live performance active" : "No act on stage"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-party-cyan border-2 border-black shadow-cartoon-sm flex items-center justify-center">
            <Mic2 className="w-6 h-6 text-slate-950 animate-pulse" />
          </div>
        </div>

        <div className="bg-party-card border-3 border-black rounded-3xl p-6 shadow-cartoon flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-party-lime block mb-1">
              Public Reveal Status
            </span>
            <span className="text-2xl font-black text-white font-cartoon block">
              {resultsVisible ? "REVEALED 🏆" : "HIDDEN 🤫"}
            </span>
            <p className="text-[11px] text-gray-400 font-bold mt-1">
              {resultsVisible ? "Audience can see winner" : "Hidden from guests"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-party-lime border-2 border-black shadow-cartoon-sm flex items-center justify-center">
            <Trophy className="w-6 h-6 text-slate-950" />
          </div>
        </div>
      </div>

      {/* Main Party Voting Controls Card */}
      <div className="bg-party-surface border-4 border-black rounded-3xl p-6 sm:p-8 shadow-cartoon-lg space-y-4">
        <div>
          <h2 className="text-xl font-black text-white font-cartoon uppercase flex items-center gap-2">
            <Flame className="w-5 h-5 text-party-yellow" />
            <span>Event Stage Controls</span>
          </h2>
          <p className="text-xs text-gray-300 font-bold mt-0.5">
            Click to change voting states during the live talent show
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {status === "upcoming" && (
            <Button
              size="lg"
              variant="yellow"
              onClick={() => handleStatusChange("open")}
              disabled={isActionLoading}
              className="text-xs sm:text-sm"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              <span>Start Voting (Open)</span>
            </Button>
          )}

          {status === "open" && (
            <Button
              size="lg"
              variant="pink"
              onClick={() => handleStatusChange("closed")}
              disabled={isActionLoading}
              className="text-xs sm:text-sm"
            >
              <Lock className="w-4 h-4 mr-2" />
              <span>End Voting (Lock Votes)</span>
            </Button>
          )}

          {status === "closed" && (
            <Button
              size="lg"
              variant="cyan"
              onClick={() => handleStatusChange("open")}
              disabled={isActionLoading}
              className="text-xs sm:text-sm"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              <span>Re-open Voting</span>
            </Button>
          )}

          <Button
            size="lg"
            variant={resultsVisible ? "lime" : "purple"}
            onClick={handleToggleReveal}
            disabled={isActionLoading}
            className="text-xs sm:text-sm"
          >
            {resultsVisible ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                <span>Hide Results From Public</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                <span>Reveal Winner on Stage! 🏆</span>
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="ghost"
            onClick={() => fetchLiveResults(true)}
            className="text-xs"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Refresh Tally</span>
          </Button>
        </div>
      </div>

      {/* 🎤 Live Stage Manager: Set Performing Act & Lock Unperformed Teams */}
      <div className="bg-party-card border-4 border-black rounded-3xl p-6 sm:p-8 shadow-cartoon-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-party-cyan text-slate-950 font-black text-xs px-3 py-1 rounded-full border-2 border-black shadow-cartoon-sm uppercase mb-2">
              <Mic2 className="w-3.5 h-3.5 fill-party-pink text-party-pink animate-pulse" />
              <span>LIVE STAGE CONTROLLER</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-cartoon uppercase">
              WHO&apos;S ON STAGE RIGHT NOW?
            </h2>
            <p className="text-xs text-gray-300 font-bold mt-0.5">
              Select the active performing act. Guests see this act featured on top, and unperformed acts remain locked!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={lockUnperformedTeams ? "lime" : "orange"}
              onClick={handleToggleLockUnperformed}
              disabled={isActionLoading}
              className="text-xs"
            >
              {lockUnperformedTeams ? (
                <>
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  <span>Lock Unperformed Acts: ON</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1" />
                  <span>Lock Unperformed Acts: OFF</span>
                </>
              )}
            </Button>

            {currentPerformingTeamId && (
              <Button
                size="sm"
                variant="pink"
                onClick={() => handleSetPerforming(null)}
                disabled={isActionLoading}
                className="text-xs"
              >
                <span>Clear Stage (Intermission)</span>
              </Button>
            )}
          </div>
        </div>

        {/* Current Active Performer Spotlight */}
        {(() => {
          const activeTeam = teams.find((t) => t.teamId === currentPerformingTeamId);
          if (!activeTeam) {
            return (
              <div className="p-4 rounded-2xl bg-party-surface border-2 border-dashed border-gray-600 text-center text-xs font-bold text-gray-400 flex items-center justify-center gap-2">
                <Mic2 className="w-4 h-4 text-gray-500" />
                <span>No act currently on stage (Intermission). Click &quot;Put on Stage&quot; on any act below!</span>
              </div>
            );
          }

          return (
            <div className="p-4 rounded-2xl bg-party-surface border-3 border-party-cyan shadow-cartoon-cyan flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl border-2 border-black overflow-hidden flex-shrink-0">
                  <Image
                    src={activeTeam.image}
                    alt={activeTeam.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-party-cyan tracking-wider flex items-center gap-1">
                    <Radio className="w-3 h-3 text-party-pink animate-pulse" /> LIVE ON STAGE NOW
                  </span>
                  <h3 className="text-xl font-black text-white font-cartoon">
                    {activeTeam.name}
                  </h3>
                  <p className="text-xs text-gray-300 font-medium">
                    {activeTeam.description || "Performing on stage!"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="yellow"
                  onClick={() => handleSetPerforming(null)}
                  disabled={isActionLoading}
                  className="text-xs"
                >
                  <span>Finish Act & Clear Stage</span>
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Acts Roster Grid for Quick Stage Setting */}
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-party-yellow block mb-3">
            Quick Act Selector (Click to Put on Stage)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teams.map((t) => {
              const isOnStage = t.teamId === currentPerformingTeamId;
              const hasPerformed = !!t.hasPerformed;

              return (
                <div
                  key={t.teamId}
                  className={`p-3 rounded-2xl border-2 border-black shadow-cartoon-sm flex items-center justify-between gap-2 transition-all ${
                    isOnStage
                      ? "bg-party-cyan text-slate-950 font-black scale-102 ring-2 ring-white"
                      : hasPerformed
                        ? "bg-party-surface text-white"
                        : "bg-party-surface/70 text-gray-300 border-dashed"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-xl border border-black overflow-hidden flex-shrink-0">
                      <Image
                        src={t.image}
                        alt={t.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-xs truncate font-cartoon">
                        {t.name}
                      </h4>
                      <span className="text-[10px] block opacity-80 font-bold">
                        {isOnStage
                          ? "🎤 On Stage"
                          : hasPerformed
                            ? "✅ Performed (Voting Open)"
                            : "⏳ Upcoming Act"}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isOnStage ? "pink" : "yellow"}
                    onClick={() => handleSetPerforming(isOnStage ? null : t.teamId)}
                    disabled={isActionLoading}
                    className="text-[10px] px-2.5 py-1 min-h-8 flex-shrink-0"
                  >
                    {isOnStage ? "End Act" : "Put on Stage 🎤"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analytics Chart & Live Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simple Bar Chart */}
        <div className="bg-party-card border-3 border-black rounded-3xl p-6 shadow-cartoon">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white font-cartoon flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-party-yellow" />
              <span>Vote Breakdown</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono font-bold">
              {totalDevices} active ballots
            </span>
          </div>

          {totalDevices === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400">
              <BarChart3 className="w-12 h-12 text-gray-600 mb-2" />
              <p className="text-xs font-bold">Awaiting first votes from the crowd!</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teams} margin={{ top: 10, right: 10, left: -25, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4C3382" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    stroke="#D1D5DB"
                    fontSize={10}
                    tickLine={false}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#D1D5DB" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E1238",
                      border: "2px solid #000",
                      borderRadius: "16px",
                      fontSize: "12px",
                      color: "#fff",
                      boxShadow: "4px 4px 0px #000",
                    }}
                    formatter={(val: number) => [`${val} votes`, "Total"]}
                  />
                  <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                    {teams.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Live Standings Table */}
        <div className="bg-party-card border-3 border-black rounded-3xl p-6 shadow-cartoon space-y-4">
          <h3 className="text-lg font-black text-white font-cartoon flex items-center gap-2">
            <Trophy className="w-5 h-5 text-party-pink" />
            <span>Current Crowd Standings</span>
          </h3>

          <div className="space-y-2.5">
            {teams.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center font-bold">
                No teams registered yet.
              </p>
            ) : (
              teams.map((t, idx) => (
                <div
                  key={t.teamId}
                  className="p-3 rounded-2xl bg-party-surface border-2 border-black shadow-cartoon-sm flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-party-card border border-black font-black flex items-center justify-center text-party-yellow flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-black text-white text-sm truncate font-cartoon">
                      {t.name}
                    </span>
                    {idx === 0 && t.votes > 0 && (
                      <span className="bg-party-yellow text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full border border-black uppercase flex-shrink-0">
                        {isTie ? "Tied Leader" : "Leader"}
                      </span>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0 font-black">
                    <span className="font-mono text-party-yellow text-sm">
                      {t.votes} votes
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1.5 font-bold">
                      ({formatPercentage(t.percentage)})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
