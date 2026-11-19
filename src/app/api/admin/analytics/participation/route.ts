import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Voter } from "@/models/Voter";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const [total, used, disabled] = await Promise.all([
      Voter.countDocuments(),
      Voter.countDocuments({ hasVoted: true }),
      Voter.countDocuments({ isActive: false }),
    ]);

    const activeUnused = Math.max(0, total - used - disabled);
    const participationRate = total > 0 ? Number(((used / total) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      total,
      used,
      activeUnused,
      disabled,
      participationRate,
    });
  } catch (error) {
    console.error("GET /api/admin/analytics/participation error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve participation analytics" },
      { status: 500 }
    );
  }
}
