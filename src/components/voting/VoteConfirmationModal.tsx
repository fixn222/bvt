"use client";

import React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ITeam } from "@/types";
import { Sparkles, ShieldAlert } from "lucide-react";

interface VoteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  team: ITeam | null;
  voterCode: string;
  isSubmitting: boolean;
}

export const VoteConfirmationModal: React.FC<VoteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  team,
  voterCode,
  isSubmitting,
}) => {
  if (!team) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="Confirm Your Vote"
      description="Please verify your selected team and voting pass code."
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Team Preview Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-party-surface border border-party-neonPink/40 shadow-glow-pink">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-party-card flex-shrink-0 border border-party-border">
            {team.image ? (
              <Image
                src={team.image}
                alt={team.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-party-neonPink" />
              </div>
            )}
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-party-neonPink tracking-wider">
              You are voting for
            </span>
            <h4 className="text-xl font-black text-white">{team.name}</h4>
          </div>
        </div>

        {/* Voting Code Display */}
        <div className="p-3.5 rounded-xl bg-party-surface/80 border border-party-border flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Your Pass Code:</span>
          <span className="font-mono font-bold text-white tracking-widest text-sm bg-black/40 px-3 py-1 rounded border border-party-border">
            {voterCode}
          </span>
        </div>

        {/* Irreversible Warning */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <span>
            Votes are final and strictly limited to <strong>one vote per pass</strong>. This action cannot be undone.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white"
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isSubmitting}
            className="px-6 py-3 shadow-glow-pink"
          >
            Confirm & Cast Vote
          </Button>
        </div>
      </div>
    </Modal>
  );
};
