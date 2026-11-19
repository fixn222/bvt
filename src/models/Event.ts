import mongoose, { Schema, Model, Document } from "mongoose";
import { VotingStatus } from "@/types";

export interface IEventDocument extends Document {
  name: string;
  description: string;
  eventDate: Date | null;
  status: VotingStatus;
  votingOpen: boolean;
  votingPaused: boolean;
  votingClosed: boolean;
  showResults: boolean;
  showVoteCounts: boolean;
  showLeaderboard: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEventDocument>(
  {
    name: {
      type: String,
      required: true,
      default: "BVTalent Show 2026",
      trim: true,
    },
    description: {
      type: String,
      default: "The Ultimate Live Talent & Performance Showcase. Every vote counts!",
    },
    eventDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["UPCOMING", "OPEN", "PAUSED", "CLOSED"],
      default: "OPEN",
    },
    votingOpen: {
      type: Boolean,
      default: true,
    },
    votingPaused: {
      type: Boolean,
      default: false,
    },
    votingClosed: {
      type: Boolean,
      default: false,
    },
    showResults: {
      type: Boolean,
      default: true,
    },
    showVoteCounts: {
      type: Boolean,
      default: true,
    },
    showLeaderboard: {
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
