// app/actions/validate-session.ts
"use server";

import { getServerSession } from "next-auth";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function validateSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });

  if (!user || user.activeSessionToken !== session.sessionToken) {
    redirect("/api/auth/signout?callbackUrl=/api/auth/signin&redirect=true");
  }

  return session;
}
