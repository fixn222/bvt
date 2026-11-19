import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { EventModel } from "@/models/Event";
import { ensureInitialData } from "@/lib/bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureInitialData();

    const [teams, eventDoc] = await Promise.all([
      Team.find()
        .sort({ performanceOrder: 1, createdAt: 1 })
        .select("_id name description image color hasPerformed performanceOrder")
        .lean(),
      EventModel.findOne().lean(),
    ]);

    const currentPerformingId = eventDoc?.currentPerformingTeamId?.toString();

    const teamsWithStatus = teams.map((t) => ({
      ...t,
      hasPerformed: !!t.hasPerformed,
      isPerforming: currentPerformingId === t._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      teams: teamsWithStatus,
    });
  } catch (error) {
    console.error("GET /api/teams error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
