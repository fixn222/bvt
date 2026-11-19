import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { Vote } from "@/models/Vote";
import { AuditLog } from "@/models/AuditLog";
import { getAdminFromRequest } from "@/lib/auth";
import { teamUpdateSchema } from "@/lib/validations";

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

    const body = await req.json();
    const validation = teamUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const team = await Team.findById(params.id);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const updates = validation.data;
    if (updates.name !== undefined) team.name = updates.name;
    if (updates.slug !== undefined) team.slug = updates.slug;
    if (updates.description !== undefined) team.description = updates.description;
    if (updates.image !== undefined) team.image = updates.image;
    if (updates.members !== undefined) team.members = updates.members;
    if (updates.isActive !== undefined) team.isActive = updates.isActive;
    if (updates.displayOrder !== undefined) team.displayOrder = updates.displayOrder;

    await team.save();

    await AuditLog.create({
      adminId: admin.id,
      adminUsername: admin.username,
      action: "UPDATE_TEAM",
      details: { teamId: team._id, updates },
    });

    return NextResponse.json({ success: true, team });
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

    await connectToDatabase();
    const team = await Team.findById(params.id);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if team has votes recorded
    const voteCount = await Vote.countDocuments({ teamId: team._id });
    if (voteCount > 0) {
      // Deactivate / archive team to preserve vote history
      team.isActive = false;
      await team.save();

      await AuditLog.create({
        adminId: admin.id,
        adminUsername: admin.username,
        action: "ARCHIVE_TEAM_WITH_VOTES",
        details: { teamId: team._id, name: team.name, voteCount },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: `Team has ${voteCount} recorded votes and was archived (deactivated) to preserve voting integrity.`,
      });
    }

    // If zero votes, safe to delete completely
    await Team.findByIdAndDelete(params.id);

    await AuditLog.create({
      adminId: admin.id,
      adminUsername: admin.username,
      action: "DELETE_TEAM",
      details: { teamId: params.id, name: team.name },
    });

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
