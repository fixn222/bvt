import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Voter } from "@/models/Voter";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "25", 10), 100);
    const filter = url.searchParams.get("filter") || "all";

    const query: Record<string, unknown> = {};

    if (filter === "used") {
      query.hasVoted = true;
    } else if (filter === "unused") {
      query.hasVoted = false;
      query.isActive = true;
    } else if (filter === "disabled") {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;

    const [voters, total] = await Promise.all([
      Voter.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id hasVoted votedAt isActive createdAt")
        .lean(),
      Voter.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      voters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/voters error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve voters" },
      { status: 500 }
    );
  }
}
