"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LiveLeaderboard } from "@/components/leaderboard/LiveLeaderboard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, Hash, Trophy, Settings, RefreshCw } from "lucide-react";

export default function AdminResultsPage() {
  const [settings, setSettings] = useState<{
    showResults: boolean;
    showVoteCounts: boolean;
    showLeaderboard: boolean;
  }>({
    showResults: true,
    showVoteCounts: true,
    showLeaderboard: true,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [key, setKey] = useState(0);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.event) {
        setSettings({
          showResults: data.event.showResults,
          showVoteCounts: data.event.showVoteCounts,
          showLeaderboard: data.event.showLeaderboard,
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = async (keyName: keyof typeof settings) => {
    try {
      setIsUpdating(true);
      const updated = { ...settings, [keyName]: !settings[keyName] };
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "BVTalent Show 2026",
          ...updated,
        }),
      });
      if (res.ok) {
        setSettings(updated);
        setKey((prev) => prev + 1); // trigger reload of leaderboard
      }
    } catch (err) {
      console.error("Update visibility error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Quick Visibility Controls */}
      <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-party-neonPurple/40">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-party-gold" />
            <span>Stage Leaderboard & Visibility Controls</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Decide what audience members and stage displays can see in real-time
          </p>
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={settings.showResults ? "primary" : "secondary"}
            onClick={() => handleToggle("showResults")}
            disabled={isUpdating}
            className="text-xs shadow-none"
          >
            {settings.showResults ? (
              <Eye className="w-3.5 h-3.5 mr-1" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 mr-1 text-gray-400" />
            )}
            <span>Results: {settings.showResults ? "Public" : "Hidden"}</span>
          </Button>

          <Button
            size="sm"
            variant={settings.showVoteCounts ? "cyan" : "secondary"}
            onClick={() => handleToggle("showVoteCounts")}
            disabled={isUpdating}
            className="text-xs shadow-none"
          >
            <Hash className="w-3.5 h-3.5 mr-1" />
            <span>Counts: {settings.showVoteCounts ? "Visible" : "Pct Only"}</span>
          </Button>

          <Button
            size="sm"
            variant={settings.showLeaderboard ? "secondary" : "ghost"}
            onClick={() => handleToggle("showLeaderboard")}
            disabled={isUpdating}
            className="text-xs border-party-border"
          >
            <Trophy className="w-3.5 h-3.5 mr-1 text-party-gold" />
            <span>Ranks: {settings.showLeaderboard ? "Ranked" : "Unranked"}</span>
          </Button>
        </div>
      </Card>

      {/* Embedded Live Leaderboard */}
      <LiveLeaderboard key={key} />
    </div>
  );
}
