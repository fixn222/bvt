"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Trophy, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { firePartyConfetti } from "@/components/voting/Confetti";

interface VoteSuccessScreenProps {
  teamName: string;
  teamImage?: string;
  onReset?: () => void;
}

export const VoteSuccessScreen: React.FC<VoteSuccessScreenProps> = ({
  teamName,
  teamImage,
  onReset,
}) => {
  useEffect(() => {
    firePartyConfetti();
    const timer = setTimeout(() => {
      firePartyConfetti();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center animate-in zoom-in-95 duration-300">
      <Card className="p-8 sm:p-10 border-party-neonPink/60 shadow-glow-pink relative overflow-hidden">
        {/* Glow orb in card */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-party-neonPink/30 blur-[80px] pointer-events-none rounded-full" />

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-party-neonPink via-purple-600 to-party-neonCyan p-1 shadow-glow-pink mx-auto mb-6">
          <div className="w-full h-full bg-party-dark rounded-[20px] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-party-neonPink animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xs font-black tracking-widest uppercase text-party-neonCyan mb-1">
          Submission Confirmed
        </h2>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-4">
          YOUR VOTE IS IN!
        </h1>

        <p className="text-gray-300 text-sm sm:text-base mb-8 max-w-md mx-auto">
          Thank you for supporting live talent! Your official ballot has been cryptographically recorded on the stage leaderboard.
        </p>

        {/* Chosen Team Badge */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-party-surface border border-party-border max-w-sm mx-auto mb-8 text-left shadow-lg">
          {teamImage && (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black flex-shrink-0">
              <Image
                src={teamImage}
                alt={teamName}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <span className="text-[11px] font-bold text-party-neonPink uppercase tracking-wider block">
              You voted for
            </span>
            <span className="text-lg font-black text-white">{teamName}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/results" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full shadow-glow">
              <Trophy className="w-5 h-5 mr-2 text-party-gold" />
              <span>Watch Live Results</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        {onReset && (
          <div className="mt-6 pt-4 border-t border-party-border/40">
            <button
              onClick={onReset}
              className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-4 transition-colors"
            >
              Vote with another pass code
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};
