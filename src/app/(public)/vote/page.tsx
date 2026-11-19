import { CartoonVotingGrid } from "@/components/voting/CartoonVotingGrid";

export const metadata = {
  title: "Vote for Your Champion! | BVTalent",
  description: "Pick your favourite performing act and change your vote anytime while voting is open!",
};

export default function VotePage() {
  return (
    <div className="min-h-screen py-4 sm:py-8 bg-party-dots">
      <CartoonVotingGrid />
    </div>
  );
}
