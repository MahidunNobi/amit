// app/actions/validate-session.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import { redirect } from "next/navigation";

export async function validateSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  const company = await Company.findOne({ email: session.user.email });
  if (!company || company.activeSessionToken !== session.sessionToken) {
    redirect("/signout");
  }
  return true;
}
