import mongoose, { Schema, Document, models } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId; // CompanyUser
  teamId: mongoose.Types.ObjectId; // Team
  status: "pending" | "in_progress" | "done";
  createdBy: mongoose.Types.ObjectId; // Project Manager
  dueDate?: Date;
  priority: "Low" | "Medium" | "High";
  comments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "CompanyUser",
      required: true,
    },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "CompanyUser",
      required: true,
    },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      required: true,
    },
    comments: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default models.Task || mongoose.model<ITask>("Task", TaskSchema);
