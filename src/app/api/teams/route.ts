import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { ensureInitialData } from "@/lib/bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureInitialData();

    const teams = await Team.find()
      .sort({ createdAt: 1 })
      .select("_id name description image color")
      .lean();

    return NextResponse.json({
      success: true,
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
