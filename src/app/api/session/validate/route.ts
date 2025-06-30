// app/api/session/validate/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { valid: false, reason: "unauthenticated" },
      { status: 401 }
    );
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });

  if (!user || user.activeSessionToken !== session.sessionToken) {
    return NextResponse.json(
      { valid: false, reason: "token_mismatch" },
      { status: 403 }
    );
  }

  return NextResponse.json({ valid: true }, { status: 200 });
}
