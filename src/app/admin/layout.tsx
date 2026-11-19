"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { VotingStatus, IAdminUser } from "@/types";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<IAdminUser | null>(null);
  const [eventStatus, setEventStatus] = useState<VotingStatus>("OPEN");
  const [isCheckingAuth, setIsCheckingAuth] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) return;

    async function checkAuth() {
      try {
        const [sessionRes, eventRes] = await Promise.all([
          fetch("/api/admin/auth/session"),
          fetch("/api/event"),
        ]);

        if (!sessionRes.ok) {
          router.replace("/admin/login");
          return;
        }

        const sessionData = await sessionRes.json();
        setAdminUser(sessionData.user);

        if (eventRes.ok) {
          const eventData = await eventRes.json();
          if (eventData?.status) setEventStatus(eventData.status);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/admin/login");
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, [isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-party-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-party-neonPink animate-spin" />
          <p className="text-xs text-gray-400 font-mono tracking-wider">
            Validating organizer credentials...
          </p>
        </div>
      </div>
    );
  }

  // Derive page title from pathname
  const pageTitles: Record<string, string> = {
    "/admin/dashboard": "Dashboard Overview",
    "/admin/teams": "Teams Management",
    "/admin/voters": "Voter Passes & Codes",
    "/admin/results": "Live Stage Results",
    "/admin/settings": "Event Configuration & Audit Log",
  };

  const currentTitle = pageTitles[pathname] || "Admin Portal";

  return (
    <div className="min-h-screen bg-party-dark flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden flex"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="w-64 bg-party-dark h-full animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={currentTitle}
          status={eventStatus}
          adminUsername={adminUser?.username || "Admin"}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
