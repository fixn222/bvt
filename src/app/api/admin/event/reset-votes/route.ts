import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { resetAllVotes } from "@/lib/voting";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await resetAllVotes();

    return NextResponse.json({
      success: true,
      message: `Voting counts successfully reset to zero! (${result.deletedCount} ${
        result.deletedCount === 1 ? "ballot" : "ballots"
      } cleared)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("POST /api/admin/event/reset-votes error:", error);
    return NextResponse.json(
      { error: "Failed to reset voting count" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  return POST(req);
}
