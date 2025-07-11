// app/actions/validate-session.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import { redirect } from "next/navigation";
import CompanyUser from "@/models/CompanyUser";

export async function validateSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  let account;
  if (session.accountType === "company") {
    account = await Company.findOne({ email: session.user.email });
  } else if (session.accountType === "user") {
    account = await CompanyUser.findOne({ email: session.user.email });
  }
  if (!account || account.activeSessionToken !== session.sessionToken) {
    redirect("/signout");
    console.log("I'm comming from validateSession");
  }
  return true;
}
