"use client";

import React from "react";
import { Menu, Shield } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { VotingStatus } from "@/types";

interface AdminHeaderProps {
  title: string;
  status?: VotingStatus;
  adminUsername?: string;
  onOpenMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  status = "OPEN",
  adminUsername = "Admin",
  onOpenMobileSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-party-dark/80 border-b border-party-border/60 px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white bg-party-surface border border-party-border"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-black text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Badge status={status} className="text-[10px] px-2.5 py-0.5" />

        <div className="flex items-center gap-2 bg-party-surface/80 border border-party-border px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300">
          <Shield className="w-3.5 h-3.5 text-party-neonCyan" />
          <span>{adminUsername}</span>
        </div>
      </div>
    </header>
  );
};
