import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { ensureInitialData } from "@/lib/bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureInitialData();

    const eventDoc = await EventModel.findOne().lean();
    if (!eventDoc) {
      return NextResponse.json(
        { error: "Event configuration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: eventDoc.name,
      description: eventDoc.description,
      status: eventDoc.status,
      resultsVisible: !!eventDoc.resultsVisible,
      winnerTeamId: eventDoc.winnerTeamId ? eventDoc.winnerTeamId.toString() : null,
    });
  } catch (error) {
    console.error("GET /api/event error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event status" },
      { status: 500 }
    );
  }
}
