import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { Team } from "@/models/Team";
import { ensureInitialData } from "@/lib/bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureInitialData();

    const eventDoc = await EventModel.findOne().lean();
    if (!eventDoc) {
      return NextResponse.json(
        { error: "Event configuration not found" },
        { status: 404 }
      );
    }

    let currentPerformingTeam = null;
    if (eventDoc.currentPerformingTeamId) {
      currentPerformingTeam = await Team.findById(eventDoc.currentPerformingTeamId)
        .select("_id name description image color hasPerformed")
        .lean();
    }

    return NextResponse.json({
      name: eventDoc.name,
      description: eventDoc.description,
      status: eventDoc.status,
      resultsVisible: !!eventDoc.resultsVisible,
      winnerTeamId: eventDoc.winnerTeamId ? eventDoc.winnerTeamId.toString() : null,
      currentPerformingTeamId: eventDoc.currentPerformingTeamId
        ? eventDoc.currentPerformingTeamId.toString()
        : null,
      currentPerformingTeam,
      lockUnperformedTeams: eventDoc.lockUnperformedTeams !== false,
    });
  } catch (error) {
    console.error("GET /api/event error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event status" },
      { status: 500 }
    );
  }
}
