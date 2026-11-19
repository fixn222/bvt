import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { ensureInitialData } from "@/lib/bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureInitialData();

    const teams = await Team.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .select("_id name slug description image members displayOrder")
      .lean();

    return NextResponse.json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    console.error("GET /api/teams error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
