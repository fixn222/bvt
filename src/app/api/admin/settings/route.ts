import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { AuditLog } from "@/models/AuditLog";
import { getAdminFromRequest } from "@/lib/auth";
import { eventSettingsSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const [eventDoc, recentLogs] = await Promise.all([
      EventModel.findOne().lean(),
      AuditLog.find().sort({ createdAt: -1 }).limit(15).lean(),
    ]);

    return NextResponse.json({
      success: true,
      event: eventDoc,
      auditLogs: recentLogs,
    });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = eventSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid settings data" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    let eventDoc = await EventModel.findOne();
    if (!eventDoc) {
      eventDoc = new EventModel();
    }

    const data = validation.data;
    eventDoc.name = data.name;
    eventDoc.description = data.description;
    eventDoc.eventDate = data.eventDate ? new Date(data.eventDate) : null;
    eventDoc.showResults = data.showResults;
    eventDoc.showVoteCounts = data.showVoteCounts;
    eventDoc.showLeaderboard = data.showLeaderboard;

    await eventDoc.save();

    await AuditLog.create({
      adminId: admin.id,
      adminUsername: admin.username,
      action: "UPDATE_EVENT_SETTINGS",
      details: data,
    });

    return NextResponse.json({
      success: true,
      message: "Event settings updated successfully.",
      event: eventDoc,
    });
  } catch (error) {
    console.error("PATCH /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update event settings" },
      { status: 500 }
    );
  }
}
