import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { calculateLiveResults } from "@/lib/results";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const results = await calculateLiveResults();

    return NextResponse.json({
      success: true,
      ...results,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/admin/results error:", error);
    return NextResponse.json(
      { error: "Failed to calculate admin results" },
      { status: 500 }
    );
  }
}
