"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { VotingStatus } from "@/types";
import { Play, Pause, PowerOff, ShieldCheck } from "lucide-react";

interface VotingControlsProps {
  currentStatus: VotingStatus;
  onStatusChange: (newStatus: VotingStatus) => void;
}

export const VotingControls: React.FC<VotingControlsProps> = ({
  currentStatus,
  onStatusChange,
}) => {
  const [activeDialog, setActiveDialog] = useState<
    "open" | "pause" | "resume" | "close" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAction = async (endpoint: string, nextStatus: VotingStatus) => {
    try {
      setIsLoading(true);
      setFeedback(null);
      const res = await fetch(`/api/admin/voting/${endpoint}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }
      onStatusChange(nextStatus);
      setFeedback(data.message);
      setActiveDialog(null);
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-party-surface/80 border border-party-border rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-party-neonCyan" />
            <span>Live Voting State Controls</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage stage voting acceptance. State changes are written to the immutable audit log.
          </p>
        </div>

        <div className="text-xs font-semibold text-gray-300 bg-party-card px-3 py-1.5 rounded-lg border border-party-border">
          Current State: <span className="font-bold text-party-neonPink ml-1">{currentStatus}</span>
        </div>
      </div>

      {feedback && (
        <div className="mb-4 text-xs font-semibold p-2.5 rounded-lg bg-party-neonPurple/20 text-purple-200 border border-party-neonPurple/40">
          {feedback}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {currentStatus !== "OPEN" && currentStatus !== "CLOSED" && (
          <Button
            size="md"
            variant="cyan"
            onClick={() => setActiveDialog("open")}
            className="shadow-glow-cyan text-xs"
          >
            <Play className="w-4 h-4 mr-1.5 fill-current" />
            <span>Open Voting</span>
          </Button>
        )}

        {currentStatus === "OPEN" && (
          <Button
            size="md"
            variant="secondary"
            onClick={() => setActiveDialog("pause")}
            className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
          >
            <Pause className="w-4 h-4 mr-1.5" />
            <span>Pause Voting</span>
          </Button>
        )}

        {currentStatus === "PAUSED" && (
          <Button
            size="md"
            variant="primary"
            onClick={() => setActiveDialog("resume")}
            className="text-xs shadow-glow-pink"
          >
            <Play className="w-4 h-4 mr-1.5" />
            <span>Resume Voting</span>
          </Button>
        )}

        {currentStatus !== "CLOSED" && (
          <Button
            size="md"
            variant="danger"
            onClick={() => setActiveDialog("close")}
            className="text-xs"
          >
            <PowerOff className="w-4 h-4 mr-1.5" />
            <span>Close Permanently</span>
          </Button>
        )}

        {currentStatus === "CLOSED" && (
          <div className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/30">
            Voting is closed. No further votes can be submitted.
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={activeDialog === "open"}
        title="Open Voting?"
        message="This will immediately enable audience members to cast votes for active teams using their pass codes."
        confirmLabel="Yes, Open Voting"
        variant="primary"
        isLoading={isLoading}
        onConfirm={() => handleAction("open", "OPEN")}
        onCancel={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        isOpen={activeDialog === "pause"}
        title="Pause Voting?"
        message="Voting will be temporarily suspended. Audience members will see a paused notice until resumed."
        confirmLabel="Pause Voting"
        variant="danger"
        isLoading={isLoading}
        onConfirm={() => handleAction("pause", "PAUSED")}
        onCancel={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        isOpen={activeDialog === "resume"}
        title="Resume Voting?"
        message="Audience members will immediately be able to cast votes again."
        confirmLabel="Resume Voting"
        variant="primary"
        isLoading={isLoading}
        onConfirm={() => handleAction("resume", "OPEN")}
        onCancel={() => setActiveDialog(null)}
      />

      <ConfirmDialog
        isOpen={activeDialog === "close"}
        title="Close Voting Permanently?"
        message="Are you sure you want to officially end voting? Any pending vote submissions will be rejected."
        confirmLabel="Close Voting"
        variant="danger"
        isLoading={isLoading}
        onConfirm={() => handleAction("close", "CLOSED")}
        onCancel={() => setActiveDialog(null)}
      />
    </div>
  );
};
