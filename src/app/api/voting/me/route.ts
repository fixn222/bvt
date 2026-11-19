import { NextRequest, NextResponse } from "next/server";
import { getDeviceVote, castOrUpdateDeviceVote } from "@/lib/voting";
import { voteSubmissionSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/security";
import { isValidDeviceId } from "@/lib/device";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const deviceId =
      url.searchParams.get("deviceId") || req.headers.get("x-device-id");

    if (!deviceId || !isValidDeviceId(deviceId)) {
      return NextResponse.json(
        { hasVoted: false, currentTeamId: null },
        { status: 200 }
      );
    }

    const voteInfo = await getDeviceVote(deviceId);
    return NextResponse.json(voteInfo);
  } catch (error) {
    console.error("GET /api/voting/me error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve device vote" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const validation = voteSubmissionSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Invalid vote request";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { deviceId, teamId } = validation.data;

    // Per-device rate limit (allows 20 vote updates/minute per phone)
    const deviceRate = checkRateLimit(`vote-device-${deviceId}`, 20, 60000);
    if (!deviceRate.allowed) {
      return NextResponse.json(
        { error: "Woah there! Too fast. Give it a second and try again! ⏳" },
        { status: 429 }
      );
    }

    // High IP capacity rate limit (prevents bot DDoS while allowing 500 party guests on shared Wi-Fi)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "party-guest";
    const ipRate = checkRateLimit(`vote-ip-${ip}`, 500, 60000);
    if (!ipRate.allowed) {
      return NextResponse.json(
        { error: "Network traffic spike! Please wait a moment and tap again! ⏳" },
        { status: 429 }
      );
    }

    const result = await castOrUpdateDeviceVote(deviceId, teamId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("PUT /api/voting/me error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong recording your vote." },
      { status: 400 }
    );
  }
}
