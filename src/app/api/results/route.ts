import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { getTeamsLeaderboard } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const eventDoc = await EventModel.findOne().lean();

    if (!eventDoc) {
      return NextResponse.json(
        { error: "Event configuration not found" },
        { status: 404 }
      );
    }

    if (!eventDoc.showResults) {
      return NextResponse.json({
        showResults: false,
        message: "Live results are currently hidden by event organizers.",
        status: eventDoc.status,
      });
    }

    const leaderboard = await getTeamsLeaderboard();

    // Sanitize if showVoteCounts is false
    const sanitizedLeaderboard = leaderboard.map((item) => ({
      rank: eventDoc.showLeaderboard ? item.rank : undefined,
      teamId: item.teamId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      description: item.description,
      voteShare: item.voteShare,
      votes: eventDoc.showVoteCounts ? item.votes : undefined,
      diffFromPrev: eventDoc.showVoteCounts ? item.diffFromPrev : undefined,
    }));

    return NextResponse.json({
      showResults: true,
      showVoteCounts: eventDoc.showVoteCounts,
      showLeaderboard: eventDoc.showLeaderboard,
      status: eventDoc.status,
      eventName: eventDoc.name,
      updatedAt: new Date().toISOString(),
      teams: sanitizedLeaderboard,
    });
  } catch (error) {
    console.error("GET /api/results error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve live results" },
      { status: 500 }
    );
  }
}
