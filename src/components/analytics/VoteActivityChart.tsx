"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Activity } from "lucide-react";

interface ActivityPoint {
  time: string;
  votes: number;
  cumulative: number;
}

interface VoteActivityChartProps {
  data: ActivityPoint[];
  peakInterval?: { interval: string; votes: number } | null;
}

export const VoteActivityChart: React.FC<VoteActivityChartProps> = ({
  data,
  peakInterval,
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-party-neonCyan" />
            <span>Voting Activity Timeline</span>
          </h3>
          <p className="text-xs text-gray-400">
            Real-time vote traffic flow during the live performance
          </p>
        </div>

        {peakInterval && (
          <div className="inline-flex items-center gap-2 text-xs bg-party-surface border border-party-neonCyan/30 px-3 py-1.5 rounded-xl text-gray-300">
            <span className="text-party-neonCyan font-bold">Peak Surge:</span>
            <span>{peakInterval.votes} votes at {peakInterval.interval}</span>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-gray-500">
          <Activity className="w-10 h-10 mb-2 stroke-[1.5] text-gray-600" />
          <p className="text-xs">No activity timeline recorded yet</p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E244B" opacity={0.5} />
              <XAxis
                dataKey="time"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
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
                formatter={(val: number) => [`${val} votes`, "Traffic"]}
                labelFormatter={(lbl: string) => `Time: ${lbl}`}
              />
              <Area
                type="monotone"
                dataKey="votes"
                stroke="#00F0FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVotes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
