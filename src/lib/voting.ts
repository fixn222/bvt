import { connectToDatabase } from "@/lib/mongodb";
import { DeviceVote } from "@/models/DeviceVote";
import { Team } from "@/models/Team";
import { EventModel } from "@/models/Event";
import { hashDeviceId } from "@/lib/security";
import { Types } from "mongoose";

export interface VoteResult {
  success: boolean;
  message: string;
  currentTeamId: string;
  isSwitch: boolean;
  teamName: string;
}

export async function getDeviceVote(deviceId: string) {
  await connectToDatabase();
  const deviceIdHash = hashDeviceId(deviceId);

  const voteDoc = await DeviceVote.findOne({ deviceIdHash }).lean();
  if (!voteDoc) {
    return {
      hasVoted: false,
      currentTeamId: null,
    };
  }

  // Ensure the team still exists (in case it was deleted)
  const teamExists = await Team.exists({ _id: voteDoc.currentTeamId });
  if (!teamExists) {
    await DeviceVote.deleteOne({ _id: voteDoc._id });
    return {
      hasVoted: false,
      currentTeamId: null,
    };
  }

  return {
    hasVoted: true,
    currentTeamId: voteDoc.currentTeamId.toString(),
  };
}

export async function castOrUpdateDeviceVote(
  deviceId: string,
  teamId: string
): Promise<VoteResult> {
  await connectToDatabase();

  // 1. Verify Event Status
  const eventDoc = await EventModel.findOne().lean();
  if (!eventDoc) {
    throw new Error("Event configuration not found.");
  }

  if (eventDoc.status === "upcoming") {
    throw new Error("The party hasn't started yet! Voting is still upcoming.");
  }

  if (eventDoc.status === "closed") {
    throw new Error("Voting is officially closed! No more changes allowed.");
  }

  // 2. Verify Team Exists
  const team = await Team.findById(teamId).lean();
  if (!team) {
    throw new Error("The selected team does not exist.");
  }

  // 3. Hash Device ID
  const deviceIdHash = hashDeviceId(deviceId);

  // 4. Check for existing vote to determine if switching
  const existing = await DeviceVote.findOne({ deviceIdHash }).lean();
  const isSwitch = !!existing && existing.currentTeamId.toString() !== teamId;

  // 5. Atomic Upsert: exactly 1 document per device in DeviceVote collection
  await DeviceVote.findOneAndUpdate(
    { deviceIdHash },
    {
      $set: {
        currentTeamId: new Types.ObjectId(teamId),
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  const funMessages = [
    "YOUR VOTE HAS LANDED! 🚀",
    "You're backing " + team.name + "! 🔥",
    "Team switched! Don't tell the others 😂",
    "That's your champion! ⭐",
  ];

  const message = isSwitch
    ? "Team switched to " + team.name + "! Don't tell the others 😂"
    : "YOUR VOTE HAS LANDED! 🚀 You're backing " + team.name + "!";

  return {
    success: true,
    message,
    currentTeamId: team._id.toString(),
    isSwitch,
    teamName: team.name,
  };
}
