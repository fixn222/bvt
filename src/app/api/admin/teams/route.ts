import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models/Team";
import { AuditLog } from "@/models/AuditLog";
import { getAdminFromRequest } from "@/lib/auth";
import { teamCreateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const teams = await Team.aggregate([
      {
        $lookup: {
          from: "votes",
          localField: "_id",
          foreignField: "teamId",
          as: "teamVotes",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          image: 1,
          members: 1,
          isActive: 1,
          displayOrder: 1,
          createdAt: 1,
          updatedAt: 1,
          voteCount: { $size: "$teamVotes" },
        },
      },
      { $sort: { displayOrder: 1, createdAt: 1 } },
    ]);

    return NextResponse.json({ success: true, teams });
  } catch (error) {
    console.error("GET /api/admin/teams error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve teams" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = teamCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid team data" },
        { status: 400 }
      );
    }

    const data = validation.data;
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    await connectToDatabase();

    // Check slug uniqueness
    const existing = await Team.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: `A team with slug '${slug}' already exists.` },
        { status: 400 }
      );
    }

    const newTeam = await Team.create({
      name: data.name,
      slug,
      description: data.description,
      image: data.image,
      members: data.members || [],
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder ?? 0,
    });

    await AuditLog.create({
      adminId: admin.id,
      adminUsername: admin.username,
      action: "CREATE_TEAM",
      details: { teamId: newTeam._id, name: newTeam.name, slug: newTeam.slug },
    });

    return NextResponse.json({ success: true, team: newTeam }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/teams error:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
