import mongoose, { Schema, Document, models } from 'mongoose';

export interface ITeam extends Document {
  _id: string;
  name: string;
  employees: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  employees: [{ type: Schema.Types.ObjectId, ref: 'CompanyUser', required: true, unique: true }],
}, { timestamps: true });

export default models.Team || mongoose.model<ITeam>('Team', TeamSchema); 