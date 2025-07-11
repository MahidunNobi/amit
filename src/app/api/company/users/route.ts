import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CompanyUser from "@/models/CompanyUser";
import Company from "@/models/Company";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== "company") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Find the company by email (admin's email)
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }
  // Find all users with this companyId
  const users = await CompanyUser.find({ company: company._id }).select(
    "-password"
  );
  return NextResponse.json({ users });
}
