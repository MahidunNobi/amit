import mongoose, { Schema, Document, models } from 'mongoose';

export interface ITeamMember {
  employee: mongoose.Types.ObjectId;
  role: string;
}

export interface ITeam extends Document {
  _id: string;
  name: string;
  teamMembers: ITeamMember[];
  company: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  employee: { type: Schema.Types.ObjectId, ref: 'CompanyUser', required: true },
  role: { 
    type: String, 
    enum: ["General", "Developer", "Project Manager", "QA", "Designer", "Team Lead", "Scrum Master"],
    default: "General",
    required: true 
  }
}, { _id: false });

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  teamMembers: [TeamMemberSchema],
  company: { type: Schema.Types.ObjectId, ref: 'companies', required: true },
}, { timestamps: true });

export default models.Team || mongoose.model<ITeam>('Team', TeamSchema); 