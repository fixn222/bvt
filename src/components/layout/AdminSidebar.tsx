"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  Ticket,
  Trophy,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: "Dashboard Overview",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Teams Roster",
      href: "/admin/teams",
      icon: Users2,
    },
    {
      name: "Voter Passes",
      href: "/admin/voters",
      icon: Ticket,
    },
    {
      name: "Live Stage Results",
      href: "/admin/results",
      icon: Trophy,
    },
    {
      name: "Event Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <aside className="w-64 bg-party-dark/95 border-r border-party-border flex flex-col justify-between h-full min-h-screen p-4 select-none">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-party-border/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-party-neonPink via-purple-600 to-party-neonCyan p-0.5 shadow-glow-pink">
            <div className="w-full h-full bg-party-dark rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-party-neonPink" />
            </div>
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white">
              BVTALENT
            </span>
            <span className="block text-[10px] font-bold tracking-widest uppercase text-party-neonCyan">
              Admin Control Center
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                  isActive
                    ? "bg-party-neonPurple text-white shadow-glow"
                    : "text-gray-300 hover:text-white hover:bg-party-surface"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-white" : "text-party-neonPink"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom actions */}
      <div className="space-y-2 pt-4 border-t border-party-border/60">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-party-surface transition-all"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-party-neonCyan" />
            <span>Public Site</span>
          </span>
          <span className="text-[10px] text-gray-500">New Tab</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
