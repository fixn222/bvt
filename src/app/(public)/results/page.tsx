import { LiveLeaderboard } from "@/components/leaderboard/LiveLeaderboard";

export const metadata = {
  title: "Live Leaderboard | BVTalent",
  description: "Live stage results and standings for BVTalent show.",
};

export default function ResultsPage() {
  return (
    <div className="min-h-screen py-4 sm:py-8">
      <LiveLeaderboard />
    </div>
  );
}
