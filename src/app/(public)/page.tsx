import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { Team } from "@/models/Team";
import { ensureInitialData } from "@/lib/bootstrap";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CartoonTeamCard } from "@/components/teams/CartoonTeamCard";
import {
  Vote,
  Trophy,
  Sparkles,
  Star,
  Zap,
  ArrowRight,
  Flame,
  Smartphone,
  Repeat,
  Crown,
} from "lucide-react";
import { ITeam, VotingStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let status: VotingStatus = "open";
  let eventName = "BVTALENT SHOWDOWN!";
  let description = "Watch the performances. Pick your champions. Change your mind. It's party time!";
  let teams: ITeam[] = [];

  try {
    await connectToDatabase();
    await ensureInitialData();

    const [eventDoc, teamDocs] = await Promise.all([
      EventModel.findOne().lean(),
      Team.find().limit(6).lean(),
    ]);

    if (eventDoc) {
      status = (eventDoc.status as VotingStatus) || "open";
      eventName = eventDoc.name || eventName;
      description = eventDoc.description || description;
    }

    if (teamDocs) {
      teams = JSON.parse(JSON.stringify(teamDocs));
    }
  } catch (err) {
    console.error("Home page data load error:", err);
  }

  const steps = [
    {
      num: "01",
      icon: Smartphone,
      title: "Open on Phone",
      desc: "No apps, passwords, or boring accounts. Just tap and play!",
      color: "bg-party-yellow text-slate-950",
    },
    {
      num: "02",
      icon: Flame,
      title: "Pick Your Star",
      desc: "See a team you love? Tap their card to instantly back them!",
      color: "bg-party-pink text-white",
    },
    {
      num: "03",
      icon: Repeat,
      title: "Change Your Mind!",
      desc: "Next performance blown you away? Switch your vote anytime!",
      color: "bg-party-cyan text-slate-950",
    },
    {
      num: "04",
      icon: Crown,
      title: "Crown the Winner",
      desc: "Curtains close, voting locks, and the champion is crowned!",
      color: "bg-party-lime text-slate-950",
    },
  ];

  return (
    <div className="flex flex-col gap-8 bg-party-dots pb-10 sm:gap-16 sm:pb-16">
      {/* 1. Cartoon Hero Section */}
      <section className="relative overflow-hidden px-4 pb-8 pt-6 text-center sm:pb-24 sm:pt-20">
        {/* Decorative Floating Stickers */}
        <div className="absolute top-10 left-6 sm:left-20 rotate-[-12deg] hidden sm:block animate-wobble">
          <div className="bg-party-pink text-white text-xs font-black px-3.5 py-1.5 rounded-2xl border-3 border-black shadow-cartoon-sm uppercase">
            ⭐ Live Party!
          </div>
        </div>

        <div className="absolute top-14 right-6 sm:right-24 rotate-[15deg] hidden sm:block animate-wobble">
          <div className="bg-party-cyan text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-2xl border-3 border-black shadow-cartoon-sm uppercase">
            🎉 Switch Anytime!
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge status={status} className="text-xs sm:text-sm px-4 py-2" />
          </div>

          {/* Huge Cartoon Title */}
          <h1 className="mb-4 font-cartoon text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl">
            WHO&apos;S GOT THE{" "}
            <span className="text-party-yellow drop-shadow-[4px_4px_0px_#000000]">
              TALENT?!
            </span>
          </h1>

          {/* Playful Subtitle */}
          <p className="mx-auto mb-6 max-w-2xl text-base font-bold leading-relaxed text-gray-200 sm:mb-8 sm:text-xl">
            {description}
          </p>

          {/* Big Bouncy CTA Buttons */}
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link href="/vote" className="w-full sm:w-auto">
              <Button
                size="xl"
                variant="yellow"
                className="group w-full text-slate-950 shadow-cartoon-lg sm:w-auto"
              >
                <Vote className="w-6 h-6 mr-2 text-party-pink animate-bounce" />
                <span>START VOTING!</span>
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/results" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="cyan"
                className="w-full shadow-cartoon-lg sm:w-auto"
              >
                <Trophy className="w-6 h-6 mr-2 text-party-pink" />
                <span>Check Live Results</span>
              </Button>
            </Link>
          </div>

          {/* Fun Guarantee Sticker */}
          <div className="mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-black bg-party-surface px-4 py-2 text-xs font-black text-gray-300 shadow-cartoon-sm">
            <Zap className="w-4 h-4 text-party-yellow" />
            <span>1 Browser = 1 Vote • Only your latest choice counts!</span>
          </div>
        </div>
      </section>

      {/* 2. Step-by-Step Cartoon Flow */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-party-yellow bg-party-card border-2 border-black px-3.5 py-1 rounded-full shadow-cartoon-sm inline-block mb-2">
            SUPER SIMPLE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-cartoon">
            HOW PARTY VOTING WORKS
          </h2>
        </div>

        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="flex w-[78%] max-w-xs shrink-0 snap-start flex-col justify-between rounded-3xl border-3 border-black bg-party-card p-5 shadow-cartoon sm:w-auto sm:max-w-none sm:shrink sm:p-6"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl border-2 border-black shadow-cartoon-sm flex items-center justify-center mb-4 ${s.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-gray-400 font-mono block mb-1">
                    STEP {s.num}
                  </span>
                  <h3 className="text-xl font-black text-white font-cartoon mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-gray-300 font-medium leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Contestants Preview Grid */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-party-pink bg-party-card border-2 border-black px-3.5 py-1 rounded-full shadow-cartoon-sm inline-block mb-2">
              TONIGHT&apos;S STARS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-cartoon">
              MEET THE PERFORMERS
            </h2>
          </div>

          <Link href="/vote">
            <Button size="sm" variant="white" className="text-xs">
              <span>View All & Vote</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team._id} href="/vote" className="w-[84%] max-w-sm shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink">
              <CartoonTeamCard team={team} compact />
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Bottom Fun Banner CTA */}
      <section className="max-w-5xl mx-auto px-4 w-full">
        <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-party-yellow p-6 text-center text-slate-950 shadow-cartoon-xl sm:p-12">
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="inline-block bg-party-pink text-white text-xs font-black px-3 py-1 rounded-full border-2 border-black shadow-cartoon-sm mb-3 uppercase">
              Ready to rock?
            </div>
            <h2 className="mb-4 font-cartoon text-3xl font-black uppercase leading-tight sm:text-5xl">
              PICK YOUR FAVORITE ACT NOW!
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-900 mb-6">
              Don&apos;t wait until the curtains close. Open the voting board on your phone and cheer for your friends!
            </p>
            <Link href="/vote">
              <Button size="xl" variant="pink" className="w-full shadow-cartoon-lg sm:w-auto">
                <Vote className="w-6 h-6 mr-2" />
                <span>LET ME VOTE!</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
