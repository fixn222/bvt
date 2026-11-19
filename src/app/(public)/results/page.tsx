"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { firePartyConfetti } from "@/components/voting/Confetti";
import {
  Trophy,
  Crown,
  Sparkles,
  RefreshCw,
  Lock,
  Vote,
  Radio,
  Medal,
  Users,
} from "lucide-react";
import { ITeamResult, VotingStatus } from "@/types";
import { formatPercentage } from "@/lib/utils";

export default function ResultsPage() {
  const [resultsVisible, setResultsVisible] = useState(false);
  const [status, setStatus] = useState<VotingStatus>("open");
  const [totalDevices, setTotalDevices] = useState(0);
  const [teams, setTeams] = useState<ITeamResult[]>([]);
  const [winners, setWinners] = useState<ITeamResult[]>([]);
  const [isTie, setIsTie] = useState(false);
  const [hiddenMessage, setHiddenMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchResults = useCallback(async (manual: boolean = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/results?t=${Date.now()}`);
      const data = await res.json();

      if (!data.resultsVisible) {
        setResultsVisible(false);
        setHiddenMessage(
          data.message ||
            "SHHH! The crowd's votes are being tallied! Results will be revealed on stage soon! 🤫✨"
        );
        setStatus(data.status || "open");
      } else {
        setResultsVisible(true);
        setStatus(data.status || "open");
        setTotalDevices(data.totalDevices || 0);
        setTeams(data.teams || []);
        setWinners(data.winners || []);
        setIsTie(!!data.isTie);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setIsLoading(false);
      if (manual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Polling every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchResults(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchResults]);

  // Trigger confetti when results are visible
  useEffect(() => {
    if (resultsVisible && winners.length > 0) {
      firePartyConfetti();
    }
  }, [resultsVisible, winners.length]);

  return (
    <div className="min-h-screen bg-party-dots px-4 py-4 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="flex flex-col items-stretch justify-between gap-4 rounded-3xl border-3 border-black bg-party-card p-4 shadow-cartoon sm:flex-row sm:items-center sm:p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-party-yellow shadow-cartoon-sm sm:h-12 sm:w-12">
              <Trophy className="h-6 w-6 fill-party-pink text-party-pink" />
            </div>
            <div className="min-w-0">
              <h1 className="font-cartoon text-xl font-black text-white sm:text-2xl">
                STAGE RESULTS
              </h1>
              <div className="mt-1.5">
                <Badge status={status} compact className="sm:hidden" />
                <Badge status={status} className="hidden sm:inline-flex" />
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs font-bold text-gray-300">
                <Radio className="h-3.5 w-3.5 shrink-0 animate-pulse text-party-cyan" />
                <span>{totalDevices} votes cast</span>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="cyan"
            onClick={() => fetchResults(true)}
            isLoading={isRefreshing}
            className="w-full text-xs sm:w-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Content */}
        {!resultsVisible ? (
          <div className="bg-party-card border-4 border-black rounded-3xl p-8 sm:p-14 text-center shadow-cartoon-xl max-w-xl mx-auto animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-3xl bg-party-pink border-3 border-black shadow-cartoon flex items-center justify-center mx-auto mb-6 rotate-[-6deg]">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-cartoon uppercase mb-3">
              RESULTS UNDER WRAPS! 🤫
            </h2>
            <p className="text-sm sm:text-base text-gray-200 font-bold leading-relaxed mb-6">
              {hiddenMessage}
            </p>
            <div className="inline-flex items-center gap-2 bg-party-surface text-party-yellow border-2 border-black px-4 py-2 rounded-2xl shadow-cartoon-sm text-xs font-black">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Organizer will reveal the winning performance soon!</span>
            </div>

            <div className="mt-8">
              <Link href="/vote" className="inline-block w-full sm:w-auto">
                <Button variant="yellow" size="md" className="w-full sm:w-auto">
                  <Vote className="w-4 h-4 mr-1.5" />
                  <span>Go to Voting Page</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Winner Announcement Spotlight Card */}
            {winners.length > 0 && (
              <div className="bg-party-yellow text-slate-950 border-4 border-black rounded-3xl p-6 sm:p-10 shadow-cartoon-xl text-center relative overflow-hidden">
                <div className="inline-flex items-center gap-2 bg-party-pink text-white font-black text-xs px-4 py-1.5 rounded-full border-2 border-black shadow-cartoon-sm mb-4 uppercase animate-bounce-subtle">
                  <Crown className="w-4 h-4 fill-current" />
                  <span>
                    {isTie ? "IT'S A TIE! MULTIPLE WINNERS!" : "AND THE CROWD WINNER IS..."}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 my-4">
                  {winners.map((winner) => (
                    <div
                      key={winner.teamId}
                      className="bg-white border-3 border-black rounded-3xl p-4 shadow-cartoon flex flex-col items-center max-w-xs w-full"
                    >
                      <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-3 border-black mb-3">
                        <Image
                          src={winner.image}
                          alt={winner.name}
                          fill
                          sizes="144px"
                          className="object-cover"
                        />
                      </div>
                      <h3 className="text-2xl font-black text-slate-950 font-cartoon">
                        {winner.name}
                      </h3>
                      <div className="mt-2 inline-flex items-center gap-2 bg-party-yellow px-3 py-1 rounded-full border-2 border-black font-black text-xs">
                        <Trophy className="w-4 h-4 text-party-pink fill-party-pink" />
                        <span>
                          {winner.votes} votes ({formatPercentage(winner.percentage)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-4 max-w-md mx-auto">
                  🎉 Congratulations to tonight&apos;s champions for an unforgettable show!
                </p>
              </div>
            )}

            {/* Complete Results Leaderboard Table */}
            <div className="bg-party-card border-3 border-black rounded-3xl p-6 shadow-cartoon space-y-4">
              <h2 className="text-xl font-black text-white font-cartoon flex items-center gap-2">
                <Medal className="w-5 h-5 text-party-cyan" />
                <span>Full Leaderboard Standings</span>
              </h2>

              <div className="space-y-3">
                {teams.map((team, index) => {
                  const rank = index + 1;
                  const isTop = rank === 1 && team.votes > 0;

                  return (
                    <div
                      key={team.teamId}
                      className={`relative rounded-2xl border-3 border-black p-4 transition-all overflow-hidden ${
                        isTop
                          ? "bg-party-yellow text-slate-950 shadow-cartoon"
                          : "bg-party-surface text-white hover:bg-party-cardHover"
                      }`}
                    >
                      {/* Vote Share Background Progress Fill */}
                      <div
                        className="absolute inset-y-0 left-0 bg-black/10 pointer-events-none transition-all duration-500"
                        style={{ width: `${team.percentage}%` }}
                      />

                      <div className="relative flex items-center justify-between gap-2 sm:gap-4">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-black flex items-center justify-center font-black text-sm flex-shrink-0 ${
                              isTop
                                ? "bg-party-pink text-white"
                                : "bg-party-card text-party-yellow"
                            }`}
                          >
                            #{rank}
                          </div>

                          <div className="relative w-12 h-12 rounded-xl border-2 border-black overflow-hidden flex-shrink-0">
                            <Image
                              src={team.image}
                              alt={team.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-black text-base sm:text-lg truncate font-cartoon">
                              {team.name}
                            </h4>
                            {isTop && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-party-pink flex items-center gap-1">
                                <Crown className="w-3 h-3 fill-current" /> Leader
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="block font-mono text-base font-black leading-none sm:text-2xl">
                            {team.votes}
                          </span>
                          <span className="text-[10px] font-bold uppercase">votes</span>
                          <span className={`block text-xs font-bold ${isTop ? "text-slate-800" : "text-gray-400"}`}>
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
        )}
      </div>
    </div>
  );
}
