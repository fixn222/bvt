"use client";

import React from "react";
import Link from "next/link";
import { Vote, Trophy, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EventCountdown } from "@/components/landing/EventCountdown";
import { VotingStatus } from "@/types";

interface HeroSectionProps {
  eventName?: string;
  tagline?: string;
  status: VotingStatus;
  eventDate?: string | Date | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  eventName = "BVTALENT 2026",
  tagline = "ONE STAGE. ONE MOMENT. YOUR VOTE.",
  status,
  eventDate,
}) => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden text-center">
      {/* Cinematic Stage Lights Gradient Background */}
      <div className="absolute inset-0 bg-stage-lights pointer-events-none opacity-80" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-party-neonPurple/20 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-party-neonPink/20 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-40 left-10 w-[280px] h-[280px] bg-party-neonCyan/15 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 mb-6">
          <Badge status={status} className="px-4 py-1.5 text-xs shadow-glow" />
        </div>

        {/* Cinematic Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-none mb-4">
          <span className="block bg-gradient-to-r from-white via-slate-100 to-gray-400 bg-clip-text text-transparent">
            {eventName}
          </span>
          <span className="block mt-2 bg-gradient-to-r from-party-neonPink via-purple-400 to-party-neonCyan bg-clip-text text-transparent text-glow-pink">
            THE CROWD DECIDES
          </span>
        </h1>

        {/* Subtitle / Tagline */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-300 font-medium tracking-wide mb-8">
          {tagline} — Scan your pass, pick your favorite team, and crown tonight&apos;s champion in real-time.
        </p>

        {/* Countdown */}
        {status === "UPCOMING" && (
          <div className="my-8">
            <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-2">
              Voting Starts In
            </p>
            <EventCountdown targetDate={eventDate} />
          </div>
        )}

        {/* Large Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link href="/vote" className="w-full sm:w-auto">
            <Button
              size="xl"
              variant="primary"
              className="w-full sm:w-auto shadow-glow-pink text-lg py-5 px-9 group"
            >
              <Vote className="w-6 h-6 mr-2 text-white animate-bounce" />
              <span>VOTE NOW</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          <Link href="/results" className="w-full sm:w-auto">
            <Button
              size="xl"
              variant="secondary"
              className="w-full sm:w-auto text-base py-5 px-8"
            >
              <Trophy className="w-5 h-5 mr-2 text-party-gold" />
              <span>View Leaderboard</span>
            </Button>
          </Link>
        </div>

        {/* Guarantee Pill */}
        <div className="mt-10 inline-flex items-center gap-2 text-xs font-semibold text-gray-400 bg-party-surface/60 border border-party-border/60 px-4 py-2 rounded-full">
          <Zap className="w-4 h-4 text-party-neonCyan" />
          <span>Fair & Secure: 1 Eligible Pass = 1 Vote = 1 Team</span>
        </div>
      </div>
    </section>
  );
};
