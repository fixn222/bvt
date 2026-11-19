import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { EventModel } from "@/models/Event";
import { calculateLiveResults } from "@/lib/results";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const eventDoc = await EventModel.findOne().lean();

    if (!eventDoc) {
      return NextResponse.json(
        { error: "Event configuration not found" },
        { status: 404 }
      );
    }

    if (!eventDoc.resultsVisible) {
      return NextResponse.json({
        resultsVisible: false,
        status: eventDoc.status,
        message: "SHHH! The crowd's votes are being tallied! Results will be revealed on stage soon! 🤫✨",
      });
    }

    const results = await calculateLiveResults();

    return NextResponse.json({
      success: true,
      resultsVisible: true,
      status: results.status,
      totalDevices: results.totalDevices,
      teams: results.teams,
      winners: results.winners,
      isTie: results.isTie,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/results error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve results" },
      { status: 500 }
    );
  }
}
