"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Vote, Trophy, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Home", href: "/", icon: Home },
  { name: "Vote", href: "/vote", icon: Vote },
  { name: "Results", href: "/results", icon: Trophy },
  { name: "Host", href: "/admin/login", icon: ShieldCheck },
];

export const MobileTabBar = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t-3 border-black bg-party-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : tab.href === "/admin/login"
                ? pathname.startsWith("/admin")
                : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-black uppercase tracking-wide",
                  isActive ? "text-party-yellow" : "text-gray-300"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-11 items-center justify-center rounded-2xl border-2",
                    isActive
                      ? "border-black bg-party-yellow text-slate-950 shadow-cartoon-sm"
                      : "border-transparent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {tab.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
