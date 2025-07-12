import mongoose from "mongoose";

const CompanyUserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide a first name."],
  },
  lastName: {
    type: String,
    required: [true, "Please provide a last name."],
  },
  number: {
    type: String,
    required: [true, "Please provide a number."],
  },
  companyName: {
    type: String,
    required: [true, "Please provide a company name."],
  },
  email: {
    type: String,
    required: [true, "Please provide an email."],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password."],
  },
  accountType: {
    type: String,
    default: "user",
  },
  activeSessionToken: {
    type: String,
    default: null,
  },
  team: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["General", "Developer", "Project Manager", "QA", "Designer"],
    default: "General",
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "companies",
    required: true,
  },
});

export default mongoose.models.CompanyUser || mongoose.model("CompanyUser", CompanyUserSchema); 