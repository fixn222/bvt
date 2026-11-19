import React from "react";
import { QrCode, CheckCircle2, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      icon: QrCode,
      title: "Get Your Voting Pass",
      description:
        "Locate your unique voting pass code provided at your seat or program flyer.",
      color: "border-party-neonPink/40 text-party-neonPink",
    },
    {
      step: "02",
      icon: CheckCircle2,
      title: "Select One Team",
      description:
        "Review the performers and select the team that gave tonight's best performance.",
      color: "border-party-neonPurple/40 text-party-neonPurple",
    },
    {
      step: "03",
      icon: Trophy,
      title: "Watch the Live Stage",
      description:
        "Cast your vote and watch the stage screen update instantly as the crowd crowns the winner.",
      color: "border-party-neonCyan/40 text-party-neonCyan",
    },
  ];

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-xs font-black uppercase tracking-widest text-party-neonPink mb-2">
          Simple 3-Step Process
        </h2>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
          How Voting Works
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.step}
              className="p-8 relative overflow-hidden group hover:border-party-neonPurple/70 transition-all duration-300"
            >
              <span className="text-5xl font-black text-white/5 absolute top-4 right-4 pointer-events-none group-hover:text-white/10 transition-colors">
                {s.step}
              </span>
              <div
                className={`w-14 h-14 rounded-2xl bg-party-surface border flex items-center justify-center mb-6 ${s.color}`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">{s.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {s.description}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
