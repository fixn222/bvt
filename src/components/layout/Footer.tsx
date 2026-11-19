import React from "react";
import Link from "next/link";
import { Star, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative mt-10 overflow-hidden border-t-3 border-black bg-party-surface px-4 py-8 sm:mt-20 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-party-yellow border-2 border-black shadow-cartoon-sm flex items-center justify-center">
              <Star className="w-4 h-4 text-party-pink fill-party-pink" />
            </div>
            <span className="text-xl font-black tracking-tight text-white font-cartoon">
              BVTALENT <span className="text-party-yellow">SHOWDOWN</span>
            </span>
          </div>
          <p className="text-xs text-gray-300 max-w-sm">
            Casual party voting! Pick your champion, switch whenever you like, and crown the winner when the curtains close! 🎉
          </p>
        </div>

        <div className="hidden items-center gap-4 text-xs font-black uppercase md:flex">
          <Link
            href="/vote"
            className="px-3.5 py-1.5 rounded-xl bg-party-yellow text-slate-950 border-2 border-black shadow-cartoon-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Pick Team
          </Link>
          <Link
            href="/results"
            className="px-3.5 py-1.5 rounded-xl bg-party-cyan text-slate-950 border-2 border-black shadow-cartoon-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Results
          </Link>
          <Link
            href="/admin/login"
            className="px-3.5 py-1.5 rounded-xl bg-party-pink text-white border-2 border-black shadow-cartoon-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Organizer Login
          </Link>
        </div>

        <div className="text-xs text-gray-400 flex items-center justify-center gap-1.5 font-bold">
          <span>Made for fun parties & crowds</span>
          <Heart className="w-4 h-4 text-party-pink fill-party-pink animate-bounce" />
        </div>
      </div>
    </footer>
  );
};
