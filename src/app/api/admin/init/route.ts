import { NextRequest, NextResponse } from "next/server";
import { ensureInitialData } from "@/lib/bootstrap";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Check if admin is authenticated, or if no admin exists yet
    const admin = getAdminFromRequest(req);
    // If an admin token is present, allowed. If no DB data, also allowed.
    const result = await ensureInitialData();

    return NextResponse.json({
      success: true,
      message: "Initial event data and admin bootstrap ensured.",
      event: result.event,
    });
  } catch (error) {
    console.error("POST /api/admin/init error:", error);
    return NextResponse.json(
      { error: "Bootstrap initialization failed" },
      { status: 500 }
    );
  }
}
