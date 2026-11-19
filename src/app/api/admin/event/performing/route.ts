import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { Team } from "@/models/Team";
import { getAdminFromRequest } from "@/lib/auth";
import { performingSchema } from "@/lib/validations";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

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
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const validation = performingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { teamId, lockUnperformedTeams } = validation.data;

    await connectToDatabase();
    const eventDoc = await EventModel.findOne();
    if (!eventDoc) {
      return NextResponse.json({ error: "Event not configured" }, { status: 404 });
    }

    let teamName = "";

    if (teamId) {
      const team = await Team.findById(teamId);
      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      eventDoc.currentPerformingTeamId = new Types.ObjectId(teamId);
      // Automatically mark team as having performed
      team.hasPerformed = true;
      await team.save();
      teamName = team.name;
    } else {
      eventDoc.currentPerformingTeamId = null;
    }

    if (typeof lockUnperformedTeams === "boolean") {
      eventDoc.lockUnperformedTeams = lockUnperformedTeams;
    }

    await eventDoc.save();

    return NextResponse.json({
      success: true,
      message: teamId
        ? `"${teamName}" is now LIVE on stage! 🎤⭐`
        : "Stage cleared! Current intermission.",
      currentPerformingTeamId: eventDoc.currentPerformingTeamId,
      lockUnperformedTeams: eventDoc.lockUnperformedTeams,
    });
  } catch (error) {
    console.error("POST /api/admin/event/performing error:", error);
    return NextResponse.json(
      { error: "Failed to update now performing act" },
      { status: 500 }
    );
  }
}
