import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { password, token } = await req.json();
    const company = await Company.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!company) {
      return NextResponse.json(
        { message: "Invalid or expired token." },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    company.password = hashedPassword;
    company.resetPasswordToken = undefined;
    company.resetPasswordExpires = undefined;
    await company.save();
    return NextResponse.json({ message: "Password reset successful." });
  } catch {
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
