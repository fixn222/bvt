import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { getVotingActivityTimeline } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const activity = await getVotingActivityTimeline();

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error("GET /api/admin/analytics/activity error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve activity analytics" },
      { status: 500 }
    );
  }
}
