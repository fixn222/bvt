"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { VotingControls } from "@/components/admin/VotingControls";
import { VoteDistributionChart } from "@/components/analytics/VoteDistributionChart";
import { VoteActivityChart } from "@/components/analytics/VoteActivityChart";
import { TeamComparisonChart } from "@/components/analytics/TeamComparisonChart";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Vote,
  Ticket,
  Percent,
  Users2,
  Hourglass,
  Activity,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { IAnalyticsOverview, ITeamLeaderboardEntry, VotingStatus } from "@/types";
import { formatPercentage } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<IAnalyticsOverview | null>(null);
  const [teams, setTeams] = useState<ITeamLeaderboardEntry[]>([]);
  const [distribution, setDistribution] = useState<
    Array<{ name: string; votes: number; percentage: number; color?: string }>
  >([]);
  const [activity, setActivity] = useState<
    Array<{ time: string; votes: number; cumulative: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (manual: boolean = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const [overviewRes, teamsRes, activityRes] = await Promise.all([
        fetch("/api/admin/analytics/overview"),
        fetch("/api/admin/analytics/teams"),
        fetch("/api/admin/analytics/activity"),
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverview(data.data);
      }

      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data.teams || []);
        setDistribution(data.distribution || []);
      }

      if (activityRes.ok) {
        const data = await activityRes.json();
        setActivity(data.activity || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
      if (manual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000); // 10s auto refresh for admin KPIs
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleStatusChange = (newStatus: VotingStatus) => {
    if (overview) {
      setOverview({ ...overview, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-28 bg-party-surface/40 border border-party-border/40 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner with Quick Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Event Control Center</h2>
          <p className="text-xs text-gray-400">
            Real-time stage voting performance metrics and crowd analytics
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => fetchDashboardData(true)}
          isLoading={isRefreshing}
          className="text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Ballots Cast"
          value={overview?.totalVotes.toLocaleString() || "0"}
          description="Verified audience votes"
          icon={Vote}
          variant="pink"
        />

        <StatCard
          title="Total Passes Issued"
          value={overview?.totalVoters.toLocaleString() || "0"}
          description="Audience pass codes"
          icon={Ticket}
          variant="purple"
        />

        <StatCard
          title="Participation Rate"
          value={formatPercentage(overview?.participationRate || 0)}
          description="Voted / Total Issued"
          icon={Percent}
          variant="cyan"
        />

        <StatCard
          title="Competing Teams"
          value={overview?.teamCount || "0"}
          description="Active on stage roster"
          icon={Users2}
          variant="gold"
        />

        <StatCard
          title="Remaining Passes"
          value={overview?.remainingVoters.toLocaleString() || "0"}
          description="Unused eligible passes"
          icon={Hourglass}
          variant="purple"
        />
      </div>

      {/* Voting State Controls */}
      <VotingControls
        currentStatus={overview?.status || "OPEN"}
        onStatusChange={handleStatusChange}
      />

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VoteActivityChart
          data={activity}
          peakInterval={overview?.peakInterval}
        />
        <VoteDistributionChart data={distribution} />
      </div>

      {/* Team Comparison & Leaderboard Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TeamComparisonChart teams={teams} />
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-party-gold" />
              <span>Current Standings</span>
            </h3>
            <Link
              href="/admin/results"
              className="text-xs text-party-neonPink hover:underline font-semibold"
            >
              Full Stage View →
            </Link>
          </div>

          {teams.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">
              No votes recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {teams.slice(0, 5).map((t, idx) => (
                <div
                  key={t.teamId}
                  className="flex items-center justify-between p-3 rounded-xl bg-party-surface/70 border border-party-border/60 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <span className="w-5 h-5 rounded-md bg-party-card border border-party-border flex items-center justify-center font-bold text-gray-300 text-[10px] flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white truncate">
                      {t.name}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-bold text-party-neonCyan">
                      {t.votes} votes
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1.5">
                      ({formatPercentage(t.voteShare)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
