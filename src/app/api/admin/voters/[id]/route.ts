import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Voter } from "@/models/Voter";
import { AuditLog } from "@/models/AuditLog";
import { getAdminFromRequest } from "@/lib/auth";

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
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const voter = await Voter.findById(params.id);
    if (!voter) {
      return NextResponse.json({ error: "Voter pass not found" }, { status: 404 });
    }

    voter.isActive = isActive;
    await voter.save();

    await AuditLog.create({
      adminId: admin.id,
      adminUsername: admin.username,
      action: isActive ? "ENABLE_VOTER_PASS" : "DISABLE_VOTER_PASS",
      details: { voterId: voter._id, isActive },
    });

    return NextResponse.json({
      success: true,
      message: `Pass ${isActive ? "enabled" : "disabled"} successfully.`,
      voter: {
        _id: voter._id,
        hasVoted: voter.hasVoted,
        votedAt: voter.votedAt,
        isActive: voter.isActive,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/voters/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update voter pass status" },
      { status: 500 }
    );
  }
}
