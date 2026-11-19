import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { DeviceVote } from "@/models/DeviceVote";
import { EventModel } from "@/models/Event";
import { getAdminFromRequest } from "@/lib/auth";
import { teamUpdateSchema } from "@/lib/validations";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid team ID format" }, { status: 400 });
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

    const validation = teamUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updatedTeam = await Team.findByIdAndUpdate(
      params.id,
      { $set: validation.data },
      { new: true }
    );

    if (!updatedTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (error) {
    console.error("PATCH /api/admin/teams/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid team ID format" }, { status: 400 });
    }

    await connectToDatabase();
    const team = await Team.findByIdAndDelete(params.id);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Clean up device votes linked to this deleted team
    await DeviceVote.deleteMany({ currentTeamId: params.id });

    // Clear winnerTeamId if the deleted team was set as winner
    await EventModel.updateMany(
      { winnerTeamId: params.id },
      { $set: { winnerTeamId: null } }
    );

    return NextResponse.json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/teams/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }
}
