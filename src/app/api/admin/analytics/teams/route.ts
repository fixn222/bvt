import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { getTeamsLeaderboard, getVoteDistribution } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const [leaderboard, distribution] = await Promise.all([
      getTeamsLeaderboard(),
      getVoteDistribution(),
    ]);

    return NextResponse.json({
      success: true,
      teams: leaderboard,
      distribution,
    });
  } catch (error) {
    console.error("GET /api/admin/analytics/teams error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve team analytics" },
      { status: 500 }
    );
  }
}
