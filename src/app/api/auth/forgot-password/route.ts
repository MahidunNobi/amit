import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import { sendPasswordResetEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();
    const company = await Company.findOne({ email });
    if (!company) {
      // To prevent email enumeration, we send a success response even if the company doesn't exist.
      return NextResponse.json({
        message:
          "If a user with that email exists, a password reset link has been sent.",
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    company.resetPasswordToken = token;
    company.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await company.save();
    await sendPasswordResetEmail(company.email, token);
    return NextResponse.json({
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}
