import mongoose, { Schema, Model, Document } from "mongoose";

export interface ITeamDocument extends Document {
  name: string;
  description: string;
  image: string;
  color: string;
  hasPerformed: boolean;
  performanceOrder: number;
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
    hasPerformed: {
      type: Boolean,
      default: false,
    },
    performanceOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Team: Model<ITeamDocument> =
  mongoose.models.Team || mongoose.model<ITeamDocument>("Team", TeamSchema);

export default Team;
