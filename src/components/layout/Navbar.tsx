"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Vote, ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { VotingStatus } from "@/types";

export const Navbar = () => {
  const pathname = usePathname();
  const [status, setStatus] = useState<VotingStatus>("open");

  useEffect(() => {
    const fetchStatus = () => {
      fetch("/api/event")
        .then((res) => res.json())
        .then((data) => {
          if (data?.status) setStatus(data.status);
        })
        .catch(() => {});
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [pathname]);

  const navLinks = [
    { name: "Vote Now!", href: "/vote", icon: Vote, color: "bg-party-yellow text-slate-950" },
    { name: "Winner & Results", href: "/results", icon: Trophy, color: "bg-party-cyan text-slate-950" },
    { name: "Admin", href: "/admin/login", icon: ShieldCheck, color: "bg-party-pink text-white" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b-3 border-black bg-party-surface/95 pt-[env(safe-area-inset-top)] shadow-cartoon backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-20 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 group sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-party-yellow shadow-cartoon-sm sm:h-12 sm:w-12 sm:rounded-2xl sm:border-3">
            <Star className="h-4 w-4 fill-party-pink text-party-pink sm:h-6 sm:w-6" />
          </div>
          <span className="truncate font-cartoon text-lg font-black tracking-tight text-white sm:text-3xl">
            BV<span className="text-party-yellow">TALENT</span>
            <span className="ml-1.5 hidden rounded-full border-2 border-black bg-party-pink px-2 py-0.5 text-xs text-white shadow-cartoon-sm sm:inline">
              PARTY!
            </span>
          </span>
        </Link>

        {/* Status Badge & Desktop Navigation */}
        <div className="hidden md:flex items-center gap-5">
          <Badge status={status} />

          <nav className="flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/admin/login"
                  ? pathname.startsWith("/admin")
                  : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-black transition-all ${
                    isActive
                      ? `${link.color} shadow-cartoon-sm scale-105`
                      : "bg-party-card text-gray-200 hover:text-white hover:bg-party-cardHover hover:shadow-cartoon-sm"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="md:hidden">
          <Badge status={status} compact className="px-2.5 py-1 text-[10px]" />
        </div>
      </div>
    </header>
  );
};
