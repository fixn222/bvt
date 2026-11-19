"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users2,
  Trophy,
  LogOut,
  Star,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { IAdminUser } from "@/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [adminUser, setAdminUser] = useState<IAdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) return;

    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth/session");
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        setAdminUser(data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/admin/login");
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, [isLoginPage, pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-party-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-party-yellow animate-spin" />
          <p className="text-xs text-party-yellow font-black uppercase tracking-wider">
            Loading Party Control Center...
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Live Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Teams Roster", href: "/admin/teams", icon: Users2 },
    { name: "Stage Screen", href: "/admin/results", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-party-bg bg-party-dots text-white flex flex-col">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b-3 border-black bg-party-surface px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] shadow-cartoon sm:px-8 sm:py-3.5">
        <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-party-yellow shadow-cartoon-sm">
            <Star className="h-5 w-5 fill-party-pink text-party-pink" />
          </div>
          <span className="truncate font-cartoon text-lg font-black tracking-tight text-white sm:text-xl">
            BV<span className="text-party-yellow">HOST</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-black transition-all ${
                  isActive
                    ? "bg-party-yellow text-slate-950 shadow-cartoon-sm scale-105"
                    : "bg-party-card text-gray-300 hover:text-white hover:bg-party-cardHover"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-party-cyan text-slate-950 border-2 border-black text-xs font-black shadow-cartoon-sm hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-black bg-party-pink px-3 py-1.5 text-xs font-black text-white shadow-cartoon-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-8 md:pb-8">
        {children}
      </main>

      <nav
        aria-label="Host"
        className="fixed inset-x-0 bottom-0 z-40 border-t-3 border-black bg-party-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const shortName = item.href.endsWith("dashboard")
              ? "Board"
              : item.href.endsWith("teams")
                ? "Teams"
                : "Stage";
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-black uppercase tracking-wide ${
                    isActive ? "text-party-yellow" : "text-gray-300"
                  }`}
                >
                  <span
                    className={`flex h-8 w-11 items-center justify-center rounded-2xl border-2 ${
                      isActive
                        ? "border-black bg-party-yellow text-slate-950 shadow-cartoon-sm"
                        : "border-transparent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {shortName}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
