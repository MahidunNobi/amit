import mongoose, { Schema, Document, models } from 'mongoose';

export interface IProject extends Document {
  name: string;
  details: string;
  deadline: Date;
  company: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  details: { type: String, required: true },
  deadline: { type: Date, required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
}, { timestamps: true });

export default models.Project || mongoose.model<IProject>('Project', ProjectSchema); 