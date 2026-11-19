import Link from "next/link";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TeamCard } from "@/components/teams/TeamCard";
import { Button } from "@/components/ui/Button";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { Team } from "@/models/Team";
import { ensureInitialData } from "@/lib/bootstrap";
import { Vote, ArrowRight, Sparkles } from "lucide-react";
import { ITeam, VotingStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let status: VotingStatus = "OPEN";
  let eventName = "BVTALENT SHOW 2026";
  let description = "One stage. One moment. Your vote.";
  let eventDate: Date | null = null;
  let teams: ITeam[] = [];

  try {
    await connectToDatabase();
    await ensureInitialData();

    const [eventDoc, teamDocs] = await Promise.all([
      EventModel.findOne().lean(),
      Team.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).limit(6).lean(),
    ]);

    if (eventDoc) {
      status = (eventDoc.status as VotingStatus) || "OPEN";
      eventName = eventDoc.name || eventName;
      description = eventDoc.description || description;
      eventDate = eventDoc.eventDate || null;
    }

    if (teamDocs) {
      teams = JSON.parse(JSON.stringify(teamDocs));
    }
  } catch (err) {
    console.error("Home page DB fetch error:", err);
  }

  return (
    <div className="flex flex-col gap-12">
      {/* 1. Hero Section */}
      <HeroSection
        eventName={eventName}
        tagline={description}
        status={status}
        eventDate={eventDate ? eventDate.toISOString() : null}
      />

      {/* 2. Competing Teams Preview Section */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-party-neonCyan mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contestants Spotlight</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Competing Performers
            </h2>
          </div>

          <Link href="/vote">
            <Button variant="outline" size="sm" className="text-xs">
              <span>View All Contestants</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link key={team._id} href="/vote">
              <TeamCard team={team} selectable={false} />
            </Link>
          ))}
        </div>
      </section>

      {/* 3. How Voting Works */}
      <HowItWorks />

      {/* 4. Bottom High-Impact Voting CTA */}
      <section className="max-w-5xl mx-auto px-4 w-full py-12">
        <div className="relative rounded-3xl bg-gradient-to-r from-party-card via-party-surface to-party-card border border-party-neonPink/40 p-8 sm:p-14 text-center overflow-hidden shadow-glow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-party-neonPink/20 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-party-neonCyan/20 blur-[100px] pointer-events-none rounded-full" />

          <h2 className="text-xs font-black uppercase tracking-widest text-party-neonCyan mb-3">
            Ready to Make Your Voice Heard?
          </h2>
          <h3 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-4">
            The Crowd Crowns Tonight&apos;s Winner
          </h3>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Grab your event pass code, choose your favorite performance, and cast your ballot before the countdown runs out.
          </p>

          <Link href="/vote">
            <Button
              size="xl"
              variant="primary"
              className="py-5 px-10 text-lg shadow-glow-pink font-black"
            >
              <Vote className="w-6 h-6 mr-2" />
              <span>VOTE FOR YOUR TEAM</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
