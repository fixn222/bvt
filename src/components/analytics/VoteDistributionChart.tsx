"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { PieChart as PieIcon } from "lucide-react";

interface DistributionItem {
  name: string;
  votes: number;
  percentage: number;
  color?: string;
}

interface VoteDistributionChartProps {
  data: DistributionItem[];
}

export const VoteDistributionChart: React.FC<VoteDistributionChartProps> = ({
  data,
}) => {
  const totalVotes = data.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-party-neonPink" />
            <span>Vote Distribution</span>
          </h3>
          <p className="text-xs text-gray-400">Share of total ballots cast per team</p>
        </div>
      </div>

      {totalVotes === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-gray-500">
          <PieIcon className="w-10 h-10 mb-2 stroke-[1.5] text-gray-600" />
          <p className="text-xs">No votes cast yet to generate distribution</p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="votes"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || "#9333EA"}
                    stroke="#08060F"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#120E1E",
                  borderColor: "#2E244B",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
                formatter={(value: number, name: string) => [
                  `${value} votes`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
