import React from "react";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-party-border/60 bg-party-dark/90 backdrop-blur-xl py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-party-neonPink" />
            <span className="text-xl font-black tracking-wider text-white">
              BVTALENT
            </span>
          </div>
          <p className="text-xs text-gray-400 max-w-sm">
            The Digital Voting Platform for Live Talent Shows & Competitions. One eligible voter = one vote = one team.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/vote" className="hover:text-party-neonPink transition-colors">
            Vote Now
          </Link>
          <Link href="/results" className="hover:text-party-neonCyan transition-colors">
            Leaderboard
          </Link>
          <Link href="/admin/login" className="hover:text-purple-400 transition-colors">
            Organizer Portal
          </Link>
        </div>

        <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <span>Built with</span>
          <Heart className="w-3.5 h-3.5 text-party-neonPink fill-party-neonPink" />
          <span>for live crowds everywhere.</span>
        </div>
      </div>
    </footer>
  );
};
