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

    const voters = await Voter.find()
      .sort({ createdAt: -1 })
      .select("_id hasVoted votedAt isActive createdAt")
      .lean();

    // Generate CSV
    const headers = ["Pass ID", "Status", "Has Voted", "Voted At", "Created At"];
    const rows = voters.map((v) => [
      v._id.toString(),
      !v.isActive ? "DISABLED" : v.hasVoted ? "USED" : "UNUSED",
      v.hasVoted ? "YES" : "NO",
      v.votedAt ? new Date(v.votedAt).toISOString() : "",
      new Date(v.createdAt).toISOString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bvtalent-voter-passes-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/voters/export error:", error);
    return NextResponse.json(
      { error: "Failed to export voter passes" },
      { status: 500 }
    );
  }
}
