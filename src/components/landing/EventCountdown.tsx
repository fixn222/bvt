"use client";

import React, { useState, useEffect } from "react";

interface CountdownProps {
  targetDate?: string | Date | null;
}

export const EventCountdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    // If no target date supplied, use a default 2 hours from now for demonstration
    const eventTime = targetDate
      ? new Date(targetDate).getTime()
      : new Date().getTime() + 1000 * 60 * 60 * 2.5;

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = eventTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  const timerUnits = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.minutes },
    { label: "SECS", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 my-6">
      {timerUnits.map((unit) => (
        <div
          key={unit.label}
          className="flex flex-col items-center justify-center bg-party-surface/80 border border-party-neonPurple/40 rounded-xl px-3 sm:px-5 py-2.5 sm:py-3 shadow-glow min-w-[64px] sm:min-w-[80px]"
        >
          <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-bold tracking-widest text-party-neonCyan uppercase mt-0.5">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
};
