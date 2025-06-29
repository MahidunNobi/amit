import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email."],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password."],
  },
  firstName: {
    type: String,
    required: [true, "Please provide a first name."],
  },
  lastName: {
    type: String,
    required: [true, "Please provide a last name."],
  },
  activeSessionToken: {
    type: String,
    default: null,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
