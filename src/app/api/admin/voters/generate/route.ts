import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Voter } from "@/models/Voter";
import { AuditLog } from "@/models/AuditLog";
import { getAdminFromRequest } from "@/lib/auth";
import { voterGenerateSchema } from "@/lib/validations";
import { generateVoterCode, hashVoterCode } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = voterGenerateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid count" },
        { status: 400 }
      );
    }

    const { count } = validation.data;

    await connectToDatabase();

    const generatedPairs: Array<{ code: string; codeHash: string }> = [];
    const hashSet = new Set<string>();

    while (generatedPairs.length < count) {
      const code = generateVoterCode();
      const codeHash = hashVoterCode(code);
      if (!hashSet.has(codeHash)) {
        hashSet.add(codeHash);
        generatedPairs.push({ code, codeHash });
      }
    }

    // Insert to MongoDB
    const docs = generatedPairs.map((p) => ({
      codeHash: p.codeHash,
      hasVoted: false,
      votedAt: null,
      isActive: true,
      createdAt: new Date(),
    }));

    await Voter.insertMany(docs, { ordered: false });

    await AuditLog.create({
      adminId: admin.id,
      adminUsername: admin.username,
      action: "GENERATE_VOTER_PASSES",
      details: { count },
    });

    // Return the generated raw codes for initial distribution/download
    return NextResponse.json({
      success: true,
      message: `Successfully generated ${count} voting passes.`,
      count,
      codes: generatedPairs.map((p) => p.code),
    });
  } catch (error) {
    console.error("POST /api/admin/voters/generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate voting passes" },
      { status: 500 }
    );
  }
}
