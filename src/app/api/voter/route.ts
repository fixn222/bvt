import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Voter } from "@/models/Voter";
import { hashVoterCode, checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client";
    const rateCheck = checkRateLimit(`voter-check-${ip}`, 20, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many verification requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawCode = body?.code;

    if (!rawCode || typeof rawCode !== "string" || rawCode.trim().length < 3) {
      return NextResponse.json(
        { error: "Please enter a valid voting code." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const codeHash = hashVoterCode(rawCode);
    const voter = await Voter.findOne({ codeHash }).lean();

    if (!voter) {
      return NextResponse.json({
        valid: false,
        message: "Invalid voting code. Please check and try again.",
      });
    }

    if (!voter.isActive) {
      return NextResponse.json({
        valid: false,
        message: "This voting pass has been disabled by event organizers.",
      });
    }

    if (voter.hasVoted) {
      return NextResponse.json({
        valid: false,
        hasVoted: true,
        message: "This pass has already been used to cast a vote.",
      });
    }

    return NextResponse.json({
      valid: true,
      hasVoted: false,
      message: "Voting pass is valid and ready!",
    });
  } catch (error) {
    console.error("POST /api/voter error:", error);
    return NextResponse.json(
      { error: "Failed to verify voting code." },
      { status: 500 }
    );
  }
}
