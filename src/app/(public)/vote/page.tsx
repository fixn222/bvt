import { VotingFlow } from "@/components/voting/VotingFlow";

export const metadata = {
  title: "Cast Your Vote | BVTalent",
  description: "Select your favorite team and submit your official voting pass.",
};

export default function VotePage() {
  return (
    <div className="min-h-screen py-4 sm:py-8">
      <VotingFlow />
    </div>
  );
}
