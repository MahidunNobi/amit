// app/api/session/validate/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import CompanyUser from "@/models/CompanyUser";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
    let account;
    if (session.accountType === "company") {
      account = await Company.findOne({ email: session.user.email });
    } else if (session.accountType === "user") {
      account = await CompanyUser.findOne({ email: session.user.email });
    }

    if (!account || account.activeSessionToken !== session.sessionToken) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
