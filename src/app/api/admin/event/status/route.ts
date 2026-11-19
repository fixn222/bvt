import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { getAdminFromRequest } from "@/lib/auth";
import { eventStatusSchema } from "@/lib/validations";
import { calculateLiveResults } from "@/lib/results";
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

    const validation = eventStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid status value. Must be 'upcoming', 'open', or 'closed'." },
        { status: 400 }
      );
    }

    const { status } = validation.data;

    await connectToDatabase();
    const eventDoc = await EventModel.findOne();
    if (!eventDoc) {
      return NextResponse.json({ error: "Event not configured" }, { status: 404 });
    }

    eventDoc.status = status;

    // If closing voting, calculate and lock winner. If re-opening or upcoming, clear locked winner.
    if (status === "closed") {
      const results = await calculateLiveResults();
      if (results.winners.length === 1) {
        eventDoc.winnerTeamId = new Types.ObjectId(results.winners[0].teamId);
      } else {
        eventDoc.winnerTeamId = null; // Tie or no votes
      }
    } else {
      eventDoc.winnerTeamId = null;
    }

    await eventDoc.save();

    return NextResponse.json({
      success: true,
      message: `Event voting status changed to: ${status.toUpperCase()}!`,
      status: eventDoc.status,
      winnerTeamId: eventDoc.winnerTeamId,
    });
  } catch (error) {
    console.error("POST /api/admin/event/status error:", error);
    return NextResponse.json(
      { error: "Failed to update event status" },
      { status: 500 }
    );
  }
}
