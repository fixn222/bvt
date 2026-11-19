import mongoose, { Schema, Model, Document } from "mongoose";

export interface IVoterDocument extends Document {
  codeHash: string;
  hasVoted: boolean;
  votedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VoterSchema = new Schema<IVoterDocument>(
  {
    codeHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    hasVoted: {
      type: Boolean,
      default: false,
      index: true,
    },
    votedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Voter: Model<IVoterDocument> =
  mongoose.models.Voter || mongoose.model<IVoterDocument>("Voter", VoterSchema);

export default Voter;
