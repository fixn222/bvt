import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { VotingStatus } from "@/types";

export interface IEventDocument extends Document {
  name: string;
  description: string;
  status: VotingStatus;
  resultsVisible: boolean;
  winnerTeamId?: Types.ObjectId | null;
  currentPerformingTeamId?: Types.ObjectId | null;
  lockUnperformedTeams: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEventDocument>(
  {
    name: {
      type: String,
      required: true,
      default: "BVTalent Showdown!",
      trim: true,
    },
    description: {
      type: String,
      default: "Watch the performances. Pick your champions. Change your mind. It's party time!",
    },
    status: {
      type: String,
      enum: ["upcoming", "open", "closed"],
      default: "open",
    },
    resultsVisible: {
      type: Boolean,
      default: false,
    },
    winnerTeamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    currentPerformingTeamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    lockUnperformedTeams: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const EventModel: Model<IEventDocument> =
  mongoose.models.Event || mongoose.model<IEventDocument>("Event", EventSchema);

export default EventModel;
