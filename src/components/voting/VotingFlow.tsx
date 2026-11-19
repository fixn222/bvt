"use client";

import React, { useState, useEffect } from "react";
import { ITeam, VotingStatus } from "@/types";
import { TeamGrid } from "@/components/teams/TeamGrid";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { VoteConfirmationModal } from "@/components/voting/VoteConfirmationModal";
import { VoteSuccessScreen } from "@/components/voting/VoteSuccessScreen";
import { Vote, KeyRound, AlertCircle, Sparkles, Check, ArrowRight } from "lucide-react";

export const VotingFlow = () => {
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [eventStatus, setEventStatus] = useState<VotingStatus>("OPEN");
  const [eventName, setEventName] = useState("BVTalent Show");
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const [voterCode, setVoterCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<boolean>(false);
  const [successTeam, setSuccessTeam] = useState<{ name: string; image?: string } | null>(null);

  // Fetch initial teams and event status
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [eventRes, teamsRes] = await Promise.all([
          fetch("/api/event"),
          fetch("/api/teams"),
        ]);

        const eventData = await eventRes.json();
        const teamsData = await teamsRes.json();

        if (eventData?.status) {
          setEventStatus(eventData.status);
          if (eventData.name) setEventName(eventData.name);
        }

        if (teamsData?.teams) {
          setTeams(teamsData.teams);
        }
      } catch (err) {
        console.error("Failed to load voting data:", err);
        setErrorMessage("Could not connect to the voting server. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectTeam = (team: ITeam) => {
    setSelectedTeam(team);
    setErrorMessage(null);
  };

  const handleOpenConfirm = () => {
    setErrorMessage(null);

    if (!selectedTeam) {
      setErrorMessage("Please select one team before submitting your vote.");
      return;
    }

    if (!voterCode.trim()) {
      setErrorMessage("Please enter your unique voting pass code.");
      return;
    }

    if (voterCode.trim().length < 3) {
      setErrorMessage("Please enter a valid voting pass code.");
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedTeam) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam._id,
          voterCode: voterCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsModalOpen(false);
        setErrorMessage(data.error || "Failed to submit vote. Please try again.");
        return;
      }

      // Success
      setIsModalOpen(false);
      setSuccessTeam({
        name: data.votedTeam?.name || selectedTeam.name,
        image: data.votedTeam?.image || selectedTeam.image,
      });
      setVoteSuccess(true);
    } catch (err) {
      console.error("Submission error:", err);
      setIsModalOpen(false);
      setErrorMessage("Network error. Please verify your connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setVoteSuccess(false);
    setSelectedTeam(null);
    setVoterCode("");
    setErrorMessage(null);
  };

  if (voteSuccess && successTeam) {
    return (
      <VoteSuccessScreen
        teamName={successTeam.name}
        teamImage={successTeam.image}
        onReset={handleReset}
      />
    );
  }

  const isVotingDisabled = eventStatus !== "OPEN";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Badge status={eventStatus} />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Cast Your Official Vote
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mt-2">
          Select your favorite performer below, type your unique event pass code, and submit.
        </p>
      </div>

      {/* Voting Inactive Alerts */}
      {eventStatus === "PAUSED" && (
        <div className="mb-8 p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Voting is temporarily paused by the organizers. Please stand by!</span>
        </div>
      )}

      {eventStatus === "CLOSED" && (
        <div className="mb-8 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Voting has officially closed. Thank you to everyone who participated!</span>
        </div>
      )}

      {eventStatus === "UPCOMING" && (
        <div className="mb-8 p-4 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Voting will open once the live performances begin. Get ready!</span>
        </div>
      )}

      {/* Error message banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/50 text-rose-300 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Team Selection Grid */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-party-neonPink text-white text-xs font-black flex items-center justify-center">
              1
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Select One Competing Team
            </h2>
          </div>
          {selectedTeam && (
            <span className="text-xs font-bold text-party-neonPink flex items-center gap-1">
              <Check className="w-4 h-4 stroke-[3]" /> Selected: {selectedTeam.name}
            </span>
          )}
        </div>

        <TeamGrid
          teams={teams}
          selectedTeamId={selectedTeam?._id}
          onSelectTeam={handleSelectTeam}
          isLoading={isLoading}
          selectable={!isVotingDisabled}
        />
      </div>

      {/* Step 2: Enter Voter Code & Submit */}
      <div className="max-w-xl mx-auto bg-party-card border border-party-border/80 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-20">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-party-neonPurple text-white text-xs font-black flex items-center justify-center">
            2
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Enter Your Voting Pass Code
          </h2>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Your unique pass code is printed on your event ticket or QR card (e.g. <span className="font-mono text-party-neonCyan">BVT-XXXX-XXXX</span>).
        </p>

        <div className="space-y-4">
          <div className="relative">
            <Input
              id="voterCodeInput"
              placeholder="e.g. BVT-8K4F-9W2M"
              value={voterCode}
              onChange={(e) => {
                setVoterCode(e.target.value.toUpperCase());
                setErrorMessage(null);
              }}
              disabled={isVotingDisabled}
              className="text-center font-mono font-bold tracking-widest text-lg py-3.5 uppercase"
              maxLength={25}
            />
            <KeyRound className="w-5 h-5 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
          </div>

          {selectedTeam ? (
            <div className="p-3 bg-party-surface/80 rounded-xl border border-party-border/60 flex items-center justify-between text-xs">
              <span className="text-gray-400">Chosen Team:</span>
              <span className="font-bold text-white">{selectedTeam.name}</span>
            </div>
          ) : (
            <p className="text-xs text-amber-400/80 italic text-center">
              Please choose a team above to complete your vote.
            </p>
          )}

          <Button
            size="lg"
            variant="primary"
            onClick={handleOpenConfirm}
            disabled={isVotingDisabled || !selectedTeam || !voterCode.trim()}
            className="w-full py-4 text-base shadow-glow-pink"
          >
            <Vote className="w-5 h-5 mr-2" />
            <span>Review & Submit Vote</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <VoteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmVote}
        team={selectedTeam}
        voterCode={voterCode}
        isSubmitting={isSubmitting}
      />

      {/* Mobile Sticky CTA Bar when a team is selected */}
      {selectedTeam && !voteSuccess && !isVotingDisabled && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-party-dark/95 backdrop-blur-xl border-t border-party-border z-30 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold text-party-neonPink block">
                Selected
              </span>
              <span className="text-sm font-black text-white truncate block">
                {selectedTeam.name}
              </span>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={handleOpenConfirm}
              className="flex-shrink-0 text-xs px-4 py-2.5 shadow-glow-pink"
            >
              <span>Submit Vote</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
