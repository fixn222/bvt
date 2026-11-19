"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ITeam, VotingStatus } from "@/types";
import { CartoonTeamCard } from "@/components/teams/CartoonTeamCard";
import { getDeviceId } from "@/lib/device";
import { firePartyConfetti } from "@/components/voting/Confetti";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Sparkles,
  Trophy,
  Flame,
  AlertCircle,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  Mic2,
  Radio,
  Star,
} from "lucide-react";

export const CartoonVotingGrid = () => {
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [status, setStatus] = useState<VotingStatus>("open");
  const [eventName, setEventName] = useState("BVTalent Showdown");
  const [currentPerformingTeamId, setCurrentPerformingTeamId] = useState<string | null>(null);
  const [currentPerformingTeam, setCurrentPerformingTeam] = useState<ITeam | null>(null);
  const [lockUnperformedTeams, setLockUnperformedTeams] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");

  const selectedTeamName = teams.find((t) => t._id === currentTeamId)?.name || null;

  const loadData = useCallback(async (isInitial: boolean = false, activeId?: string) => {
    try {
      if (isInitial) setIsLoading(true);
      const [eventRes, teamsRes] = await Promise.all([
        fetch(`/api/event?t=${Date.now()}`),
        fetch(`/api/teams?t=${Date.now()}`),
      ]);

      const eventData = await eventRes.json();
      const teamsData = await teamsRes.json();

      if (eventData?.status) {
        setStatus(eventData.status);
        if (eventData.name) setEventName(eventData.name);
        setCurrentPerformingTeamId(eventData.currentPerformingTeamId || null);
        setCurrentPerformingTeam(eventData.currentPerformingTeam || null);
        setLockUnperformedTeams(eventData.lockUnperformedTeams !== false);
      }

      if (teamsData?.teams) {
        setTeams(teamsData.teams);
      }

      const idToCheck = activeId || deviceId || getDeviceId();
      if (idToCheck && isInitial) {
        try {
          const voteRes = await fetch(`/api/voting/me?deviceId=${idToCheck}&t=${Date.now()}`);
          const voteData = await voteRes.json();
          if (voteData?.hasVoted && voteData?.currentTeamId) {
            setCurrentTeamId(voteData.currentTeamId);
          }
        } catch {
          // Ignore failure to fetch past vote
        }
      }
    } catch (err) {
      console.error("Failed to load voting data:", err);
      if (isInitial) {
        setErrorMessage("Could not connect to the party server. Please refresh!");
      }
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [deviceId]);

  // Initialize device ID & fetch data
  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    loadData(true, id);

    // Live polling every 4s to track when host opens/closes voting, changes performing team, or updates teams
    const interval = setInterval(() => {
      loadData(false, id);
    }, 4000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleSelectTeam = async (team: ITeam) => {
    if (isSubmitting) return;
    if (status !== "open") return;
    if (team._id === currentTeamId) return; // Already current choice

    // Client-side guard for locked acts
    const isCurrentlyPerforming = team._id === currentPerformingTeamId;
    if (lockUnperformedTeams && !team.hasPerformed && !isCurrentlyPerforming) {
      setErrorMessage(`Hold on! ${team.name} hasn't performed yet! ⏳ Voting unlocks when they hit the stage!`);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const activeDeviceId = deviceId || getDeviceId();
      if (!activeDeviceId) {
        setErrorMessage("Could not identify your device. Please refresh the page!");
        return;
      }

      const res = await fetch("/api/voting/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: activeDeviceId,
          teamId: team._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to submit vote. Try again!");
        loadData(false, activeDeviceId);
        return;
      }

      // Success! Update local state
      setCurrentTeamId(team._id);
      setToastMessage(data.message || "YOUR VOTE HAS LANDED! 🚀");

      // Blast confetti
      firePartyConfetti();

      // Clear toast after 5s
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Voting error:", err);
      setErrorMessage("Network wobble! Please tap again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVotingOpen = status === "open";

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:py-10">
      {/* Header Banner */}
      <div className="mb-5 text-center sm:mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Badge status={status} />
        </div>

        <h1 className="mb-2 font-cartoon text-3xl font-black tracking-tight text-white sm:text-6xl">
          PICK YOUR <span className="text-party-yellow">CHAMPION!</span>
        </h1>

        <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto font-medium">
          Watch the stage, choose your favourite team, and tap to vote. You can change your mind anytime until voting locks!
        </p>
      </div>

      {/* Floating Status / Current Vote Notice */}
      <div className="mx-auto mb-5 max-w-xl sm:mb-8">
        {status === "upcoming" ? (
          <div className="p-4 rounded-3xl bg-party-cyan text-slate-950 border-3 border-black shadow-cartoon flex items-center justify-center gap-3 text-center font-black text-sm">
            <Clock className="w-5 h-5 flex-shrink-0 animate-spin" />
            <span>The party is starting soon! Voting will open when performances begin!</span>
          </div>
        ) : status === "closed" ? (
          <div className="p-4 rounded-3xl bg-party-pink text-white border-3 border-black shadow-cartoon flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-black text-sm block">VOTING IS OFFICIALLY CLOSED!</span>
                <span className="text-xs text-white/90">The crowd has spoken! Head over to see the winners!</span>
              </div>
            </div>
            <Link href="/results" className="w-full sm:w-auto">
              <Button size="sm" variant="yellow" className="w-full flex-shrink-0 text-xs sm:w-auto">
                <Trophy className="w-4 h-4 mr-1 text-party-pink" />
                <span>See Winner!</span>
              </Button>
            </Link>
          </div>
        ) : currentTeamId && selectedTeamName ? (
          <div className="flex flex-col gap-3 rounded-3xl border-3 border-black bg-party-yellow p-4 text-slate-950 shadow-cartoon sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0 stroke-[3] text-party-pink" />
              <div className="min-w-0">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-800">
                  Your Current Vote
                </span>
                <span className="block truncate text-sm font-black sm:text-base">
                  Backing {selectedTeamName}! ⭐
                </span>
              </div>
            </div>
            <span className="self-start rounded-full border-2 border-black bg-white px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow-cartoon-sm sm:self-auto">
              Tap another card to switch
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-party-card border-3 border-party-border shadow-cartoon flex items-center justify-center gap-2 text-center text-xs font-bold text-gray-300">
            <Sparkles className="w-4 h-4 text-party-yellow" />
            <span>You haven&apos;t picked your champion yet! Tap any team card below to cast your vote!</span>
          </div>
        )}
      </div>

      {/* Pop Toast Message */}
      {toastMessage && (
        <div className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-24 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:px-4">
          <div className="p-4 rounded-2xl bg-party-lime text-slate-950 border-3 border-black shadow-cartoon-xl font-black text-sm text-center flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 fill-current" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="max-w-md mx-auto mb-6 p-3.5 rounded-2xl bg-party-pink text-white border-3 border-black shadow-cartoon text-xs font-black text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 🎤 Spotlight: Now Performing Act on Stage */}
      {currentPerformingTeam && (
        <div className="relative mb-8 overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-r from-party-surface via-party-card to-party-surface p-5 sm:p-7 shadow-cartoon-xl ring-4 ring-party-cyan/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left min-w-0">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-3 border-black shadow-cartoon flex-shrink-0">
                {currentPerformingTeam.image ? (
                  <Image
                    src={currentPerformingTeam.image}
                    alt={currentPerformingTeam.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-party-cyan flex items-center justify-center">
                    <Mic2 className="w-8 h-8 text-slate-950" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 bg-party-cyan text-slate-950 px-3 py-1 rounded-full border-2 border-black font-black text-xs uppercase mb-1.5 shadow-cartoon-sm animate-bounce-subtle">
                  <Mic2 className="w-3.5 h-3.5 fill-party-pink text-party-pink animate-pulse" />
                  <span>ON STAGE RIGHT NOW!</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white font-cartoon truncate">
                  {currentPerformingTeam.name}
                </h2>
                <p className="text-xs text-gray-300 font-medium line-clamp-2 max-w-lg mt-0.5">
                  {currentPerformingTeam.description || "Live performance in progress! Tap to cheer and vote!"}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 w-full sm:w-auto">
              {currentTeamId === currentPerformingTeam._id ? (
                <div className="bg-party-yellow text-slate-950 px-5 py-3 rounded-2xl border-3 border-black shadow-cartoon-sm font-black text-xs text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-party-pink stroke-[3]" />
                  <span>You&apos;re Backing This Live Act! ⭐</span>
                </div>
              ) : (
                <Button
                  size="lg"
                  variant="cyan"
                  onClick={() => handleSelectTeam(currentPerformingTeam)}
                  disabled={!isVotingOpen || isSubmitting}
                  className="w-full sm:w-auto shadow-cartoon text-xs sm:text-sm font-black"
                >
                  <Star className="w-4 h-4 mr-1.5 fill-party-pink text-party-pink animate-bounce" />
                  <span>Vote For Live Act! 🚀</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-3xl bg-party-card border-3 border-black shadow-cartoon animate-pulse"
            />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-16 px-4 bg-party-card border-3 border-black rounded-3xl shadow-cartoon max-w-lg mx-auto">
          <Sparkles className="w-12 h-12 text-party-yellow mx-auto mb-3" />
          <h3 className="text-xl font-black text-white font-cartoon">
            No Teams Added Yet!
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            The event organizer is getting the performer list ready. Check back in a moment!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {teams.map((team) => {
            const isPerforming = team._id === currentPerformingTeamId;
            const isLocked = lockUnperformedTeams && !team.hasPerformed && !isPerforming;

            return (
              <CartoonTeamCard
                key={team._id}
                team={team}
                isSelected={currentTeamId === team._id}
                onSelect={handleSelectTeam}
                disabled={!isVotingOpen || isSubmitting || isLocked}
                isPerforming={isPerforming}
                isLocked={isLocked}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
