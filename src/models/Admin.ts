import mongoose, { Schema, Model, Document } from "mongoose";

export interface IAdminDocument extends Document {
  username: string;
  passwordHash: string;
  email?: string;
  role: "superadmin" | "admin";
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin"],
      default: "admin",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Admin: Model<IAdminDocument> =
  mongoose.models.Admin || mongoose.model<IAdminDocument>("Admin", AdminSchema);

export default Admin;
