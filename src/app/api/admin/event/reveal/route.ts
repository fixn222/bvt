import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    await connectToDatabase();
    const eventDoc = await EventModel.findOne();
    if (!eventDoc) {
      return NextResponse.json({ error: "Event not configured" }, { status: 404 });
    }

    const nextVisible =
      typeof body.resultsVisible === "boolean"
        ? body.resultsVisible
        : !eventDoc.resultsVisible;

    eventDoc.resultsVisible = nextVisible;
    await eventDoc.save();

    return NextResponse.json({
      success: true,
      message: nextVisible
        ? "Results are now REVEALED to all guests! 🏆🎉"
        : "Results are now hidden from guests! 🤫",
      resultsVisible: eventDoc.resultsVisible,
    });
  } catch (error) {
    console.error("POST /api/admin/event/reveal error:", error);
    return NextResponse.json(
      { error: "Failed to toggle result reveal" },
      { status: 500 }
    );
  }
}
