"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { BarChart3 } from "lucide-react";
import { ITeamLeaderboardEntry } from "@/types";

interface TeamComparisonChartProps {
  teams: ITeamLeaderboardEntry[];
}

export const TeamComparisonChart: React.FC<TeamComparisonChartProps> = ({
  teams,
}) => {
  const colors = ["#FF2E93", "#9333EA", "#00F0FF", "#7B2CBF", "#FFD700", "#10B981"];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-party-neonPurple" />
            <span>Team Vote Comparison</span>
          </h3>
          <p className="text-xs text-gray-400">Total votes accumulated per performance</p>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-gray-500">
          <BarChart3 className="w-10 h-10 mb-2 stroke-[1.5] text-gray-600" />
          <p className="text-xs">No teams available for comparison</p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={teams}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2E244B" opacity={0.5} />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#120E1E",
                  borderColor: "#2E244B",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
                formatter={(val: number) => [`${val} votes`, "Votes"]}
              />
              <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                {teams.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
