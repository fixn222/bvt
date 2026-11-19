import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IDeviceVoteDocument extends Document {
  deviceIdHash: string;
  currentTeamId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceVoteSchema = new Schema<IDeviceVoteDocument>(
  {
    deviceIdHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    currentTeamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DeviceVote: Model<IDeviceVoteDocument> =
  mongoose.models.DeviceVote ||
  mongoose.model<IDeviceVoteDocument>("DeviceVote", DeviceVoteSchema);

export default DeviceVote;
