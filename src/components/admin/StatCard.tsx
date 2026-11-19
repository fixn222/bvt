import React from "react";
import { Card } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: "pink" | "purple" | "cyan" | "gold";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  variant = "purple",
}) => {
  const iconColors = {
    pink: "bg-party-neonPink/15 text-party-neonPink border-party-neonPink/30",
    purple: "bg-party-neonPurple/15 text-party-neonPurple border-party-neonPurple/30",
    cyan: "bg-party-neonCyan/15 text-party-neonCyan border-party-neonCyan/30",
    gold: "bg-party-gold/15 text-party-gold border-party-gold/30",
  };

  return (
    <Card className="p-6 relative overflow-hidden group hover:border-party-neonPurple/60 transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {value}
          </div>
          {description && (
            <p className="text-xs text-gray-400 mt-1.5">{description}</p>
          )}
        </div>

        <div
          className={cn(
            "w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
            iconColors[variant]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
