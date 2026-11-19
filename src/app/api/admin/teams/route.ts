import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { DeviceVote } from "@/models/DeviceVote";
import { getAdminFromRequest } from "@/lib/auth";
import { teamSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const teams = await Team.find().sort({ createdAt: 1 }).lean();

    // Attach active device vote counts
    const counts = await DeviceVote.aggregate([
      {
        $group: {
          _id: "$currentTeamId",
          votes: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    for (const c of counts) {
      if (c._id) countMap.set(c._id.toString(), c.votes);
    }

    const teamsWithCounts = teams.map((t) => ({
      ...t,
      voteCount: countMap.get(t._id.toString()) || 0,
    }));

    return NextResponse.json({ success: true, teams: teamsWithCounts });
  } catch (error) {
    console.error("GET /api/admin/teams error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve teams" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }
    const validation = teamSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid team data" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const newTeam = await Team.create(validation.data);

    return NextResponse.json({ success: true, team: newTeam }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/teams error:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
