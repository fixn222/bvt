import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Vote } from "@/models/Vote";
import { Voter } from "@/models/Voter";
import { Team } from "@/models/Team";
import { EventModel } from "@/models/Event";
import { voteSubmissionSchema } from "@/lib/validations";
import { hashVoterCode, checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting by client IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "client-vote";
    const rate = checkRateLimit(`vote-${ip}`, 10, 60000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many voting attempts. Please slow down." },
        { status: 429 }
      );
    }

    // 2. Validate request body with Zod
    const body = await req.json();
    const validation = voteSubmissionSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Invalid submission data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { voterCode, teamId } = validation.data;

    await connectToDatabase();

    // 3. Verify Event Status
    const eventDoc = await EventModel.findOne();
    if (!eventDoc) {
      return NextResponse.json(
        { error: "Event is not configured." },
        { status: 500 }
      );
    }

    if (eventDoc.votingClosed || eventDoc.status === "CLOSED") {
      return NextResponse.json(
        { error: "Voting is closed. Votes can no longer be accepted." },
        { status: 400 }
      );
    }

    if (eventDoc.votingPaused || eventDoc.status === "PAUSED") {
      return NextResponse.json(
        { error: "Voting is currently paused by the organizers. Please stand by." },
        { status: 400 }
      );
    }

    if (!eventDoc.votingOpen || eventDoc.status === "UPCOMING") {
      return NextResponse.json(
        { error: "Voting has not started yet. Please check back when announced!" },
        { status: 400 }
      );
    }

    // 4. Verify Team exists and is active
    const team = await Team.findById(teamId);
    if (!team || !team.isActive) {
      return NextResponse.json(
        { error: "The selected team is invalid or no longer active." },
        { status: 400 }
      );
    }

    // 5. Verify Voter Code
    const codeHash = hashVoterCode(voterCode);
    const voter = await Voter.findOne({ codeHash });

    if (!voter) {
      return NextResponse.json(
        { error: "Invalid voting pass code. Please verify the code on your pass." },
        { status: 404 }
      );
    }

    if (!voter.isActive) {
      return NextResponse.json(
        { error: "This voting pass has been disabled by event organizers." },
        { status: 403 }
      );
    }

    if (voter.hasVoted) {
      return NextResponse.json(
        { error: "This voting code has already been used. One voter = one vote." },
        { status: 409 }
      );
    }

    // 6. Atomic Redemption & Vote Recording
    // Atomic update on Voter ensures no race condition can use the code twice
    const now = new Date();
    const updatedVoter = await Voter.findOneAndUpdate(
      { _id: voter._id, hasVoted: false },
      { $set: { hasVoted: true, votedAt: now } },
      { new: true }
    );

    if (!updatedVoter) {
      return NextResponse.json(
        { error: "This voting code has already been redeemed." },
        { status: 409 }
      );
    }

    try {
      // Record vote with unique voterId index
      await Vote.create({
        voterId: voter._id,
        teamId: team._id,
        createdAt: now,
      });
    } catch (voteErr: unknown) {
      // If vote creation failed (e.g. unique constraint violation), roll back voter status
      await Voter.updateOne({ _id: voter._id }, { $set: { hasVoted: false, votedAt: null } });
      const err = voteErr as { code?: number };
      if (err.code === 11000) {
        return NextResponse.json(
          { error: "A vote has already been recorded for this pass." },
          { status: 409 }
        );
      }
      throw voteErr;
    }

    return NextResponse.json({
      success: true,
      message: "Your vote has been successfully and securely recorded!",
      votedTeam: {
        id: team._id,
        name: team.name,
        slug: team.slug,
        image: team.image,
      },
      votedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("POST /api/votes error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your vote." },
      { status: 500 }
    );
  }
}
