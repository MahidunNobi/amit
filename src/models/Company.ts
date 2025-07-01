import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email."],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password."],
  },
  companyName: {
    type: String,
    required: [true, "Please provide a company name."],
  },
  address: {
    type: String,
    required: [true, "Please provide an address."],
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number."],
  },
  website: {
    type: String,
    required: false,
  },
  accountType: {
    type: String,
    default: "company",
  },
  activeSessionToken: {
    type: String,
    default: null,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

export default mongoose.models.companies || mongoose.model("companies", CompanySchema);
