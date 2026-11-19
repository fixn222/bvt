import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { AuditLog } from "@/models/AuditLog";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const eventDoc = await EventModel.findOne();
    if (!eventDoc) {
      return NextResponse.json({ error: "Event not configured" }, { status: 404 });
    }

    eventDoc.status = "OPEN";
    eventDoc.votingOpen = true;
    eventDoc.votingPaused = false;
    eventDoc.votingClosed = false;
    await eventDoc.save();

    await AuditLog.create({
      adminId: admin.id,
      adminUsername: admin.username,
      action: "OPEN_VOTING",
      details: { previousStatus: eventDoc.status },
    });

    return NextResponse.json({
      success: true,
      message: "Voting has been opened! Audience can now submit votes.",
      status: eventDoc.status,
    });
  } catch (error) {
    console.error("POST /api/admin/voting/open error:", error);
    return NextResponse.json(
      { error: "Failed to open voting" },
      { status: 500 }
    );
  }
}
