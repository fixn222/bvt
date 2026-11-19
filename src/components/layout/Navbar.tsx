"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Trophy, Vote, ShieldCheck, Menu, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { VotingStatus } from "@/types";

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [status, setStatus] = useState<VotingStatus>("OPEN");

  useEffect(() => {
    // Fetch current status
    fetch("/api/event")
      .then((res) => res.json())
      .then((data) => {
        if (data?.status) setStatus(data.status);
      })
      .catch(() => {});
  }, [pathname]);

  const navLinks = [
    { name: "Vote Now", href: "/vote", icon: Vote },
    { name: "Live Results", href: "/results", icon: Trophy },
    { name: "Admin Portal", href: "/admin/login", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-party-dark/80 border-b border-party-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-party-neonPink via-purple-600 to-party-neonCyan p-0.5 shadow-glow-pink transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-party-dark rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-party-neonPink animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-purple-200 to-party-neonPink bg-clip-text text-transparent">
              BVTALENT
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold tracking-widest uppercase text-party-neonCyan bg-party-neonCyan/10 px-2 py-0.5 rounded border border-party-neonCyan/30">
              Live Show
            </span>
          </div>
        </Link>

        {/* Status Badge & Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Badge status={status} />

          <nav className="flex items-center gap-1 bg-party-surface/60 p-1 rounded-xl border border-party-border/50">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-party-neonPurple text-white shadow-glow"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Badge status={status} className="text-[10px] px-2 py-0.5" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-party-surface border border-party-border"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-party-border bg-party-card/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? "bg-party-neonPurple text-white shadow-glow"
                    : "text-gray-200 hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5 text-party-neonPink" />
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
