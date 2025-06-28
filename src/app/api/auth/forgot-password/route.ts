import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      // To prevent email enumeration, we send a success response even if the user doesn't exist.
      return NextResponse.json(
        {
          message:
            "If a user with that email exists, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    console.log(user);
    await user.save();

    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json(
      {
        message:
          "If a user with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
