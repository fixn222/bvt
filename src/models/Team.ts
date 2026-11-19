import mongoose, { Schema, Model, Document } from "mongoose";

export interface ITeamDocument extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  members: string[];
  isActive: boolean;
  displayOrder: number;
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
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    image: {
      type: String,
      required: true,
    },
    members: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Team: Model<ITeamDocument> =
  mongoose.models.Team || mongoose.model<ITeamDocument>("Team", TeamSchema);

export default Team;
