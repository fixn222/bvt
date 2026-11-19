import mongoose, { Schema, Model, Document } from "mongoose";

export interface ITeamDocument extends Document {
  name: string;
  description: string;
  image: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeamDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    image: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "yellow", // yellow, pink, cyan, lime, purple, orange
    },
  },
  {
    timestamps: true,
  }
);

export const Team: Model<ITeamDocument> =
  mongoose.models.Team || mongoose.model<ITeamDocument>("Team", TeamSchema);

export default Team;
