import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { getAnalyticsOverview } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const overview = await getAnalyticsOverview();

    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error("GET /api/admin/analytics/overview error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analytics overview" },
      { status: 500 }
    );
  }
}
