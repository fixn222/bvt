import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IVoteDocument extends Document {
  voterId: Types.ObjectId;
  teamId: Types.ObjectId;
  createdAt: Date;
}

const VoteSchema = new Schema<IVoteDocument>(
  {
    voterId: {
      type: Schema.Types.ObjectId,
      ref: "Voter",
      required: true,
      unique: true, // Guarantees 1 voter = 1 vote strictly at the database engine level
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export const Vote: Model<IVoteDocument> =
  mongoose.models.Vote || mongoose.model<IVoteDocument>("Vote", VoteSchema);

export default Vote;
